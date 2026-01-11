// Test setup file
import '@testing-library/jest-dom';

// Mock Electron
global.window = {
  electronAPI: {
    cars: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    },
    customers: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sales: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      generateInvoice: jest.fn(),
    },
    leads: {
      getAll: jest.fn(),
      getByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateFollowUp: jest.fn(),
    },
    employees: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    shifts: {
      getByDateRange: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    users: {
      authenticate: jest.fn(),
      updateSettings: jest.fn(),
    },
    vin: {
      decode: jest.fn(),
    },
    translate: {
      translateText: jest.fn(),
    },
  },
} as any;
