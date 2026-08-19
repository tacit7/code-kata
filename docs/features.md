# Features

Current cross-app feature status. `Partial` means the feature exists but is not at parity with the Python app or has known gaps.

| Feature | Python | Ruby | C++ | Java |
|---|---:|---:|---:|---:|
| Downloadable desktop app | Yes | Yes | Yes | Partial |
| Monaco editor | Yes | Yes | Unknown | Unknown |
| In-app test runner | Yes | Yes | Unknown | Unknown |
| Timed practice sessions | Yes | Yes | Unknown | Unknown |
| Practice session resume | Yes | Yes | Unknown | Unknown |
| Time limit auto-fail and advance | Yes | Yes | Unknown | Unknown |
| Better failure messages | Yes | Yes | No | No |
| LeetCode-style visible testcase panel | Yes | No | No | No |
| Python debug helpers | Yes | No | No | No |
| Tree-specific recursion tracing | Yes | No | No | No |
| Recursion course module | Yes | No | No | No |
| Complexity-aware practice sessions | Yes | No | No | No |
| Practice config presets | Yes | No | No | No |
| Spaced review due-only queue | Yes | No | No | No |
| Retry failed queue after session | Yes | No | No | No |
| Review slow solves queue after session | Yes | No | No | No |
| Repeat completed session queue | Yes | No | No | No |
| Practice result problem cards link to problem pages | Yes | No | No | No |
| Dashboard analytics | Yes | Yes | Unknown | Unknown |
| Problem mastery progress | Yes | Partial | Unknown | Unknown |
| Module progress dashboard | Yes | Partial | Unknown | Unknown |
| Modules page with DP submodules | Yes | Partial | Unknown | Unknown |
| Modules page back-state restore | Yes | No | No | No |
| LeetCode problem links | Yes | Partial | Unknown | Unknown |
| LeetCode icon column in problem tables | Yes | No | No | No |
| LeetCode / Blind 75 / NeetCode 150 / NeetCode 250 filters | Yes | Yes | Unknown | Unknown |
| Official NeetCode module ordering and target counts | Yes | Yes | Unknown | Unknown |
| Multiple solution variants | Yes | Partial | Unknown | Unknown |
| Copy solution to editor | Yes | Yes | No | No |
| Implementation complexity column / sort / filter | Yes | No | No | No |
| Vim mode setting | Yes | Yes | Unknown | Unknown |
| Editor toggles and theme settings | Yes | Yes | Unknown | Unknown |
| Native preferences-style settings page | Yes | Yes | Unknown | Unknown |
| Chrome-style app UI zoom | Yes | Yes | Unknown | Unknown |
| Command palette | Yes | Yes | No | No |
| Agent helper bridge and CLI | Yes | No | No | No |
| Embedded xterm agent terminal | Yes | No | No | No |
| Native confirmation dialogs | Yes | No | Unknown | Unknown |
| Toast notifications | Yes | Yes | Unknown | Unknown |
| Colorized bracket pairs | Yes | Yes | Unknown | Unknown |
| Configurable keyboard shortcuts, including REPL toggle | Yes | Partial | Unknown | Unknown |
| Problem notes | Yes | Yes | Unknown | Unknown |
| REPL panel | Yes | Yes | Unknown | Unknown |
| Resizable REPL/results pane | Yes | Yes | No | No |
| Collapsible problem panel and REPL split layouts | Yes | Yes | No | No |
| Persisted pane layouts | Yes | Yes | Unknown | Unknown |
| Inline editor markers for user-code errors | Yes | Yes | No | No |

## Implemented Notes

### Native Preferences-Style Settings Page

Python and Ruby use a desktop-style Settings page with a left navigation rail
and compact row-based preference groups. Settings are organized into:

- Editor
- Practice
- Data
- Shortcuts

Rows keep labels on the left and controls on the right, with short muted helper
text only where it clarifies behavior. Boolean options use toggles, segmented
choices use compact button groups, and library/destructive actions live under
Data instead of being mixed into Practice.

