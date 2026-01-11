import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { initializeDatabase, getDatabase, closeDatabase } from './database';
import { TranslationService } from './services/translation';

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

app.whenReady().then(() => {
  initializeDatabase();
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
ipcMain.handle('cars:getAll', async () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM cars ORDER BY createdAt DESC').all();
});

ipcMain.handle('cars:getById', async (_, id: number) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
});

ipcMain.handle('cars:create', async (_, car: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO cars (vin, make, model, year, price, photoPath, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    car.vin,
    car.make,
    car.model,
    car.year,
    car.price,
    car.photoPath || null,
    car.notes || null,
    car.status || 'available'
  );
  return { id: result.lastInsertRowid, ...car };
});

ipcMain.handle('cars:update', async (_, id: number, car: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE cars 
    SET vin = ?, make = ?, model = ?, year = ?, price = ?, 
        photoPath = ?, notes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    car.vin,
    car.make,
    car.model,
    car.year,
    car.price,
    car.photoPath || null,
    car.notes || null,
    car.status || 'available',
    id
  );
  return db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
});

ipcMain.handle('cars:delete', async (_, id: number) => {
  const db = getDatabase();
  db.prepare('DELETE FROM cars WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('cars:search', async (_, query: string) => {
  const db = getDatabase();
  const searchTerm = `%${query}%`;
  return db.prepare(`
    SELECT * FROM cars 
    WHERE vin LIKE ? OR make LIKE ? OR model LIKE ? OR year LIKE ?
    ORDER BY createdAt DESC
  `).all(searchTerm, searchTerm, searchTerm, searchTerm);
});

// IPC Handlers for Customers
ipcMain.handle('customers:getAll', async () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM customers ORDER BY createdAt DESC').all();
});

ipcMain.handle('customers:getById', async (_, id: number) => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
});

ipcMain.handle('customers:create', async (_, customer: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO customers (name, email, phone, address, notes, language)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    customer.name,
    customer.email || null,
    customer.phone || null,
    customer.address || null,
    customer.notes || null,
    customer.language || 'en'
  );
  return { id: result.lastInsertRowid, ...customer };
});

ipcMain.handle('customers:update', async (_, id: number, customer: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE customers 
    SET name = ?, email = ?, phone = ?, address = ?, notes = ?, 
        language = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    customer.name,
    customer.email || null,
    customer.phone || null,
    customer.address || null,
    customer.notes || null,
    customer.language || 'en',
    id
  );
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
});

ipcMain.handle('customers:delete', async (_, id: number) => {
  const db = getDatabase();
  db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  return { success: true };
});

// IPC Handlers for Sales
ipcMain.handle('sales:getAll', async () => {
  const db = getDatabase();
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
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO sales (carId, customerId, saleDate, price, tax, financing, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    sale.carId,
    sale.customerId,
    sale.saleDate || new Date().toISOString(),
    sale.price,
    sale.tax || 0,
    sale.financing || null,
    sale.notes || null
  );
  
  // Update car status to sold
  db.prepare('UPDATE cars SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('sold', sale.carId);
  
  return { id: result.lastInsertRowid, ...sale };
});

ipcMain.handle('sales:generateInvoice', async (_, saleId: number) => {
  // This will be implemented with jsPDF later
  return { success: true, message: 'Invoice generation coming soon' };
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
  const db = getDatabase();
  return db.prepare(`
    SELECT l.*, c.name as customerName, c.phone as customerPhone, c.email as customerEmail
    FROM leads l
    LEFT JOIN customers c ON l.customerId = c.id
    WHERE l.status = ?
    ORDER BY l.createdAt DESC
  `).all(status);
});

ipcMain.handle('leads:create', async (_, lead: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO leads (customerId, source, status, followUpDate, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    lead.customerId || null,
    lead.source || null,
    lead.status || 'new',
    lead.followUpDate || null,
    lead.notes || null
  );
  return { id: result.lastInsertRowid, ...lead };
});

ipcMain.handle('leads:update', async (_, id: number, lead: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE leads 
    SET customerId = ?, source = ?, status = ?, followUpDate = ?, 
        notes = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    lead.customerId || null,
    lead.source || null,
    lead.status || 'new',
    lead.followUpDate || null,
    lead.notes || null,
    id
  );
  return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
});

ipcMain.handle('leads:updateFollowUp', async (_, id: number, date: string) => {
  const db = getDatabase();
  db.prepare('UPDATE leads SET followUpDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(date, id);
  return { success: true };
});

// IPC Handlers for Employees
ipcMain.handle('employees:getAll', async () => {
  const db = getDatabase();
  return db.prepare('SELECT * FROM employees ORDER BY createdAt DESC').all();
});

ipcMain.handle('employees:create', async (_, employee: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO employees (name, email, phone, role)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(
    employee.name,
    employee.email || null,
    employee.phone || null,
    employee.role || null
  );
  return { id: result.lastInsertRowid, ...employee };
});

ipcMain.handle('employees:update', async (_, id: number, employee: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE employees 
    SET name = ?, email = ?, phone = ?, role = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    employee.name,
    employee.email || null,
    employee.phone || null,
    employee.role || null,
    id
  );
  return db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
});

ipcMain.handle('employees:delete', async (_, id: number) => {
  const db = getDatabase();
  db.prepare('DELETE FROM employees WHERE id = ?').run(id);
  return { success: true };
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
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO shifts (employeeId, startTime, endTime, date, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    shift.employeeId,
    shift.startTime,
    shift.endTime,
    shift.date,
    shift.notes || null
  );
  return { id: result.lastInsertRowid, ...shift };
});

ipcMain.handle('shifts:update', async (_, id: number, shift: any) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE shifts 
    SET employeeId = ?, startTime = ?, endTime = ?, date = ?, 
        notes = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(
    shift.employeeId,
    shift.startTime,
    shift.endTime,
    shift.date,
    shift.notes || null,
    id
  );
  return db.prepare('SELECT * FROM shifts WHERE id = ?').get(id);
});

ipcMain.handle('shifts:delete', async (_, id: number) => {
  const db = getDatabase();
  db.prepare('DELETE FROM shifts WHERE id = ?').run(id);
  return { success: true };
});

// IPC Handlers for Users
ipcMain.handle('users:authenticate', async (_, username: string, password: string) => {
  // This will be implemented with bcryptjs later
  return { success: true, message: 'Authentication coming soon' };
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
