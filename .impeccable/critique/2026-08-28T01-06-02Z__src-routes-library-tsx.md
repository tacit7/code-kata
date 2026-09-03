---
target: /problems
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-28T01-06-02Z
slug: src-routes-library-tsx
---
Method: dual-agent (A: 01a045e4-7955-7ff3-9840-981d21b3b771 · B: 01a045e4-8e1d-7602-878b-016c9bb64a8a)

**Design Health Score**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Selected row, active filters, loading/reseed states, and toasts exist; no result count or filtered progress summary. |
| 2 | Match System / Real World | 3 | Interview-practice terms mostly fit; star-as-daily and LOC-derived complexity need clearer framing. |
| 3 | User Control and Freedom | 3 | Search clear, toggles reversible, context menu exists; no single clear-all for every active filter/search/sort state. |
| 4 | Consistency and Standards | 3 | Consistent with current app chrome and table style; mixed custom SVG/icon patterns and very rounded shell reduce polish. |
| 5 | Error Prevention | 2 | Confirmations cover destructive actions, but global arrow/enter row navigation can hijack focus inside controls. |
| 6 | Recognition Rather Than Recall | 2 | Main controls are visible, but keyboard navigation, context menu, level search, and number search are mostly hidden. |
| 7 | Flexibility and Efficiency | 3 | Dense table, remembered scroll, tag filters, sorting, keyboard navigation, and LeetCode links support repeated expert use. |
| 8 | Aesthetic and Minimalist Design | 2 | Operate-appropriate density, but the filter/header area is flat and row metadata competes at nearly equal weight. |
| 9 | Error Recovery | 2 | Empty state offers reseed, but not filter recovery; failures rely on toasts without local recovery affordances. |
| 10 | Help and Documentation | 1 | Tooltips exist, but complexity, daily, done, and power workflows are not explained where decisions happen. |
| **Total** | | **24/40** | **Functional but cognitively flat** |

**Design Specificity Verdict**

The `/problems` route is moderately specific. Its data is unmistakably Code Kata: LeetCode numbers, daily queue, done state, best time, streak, difficulty, category, tags, level, and implementation complexity are the right ingredients for a kata trainer. The surface understands the product.

The composition is less specific than the model. It reads like a capable daisyUI admin table that happens to contain kata metadata. A more authored version would help resolve the user's actual question: "What should I practice next?" Right now, the interface exposes everything it knows but does not synthesize a practice recommendation, queue-building state, or progress moment.

**LLM assessment**: The route is efficient and usable for an experienced user, but the hierarchy is under-committed. Search, sort, collection filters, complexity filters, table columns, row actions, and progress signals all compete in a single dense surface. The best product-specific ideas are present as data, not yet expressed as interaction design.

**Deterministic scan**: `node /Users/urielmaldonado/.codex/skills/impeccable/scripts/detect.mjs --json src/routes/library.tsx` returned `[]` with exit code `0`. No detector rule names, locations, or false positives were reported.

**Visual overlays**: No reliable user-visible overlay is available. Assessment B could reach `http://localhost:1420/problems`, but it did not have mutable browser automation. The parent pass connected to the Browser plugin but did not receive page-state output; bundled Playwright was present but missing its browser executable. Fallback signal is source review plus HTTP route reachability.

**Overall Impression**

This is a strong inventory screen and a weaker practice decision screen. The biggest opportunity is not visual decoration; it is turning the top of `/problems` into a compact command surface that explains the current filtered set and gives users one or two obvious next actions.

**What's Working**

- The page respects repeated expert use: compact table, sort modes, keyboard row movement, remembered scroll, tag-as-filter clicks, LeetCode links, and context commands all reduce friction.
- The problem metadata is genuinely product-specific. Best time, streak, done, daily, levels, roadmap filters, and implementation size are valuable practice signals.
- The Problems/Modules split is clear: `/modules` can carry curriculum structure while `/problems` can remain the searchable inventory.

**Priority Issues**

