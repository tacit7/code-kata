# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Kata Desktop is a Tauri v2 desktop app for timed coding kata practice sessions with progress tracking. It combines algo katas (Python) and React katas (TypeScript) into a single tool with a Monaco editor, test runner, and analytics dashboard. See `PRD_kata_desktop.md` for the full product spec.

## Commands

### Development
```bash
pnpm tauri dev          # Start the full app (Rust backend + Vite frontend with HMR)
pnpm dev                # Frontend only (Vite dev server on port 1420)
pnpm build              # TypeScript check + Vite production build (frontend only)
pnpm tauri build        # Full production build (frontend + Rust, generates installer)
```

### Rust Backend
```bash
cd src-tauri && cargo build       # Build Rust backend
cd src-tauri && cargo check       # Type check Rust without building
cd src-tauri && cargo clippy      # Lint Rust code
```

## Architecture

### Two-Layer Structure

| Layer | Path | Language | Purpose |
|-------|------|----------|---------|
| Frontend | `src/` | TypeScript + React 19 | UI, editor, state |
| Backend | `src-tauri/` | Rust | Native APIs, process spawning, SQLite |

### Frontend Stack
- **React 19** with TypeScript, bundled by **Vite 7**
- **Tailwind CSS v4** (imported via `@import "tailwindcss"` in `index.css`, uses `@tailwindcss/vite` plugin)
- **Zustand** for state management
- **Monaco Editor** (`@monaco-editor/react`) with vim mode support (`monaco-vim`)
- **React Router v7** for navigation
- **Recharts** for analytics charts

### Backend (Tauri v2) Plugins
Registered in `src-tauri/src/lib.rs`:
- `tauri-plugin-shell` — spawns child processes for test runners (pytest, vitest)
- `tauri-plugin-sql` — SQLite database access (kata metadata, sessions, attempts, settings)
- `tauri-plugin-fs` — read/write kata files from the local filesystem
- `tauri-plugin-log` — logging (debug builds only)

### Tauri Capabilities
Defined in `src-tauri/capabilities/default.json`. The frontend is granted permissions for:
- Shell execution (`shell:allow-execute`, `shell:allow-open`)
- File system read/write (`fs:allow-read-text-file`, `fs:allow-write-text-file`, `fs:allow-exists`, `fs:allow-read-dir`)

When adding new Tauri plugin features, you may need to add permissions here.

### Data Layer
SQLite via `@tauri-apps/plugin-sql` on the frontend side. Schema defined in `PRD_kata_desktop.md` — tables: `katas`, `sessions`, `attempts`, `settings`, `presets`.

### Test Execution Model
The app spawns child processes via Tauri's shell plugin:
- Python katas: `uv run python -m pytest <test_file> -q --tb=short`
- React katas: `pnpm vitest run <test_file>`

## Key Conventions

- Package manager is **pnpm** (v10.29.1, specified in `packageManager` field)
- TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- Target is ES2021
- Vite dev server runs on port 1420 (strict port); Tauri dev URL points to it
- The Rust crate is named `app_lib` (see `src-tauri/Cargo.toml`)
