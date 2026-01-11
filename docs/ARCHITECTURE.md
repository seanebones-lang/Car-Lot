# Architecture Documentation

## Overview

AutoLot Pro Desktop is an Electron-based desktop application built with React, TypeScript, and SQLite. It follows a multi-process architecture with clear separation between the main process (Node.js) and renderer process (React).

## Technology Stack

### Frontend
- **React 19.0.0**: UI framework
- **TypeScript 5.5.4**: Type-safe development
- **Tailwind CSS 3.4.10**: Styling with RTL support
- **Zustand 5.0.1**: State management
- **React Router 7.1.0**: Client-side routing
- **React-i18next 14.0.0**: Internationalization

### Backend
- **Electron 32.1.0**: Desktop framework
- **Node.js 22.4.0**: Runtime
- **better-sqlite3 12.6.0**: SQLite database
- **Sharp 0.33.5**: Image processing

### Additional Libraries
- **jsPDF 2.5.1**: PDF generation
- **Zod 3.23.8**: Runtime validation
- **bcryptjs 2.4.3**: Password hashing
- **@google-cloud/translate 8.0.0**: Translation services

## Architecture Patterns

### Process Separation

```
┌─────────────────────────────────────┐
│         Renderer Process            │
│         (React App)                 │
│  - UI Components                    │
│  - State Management (Zustand)       │
│  - Routing                          │
└──────────────┬──────────────────────┘
               │ IPC (contextBridge)
               ▼
┌─────────────────────────────────────┐
│         Main Process                │
│         (Node.js)                   │
│  - Database Operations              │
│  - File System Access               │
│  - External API Calls               │
│  - Security (Auth, Encryption)      │
└─────────────────────────────────────┘
```

### IPC Communication

All communication between processes uses Electron's IPC system via `contextBridge`:

1. Renderer calls `window.electronAPI.*`
2. Preload script forwards to `ipcRenderer.invoke()`
3. Main process handles via `ipcMain.handle()`
4. Response sent back through IPC

**Security**: Context isolation is enabled, node integration is disabled in renderer.

## Directory Structure

```
src/
├── main/                    # Main process (Node.js)
│   ├── index.ts            # Entry point, IPC handlers
│   ├── database.ts         # Database initialization
│   ├── preload.ts          # Context bridge
│   ├── services/           # Business logic services
│   │   ├── auth.ts         # Authentication
│   │   ├── encryption.ts   # Data encryption
│   │   ├── audit.ts        # Audit logging
│   │   ├── backup.ts       # Database backups
│   │   ├── invoice.ts      # PDF generation
│   │   ├── translation.ts  # Translation service
│   │   └── rateLimiter.ts  # Rate limiting
│   ├── validation/         # Validation schemas
│   │   └── schemas.ts      # Zod schemas
│   ├── utils/              # Utilities
│   │   ├── validation.ts   # Validation helpers
│   │   └── errors.ts       # Error handling
│   └── __tests__/          # Tests
│
├── renderer/                # Renderer process (React)
│   ├── App.tsx             # Root component
│   ├── components/         # Reusable components
│   ├── modules/            # Feature modules
│   │   ├── Inventory/
│   │   ├── CRM/
│   │   ├── Sales/
│   │   ├── Scheduling/
│   │   ├── Reports/
│   │   └── Settings/
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript types
│   └── i18n.ts             # i18n configuration
│
└── locales/                # Translation files
    ├── en.json
    ├── ar.json
    └── es.json
```

## Key Design Patterns

### 1. Service Layer Pattern

Business logic is encapsulated in service modules:
- `auth.ts`: Authentication and user management
- `encryption.ts`: Data encryption/decryption
- `audit.ts`: Audit logging
- `backup.ts`: Backup operations
- `invoice.ts`: PDF generation

### 2. Validation Layer

All inputs are validated using Zod schemas before processing:
- Runtime type checking
- Data sanitization
- Error handling

### 3. State Management

Zustand stores manage application state:
- `useAppStore`: Global app state (language, theme, user)
- `useCarStore`: Inventory management
- `useCustomerStore`: Customers and leads
- `useSaleStore`: Sales transactions
- `useScheduleStore`: Employees and shifts

### 4. Error Handling

Centralized error handling:
- Custom error classes (`ValidationError`, `AuthenticationError`, etc.)
- Error sanitization (prevents information disclosure)
- Consistent error responses

### 5. Audit Logging

All critical operations are logged:
- User actions (create, update, delete)
- Authentication events
- System events

## Security Architecture

### Authentication
- Bcrypt password hashing (12 rounds)
- Session management (stateless, can be enhanced)
- Default admin user initialization

### Data Protection
- API keys encrypted at rest (AES-256-GCM)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

### Access Control
- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication (contextBridge)

### Audit Trail
- All critical operations logged
- User tracking
- Event timestamping

## Database Architecture

### Storage
- SQLite database (single file)
- Stored in user data directory
- Foreign key constraints enabled
- Indexes on frequently queried columns

### Backup Strategy
- Daily automated backups
- 30-day retention
- Manual backup/restore capability
- Backup location: `{userData}/backups/`

## Internationalization

### Supported Languages
- English (en)
- Arabic (ar) - RTL support
- Spanish (es)

### Implementation
- React-i18next for translation
- Translation files in JSON format
- Automatic RTL switching for Arabic
- Language persistence in user preferences

## Testing Strategy

### Unit Tests
- Jest testing framework
- Test coverage for critical paths
- Validation schema tests
- Service layer tests

### Integration Tests
- Database integration tests
- IPC handler tests
- End-to-end flow tests

## Build and Deployment

### Development
- Electron Forge for development
- Webpack for bundling
- Hot reloading enabled
- DevTools in development mode

### Production
- ASAR archive for code protection
- Platform-specific installers
- Code minification
- Dependency bundling

## Performance Considerations

### Database
- Indexes on key columns
- Parameterized queries (prepared statements)
- Single database connection (better-sqlite3)

### Frontend
- React 19 optimizations
- Component lazy loading (can be added)
- Virtual scrolling (can be added for large lists)

### Caching
- In-memory cache for frequently accessed data (can be enhanced)
- VIN decode result caching

## Future Enhancements

### Potential Improvements
1. Session management with JWT
2. Photo upload persistence
3. Pagination for large datasets
4. Virtual scrolling for lists
5. Service worker for caching
6. Database connection pooling
7. Query optimization and analysis
8. Performance monitoring
9. Error tracking and reporting
10. Automated testing expansion

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint for code quality
- Consistent naming conventions
- Modular architecture

### Git Workflow
- Feature branches
- Commit messages following conventions
- Code review process

### Documentation
- JSDoc comments for public APIs
- Architecture documentation (this file)
- API documentation
- Database schema documentation
