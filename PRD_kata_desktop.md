# PRD: Kata Desktop

## Overview

Desktop application for drilling algorithm and React patterns with timed practice sessions, progress tracking, and an integrated code editor. Built with Tauri v2 (Rust backend, TypeScript/React frontend).

## Problem

Current kata workflow is VS Code-dependent: keybindings, tasks, terminal output, manual config editing. No unified dashboard, no historical analytics, no session management beyond a markdown log. Switching between algo-kata and kata-react requires context-switching between projects.

## Target User

Developers practicing algorithm and UI patterns daily. Intermediate to advanced. Comfortable with TypeScript, Python, React. Wants a focused practice tool, not a full IDE.

## Platform

- macOS (primary)
- Windows, Linux (secondary)
- Tauri v2 handles cross-platform packaging

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Tauri v2 (Rust) |
| Frontend | React 19 + TypeScript |
| Editor | Monaco Editor (@monaco-editor/react) |
| State | Zustand |
| Storage | SQLite via Tauri plugin (tauri-plugin-sql) |
| Test Runner | Child process; Python (pytest) for algo, Node (vitest) for React |
| Styling | Tailwind CSS |
| Charts | Recharts (progress analytics) |

## Core Features

### F1: Code Editor

Monaco Editor embedded in the app. One file open at a time (the active kata problem file).

- Syntax highlighting for Python and TypeScript/TSX
- Vim keybindings toggle (monaco-vim)
- Font size, theme (dark/light) configurable in settings
- Read-only solution viewer (split pane or toggle)
- No file tree, no tabs; the app controls which file is loaded

### F2: Kata Library

Unified catalog of all katas from both algo-kata and kata-react.

- List view: number, name, category, language, last practiced date, best time
- Filter by: category, language (Python/TypeScript), difficulty tag
- Search by name
- Each kata entry shows: problem description (from docstring), your code, solution code
- Kata metadata stored in SQLite; file content read from disk

**Kata categories (algo):**
Trees, Graphs, Linked Lists, Search, Sorting, Hashing, Two Pointer, Sliding Window, Stack, Queue, Heaps, Bit Manipulation, Dynamic Programming, Backtracking, Arrays, Data Structures

**Kata categories (React):**
Hooks, Component Patterns, State Management, Data Fetching

### F3: Practice Sessions

Three session modes:

#### Daily Practice
- User picks session size: 5, 10, 15, or 20 katas
- App selects katas based on selection strategy (see F3a)
- Sequential flow: solve one, move to next
- Timer runs per-kata and for the full session
- Session ends when all katas completed or user quits

#### Random Drill
- User picks count: 5, 10, 15, 20
- Katas selected randomly from full library (or filtered subset)
- Same flow as Daily Practice

#### Custom Session
- User manually picks specific katas from the library
- Drag to reorder
- Save as a named preset for reuse

#### F3a: Selection Strategy (Daily Practice)

Spaced repetition-lite. Prioritize katas where:
1. Never attempted (highest priority)
2. Last attempt failed
3. Longest time since last practice
4. Slowest average completion time

No complex SM-2 algorithm. Simple weighted scoring based on the four factors above.

### F4: Timer System

- Per-kata timer: starts when kata loads, stops when tests pass
- Session timer: cumulative time across all katas in session
- Pause button (pauses per-kata timer; does not affect session timer)
- Visual countdown option: set a target time per kata (e.g., 5 min), timer turns red when exceeded
- Timer state persisted; closing app mid-session resumes where you left off

### F5: Test Runner

Executes tests for the active kata and reports results inline.

- **Python katas**: spawns `uv run python -m pytest <test_file> -q --tb=short` via Tauri Command (child process)
- **React katas**: spawns `pnpm vitest run <test_file>` via Tauri Command
- Parse test output: extract pass/fail count, failure messages
- Display results in a panel below the editor
- Green/red status indicator per test
- "Run Tests" button + keyboard shortcut (Cmd+Enter / Ctrl+Enter)
- Auto-run on save (optional, toggle in settings)

### F6: Progress Dashboard

Home screen showing practice analytics.

- **Streak counter**: consecutive days with at least one completed session
- **Today's activity**: katas completed, total time, pass rate
- **Weekly heatmap**: GitHub-style grid showing daily activity
- **Category breakdown**: bar chart of time spent per category
- **Kata leaderboard**: your fastest times per kata (personal bests)
- **Trend line**: average completion time over the last 30 days
- All data from SQLite; no external services

### F7: Results History

Searchable log of all past sessions and individual kata attempts.

- Table view: date, session type, kata count, total time, pass rate
- Drill into session: see per-kata times, pass/fail, code snapshot
- Export to CSV
- Filter by date range, category, language

### F8: Settings

- **Editor**: theme (dark/light/custom), font size, font family, vim mode toggle, tab size
- **Practice**: default session size, target time per kata, auto-run tests on save
- **Paths**: algo-kata project path, kata-react project path (for locating problem/test files)
- **Runner**: Python command (default: `uv run python`), Node command (default: `pnpm`)
- Settings stored in Tauri's app data directory (JSON or SQLite)

### F9: Keyboard Shortcuts

Global app shortcuts (configurable):

