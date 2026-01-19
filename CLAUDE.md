# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeCom Database Management UI - a React 18 frontend application for managing databases and user synchronization for enterprise WeChat Work (WeCom) integration.

## Commands

```bash
# Development
npm run dev              # Start Vite dev server (0.0.0.0:5173)
npm run build            # Build for production (output to ./dist)
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

## Architecture

### Tech Stack
- React 18.2.0 with JSX
- Vite 4.4.5 for build/dev server
- Tailwind CSS 3.3.3 for styling
- react-split for resizable panels
- lucide-react for icons

### Key Files
- `src/App.jsx` - Root component
- `src/DatabaseManagementApp.jsx` - Main application (~2000 lines)
- `src/index.css` - Global styles + Tailwind + custom scrollbar/split styles

### API Configuration (vite.config.js)
- Base API: `https://qa-kip-service-internal.kerryplus.com`
- Proxies:
  - `/db-manager/api/*` → `wshot-ka-jiali-service`
  - `/admin/aad_users/*` → `aad-database-syncer`
  - `/admin/user-sync/*` → `wshot-ka-jiali-service`

### API Endpoints
```javascript
// Database
GET  /db-manager/api/databases
GET  /db-manager/api/tables?dbName={dbName}
GET  /db-manager/api/table-structure?dbName={dbName}&tableName={tableName}
GET  /db-manager/api/table-data?dbName={dbName}&tableName={tableName}&page={page}&size={size}
DELETE /db-manager/api/delete-data?dbName={dbName}&tableName={tableName}&id={id}
POST /db-manager/api/execute-sql

// User sync
PUT  /admin/aad_users/manual_sync
GET/POST /admin/user-sync/{corpId}
GET /syncDept
GET /initUser
```

### Design System
- "Midnight Terminal" aesthetic with amber (#f59e0b) accent
- Dark theme: `#0a0a0f` (primary), `#12121a` (secondary), `#1a1a24` (tertiary)
- Custom components: NeonBadge, GlowButton, SqlEditor, Split panes

### State Management
- React hooks (useState, useEffect, useRef, useCallback)
- LocalStorage for SQL history (max 100 records)
- No external state library (Redux/Zustand)

## Documentation
- `SQL_HISTORY_FEATURE.md` - SQL history feature documentation (Chinese)
