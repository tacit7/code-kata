# Code Kata

A desktop app for timed coding practice. Solve algorithm and React katas with real-time feedback, progress tracking, and analytics.

## Features

- **Timed Sessions** — Practice multiple katas back-to-back with configurable session sizes
- **Live Test Runner** — Instant feedback as you code (pytest for Python, vitest for JavaScript)
- **Built-in Editor** — Monaco editor with vim mode support, syntax highlighting, and custom shortcuts
- **Progress Tracking** — Per-kata best times, streak tracking, and session history
- **Dashboard Analytics** — Visual breakdown of your performance over time
- **Custom Katas** — Create, edit, and organize your own kata library
- **Spaced Repetition** — Weighted practice system to focus on weak areas
- **Dual Language** — Practice Python algorithms or TypeScript/React components

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+ (for Python katas)
- Rust 1.77+ (for building)

### Development

```bash
# Install dependencies
pnpm install

# Start dev server (full app with HMR)
pnpm tauri dev

# Or frontend only (Vite on port 1420)
pnpm dev
```

### Build

```bash
# TypeScript check + production build
pnpm build

# Full production build (frontend + Rust)
pnpm tauri build
```

## Project Structure

```
kata-desktop/
├── src/                 # React frontend (TypeScript)
│   ├── routes/          # Page components
│   ├── components/      # UI components
│   ├── stores/          # Zustand state management
│   ├── lib/             # Utilities (database, runners, katas)
│   └── types/           # TypeScript types
├── src-tauri/          # Rust backend
│   ├── src/lib.rs      # Tauri command handlers
│   └── Cargo.toml      # Rust dependencies
└── public/             # Static assets
```

## Architecture

**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
**State:** Zustand
**Backend:** Tauri v2 (Rust)
**Database:** SQLite
**Editor:** Monaco Editor with vim mode

## Key Pages

- **Dashboard** — Stats, performance charts, session history
- **Library** — Browse and filter katas, manage daily practice set
- **Practice** — Timed kata sessions with test runner
- **Editor** — Create and edit custom katas
- **Settings** — Customize theme, editor, shortcuts, and practice preferences

## Creating a Custom Kata

1. Click **+ New Kata** in the top menu
2. Write your kata title, description, and test cases
3. Support both Python and JavaScript/TypeScript
4. Tests run with pytest or vitest automatically
5. Save and practice immediately

## Test Format

### Python
```python
def solution(n):
    return n * 2

# Tests
assert solution(5) == 10
assert solution(0) == 0
```

### JavaScript/TypeScript
```typescript
export function solution(n: number): number {
  return n * 2;
}

describe('solution', () => {
  it('doubles the input', () => {
    expect(solution(5)).toBe(10);
  });
});
```

## Settings

- **Theme** — Dark/Light mode
- **Vim Mode** — Enable vim keybindings in editor
- **Font & Tab Size** — Customize editor appearance
- **Default Session Size** — How many katas per session
- **Target Time** — Personal time goal per kata
- **Custom Shortcuts** — Rebind keyboard shortcuts

## Keyboard Shortcuts

| Action | Default |
|--------|---------|
| Run Tests | Cmd+Enter |
| Next Kata | Cmd+→ |
| Previous Kata | Cmd+← |
| Toggle Solution | Cmd+Shift+S |
| Open Settings | Cmd+, |
| Close Panel | Esc |

All shortcuts are customizable in Settings.

## Performance Tracking

- **Best Time** — Your fastest solve for each kata
- **Streak** — Consecutive days/sessions completed
- **Session History** — Detailed logs of all attempts
- **Analytics** — Performance trends and weak areas

## Release & Build Troubleshooting

### Cross-Platform Builds (Windows, Linux, macOS)

The release workflow builds for all three platforms. If you're building locally on macOS and get a "code kata is damaged" error, remove the quarantine attribute:

```bash
xattr -d com.apple.quarantine /Applications/CodeKata.app
```

### Build Issues Fixed

**Windows builds required explicit target flag** — Added `-t x86_64-pc-windows-msvc` to the release workflow to resolve Tauri v2 caching issues.

**CI environment compatibility** — Removed `clear` command from build script as it requires `TERM` environment variable in CI runners.

**License system cleanup** — Removed `activateLicense` from SettingsState type after removing monetization code.

## License

MIT
