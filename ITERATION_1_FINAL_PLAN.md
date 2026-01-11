# Iteration 1: Final Refined Improvement Plan
**Date**: January 2026  
**Based on**: Assessment + Critique  
**Target Score**: 42 → 65+

---

## Scope (Refined)

**Focus Areas**:
1. Security Foundations (CRITICAL)
2. Testing Infrastructure (CRITICAL)  
3. Invoice Generation (HIGH)
4. Database Backups (MEDIUM)
5. Basic Documentation (LOW)

**Excluded from Iteration 1** (moved to Iteration 2):
- Photo upload persistence
- Performance optimization (pagination, caching)
- Transaction handling
- Code refactoring
- Integration tests (E2E)

---

## Phase 1: Security Foundations (Days 1-4)

### 1.1 Authentication Implementation
- Implement bcryptjs password hashing
- Create user migration/registration utility
- Remove authentication bypass (use test user)
- Add password strength validation
- Implement session management
- Add logout functionality

### 1.2 Input Validation
- Configure Zod schemas for all entities
- Add validation to all IPC handlers
- Fix SQL injection in search queries
- Add XSS sanitization for text inputs
- Create validation error handling

### 1.3 Data Encryption
- Use Node.js built-in crypto module
- Encrypt API keys before database storage
- Update translation service to use encrypted keys
- Create encryption utility

### 1.4 Security Enhancements
- Add audit logging for critical operations
- Sanitize error messages (prevent info disclosure)
- Add npm audit to scripts
- Add rate limiting to VIN decoder

**Deliverables**:
- Secure authentication system
- Validated inputs
- Encrypted sensitive data
- Basic security logging

---

## Phase 2: Testing Infrastructure (Days 5-9)

### 2.1 Testing Setup
- Install Jest + @testing-library/react
- Configure Jest for TypeScript and Electron
- Create test utilities and mocks
- Set up test database fixtures
- Add test scripts to package.json
- Configure code coverage (Jest's built-in)

### 2.2 Critical Unit Tests
- Authentication tests (90%+ coverage)
- Validation schema tests (90%+ coverage)
- Database operation tests (80%+ coverage)
- Encryption utility tests (90%+ coverage)
- IPC handler tests (70%+ coverage, mocked)

### 2.3 E2E Tests (Basic)
- Authentication flow E2E test
- One CRUD operation E2E test

**Deliverables**:
- Working test suite
- 60%+ code coverage
- CI-ready test configuration

---

## Phase 3: Invoice Generation (Days 10-12)

### 3.1 PDF Implementation
- Create invoice PDF template
- Implement jsPDF invoice generation
- Add invoice number generation
- Save invoices to filesystem
- Update sales table with invoice path

### 3.2 Invoice UI
- Add invoice preview/download
- Update SaleList component
- Add invoice generation button

**Deliverables**:
- Functional invoice generation
- Invoice storage and retrieval
- UI for invoice management

---

## Phase 4: Database Backups (Days 13-14)

### 4.1 Backup Implementation
- Create backup utility
- Implement scheduled backups (daily)
- Add manual backup trigger
- Store backups with timestamps
- Limit retention (30 days)

### 4.2 Backup UI
- Add backup/restore UI in Settings
- Add backup status display

**Deliverables**:
- Automated backup system
- Manual backup/restore capability
- Backup management UI

---

## Phase 5: Documentation (Days 15-16)

### 5.1 API Documentation
- Document all IPC handlers
- Document database schema
- Add JSDoc to public APIs

### 5.2 Architecture Documentation
- Create architecture overview
- Document security architecture
- Document testing approach

**Deliverables**:
- API documentation
- Schema documentation
- Architecture documentation

---

## Implementation Details

### Technology Choices (Finalized)
- **Testing**: Jest (not Vitest) - better Electron support
- **Encryption**: Node.js crypto module (built-in, no dependencies)
- **E2E Testing**: Playwright (better Electron support)
- **Coverage**: Jest's built-in coverage (no c8 needed)

### New Dependencies
```json
{
  "devDependencies": {
    "jest": "^30.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.0.0",
    "ts-jest": "^29.2.0",
    "@playwright/test": "^1.48.0"
  }
}
```

### File Structure Changes
```
src/
├── main/
│   ├── handlers/          # NEW: Extracted handlers
│   ├── services/
│   │   ├── encryption.ts  # NEW
│   │   ├── audit.ts       # NEW
│   │   └── backup.ts      # NEW
│   ├── validation/        # NEW: Validation schemas
│   └── utils/             # NEW: Utilities
├── test/                  # NEW: Test files
│   ├── setup.ts
│   ├── utils.ts
│   └── mocks/
└── docs/                  # NEW: Documentation
```

---

## Success Criteria

### Must Achieve:
- ✅ Authentication fully functional with bcryptjs
- ✅ All inputs validated with Zod
- ✅ API keys encrypted at rest
- ✅ Test coverage: 60%+ on critical paths
- ✅ Invoice generation complete and tested
- ✅ Backup system functional
- ✅ Security score: 25 → 55+
- ✅ Functionality score: 65 → 75+

### Metrics:
- Test coverage: 0% → 60%+
- Security vulnerabilities: High → Medium
- Authentication: 0% → 100% functional
- Invoice generation: 0% → 100% complete

---

## Risk Mitigation

1. **Authentication breaking changes**
   - Create migration script
   - Test thoroughly before merging
   - Provide test credentials

2. **Testing setup issues**
   - Use proven stack (Jest)
   - Test setup early (Day 5)
   - Have fallback plan

3. **Scope creep**
   - Strict adherence to refined scope
   - Defer items to Iteration 2
   - Daily progress review

---

## Timeline

**Total: 16 days (3.2 weeks)**

- Days 1-4: Security Foundations
- Days 5-9: Testing Infrastructure
- Days 10-12: Invoice Generation
- Days 13-14: Database Backups
- Days 15-16: Documentation
- Buffer: Included in timeline (20% buffer per phase)

---

**Plan Status**: FINAL - Ready for Execution  
**Next Step**: Begin Phase 1 Implementation
