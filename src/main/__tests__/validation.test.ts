import { CarSchema, CustomerSchema, SaleSchema, EmployeeSchema, LeadSchema, ShiftSchema } from '../validation/schemas';
import { validate } from '../utils/validation';

describe('Validation Schemas', () => {
  describe('CarSchema', () => {
    it('should validate a valid car', () => {
      const validCar = {
        vin: '1HGBH41JXMN109186',
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        price: 25000,
        status: 'available' as const,
      };
      
      expect(() => validate(CarSchema, validCar)).not.toThrow();
    });
    
    it('should reject invalid VIN', () => {
      const invalidCar = {
        vin: 'INVALID',
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        price: 25000,
        status: 'available' as const,
      };
      
      expect(() => validate(CarSchema, invalidCar)).toThrow();
    });
    
    it('should reject negative price', () => {
      const invalidCar = {
        vin: '1HGBH41JXMN109186',
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        price: -1000,
        status: 'available' as const,
      };
      
      expect(() => validate(CarSchema, invalidCar)).toThrow();
    });
  });
  
  describe('CustomerSchema', () => {
    it('should validate a valid customer', () => {
      const validCustomer = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
      };
      
      expect(() => validate(CustomerSchema, validCustomer)).not.toThrow();
    });
    
    it('should reject invalid email', () => {
      const invalidCustomer = {
        name: 'John Doe',
        email: 'invalid-email',
      };
      
      expect(() => validate(CustomerSchema, invalidCustomer)).toThrow();
    });
  });
  
  describe('SaleSchema', () => {
    it('should validate a valid sale', () => {
      const validSale = {
        carId: 1,
        customerId: 1,
        saleDate: new Date().toISOString(),
        price: 25000,
        tax: 2000,
      };
      
      expect(() => validate(SaleSchema, validSale)).not.toThrow();
    });
  });
  
  describe('ShiftSchema', () => {
    it('should validate a valid shift', () => {
      const validShift = {
        employeeId: 1,
        startTime: new Date('2026-01-15T09:00:00Z').toISOString(),
        endTime: new Date('2026-01-15T17:00:00Z').toISOString(),
        date: '2026-01-15',
      };
      
      expect(() => validate(ShiftSchema, validShift)).not.toThrow();
    });
    
    it('should reject shift where end time is before start time', () => {
      const invalidShift = {
        employeeId: 1,
        startTime: new Date('2026-01-15T17:00:00Z').toISOString(),
        endTime: new Date('2026-01-15T09:00:00Z').toISOString(),
        date: '2026-01-15',
      };
      
      expect(() => validate(ShiftSchema, invalidShift)).toThrow();
    });
  });
});
