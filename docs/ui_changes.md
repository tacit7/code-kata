# UI Changes

This document tracks notable UI changes made to the Python Code Kata app during
the current UI/product cleanup workstream.

## Dashboard

| Change | Status | Notes |
|---|---:|---|
| Removed `Needs Review` card | Done | Review pressure now lives in practice queues and status badges instead of a standalone dashboard card. |
| Moved LeetCode progress into `Problem Mastery` | Done | LeetCode, NeetCode, and Blind 75 now display as progress bars inside the mastery card. |
| Added high-value dashboard cards | Done | Added/kept Activity, Time by Category, Avg Completion Time, Problem Mastery, Module Progress, and Recently Improved. |
| Reordered overview content | Done | Activity, Time by Category, and Avg Completion Time appear before Problem Mastery and module progress. |
| Added full module roadmap progress | Done | Module Progress follows the module roadmap order instead of only showing DP modules. |
| Split dashboard into tabs | Done | Tabs are now `Overview`, `Progress`, `Leaderboard`, and `History`. |
| Moved Module Progress to its own tab | Done | `Progress` tab contains Module Progress by itself. |
| Constrained Progress tab width | Done | Progress content is 75% width on large screens and full width on small screens. |
| Centered Progress tab content | Done | The 75% Progress panel is centered. |
| Centered dashboard tab switcher | Done | `Overview`, `Progress`, `Leaderboard`, and `History` tabs are centered. |
| Removed Daily Practice banner | Done | Dashboard now starts directly with the centered tab switcher. |

## Practice

| Change | Status | Notes |
|---|---:|---|
| Cleaned up practice page settings | Done | The mode column remains visible; detailed configuration moved into a settings modal opened by the gear icon. |
| Added spacing between settings categories | Done | Settings sections have clearer vertical rhythm. |
| Converted editor settings to toggles | Done | Practice settings uses toggle controls for binary editor options. |
| Added problem time limit setting | Done | Per-problem time limit is configurable from the Practice settings modal. |
| Added multi-select difficulty and category filters | Done | Practice filters can now include multiple difficulties and categories. |
| Added implementation complexity filter | Done | Users can filter practice queues by implementation size labels. |
| Added practice config presets | Done | Users can save, apply, and delete named practice configurations from the settings modal. Preset saving uses a visible name input and status text. |
| Preserved active practice sessions when navigating away | Done | Returning to Practice resumes the unfinished session instead of starting over. |
| Time limit auto-advance | Done | When the time limit is reached, the current kata is marked failed and the session advances. |
| Practice list rows link to problem pages | Done | Clicking a problem in the right pane opens its problem page. |

## Modules

| Change | Status | Notes |
|---|---:|---|
| Added DP submodule accordions | Done | Dynamic Programming can expand into nested submodules. |
| Improved module/submodule visual distinction | Done | Submodules are visually separated from top-level modules. |
| Removed colored left border from submodules | Done | Submodule styling is cleaner and less visually heavy. |
| Increased accordion title size | Done | Accordion titles use larger text for readability. |
| Preserved module page and accordion state | Done | Navigating into a problem and back preserves module page view state. |

## Problems

| Change | Status | Notes |
|---|---:|---|
| Added LeetCode icon column | Done | Problem and module tables show a LeetCode icon before the level column. |
| Linked LeetCode icons | Done | Icons link directly to the matching LeetCode problem page when available. |
| Added implementation complexity column | Done | Problems/modules show implementation size as a learner-facing complexity label. |
| Fixed Blind 75 and NeetCode filter counts | Done | Blind 75 and NeetCode progress/counts are based on the intended list sizes. |
| Added checked/done status | Done | Checked problems display completed status. |

## Editor And Session

| Change | Status | Notes |
|---|---:|---|
| Removed Vim toggle from problem page | Done | Vim mode is controlled from Settings only. |
| Preserved Vim mode across kata navigation | Done | Option-Command kata navigation no longer resets Vim mode. |
| Added clearer Python failure messages | Done | Test output now shows `Input`, `Solution`, and `Yours` wording for assertion failures. |
| Added user-code runtime error card | Done | Runtime errors show the user code line number, line text, and exception below the test name. |
| Added inline editor markers for user-code errors | Done | User-code error locations can be marked in the editor. |
| Made REPL/results panes resizable | Done | The editor lower panels can be resized. |
| Added maximize/unmaximize pane control | Done | Uses a Lucide-style maximize control for pane expansion. |
| Added collapsible problem panel | Done | The problem/solution/notes side panel can be hidden and restored from the editor tab bar. |
| Added REPL split controls | Done | The REPL pane can switch between horizontal and vertical 50/50 splits with VS Code-style layout icons. |
| Added copy solution to editor | Done | The solution copy action copies the selected solution into the editor, using `Copy ->` wording. |
| Added visible Ask Agent action | Done | The problem toolbar includes an `Ask` action that exports fresh agent context and copies a no-spoilers tutoring prompt. |
| Added embedded agent terminal panel | Done | The problem page can open an xterm.js PTY panel and launch Shell, Claude, or Codex. |
| Added Send to Terminal prompt action | Done | When the terminal is open, the toolbar shows `Send ->` to paste the current agent prompt into the terminal without submitting it. |

## Session Results

| Change | Status | Notes |
|---|---:|---|
| Added retry/review queues | Done | Results can create retry failed, review slow solves, and repeat session queues. |
| Moved result cards below problem list | Done | Follow-up action cards now appear under the completed problem list. |
| Removed `Back to Practice` and `Practice Again` links | Done | Results page relies on the new queue cards instead. |
| Problem result cards link to problem pages | Done | Users can drill into problem pages from results. |

## Settings

| Change | Status | Notes |
|---|---:|---|
| Added colorized bracket pair setting | Done | Editor settings include bracket pair colorization. |
| Used toggles for editor settings | Done | Binary settings are displayed as toggles. |
| Improved settings section spacing | Done | Category sections have more margin for scanability. |
| Switched destructive prompts to native confirmations | Done | Reset/delete actions use Tauri native confirmation dialogs with browser fallback outside Tauri. |

## App Shell And Branding

| Change | Status | Notes |
|---|---:|---|
| Compared Python and Ruby app logo treatment | Done | Python logo issues were investigated against the Ruby app style. |
| Updated app icon family assets | Done | App icon files were changed in the working tree to align with the Code Kata family style. |