### Chrome-Style App UI Zoom

Python and Ruby support app-level UI scaling from Settings -> Editor ->
Interface Size. The available scales are 90%, 100%, 110%, 125%, and 150%.
The setting is persisted with the rest of the user preferences.

Keyboard shortcuts mirror browser zoom behavior:

- Zoom In: `Cmd/Ctrl + Plus`
- Zoom Out: `Cmd/Ctrl + Minus`
- Actual Size: `Cmd/Ctrl + 0`

The zoom is applied through the app root font size so the desktop chrome,
tables, controls, and preference rows scale together. Monaco editor font size
remains controlled by the existing editor font-size setting.

### Official NeetCode Lists

Python and Ruby expose library filters for:

- LeetCode-backed problems
- Blind 75
- NeetCode 150
- NeetCode 250

The NeetCode filters use LeetCode problem numbers as the source of truth, not
display titles. This avoids title drift between NeetCode, LeetCode, and local
kata names such as `Two Sum II Input Array Is Sorted` versus
`Two Sum II - Input Array Is Sorted`.

The Modules page uses official NeetCode module ordering when a NeetCode filter
is active. Module progress denominators use the official target totals:

| Module | NeetCode 150 | NeetCode 250 |
|---|---:|---:|
| Arrays & Hashing | 9 | 22 |
| Two Pointers | 5 | 13 |
| Sliding Window | 6 | 9 |
| Stack | 6 | 14 |
| Binary Search | 7 | 14 |
| Linked List | 11 | 14 |
| Trees | 15 | 23 |
| Heap / Priority Queue | 7 | 12 |
| Backtracking | 10 | 17 |
| Tries | 3 | 4 |
| Graphs | 13 | 21 |
| Advanced Graphs | 6 | 10 |
| 1-D Dynamic Programming | 12 | 17 |
| 2-D Dynamic Programming | 11 | 16 |
| Greedy | 8 | 14 |
| Intervals | 6 | 7 |
| Math & Geometry | 8 | 13 |
| Bit Manipulation | 7 | 10 |

NeetCode 250 currently filters to the NeetCode 250 problems that are already
implemented in the app. Missing NeetCode 250 problems are not added as empty
placeholder rows; the official denominator makes that gap visible.

### Toast Notifications

Python and Ruby use compact bottom-right toast notifications for native-feeling
action feedback. Current toast triggers include copying a solution to the
editor, saving/applying/deleting practice presets, reloading seeded problem
statements, resetting progress, copying a problem name, and marking problems as
daily or done.

### Command Palette

Python and Ruby include a `cmdk` command palette opened with
`Cmd/Ctrl+Shift+P` by default. The shortcut is listed in Settings -> Shortcuts
and can be customized like the other app commands.

The palette includes global navigation, start/resume practice, app zoom, and
settings commands. Problem pages register editor-scoped commands while mounted:
run tests, show/hide the problem panel, show/hide solutions, open/hide the REPL,
copy the selected solution to the editor, reset code, move to the next/previous
kata, and open the current problem on LeetCode when available.

### Agent Helper Bridge and CLI

Python exports the current Monaco problem context to the app data directory for
local agents. The export includes problem metadata, student code, selected code,
cursor/selection, visible test cases, raw tests, notes, and latest run results.
Reference solution code is intentionally not exported.

Agents can inspect the context through:

```bash
pnpm agent summary
pnpm agent prompt
pnpm agent code
pnpm agent results
```

The problem page also exposes an `Ask` toolbar button and registers `Ask Agent`
and `Export Agent Context` commands in the command palette. `Ask Agent` exports
fresh context and copies a no-spoilers tutoring prompt to the clipboard. See
`docs/agent_bridge.md` for the schema and usage contract. Tauri packaged builds
include the project-local skill, CLI, and bridge doc under the app's bundled
`agent/` resources.

### Native Confirmation Dialogs