| Shortcut | Action |
|----------|--------|
| Cmd+Enter | Run tests |
| Cmd+S | Save current file |
| Cmd+N | Next kata (in session) |
| Cmd+P | Previous kata (in session) |
| Cmd+Shift+S | Toggle solution view |
| Cmd+T | Start/stop timer |
| Cmd+, | Open settings |
| Escape | Close panel/modal |

## Data Model (SQLite)

```sql
CREATE TABLE katas (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,        -- e.g., "01_binary_tree_bfs"
    category TEXT NOT NULL,
    language TEXT NOT NULL,            -- "python" | "typescript"
    difficulty TEXT,                   -- "easy" | "medium" | "hard"
    problem_path TEXT NOT NULL,        -- relative path to _problem file
    solution_path TEXT NOT NULL,       -- relative path to _solution file
    test_path TEXT NOT NULL,           -- relative path to test file
    description TEXT,                  -- extracted from docstring
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id INTEGER PRIMARY KEY,
    session_type TEXT NOT NULL,        -- "daily" | "random" | "custom"
    started_at TEXT NOT NULL,
    finished_at TEXT,
    total_time_secs INTEGER,
    kata_count INTEGER NOT NULL,
    pass_count INTEGER DEFAULT 0,
    preset_name TEXT                   -- for custom sessions
);

CREATE TABLE attempts (
    id INTEGER PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    kata_id INTEGER REFERENCES katas(id) NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    time_secs INTEGER,
    passed INTEGER NOT NULL DEFAULT 0, -- 0 or 1
    code_snapshot TEXT,                -- user's code at submission time
    test_output TEXT,                  -- raw test runner output
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE presets (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    kata_ids TEXT NOT NULL             -- JSON array of kata IDs
);
```

## UI Screens

### S1: Dashboard (Home)
- Streak counter top-left
- "Start Practice" button (prominent)
- Weekly heatmap
- Recent sessions list (last 5)
- Category breakdown chart

### S2: Library
- Left sidebar: category filters, language toggle
- Main area: kata list (sortable table)
- Click kata: opens detail view with description, best time, attempt count

### S3: Session Setup
- Mode selector: Daily / Random / Custom
- Size picker: 5 / 10 / 15 / 20
- Category filter (optional)
- Language filter (optional)
- "Start Session" button

### S4: Practice View (main coding screen)
- Top bar: session progress (3/10), per-kata timer, session timer
- Center: Monaco editor (full width)
- Bottom panel: test output (collapsible)
- Right sidebar (collapsible): solution viewer
- Navigation: prev/next kata buttons

### S5: Session Results
- Summary: total time, pass rate, fastest/slowest kata
- Per-kata breakdown table
- "Save to History" (auto), "Practice Again" button

### S6: History
- Date-filterable table of past sessions
- Click to expand session details

### S7: Settings
- Tab layout: Editor, Practice, Paths, Shortcuts

## Non-Goals (v1)

- Multiplayer / shared leaderboards
- Cloud sync
- AI hints or auto-complete
- Creating new katas from within the app (use filesystem directly)
- Mobile support
- Kata difficulty ratings (manual tagging only)
- Language execution sandboxing (trusts local environment)

## Dependencies

```json
{
  "@anthropic-ai/sdk": "not needed",
  "@monaco-editor/react": "^4",
  "@tauri-apps/api": "^2",
  "@tauri-apps/plugin-shell": "^2",
  "@tauri-apps/plugin-sql": "^2",
  "@tauri-apps/plugin-fs": "^2",
  "react": "^19",
  "react-dom": "^19",
  "react-router-dom": "^7",
  "zustand": "^5",
  "tailwindcss": "^4",
  "recharts": "^2",
  "monaco-vim": "^0.4",
  "typescript": "^5"
}
```

## Milestones

### M1: Shell + Editor
- Tauri v2 project scaffolded
- Monaco editor loads and displays a hardcoded kata file
- Vim mode toggle works
- Dark/light theme switching

### M2: Kata Library + File Loading
- SQLite database with katas table populated from filesystem scan
- Library screen with list, filter, search
- Click kata to load its problem file into editor
- Solution toggle view

### M3: Test Runner
- Shell command execution via Tauri plugin-shell
- Python test runner (pytest)
- TypeScript test runner (vitest)
- Output parsed and displayed in bottom panel
- Pass/fail indicators

### M4: Timer + Sessions
- Per-kata and session timers
- Daily/Random/Custom session modes
- Session flow: setup, practice (sequential katas), results
- Attempts and sessions saved to SQLite

### M5: Dashboard + Analytics
- Streak calculation
- Weekly heatmap
- Category breakdown chart
- Trend lines
- Session history with drill-down

### M6: Settings + Polish
- Full settings screen
- Keyboard shortcuts (configurable)
- Presets (save/load custom sessions)
- CSV export
- Cross-platform testing (Windows, Linux)
- App icon, installer packaging

## Open Questions

1. Should the app manage kata file creation/reset, or leave that to git (checkout problem file to clear it)?
2. Code snapshots in attempts table; store full file or diff?
3. Target time per kata; fixed globally or per-category?
4. Should session state survive app crashes (persist to SQLite mid-session)?
