# AutoLot Pro Desktop

A comprehensive, multilingual desktop application designed specifically for small used car dealerships. Built with Electron and React, AutoLot Pro Desktop provides a complete solution for managing vehicle inventory, customer relationships, sales transactions, employee scheduling, invoicing, and business analytics—all in one user-friendly, offline-first application.

## Overview

AutoLot Pro Desktop is a professional-grade dealership management system that combines the power of modern web technologies with the reliability of desktop applications. Whether you're managing a small family-owned lot or a growing dealership, this application provides all the essential tools you need to run your business efficiently.

### Key Highlights

- **Offline-First Architecture**: All data is stored locally using SQLite, ensuring your business operations continue even without internet connectivity
- **Multilingual Support**: Full interface support for English, Arabic (with RTL), and Spanish, making it accessible to diverse customer bases
- **Comprehensive Feature Set**: Everything from inventory management to employee scheduling in one integrated platform
- **Modern Technology Stack**: Built with React 19, TypeScript, and Electron for cross-platform compatibility
- **User-Friendly Design**: Intuitive interface designed for non-technical users with tooltips and accessibility features

## What It Does

AutoLot Pro Desktop streamlines every aspect of your dealership operations:

### Core Functionality

1. **Vehicle Inventory Management**
   - Track all vehicles in your inventory with detailed information
   - Automatic VIN decoding using NHTSA API for quick data entry
   - Photo management for vehicle listings
   - Status tracking (Available, Sold, Pending)
   - Advanced search and filtering capabilities

2. **Customer Relationship Management (CRM)**
   - Complete customer database with contact information
   - Lead tracking and conversion pipeline
   - Follow-up reminders and task management
   - Customer communication history
   - Multi-language customer notes support

3. **Sales & Invoicing**
   - Create and track sales transactions
   - Automatic tax calculations
   - Financing option tracking
   - PDF invoice generation
   - Sales history and reporting

4. **Employee Scheduling**
   - Visual calendar-based shift management
   - Employee roster management
   - Shift assignment and editing
   - Schedule conflict detection
   - Export capabilities

5. **Reports & Analytics**
   - Real-time dashboard with key metrics
   - Sales trends and performance charts
   - Inventory value tracking
   - Lead conversion analytics
   - Customizable date range filtering

6. **Translation Services**
   - On-demand translation of ads and documents
   - Google Cloud Translation API integration
   - Support for 100+ languages
   - Customer communication translation

## Features

### Multilingual Interface
- **English**: Full interface translation
- **Arabic (العربية)**: Complete RTL (right-to-left) support with proper text direction
- **Spanish (Español)**: Full localization
- Automatic language detection
- Seamless language switching

### Inventory Management
- ✅ VIN Decoder: Automatic vehicle information retrieval from NHTSA database
- ✅ Photo Upload: Drag-and-drop image management with thumbnails
- ✅ Advanced Search: Filter by make, model, year, VIN, status, and more
- ✅ Status Management: Track vehicle availability and sales status
- ✅ Notes & Documentation: Store detailed vehicle information

### Customer & Lead Management
- ✅ Customer Database: Complete contact management system
- ✅ Lead Pipeline: Track leads from initial contact to conversion
- ✅ Status Workflow: New → Contacted → Qualified → Converted/Lost
- ✅ Follow-up Reminders: Never miss an important customer interaction
- ✅ Communication Log: Track all customer interactions

### Sales Processing
- ✅ Transaction Management: Complete sales workflow
- ✅ Tax Calculation: Automatic tax computation
- ✅ Financing Tracking: Record financing options and terms
- ✅ Invoice Generation: Professional PDF invoices
- ✅ Sales History: Complete transaction records

### Employee Scheduling
- ✅ Calendar View: Visual monthly/weekly schedule display
- ✅ Shift Management: Create, edit, and delete shifts
- ✅ Employee Roster: Manage employee information
- ✅ Drag-and-Drop: Intuitive shift assignment
- ✅ Conflict Detection: Prevent scheduling conflicts

### Reporting & Analytics
- ✅ Dashboard: Real-time business metrics
- ✅ Sales Charts: Visual sales trends over time
- ✅ Inventory Analytics: Distribution by make/model
- ✅ Lead Metrics: Conversion rates and pipeline analysis
- ✅ Export Capabilities: Generate reports for external use

### Security & Settings
- ✅ User Authentication: Secure login system
- ✅ Data Encryption: Sensitive information protection
- ✅ Auto-Lock: Automatic session timeout
- ✅ Theme Options: Light and dark modes
- ✅ API Configuration: Secure API key management

