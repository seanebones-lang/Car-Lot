# IPC API Documentation

This document describes all IPC (Inter-Process Communication) handlers available in the AutoLot Pro Desktop application.

## Overview

The application uses Electron's IPC system for communication between the main process (Node.js) and the renderer process (React). All IPC handlers are exposed through `window.electronAPI`.

## Authentication

### `users:authenticate`
Authenticates a user with username and password.

**Parameters:**
- `username` (string): Username
- `password` (string): Password

**Returns:**
```typescript
{
  success: boolean;
  userId?: number;
  username?: string;
  error?: string;
}
```

## Cars

### `cars:getAll`
Gets all cars from inventory.

**Returns:** Array of car objects

### `cars:getById`
Gets a car by ID.

**Parameters:**
- `id` (number): Car ID

**Returns:** Car object or undefined

### `cars:create`
Creates a new car.

**Parameters:**
- `car` (CarInput): Car data

**Returns:** Created car object with ID

### `cars:update`
Updates an existing car.

**Parameters:**
- `id` (number): Car ID
- `car` (Partial<CarInput>): Car data to update

**Returns:** Updated car object

### `cars:delete`
Deletes a car.

**Parameters:**
- `id` (number): Car ID

**Returns:** `{ success: boolean }`

### `cars:search`
Searches for cars.

**Parameters:**
- `query` (string): Search query

**Returns:** Array of matching car objects

## Customers

### `customers:getAll`
Gets all customers.

**Returns:** Array of customer objects

### `customers:getById`
Gets a customer by ID.

**Parameters:**
- `id` (number): Customer ID

**Returns:** Customer object or undefined

### `customers:create`
Creates a new customer.

**Parameters:**
- `customer` (CustomerInput): Customer data

**Returns:** Created customer object with ID

### `customers:update`
Updates an existing customer.

**Parameters:**
- `id` (number): Customer ID
- `customer` (Partial<CustomerInput>): Customer data to update

**Returns:** Updated customer object

### `customers:delete`
Deletes a customer.

**Parameters:**
- `id` (number): Customer ID

**Returns:** `{ success: boolean }`

## Sales

### `sales:getAll`
Gets all sales.

**Returns:** Array of sale objects with joined car and customer data

### `sales:getById`
Gets a sale by ID.

**Parameters:**
- `id` (number): Sale ID

**Returns:** Sale object with joined data

### `sales:create`
Creates a new sale.

**Parameters:**
- `sale` (SaleInput): Sale data

**Returns:** Created sale object with ID

**Note:** Automatically updates car status to 'sold'

### `sales:generateInvoice`
Generates a PDF invoice for a sale.

**Parameters:**
- `saleId` (number): Sale ID

**Returns:**
```typescript
{
  success: boolean;
  invoicePath?: string;
  error?: string;
}
```

## Leads

### `leads:getAll`
Gets all leads.

**Returns:** Array of lead objects with joined customer data

### `leads:getByStatus`
Gets leads by status.

**Parameters:**
- `status` (string): Lead status ('new', 'contacted', 'qualified', 'converted', 'lost')

**Returns:** Array of lead objects

### `leads:create`
Creates a new lead.

**Parameters:**
- `lead` (LeadInput): Lead data

**Returns:** Created lead object with ID

### `leads:update`
Updates an existing lead.

**Parameters:**
- `id` (number): Lead ID
- `lead` (Partial<LeadInput>): Lead data to update

**Returns:** Updated lead object

### `leads:updateFollowUp`
Updates follow-up date for a lead.

**Parameters:**
- `id` (number): Lead ID
- `date` (string): Follow-up date (ISO format)

**Returns:** `{ success: boolean }`

## Employees

### `employees:getAll`
Gets all employees.

**Returns:** Array of employee objects

### `employees:create`
Creates a new employee.

**Parameters:**
- `employee` (EmployeeInput): Employee data

**Returns:** Created employee object with ID

### `employees:update`
Updates an existing employee.

**Parameters:**
- `id` (number): Employee ID
- `employee` (Partial<EmployeeInput>): Employee data to update

**Returns:** Updated employee object

### `employees:delete`
Deletes an employee.

**Parameters:**
- `id` (number): Employee ID

**Returns:** `{ success: boolean }`

## Shifts

### `shifts:getByDateRange`
Gets shifts within a date range.

**Parameters:**
- `start` (string): Start date (ISO format)
- `end` (string): End date (ISO format)

**Returns:** Array of shift objects with joined employee data

### `shifts:create`
Creates a new shift.

**Parameters:**
- `shift` (ShiftInput): Shift data

**Returns:** Created shift object with ID

### `shifts:update`
Updates an existing shift.

**Parameters:**
- `id` (number): Shift ID
- `shift` (Partial<ShiftInput>): Shift data to update

**Returns:** Updated shift object

### `shifts:delete`
Deletes a shift.

**Parameters:**
- `id` (number): Shift ID

**Returns:** `{ success: boolean }`

## VIN Decoding

### `vin:decode`
Decodes a VIN using NHTSA API.

**Parameters:**
- `vin` (string): 17-character VIN

**Returns:**
```typescript
{
  success: boolean;
  data?: {
    make: string;
    model: string;
    year: number;
    bodyClass: string;
    engineCylinders: string;
    engineDisplacement: string;
    fuelType: string;
  };
  error?: string;
}
```

**Note:** Rate limited to 10 requests per minute

## Translation

### `translate:text`
Translates text using Google Cloud Translation API.

**Parameters:**
- `text` (string): Text to translate
- `targetLang` (string): Target language code

**Returns:**
```typescript
{
  success: boolean;
  translated?: string;
  error?: string;
}
```

## Backups

### `backup:create`
Creates a database backup.

**Returns:**
```typescript
{
  success: boolean;
  backupPath?: string;
  error?: string;
}
```

### `backup:restore`
Restores database from a backup.

**Parameters:**
- `backupPath` (string): Path to backup file

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

### `backup:list`
Gets list of available backups.

**Returns:**
```typescript
{
  success: boolean;
  backups?: Array<{
    path: string;
    date: Date;
    size: number;
  }>;
  error?: string;
}
```

## Error Handling

All IPC handlers use consistent error handling:
- Validation errors return sanitized error messages
- Database errors are logged but not exposed to renderer
- All errors are logged to audit log

## Type Definitions

See `src/renderer/types/index.ts` and `src/main/validation/schemas.ts` for TypeScript type definitions.
