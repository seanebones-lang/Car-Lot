export interface ElectronAPI {
  cars: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (car: any) => Promise<any>;
    update: (id: number, car: any) => Promise<any>;
    delete: (id: number) => Promise<{ success: boolean }>;
    search: (query: string) => Promise<any[]>;
  };
  customers: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (customer: any) => Promise<any>;
    update: (id: number, customer: any) => Promise<any>;
    delete: (id: number) => Promise<{ success: boolean }>;
  };
  sales: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    create: (sale: any) => Promise<any>;
    generateInvoice: (saleId: number) => Promise<any>;
  };
  leads: {
    getAll: () => Promise<any[]>;
    getByStatus: (status: string) => Promise<any[]>;
    create: (lead: any) => Promise<any>;
    update: (id: number, lead: any) => Promise<any>;
    updateFollowUp: (id: number, date: string) => Promise<{ success: boolean }>;
  };
  employees: {
    getAll: () => Promise<any[]>;
    create: (employee: any) => Promise<any>;
    update: (id: number, employee: any) => Promise<any>;
    delete: (id: number) => Promise<{ success: boolean }>;
  };
  shifts: {
    getByDateRange: (start: string, end: string) => Promise<any[]>;
    create: (shift: any) => Promise<any>;
    update: (id: number, shift: any) => Promise<any>;
    delete: (id: number) => Promise<{ success: boolean }>;
  };
  users: {
    authenticate: (username: string, password: string) => Promise<any>;
    updateSettings: (settings: any) => Promise<{ success: boolean }>;
  };
  vin: {
    decode: (vin: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
  translate: {
    translateText: (text: string, targetLang: string) => Promise<{ success: boolean; translated?: string; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