Python uses Tauri's native confirmation dialog for destructive actions such as
resetting code, deleting custom katas, deleting practice presets, resetting kata
progress, and resetting all progress. A browser-confirm fallback remains for
tests and non-Tauri contexts.

### Embedded xterm Agent Terminal

Python includes an embedded xterm.js terminal panel backed by a native PTY. The
problem toolbar can open a shell terminal, and the command palette/native Kata
menu can launch shell, Claude, or Codex directly. The terminal sets
`KATA_AGENT_CONTEXT_PATH` so local agent CLIs can locate the current exported
problem context from the agent helper bridge.

### Persisted Pane Layouts

Python and Ruby persist workspace layout in the settings table so the app
reopens in the user's last working shape. The editor remembers left-panel
visibility, active panel, left-panel width, REPL visibility, REPL split
direction, and output pane height. Python also remembers the active output tab
and testcase/results visibility. The Dashboard remembers the last active tab in
each app.

Session-only "Hide Problem in Sessions" does not overwrite the normal persisted
left-panel preference.

### Failure Messages and Inline Markers

Python and Ruby show compact, learner-facing failure details in the test result
pane. Assertion failures use `Input`, `Solution`, and `Yours` labels; syntax and
runtime errors use a small error card with `Line <number>:` plus the source line
when the runner can resolve it.

Both apps mark user-code syntax/runtime error lines directly in Monaco after a
failed run. Ruby evaluates user code and test code with synthetic filenames so
runtime backtraces can be mapped back to the learner's editor line instead of
showing only Ruby's raw VM output.

### Practice Config Presets

Practice presets let a user save the current Practice settings modal state and
apply it later from the same modal. A preset stores:

- Practice mode
- Category filters
- Difficulty filters
- Implementation complexity filters
- Selected levels
- Daily randomization
- Session size
- Problem time limit
- Max attempts per kata

Python stores presets in SQLite using `practice_presets`. Presets are named,
upserted by name, and loaded only when the Practice settings modal opens.
Applying a preset updates both `practiceConfig` and `sessionTimeLimitMs` in the
settings store.

### Problem Page Layout Controls

Python and Ruby problem pages include layout controls for focused practice:

- The left problem panel can be hidden and restored from the editor tab bar.
- The REPL can split horizontally, with the editor/problem area above and REPL
  below in a 50/50 layout.
- The REPL can split vertically, with the editor/problem area beside the REPL in
  a 50/50 layout.
- REPL and results panes keep maximize/restore controls for temporary full-pane
  focus.

Both apps also expose a `copy ->` action in the Solutions panel. It replaces the
current editor contents with the selected solution variant and shows a toast so
the action has clear feedback.

### Visible Testcase Panel

Python problem pages show a LeetCode-style `Testcase` tab in the bottom output
pane when visible cases can be derived from the kata's Python tests. The first
implementation parses common test shapes from `testCode`, including direct
`assert solution(args) == expected`, `assert_equal(solution(args), expected)`,
and `result = solution(args)` followed by an assertion.

The parsed cases are learner-facing examples only. The existing `testCode`
runner remains the grading source, so hidden/setup-heavy assertions continue to
work even when they are not shown as visible cases. Running tests switches the
bottom pane to `Test Result`; users can return to `Testcase` afterward.

### Python Debug Helpers

Python includes debug helpers in both tests and the REPL. Builder helpers such
as `build_tree` are REPL-only, so tests stay focused on user solutions.

`trace_recursion` and `trace_tree` print recursive calls and returns with
indentation by call depth. Return and error lines repeat the original call
arguments, for example `countdown(3) -> None`, instead of collapsing them to
`countdown(...) -> None`. This makes linear recursion traces easier to match
against the current stack frame. `trace_tree` uses the same call/return format
and also labels left/right child traversal when it can infer the direction.
`recursion_depth`, `recursion_indent`, and `pindent` expose that active trace
indentation to user code so custom debug prints can line up with the current
recursive frame.

### Recursion Course Module

Python includes a top-level Recursion module on the Modules page, placed after
Linked List and before Trees.

