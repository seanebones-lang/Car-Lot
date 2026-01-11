import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { initializeDatabase, getDatabase, closeDatabase } from './database';
import { TranslationService } from './services/translation';
import { authenticateUser, initializeDefaultUser } from './services/auth';
import { sanitizeError } from './utils/errors';
import { validate, validatePartial, sanitizeSearchQuery } from './utils/validation';
import { CarSchema, CustomerSchema, SaleSchema, EmployeeSchema, LeadSchema, ShiftSchema, SearchQuerySchema, IdSchema } from './validation/schemas';
import { logAuditEvent } from './services/audit';
import { checkRateLimit } from './services/rateLimiter';
import { generateInvoice } from './services/invoice';
import { createBackup, restoreBackup, getBackupList } from './services/backup';
import { getOffset, validatePagination, createPaginatedResult, type PaginationParams } from './utils/pagination';
import { saveCarPhoto, deleteCarPhoto, getPhotoPath } from './services/fileUpload';

// Electron Forge webpack plugin provides this
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
let translationService: TranslationService | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Electron Forge webpack plugin handles loading automatically
  // The MAIN_WINDOW_WEBPACK_ENTRY is provided by Electron Forge
  if (typeof MAIN_WINDOW_WEBPACK_ENTRY !== 'undefined') {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  } else {
    // Fallback for production
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  initializeDatabase();
  await initializeDefaultUser();
  translationService = new TranslationService();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

// IPC Handlers for Cars
ipcMain.handle('cars:getAll', async (_, pagination?: PaginationParams) => {
  const db = getDatabase();
  
  if (pagination) {
    validatePagination(pagination.page, pagination.pageSize);
    const offset = getOffset(pagination.page, pagination.pageSize);
    
    // Get total count
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM cars').get() as { count: number };
    const total = totalResult.count;
    
    // Get paginated data
    const data = db.prepare(`
      SELECT * FROM cars 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `).all(pagination.pageSize, offset);
    
    return createPaginatedResult(data, pagination.page, pagination.pageSize, total);
  }
  
  // No pagination - return all (for backward compatibility)
  return db.prepare('SELECT * FROM cars ORDER BY createdAt DESC').all();
});

ipcMain.handle('cars:getById', async (_, id: number) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
});

