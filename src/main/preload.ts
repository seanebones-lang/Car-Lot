import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Cars
  cars: {
    getAll: () => ipcRenderer.invoke('cars:getAll'),
    getById: (id: number) => ipcRenderer.invoke('cars:getById', id),
    create: (car: any) => ipcRenderer.invoke('cars:create', car),
    update: (id: number, car: any) => ipcRenderer.invoke('cars:update', id, car),
    delete: (id: number) => ipcRenderer.invoke('cars:delete', id),
    search: (query: string) => ipcRenderer.invoke('cars:search', query),
  },
  // Customers
  customers: {
    getAll: () => ipcRenderer.invoke('customers:getAll'),
    getById: (id: number) => ipcRenderer.invoke('customers:getById', id),
    create: (customer: any) => ipcRenderer.invoke('customers:create', customer),
    update: (id: number, customer: any) => ipcRenderer.invoke('customers:update', id, customer),
    delete: (id: number) => ipcRenderer.invoke('customers:delete', id),
  },
  // Sales
  sales: {
    getAll: () => ipcRenderer.invoke('sales:getAll'),
    getById: (id: number) => ipcRenderer.invoke('sales:getById', id),
    create: (sale: any) => ipcRenderer.invoke('sales:create', sale),
    generateInvoice: (saleId: number) => ipcRenderer.invoke('sales:generateInvoice', saleId),
  },
  // Leads
  leads: {
    getAll: () => ipcRenderer.invoke('leads:getAll'),
    getByStatus: (status: string) => ipcRenderer.invoke('leads:getByStatus', status),
    create: (lead: any) => ipcRenderer.invoke('leads:create', lead),
    update: (id: number, lead: any) => ipcRenderer.invoke('leads:update', id, lead),
    updateFollowUp: (id: number, date: string) => ipcRenderer.invoke('leads:updateFollowUp', id, date),
  },
  // Employees
  employees: {
    getAll: () => ipcRenderer.invoke('employees:getAll'),
    create: (employee: any) => ipcRenderer.invoke('employees:create', employee),
    update: (id: number, employee: any) => ipcRenderer.invoke('employees:update', id, employee),
    delete: (id: number) => ipcRenderer.invoke('employees:delete', id),
  },
  // Shifts
  shifts: {
    getByDateRange: (start: string, end: string) => ipcRenderer.invoke('shifts:getByDateRange', start, end),
    create: (shift: any) => ipcRenderer.invoke('shifts:create', shift),
    update: (id: number, shift: any) => ipcRenderer.invoke('shifts:update', id, shift),
    delete: (id: number) => ipcRenderer.invoke('shifts:delete', id),
  },
  // Users
  users: {
    authenticate: (username: string, password: string) => ipcRenderer.invoke('users:authenticate', username, password),
    updateSettings: (settings: any) => ipcRenderer.invoke('users:updateSettings', settings),
  },
  // VIN Decoding
  vin: {
    decode: (vin: string) => ipcRenderer.invoke('vin:decode', vin),
  },
  // Translation
  translate: {
    translateText: (text: string, targetLang: string) => ipcRenderer.invoke('translate:text', text, targetLang),
  },
});
