# Build Instructions for AutoLot Pro Desktop

## Prerequisites

- Node.js 22.4.0 or later
- npm 11.6.2 or later
- Python 3.14+ (for native module compilation)

## Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` is required due to some peer dependency conflicts with React 19.

## Development

Start the development server:
```bash
npm start
```

This will:
- Start the Electron Forge webpack dev server
- Launch the Electron application
- Enable hot reloading

## Building for Production

### Package (without installers):
```bash
npm run package
```

### Create Installers:
```bash
npm run make
```

This creates platform-specific installers:
- **macOS**: `.zip` file in `out/make/`
- **Windows**: `.exe` installer (Squirrel)
- **Linux**: `.deb` and `.rpm` packages

## Configuration

### Google Cloud Translation API

1. Obtain a Google Cloud Translation API key
2. Create a service account JSON file
3. In the app Settings, enter the path to the JSON file
4. Enable the translation toggle

### Database Location

The SQLite database is stored in the user data directory:
- **macOS**: `~/Library/Application Support/auto-lot-pro/autolot.db`
- **Windows**: `%APPDATA%/auto-lot-pro/autolot.db`
- **Linux**: `~/.config/auto-lot-pro/autolot.db`

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

2. Rebuild native modules:
```bash
npm rebuild better-sqlite3
```

### ESLint Errors

The project uses ESLint 9 with flat config. If you see errors:
- Ensure `eslint.config.mjs` exists
- Run `npm install --save-dev typescript-eslint`

### VIN Decoding Not Working

- Ensure internet connection (uses NHTSA API)
- Check browser console for errors
- Verify VIN is 17 characters

### Translation Not Working

- Verify Google Cloud Translation API key is set
- Check API key has proper permissions
- Ensure internet connection

## Project Structure

```
src/
├── main/              # Electron main process
│   ├── index.ts      # Main entry, IPC handlers
│   ├── database.ts   # SQLite setup
│   ├── preload.ts    # Context bridge
│   └── services/     # Translation service
├── renderer/          # React application
│   ├── components/   # Reusable components
│   ├── modules/     # Feature modules
│   ├── stores/      # Zustand stores
│   └── types/       # TypeScript types
└── locales/         # Translation files
```

## Testing

Run linting:
```bash
npm run lint
```

Type checking:
```bash
npx tsc --noEmit
```

## Deployment

1. Update version in `package.json`
2. Run `npm run make`
3. Test the installer on target platform
4. Distribute the installer from `out/make/`

## Notes

- The app uses `better-sqlite3` which requires native compilation
- First build may take longer due to native module compilation
- Development mode skips authentication (see `src/renderer/App.tsx`)
- Production builds include all dependencies in ASAR archive
