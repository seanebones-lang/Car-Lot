# Database Schema Documentation

## Overview

AutoLot Pro Desktop uses SQLite (better-sqlite3) for local data storage. The database file is stored in the user's application data directory.

**Database Location:**
- macOS: `~/Library/Application Support/auto-lot-pro/autolot.db`
- Windows: `%APPDATA%/auto-lot-pro/autolot.db`
- Linux: `~/.config/auto-lot-pro/autolot.db`

## Tables

### cars

Stores vehicle inventory.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| vin | TEXT | UNIQUE | Vehicle Identification Number (17 chars) |
| make | TEXT | | Vehicle make |
| model | TEXT | | Vehicle model |
| year | INTEGER | | Model year |
| price | REAL | | Sale price |
| photoPath | TEXT | NULLABLE | Path to vehicle photo |
| notes | TEXT | NULLABLE | Additional notes |
| status | TEXT | DEFAULT 'available' | Status: 'available', 'sold', 'pending' |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_cars_status` on `status`
- `idx_cars_vin` on `vin`

---

### customers

Stores customer information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Customer name |
| email | TEXT | NULLABLE | Email address |
| phone | TEXT | NULLABLE | Phone number |
| address | TEXT | NULLABLE | Physical address |
| notes | TEXT | NULLABLE | Additional notes |
| language | TEXT | DEFAULT 'en' | Preferred language |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

---

### sales

Stores sales transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| carId | INTEGER | NOT NULL, FOREIGN KEY → cars(id) | Reference to car |
| customerId | INTEGER | NOT NULL, FOREIGN KEY → customers(id) | Reference to customer |
| saleDate | DATETIME | DEFAULT CURRENT_TIMESTAMP | Date of sale |
| price | REAL | NOT NULL | Sale price |
| tax | REAL | DEFAULT 0 | Tax amount |
| financing | TEXT | NULLABLE | Financing information |
| invoicePath | TEXT | NULLABLE | Path to generated invoice PDF |
| notes | TEXT | NULLABLE | Additional notes |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_sales_date` on `saleDate`

**Foreign Keys:**
- `carId` → `cars(id)`
- `customerId` → `customers(id)`

---

### employees

Stores employee information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Employee name |
| email | TEXT | NULLABLE | Email address |
| phone | TEXT | NULLABLE | Phone number |
| role | TEXT | NULLABLE | Job role |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

---

### leads

Stores sales leads.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| customerId | INTEGER | NULLABLE, FOREIGN KEY → customers(id) | Reference to customer |
| source | TEXT | NULLABLE | Lead source |
| status | TEXT | DEFAULT 'new' | Status: 'new', 'contacted', 'qualified', 'converted', 'lost' |
| followUpDate | DATETIME | NULLABLE | Scheduled follow-up date |
| notes | TEXT | NULLABLE | Additional notes |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_leads_status` on `status`
- `idx_leads_followup` on `followUpDate`

**Foreign Keys:**
- `customerId` → `customers(id)`

---

### shifts

Stores employee shift schedules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| employeeId | INTEGER | NOT NULL, FOREIGN KEY → employees(id) | Reference to employee |
| startTime | DATETIME | NOT NULL | Shift start time |
| endTime | DATETIME | NOT NULL | Shift end time |
| date | DATE | NOT NULL | Shift date |
| notes | TEXT | NULLABLE | Additional notes |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_shifts_date` on `date`

**Foreign Keys:**
- `employeeId` → `employees(id)`

---

### users

Stores user accounts for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| username | TEXT | UNIQUE, NOT NULL | Username |
| passwordHash | TEXT | NOT NULL | Bcrypt password hash |
| language | TEXT | DEFAULT 'en' | Preferred language |
| theme | TEXT | DEFAULT 'light' | UI theme: 'light', 'dark' |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

---

### settings

Stores application settings (key-value pairs).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | TEXT | PRIMARY KEY | Setting key |
| value | TEXT | NULLABLE | Setting value (JSON encoded) |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Common Settings:**
- `translationApiKey`: Encrypted Google Cloud Translation API credentials

---

### audit_log

Stores audit trail of system events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| action | TEXT | NOT NULL | Action name (e.g., 'car.create', 'auth.success') |
| userId | INTEGER | NULLABLE, FOREIGN KEY → users(id) | User who performed action |
| username | TEXT | NULLABLE | Username (for audit trail) |
| resource | TEXT | NULLABLE | Resource type |
| resourceId | INTEGER | NULLABLE | Resource ID |
| details | TEXT | NULLABLE | Additional details (JSON encoded) |
| timestamp | DATETIME | DEFAULT CURRENT_TIMESTAMP | Event timestamp |

**Indexes:**
- `idx_audit_timestamp` on `timestamp`
- `idx_audit_action` on `action`
- `idx_audit_user` on `userId`

**Foreign Keys:**
- `userId` → `users(id)`

## Relationships

```
customers ──┐
            ├──> sales <── cars
            │
            └──> leads

employees ──> shifts

users ──> audit_log
```

## Constraints

- Foreign keys are enforced (PRAGMA foreign_keys = ON)
- Unique constraints on: `cars.vin`, `users.username`, `settings.key`
- NOT NULL constraints on required fields

## Migration Notes

The database schema is created automatically on first run. No migration system is currently in place - schema changes require manual database updates or re-creation.

## Backup and Restore

Database backups are stored in:
- `{userData}/backups/autolot-backup-{timestamp}.db`

Backups are automatically created daily and retained for 30 days.