## Technology Stack

### Frontend
- **React 19.0.0**: Modern UI framework
- **TypeScript 5.5.4**: Type-safe development
- **Tailwind CSS 3.4.10**: Utility-first styling with RTL support
- **Zustand 5.0.1**: Lightweight state management
- **React Router 7.1.0**: Client-side routing
- **React-i18next 14.0.0**: Internationalization

### Backend
- **Electron 32.1.0**: Cross-platform desktop framework
- **Node.js 22.4.0**: Runtime environment
- **better-sqlite3 12.6.0**: High-performance SQLite database
- **Sharp 0.33.5**: Image processing

### Additional Libraries
- **react-big-calendar 1.19.4**: Calendar component
- **Recharts 2.10.0**: Chart library
- **jsPDF 2.5.1**: PDF generation
- **@google-cloud/translate 8.0.0**: Translation services
- **react-hot-toast 2.4.1**: User notifications
- **Lucide React 0.451.0**: Icon library

## Installation

### Prerequisites
- Node.js 22.4.0 or later
- npm 11.6.2 or later
- Python 3.14+ (for native module compilation)

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Car-Lot
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: `--legacy-peer-deps` is required due to React 19 compatibility.

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run make
   ```

For detailed build instructions, see [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md).

## Usage Guide

### Getting Started

1. **First Launch**: The application will create a local database automatically
2. **Language Selection**: Choose your preferred language from the sidebar
3. **Add Inventory**: Start by adding vehicles to your inventory
4. **Configure Settings**: Set up Google Cloud Translation API if needed

### Common Workflows

#### Adding a Vehicle
1. Navigate to Inventory
2. Click "Add Vehicle"
3. Enter VIN and click "Decode VIN" for automatic data entry
4. Upload photos and set price
5. Save the vehicle

#### Creating a Sale
1. Go to Sales module
2. Click "Create Sale"
3. Select vehicle and customer
4. Enter sale details (price, tax, financing)
5. Generate invoice PDF

#### Managing Leads
1. Navigate to CRM → Leads tab
2. Add new lead with customer information
3. Set follow-up date
4. Update status as lead progresses
5. Convert to customer when ready

#### Scheduling Employees
1. Go to Scheduling
2. Add employees first (if not already added)
3. Click "Add Shift"
4. Select employee, date, and times
5. View on calendar

## Database

The application uses SQLite for local data storage. The database is automatically created in your system's application data directory:

- **macOS**: `~/Library/Application Support/auto-lot-pro/autolot.db`
- **Windows**: `%APPDATA%/auto-lot-pro/autolot.db`
- **Linux**: `~/.config/auto-lot-pro/autolot.db`

### Database Schema

The database includes the following tables:
- `cars`: Vehicle inventory
- `customers`: Customer information
- `sales`: Sales transactions
- `employees`: Employee roster
- `leads`: Lead tracking
- `shifts`: Employee schedules
- `users`: User accounts
- `settings`: Application settings

## Configuration

### Google Cloud Translation API

To enable translation features:

1. Obtain Google Cloud Translation API credentials
2. Navigate to Settings in the application
3. Enter your API key or credentials file path
4. Enable the translation toggle

### Customization

- **Company Information**: Update in Settings for invoice generation
- **Theme**: Switch between light and dark modes
- **Language**: Change interface language anytime
- **Auto-Lock**: Configure session timeout duration

## Project Structure

```
Car-Lot/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts      # IPC handlers, app initialization
│   │   ├── database.ts   # SQLite setup and queries
│   │   ├── preload.ts    # Context bridge for IPC
│   │   └── services/     # Backend services
│   ├── renderer/          # React application
│   │   ├── components/   # Reusable UI components
│   │   ├── modules/      # Feature modules
│   │   ├── stores/       # State management
│   │   └── types/        # TypeScript definitions
│   └── locales/          # Translation files
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── forge.config.js
```

## Development

### Scripts

- `npm start`: Start development server
- `npm run package`: Create distributable package
- `npm run make`: Build platform-specific installers
- `npm run lint`: Run ESLint

### Building

The application uses Electron Forge for building and packaging. See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) for detailed build instructions.

## Browser Support

This is a desktop application built with Electron, supporting:
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian 11+, Fedora 34+)

## Contributing

This is a proprietary application. See the Legal Notice section below for usage restrictions.

## Support

For issues, questions, or feature requests, please contact the development team.

## Version History

- **1.0.0** (Current): Initial release with full feature set

## License & Legal Notice

---

## LEGAL NOTICE - COPYRIGHT AND TRADE SECRET PROTECTION

**Copyright © 2025 NextEleven LLC. All Rights Reserved.**

### 1. Copyright Protection

This software, including but not limited to source code, documentation, designs, algorithms, user interfaces, and all associated materials (collectively, the "Works"), is the exclusive property of NextEleven LLC and is protected by United States copyright law (17 U.S.C. § 101 et seq.), international copyright treaties, and other intellectual property laws.

**• No Implied Rights**: Nothing in these repositories grants any license, sublicense, permission, or right—express, implied, statutory, or otherwise—to view, access, download, copy, modify, distribute, perform, display, transmit, or otherwise use the Works in any manner whatsoever without prior written authorization from an executive officer of NextEleven LLC.

**• Automatic Protection**: Protection attaches immediately upon creation, without need for registration (though we reserve the right to register copyrights formally for enhanced enforcement). As of December 2025, U.S. copyright law provides for statutory damages up to $150,000 per willful infringement, and we will seek the maximum in every case.

**• Trade Secrets and Confidential Information**: Any non-public elements, including but not limited to source code, proprietary algorithms, business logic, or internal documentation, are trade secrets under the Defend Trade Secrets Act of 2016 (18 U.S.C. § 1839) and Texas Uniform Trade Secrets Act (Texas Civil Practice and Remedies Code § 134A). Misappropriation will trigger civil and criminal penalties, including treble damages and attorneys' fees.

### 2. Prohibited Activities: A Comprehensive Blacklist

You are expressly forbidden from engaging in any of the following, directly or indirectly, anywhere in the world:

**• Copying or Reproduction**: Duplicating any part of the Works, in whole or in part, including but not limited to cloning repositories via Git, forking, mirroring, scraping, screenshotting, photographing, or any other form of replication.

**• Stealing or Misappropriation**: Accessing, downloading, or extracting the Works without permission, including through automated tools, bots, APIs, or manual means. This includes "inspiration" that results in substantially similar creations—we will pursue derivative works as infringements under 17 U.S.C. § 106.

**• Cloning or Forking**: Creating any derivative, modified, or adapted version of the Works, whether for personal, commercial, educational, or any other use. Reverse engineering, decompiling, disassembling, or attempting to derive source code is a direct violation under the DMCA's anti-circumvention provisions (17 U.S.C. § 1201), punishable by up to $500,000 in fines and 5 years imprisonment for first offenses.

**• Distribution or Sharing**: Uploading, posting, emailing, linking, or otherwise disseminating the Works or any portion thereof on any platform, including but not limited to other GitHub repos, GitLab, Bitbucket, SourceForge, personal websites, social media, forums, cloud storage, or physical media.

**• Public Performance or Display**: Demonstrating, showcasing, or integrating the Works into any product, service, presentation, or public medium without explicit license.

**• Commercial Exploitation**: Using the Works in any business, startup, app, software, hardware, AI model training, or revenue-generating activity. This includes indirect uses like benchmarking or competitive analysis.

**• Educational or Non-Profit Use**: No exemptions for "fair use" claims—we will contest and litigate any asserted fair use under 17 U.S.C. § 107, demanding proof of transformative nature, minimal portion used, and no market harm (which we assert is always present).

**• AI and Machine Learning**: Feeding any Works into AI systems for training, generation, or analysis constitutes theft and will be pursued as copyright infringement, consistent with emerging case law as of December 2025 (e.g., extensions of Getty Images v. Stability AI precedents).

**• International Violations**: If you are outside the U.S., we invoke the Universal Copyright Convention, TRIPS Agreement (under WTO), and bilateral treaties to enforce in your jurisdiction. We will use long-arm statutes (e.g., Texas Civil Practice and Remedies Code § 17.042) to haul you into Texas courts.

Any attempt to circumvent these prohibitions, including through VPNs, proxies, anonymous accounts, or offshore entities, will be treated as willful infringement, escalating damages.

### 3. Enforcement

NextEleven LLC reserves the right to pursue all available legal remedies, including but not limited to:

- Injunctive relief
- Statutory damages up to $150,000 per work for willful infringement
- Actual damages and lost profits
- Attorneys' fees and costs
- Criminal prosecution where applicable
- Treble damages for trade secret misappropriation

### 4. Contact

For licensing inquiries or authorization requests, contact:
**NextEleven LLC**
Executive Officer
[Contact information]

---

**By accessing, viewing, or using this repository in any way, you acknowledge that you have read, understood, and agree to be bound by these terms. Unauthorized use will result in immediate legal action.**