Submodule `1. Call Flow`:

| # | Problem | Difficulty | Pattern |
|---:|---|---|---|
| 1 | Countdown | Easy | Work before recursive call |
| 2 | Count Up | Easy | Recursive call before work |
| 3 | Sum From 1 to N | Easy | Additive return recursion |
| 4 | Factorial | Easy | Multiplicative return recursion |
| 5 | Power of Number | Medium | Repeated recursive multiplication |

Submodule `2. Numeric Recursion`:

| # | Problem | Difficulty | Pattern |
|---:|---|---|---|
| 6 | Count Digits | Easy | Divide by 10 |
| 7 | Sum Digits | Easy | Modulo + division |
| 8 | Product of Digits | Easy | Modulo + division |
| 9 | Reverse Number | Medium | Accumulator recursion |
| 10 | Is Power of Two | Medium | Recursive reduction |

Submodule `3. Array Recursion`:

| # | Problem | Difficulty | Pattern |
|---:|---|---|---|
| 11 | Sum Array | Easy | Index recursion |
| 12 | Count Items | Easy | Index recursion |
| 13 | Find Maximum | Medium | Compare recursive result |
| 14 | Contains Target | Easy | Boolean recursion |
| 15 | Count Target Occurrences | Easy | Count current + rest |
| 16 | Check If Sorted | Medium | Compare neighbors |
| 17 | First Index of Target | Medium | Return index or -1 |

Submodule `4. String Recursion`:

| # | Problem | Difficulty | Pattern |
|---:|---|---|---|
| 18 | Count Characters | Easy | Index recursion |
| 19 | Count Vowels | Easy | Conditional count |
| 20 | Count Character Occurrences | Easy | Conditional count |
| 21 | Reverse String | Medium | Build result |
| 22 | Palindrome Check | Medium | Two-pointer recursion |
| 23 | Remove Character | Medium | Recursive string building |
| 24 | Replace Character | Medium | Recursive transformation |

Submodule `5. Branching Recursion`:

| # | Problem | Difficulty | Pattern |
|---:|---|---|---|
| 25 | Fibonacci Number (Recursive) | Medium | Two recursive calls |
| 26 | Climbing Stairs (Recursive Choices) | Medium | Take 1 or 2 steps |
| 27 | Count Ways to Reach N | Medium | Multiple choices |
| 28 | Generate Binary Strings (Recursive Choices) | Medium | Choose 0 or 1 |
| 29 | Generate Coin Flip Outcomes | Medium | Heads or tails |

Submodule `6. Binary Tree Recursion`:

| # | Problem | Difficulty | Pattern |
|---:|---|---|---|
| 30 | Count Nodes (Recursive) | Easy | Root + left + right |
| 31 | Sum Tree Values | Easy | Root value + subtrees |
| 32 | Find Max in Tree | Medium | Max of root/left/right |
| 33 | Count Leaves (Recursive) | Medium | Leaf detection |
| 34 | Tree Height | Medium | 1 + max subtree height |
| 35 | Contains Value in Tree | Easy | Search recursively |
| 36 | Invert Binary Tree (Recursive) | Medium | Swap children |
| 37 | Same Tree (Recursive) | Medium | Compare two trees |

Submodule `7. Recursive Backtracking`:

| # | Problem | Difficulty | Pattern |
|---:|---|---|---|
| 38 | Generate Subsets | Medium | Include / exclude |
| 39 | Generate Binary Strings of Length N | Medium | Choice recursion |
| 40 | Generate Permutations | Medium | Choose unused item |
| 41 | Letter Case Permutation | Medium | Branch on letters |
| 42 | Simple Maze Paths | Medium | Explore moves |

The katas use category `recursion` and explicit submodule tags such as
`recursion-call-flow`, `recursion-numeric`, `recursion-array`, and
`recursion-string`. `recursion-branching`, `recursion-binary-tree`, and
`recursion-backtracking` use distinct names where exact titles already exist in
the DP, backtracking, or tree seed corpus. Existing tree katas that merely have
a generic `recursion` tag remain under Trees.