ipcMain.handle('cars:create', async (_, car: any) => {
  try {
    // Validate input
    const validatedCar = validate(CarSchema, car);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO cars (vin, make, model, year, price, photoPath, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      validatedCar.vin,
      validatedCar.make,
      validatedCar.model,
      validatedCar.year,
      validatedCar.price,
      validatedCar.photoPath || null,
      validatedCar.notes || null,
      validatedCar.status || 'available'
    );
    
    const newCar = { id: result.lastInsertRowid, ...validatedCar };
    logAuditEvent('car.create', { carId: newCar.id });
    
    return newCar;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('cars:update', async (_, id: number, car: any) => {
  try {
    // Validate ID and input
    validate(IdSchema, id);
    const validatedCar = validatePartial(CarSchema, car);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE cars 
      SET vin = ?, make = ?, model = ?, year = ?, price = ?, 
          photoPath = ?, notes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      validatedCar.vin,
      validatedCar.make,
      validatedCar.model,
      validatedCar.year,
      validatedCar.price,
      validatedCar.photoPath || null,
      validatedCar.notes || null,
      validatedCar.status || 'available',
      id
    );
    
    const updated = db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
    logAuditEvent('car.update', { carId: id });
    
    return updated;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('cars:delete', async (_, id: number) => {
  try {
    validate(IdSchema, id);
    
    const db = getDatabase();
    // Get photo path before deleting
    const car = db.prepare('SELECT photoPath FROM cars WHERE id = ?').get(id) as { photoPath?: string } | undefined;
    
    db.prepare('DELETE FROM cars WHERE id = ?').run(id);
    
    // Delete associated photos
    if (car?.photoPath) {
      deleteCarPhoto(car.photoPath);
    }
    
    logAuditEvent('car.delete', { carId: id });
    return { success: true };
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('cars:search', async (_, query: string) => {
  try {
    // Validate and sanitize search query
    const sanitizedQuery = sanitizeSearchQuery(query);
    validate(SearchQuerySchema, sanitizedQuery);
    
    const db = getDatabase();
    const searchTerm = `%${sanitizedQuery}%`;
    const results = db.prepare(`
      SELECT * FROM cars 
      WHERE vin LIKE ? OR make LIKE ? OR model LIKE ? OR CAST(year AS TEXT) LIKE ?
      ORDER BY createdAt DESC
    `).all(searchTerm, searchTerm, searchTerm, searchTerm);
    
    return results;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

// IPC Handlers for Customers
ipcMain.handle('customers:getAll', async (_, pagination?: PaginationParams) => {
  const db = getDatabase();
  
  if (pagination) {
    validatePagination(pagination.page, pagination.pageSize);
    const offset = getOffset(pagination.page, pagination.pageSize);
    
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
    const total = totalResult.count;
    
    const data = db.prepare(`
      SELECT * FROM customers 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `).all(pagination.pageSize, offset);
    
    return createPaginatedResult(data, pagination.page, pagination.pageSize, total);
  }
  
  return db.prepare('SELECT * FROM customers ORDER BY createdAt DESC').all();
});

ipcMain.handle('customers:getById', async (_, id: number) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
});

ipcMain.handle('customers:create', async (_, customer: any) => {
  try {
    const validatedCustomer = validate(CustomerSchema, customer);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address, notes, language)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      validatedCustomer.name,
      validatedCustomer.email || null,
      validatedCustomer.phone || null,
      validatedCustomer.address || null,
      validatedCustomer.notes || null,
      validatedCustomer.language || 'en'
    );
    
    const newCustomer = { id: result.lastInsertRowid, ...validatedCustomer };
    logAuditEvent('customer.create', { customerId: newCustomer.id });
    
    return newCustomer;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('customers:update', async (_, id: number, customer: any) => {
  try {
    validate(IdSchema, id);
    const validatedCustomer = validatePartial(CustomerSchema, customer);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, address = ?, notes = ?, 
          language = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      validatedCustomer.name,
      validatedCustomer.email || null,
      validatedCustomer.phone || null,
      validatedCustomer.address || null,
      validatedCustomer.notes || null,
      validatedCustomer.language || 'en',
      id
    );
    
    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    logAuditEvent('customer.update', { customerId: id });
    
    return updated;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('customers:delete', async (_, id: number) => {
  try {
    validate(IdSchema, id);
    
    const db = getDatabase();
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    
    logAuditEvent('customer.delete', { customerId: id });
    return { success: true };
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

// IPC Handlers for Sales
ipcMain.handle('sales:getAll', async (_, pagination?: PaginationParams) => {
  const db = getDatabase();
  
  if (pagination) {
    validatePagination(pagination.page, pagination.pageSize);
    const offset = getOffset(pagination.page, pagination.pageSize);
    
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM sales').get() as { count: number };
    const total = totalResult.count;
    
    const data = db.prepare(`
      SELECT s.*, c.make, c.model, c.year as carYear, cus.name as customerName
      FROM sales s
      JOIN cars c ON s.carId = c.id
      JOIN customers cus ON s.customerId = cus.id
      ORDER BY s.saleDate DESC
      LIMIT ? OFFSET ?
    `).all(pagination.pageSize, offset);
    
    return createPaginatedResult(data, pagination.page, pagination.pageSize, total);
  }
  
  return db.prepare(`
    SELECT s.*, c.make, c.model, c.year as carYear, cus.name as customerName
    FROM sales s
    JOIN cars c ON s.carId = c.id
    JOIN customers cus ON s.customerId = cus.id
    ORDER BY s.saleDate DESC
  `).all();
});

ipcMain.handle('sales:getById', async (_, id: number) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT s.*, c.make, c.model, c.year as carYear, cus.name as customerName
    FROM sales s
    JOIN cars c ON s.carId = c.id
    JOIN customers cus ON s.customerId = cus.id
    WHERE s.id = ?
  `).get(id);
});

ipcMain.handle('sales:create', async (_, sale: any) => {
  try {
    const validatedSale = validate(SaleSchema, {
      ...sale,
      saleDate: sale.saleDate || new Date().toISOString(),
      tax: sale.tax || 0,
    });
    
    const db = getDatabase();
    
    // Use transaction to ensure atomicity
    const transaction = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO sales (carId, customerId, saleDate, price, tax, financing, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        validatedSale.carId,
        validatedSale.customerId,
        validatedSale.saleDate,
        validatedSale.price,
        validatedSale.tax,
        validatedSale.financing || null,
        validatedSale.notes || null
      );
      
      // Update car status to sold
      db.prepare('UPDATE cars SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('sold', validatedSale.carId);
      
      return { id: result.lastInsertRowid, ...validatedSale };
    });
    
    const newSale = transaction();
    logAuditEvent('sale.create', { saleId: newSale.id, carId: validatedSale.carId, customerId: validatedSale.customerId });
    
    return newSale;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('sales:generateInvoice', async (_, saleId: number) => {
  try {
    validate(IdSchema, saleId);
    
    const invoicePath = await generateInvoice(saleId);
    logAuditEvent('invoice.generate', { saleId, invoicePath });
    
    return { success: true, invoicePath };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return { success: false, error: sanitized.message };
  }
});

// IPC Handlers for Leads
ipcMain.handle('leads:getAll', async () => {
  const db = getDatabase();
  return db.prepare(`
    SELECT l.*, c.name as customerName, c.phone as customerPhone, c.email as customerEmail
    FROM leads l
    LEFT JOIN customers c ON l.customerId = c.id
    ORDER BY l.createdAt DESC
  `).all();
});

ipcMain.handle('leads:getByStatus', async (_, status: string) => {
  try {
    // Validate status
    if (!['new', 'contacted', 'qualified', 'converted', 'lost'].includes(status)) {
      throw new Error('Invalid lead status');
    }
    
    const db = getDatabase();
    return db.prepare(`
      SELECT l.*, c.name as customerName, c.phone as customerPhone, c.email as customerEmail
      FROM leads l
      LEFT JOIN customers c ON l.customerId = c.id
      WHERE l.status = ?
      ORDER BY l.createdAt DESC
    `).all(status);
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('leads:create', async (_, lead: any) => {
  try {
    const validatedLead = validate(LeadSchema, {
      ...lead,
      status: lead.status || 'new',
    });
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO leads (customerId, source, status, followUpDate, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      validatedLead.customerId || null,
      validatedLead.source || null,
      validatedLead.status,
      validatedLead.followUpDate || null,
      validatedLead.notes || null
    );
    
    const newLead = { id: result.lastInsertRowid, ...validatedLead };
    logAuditEvent('lead.create', { leadId: newLead.id });
    
    return newLead;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('leads:update', async (_, id: number, lead: any) => {
  try {
    validate(IdSchema, id);
    const validatedLead = validatePartial(LeadSchema, lead);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE leads 
      SET customerId = ?, source = ?, status = ?, followUpDate = ?, 
          notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      validatedLead.customerId || null,
      validatedLead.source || null,
      validatedLead.status || 'new',
      validatedLead.followUpDate || null,
      validatedLead.notes || null,
      id
    );
    
    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    logAuditEvent('lead.update', { leadId: id });
    
    return updated;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('leads:updateFollowUp', async (_, id: number, date: string) => {
  try {
    validate(IdSchema, id);
    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) {
      throw new Error('Invalid date format');
    }
    
    const db = getDatabase();
    db.prepare('UPDATE leads SET followUpDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(date, id);
    
    logAuditEvent('lead.update_followup', { leadId: id });
    return { success: true };
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

// IPC Handlers for Employees
ipcMain.handle('employees:getAll', async () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM employees ORDER BY createdAt DESC').all();
});

ipcMain.handle('employees:create', async (_, employee: any) => {
  try {
    const validatedEmployee = validate(EmployeeSchema, employee);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO employees (name, email, phone, role)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      validatedEmployee.name,
      validatedEmployee.email || null,
      validatedEmployee.phone || null,
      validatedEmployee.role || null
    );
    
    const newEmployee = { id: result.lastInsertRowid, ...validatedEmployee };
    logAuditEvent('employee.create', { employeeId: newEmployee.id });
    
    return newEmployee;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('employees:update', async (_, id: number, employee: any) => {
  try {
    validate(IdSchema, id);
    const validatedEmployee = validatePartial(EmployeeSchema, employee);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE employees 
      SET name = ?, email = ?, phone = ?, role = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      validatedEmployee.name,
      validatedEmployee.email || null,
      validatedEmployee.phone || null,
      validatedEmployee.role || null,
      id
    );
    
    const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    logAuditEvent('employee.update', { employeeId: id });
    
    return updated;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('employees:delete', async (_, id: number) => {
  try {
    validate(IdSchema, id);
    
    const db = getDatabase();
    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    
    logAuditEvent('employee.delete', { employeeId: id });
    return { success: true };
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

// IPC Handlers for Shifts
ipcMain.handle('shifts:getByDateRange', async (_, start: string, end: string) => {
  const db = getDatabase();
  return db.prepare(`
    SELECT s.*, e.name as employeeName
    FROM shifts s
    JOIN employees e ON s.employeeId = e.id
    WHERE s.date BETWEEN ? AND ?
    ORDER BY s.date, s.startTime
  `).all(start, end);
});

ipcMain.handle('shifts:create', async (_, shift: any) => {
  try {
    const validatedShift = validate(ShiftSchema, shift);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO shifts (employeeId, startTime, endTime, date, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      validatedShift.employeeId,
      validatedShift.startTime,
      validatedShift.endTime,
      validatedShift.date,
      validatedShift.notes || null
    );
    
    const newShift = { id: result.lastInsertRowid, ...validatedShift };
    logAuditEvent('shift.create', { shiftId: newShift.id, employeeId: validatedShift.employeeId });
    
    return newShift;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('shifts:update', async (_, id: number, shift: any) => {
  try {
    validate(IdSchema, id);
    const validatedShift = validatePartial(ShiftSchema, shift);
    
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE shifts 
      SET employeeId = ?, startTime = ?, endTime = ?, date = ?, 
          notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      validatedShift.employeeId,
      validatedShift.startTime,
      validatedShift.endTime,
      validatedShift.date,
      validatedShift.notes || null,
      id
    );
    
    const updated = db.prepare('SELECT * FROM shifts WHERE id = ?').get(id);
    logAuditEvent('shift.update', { shiftId: id });
    
    return updated;
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

ipcMain.handle('shifts:delete', async (_, id: number) => {
  try {
    validate(IdSchema, id);
    
    const db = getDatabase();
    db.prepare('DELETE FROM shifts WHERE id = ?').run(id);
    
    logAuditEvent('shift.delete', { shiftId: id });
    return { success: true };
  } catch (error) {
    const sanitized = sanitizeError(error);
    throw new Error(sanitized.message);
  }
});

// IPC Handlers for Users
ipcMain.handle('users:authenticate', async (_, username: string, password: string) => {
  try {
    const result = await authenticateUser(username, password);
    return result;
  } catch (error) {
    const sanitized = sanitizeError(error);
    return { success: false, error: sanitized.message };
  }
});

ipcMain.handle('users:updateSettings', async (_, settings: any) => {
  const db = getDatabase();
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)');
  for (const [key, value] of Object.entries(settings)) {
    stmt.run(key, JSON.stringify(value));
  }
  return { success: true };
});

// IPC Handler for VIN Decoding
ipcMain.handle('vin:decode', async (_, vin: string) => {
  try {
    // Rate limiting: 10 requests per minute per client
    // Using a simple key based on the request (in production, use IP or user ID)
    const rateLimitKey = 'vin:decode';
    if (!checkRateLimit(rateLimitKey, 10, 60000)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Validate VIN format (basic)
    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format');
    }
    
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      const result: any = {};
      data.Results.forEach((item: any) => {
        if (item.Value && item.Value !== 'Not Applicable' && item.Value !== '') {
          result[item.Variable] = item.Value;
        }
      });
      return {
        success: true,
        data: {
          make: result.Make || '',
          model: result.Model || '',
          year: result['Model Year'] ? parseInt(result['Model Year']) : null,
          bodyClass: result['Body Class'] || '',
          engineCylinders: result['Engine Number of Cylinders'] || '',
          engineDisplacement: result['Displacement (L)'] || '',
          fuelType: result['Fuel Type - Primary'] || '',
        },
      };
    }
    return { success: false, error: 'No data found' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// IPC Handler for Translation
ipcMain.handle('translate:text', async (_, text: string, targetLang: string) => {
  if (!translationService) {
    return { success: false, error: 'Translation service not initialized' };
  }
  try {
    const translated = await translationService.translate(text, targetLang);
    return { success: true, translated };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// IPC Handlers for Backups
ipcMain.handle('backup:create', async () => {
  try {
    const backupPath = createBackup();
    logAuditEvent('backup.create', { backupPath });
    return { success: true, backupPath };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return { success: false, error: sanitized.message };
  }
});

ipcMain.handle('backup:restore', async (_, backupPath: string) => {
  try {
    restoreBackup(backupPath);
    logAuditEvent('backup.restore', { backupPath });
    return { success: true };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return { success: false, error: sanitized.message };
  }
});

ipcMain.handle('backup:list', async () => {
  try {
    const backups = getBackupList();
    return { success: true, backups };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return { success: false, error: sanitized.message };
  }
});