**[P1] The primary practice decision is under-designed**  
Why it matters: Users come here to decide what to practice, not to manage a database. The page has enough signals to recommend or assemble a queue, but it leaves synthesis to the user.  
Fix: Add a compact status/action strip above the table with visible result count, daily count, completed count within current filters, and a primary action such as "Practice filtered" or "Add filtered to daily." Add a useful sort preset like "Needs work" based on not done, low streak, or no best time.  
Suggested command: `$impeccable shape`

**[P1] Filter controls are too flat and numerous**  
Why it matters: Search, an 11-option sort menu, four collection filters, four complexity filters, and clear/reset fragments create too many first-screen decisions. Density is fine; equal weight is the problem.  
Fix: Recompose the header into zones: search plus result count, sort/view controls, and collection filters. Treat LeetCode/Blind 75/NeetCode as a segmented collection control. Give all active filters one shared "Clear all" affordance.  
Suggested command: `$impeccable layout`

**[P2] Keyboard behavior is powerful but risky and undiscoverable**  
Why it matters: Arrow and Enter navigation are valuable, but the global key handler can fire while focus is in inputs, selects, buttons, or links. The users who would value keyboard browsing may also never discover it.  
Fix: Ignore row navigation when the active element is an interactive control. Surface the shortcuts through the command palette or a subtle table footer, and keep the visible copy minimal.  
Suggested command: `$impeccable harden`

**[P2] Row hierarchy does not match practice intent**  
Why it matters: Name, LeetCode number, done, difficulty, complexity, tags, best time, and streak are all visible, but not ranked by selection value. Done state is especially easy to miss because it is tucked inside the name cell.  
Fix: Make name, difficulty, and progress state the primary read. Move completion into a stable column or clearer glyph. De-emphasize tags further, or show one collection tag by default with overflow available on demand.  
Suggested command: `$impeccable distill`

**[P3] Visual craft is competent but generic**  
Why it matters: For an Operate surface, generic is not fatal, but the current visual language caps confidence and memorability. The page feels like a themed admin table rather than a deliberate kata cockpit.  
Fix: Preserve density, but tighten the table shell, reduce the `rounded-2xl` softness, use consistent iconography, sharpen selected-row treatment, and align row/progress styling with the dashboard and module surfaces.  
Suggested command: `$impeccable polish`

**Persona Red Flags**

**Alex, daily power user**: Alex benefits from keyboard selection and remembered scroll, but shortcut behavior is invisible and can conflict with focused controls. Alex wants "unsolved medium graph problems I have not practiced recently"; the screen supports pieces of that through manual search/filter/sort combinations, but not as a first-class workflow.

**Maya, interview prep planner**: Maya wants to build a week of practice. Daily, done, and modules exist, but `/problems` does not make queue-building feel deliberate. There is no visible daily count in the surface, no batch action for the filtered set, and no "practice this set" affordance.

**Jordan, first-time user**: Jordan sees "Complexity" as both a filter row and a table column without understanding that it means implementation-size LOC. "Daily" is represented by a star, "done" by a tiny inline check pill, and roadmap filters assume familiarity with Blind 75 and NeetCode.

**Minor Observations**

- Empty state should echo active filters/search and offer "Clear filters" before "Reload problem statements."
- Rows without a LeetCode URL currently show a dash; a blank cell or muted unavailable icon would reduce scanning noise.
- Search placeholder should advertise supported searches: problem name, tag, level, or `#`.
- The LeetCode icon column is useful, but its header-only icon is easy to miss for first-time users.
- Tags are helpful for discovery but currently add a lot of chromatic and layout texture in every row.

**Questions to Consider**

- What if `/problems` opened with one opinionated default: "show me what to practice next," with raw browsing still available?
- Should "Daily" behave more like a visible practice queue than a star/favorite metaphor?
- Which should dominate default ordering: curriculum, weakness, recency, or LeetCode list membership?
- Could this become a practice command center without becoming less dense?