## Planned

| Feature | Python | Ruby | C++ | Java |
|---|---:|---:|---:|---:|
| Mistake tags on attempts | Planned | No | No | No |
| Readable debug reprs for common kata objects | Planned | No | No | No |
| Native app menu commands | Planned | Planned | No | No |
| Native window chrome polish | Planned | Planned | No | No |
| Keyboard shortcut editor | Planned | Planned | No | No |
| Context menus | Planned | Planned | No | No |
| Skeleton loading states | Planned | Planned | No | No |
| Custom native-style dialogs | Yes | Planned | No | No |
| Follow system theme | Planned | Planned | No | No |

### Native-Feel Improvements

These features are intended to make the desktop apps feel less like web pages in
a shell and more like local developer tools.

| Feature | Intended Behavior |
|---|---|
| Native app menu commands | Add menu items for Run, Open REPL, Toggle Vim, Zoom In/Out, Preferences, Next Problem, and Previous Problem so shortcuts are discoverable from the system menu. |
| Native window chrome polish | Tighten titlebar and toolbar spacing, especially around macOS traffic lights, so the app frame feels intentional. |
| Keyboard shortcut editor | Show shortcuts in Settings as editable rows with conflict detection and reset controls. |
| Toast notifications | Use compact bottom-right messages for actions such as copied solution, preset saved, session resumed, and problem marked done. |
| Context menus | Add right-click actions for problem rows and editor surfaces, including mark done, star, add/remove from daily, copy link, and reset progress. |
| Persisted pane layouts | Remember problem panel visibility, REPL split direction, REPL size, active output tab, and dashboard tab. |
| Skeleton loading states | Replace broad loading spinners with compact skeleton rows and specific status text where possible. |
| Custom native-style dialogs | Replace browser `confirm()` prompts for delete/reset actions with app-styled or native confirmation dialogs. |
| Follow system theme | Add a theme option that follows the operating system light/dark appearance. |

Suggested implementation order:

1. Native app menu commands
2. Persisted pane layouts
3. Custom native-style dialogs
4. Context menus

### Mistake Tags

Mistake tags should be stored per attempt, not permanently on the kata. A failed
or slow solve can be tagged with one or more reasons such as:

- Edge case
- Off-by-one
- Wrong invariant
- Syntax
- Timeout
- Misread prompt
- Implementation bug

The intended first UI is on the session results page: failed or slow rows show
quick tag buttons. The dashboard can aggregate those tags into a "Top mistake
patterns" card, and a later Practice mode can generate queues from a selected
mistake tag.

Suggested storage:

```sql
ALTER TABLE attempts ADD COLUMN mistake_tags TEXT;
```

Store the value as JSON, for example:

```json
["edge-case", "off-by-one"]
```

### Readable Debug Reprs For Common Kata Objects

Python debug helpers already avoid raw object addresses for simple
tree-node-like objects with a `val` field by showing `Node(value)`. The next
formatter pass should expand that behavior to the objects users commonly inspect
while tracing LeetCode-style solutions.

Backlog tasks:

| Task | Object Shape | Target Output |
|---:|---|---|
| 9103 | Linked-list nodes with `val` / `next` | `ListNode(1) -> ListNode(2)` |
| 9104 | Interval-like objects with `start` / `end` | `Interval(1, 4)` |
| 9105 | Binary tree nodes with `val` / `left` / `right` | `TreeNode(3, left=9, right=20)` |
| 9106 | Stack, queue, and heap wrapper objects | `Queue([1, 2, 3])` |
| 9107 | Trie nodes with `children` and terminal flags | `TrieNode(keys=['a', 'b'], end=False)` |
| 9108 | Graph nodes with `val` / `neighbors` | `GraphNode(1, neighbors=[2, 4])` |

All collection-like formatters should truncate long output and protect against
cycles so debug traces stay readable.
