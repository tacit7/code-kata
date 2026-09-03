---
target: public/algo-viz representative visualization collection
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-28T02-45-40Z
slug: public-algo-viz
---
Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2 | Step counters and phase badges help, but some pages start blank or contradictory. |
| 2 | Match System / Real World | 3 | Arrays, grids, graphs, pointers, heaps, and code highlighting map well to algorithm concepts. |
| 3 | User Control and Freedom | 2 | Step/play/reset/speed exist, but narrow layouts trap content and resize affordances are weak. |
| 4 | Consistency and Standards | 2 | Shell is consistent, but page controls, reset behavior, back links, and panel placement vary. |
| 5 | Error Prevention | 1 | Invalid inputs mostly fail silently. |
| 6 | Recognition Rather Than Recall | 3 | Legends and variable panels reduce recall, especially in Coin Change and Network Delay. |
| 7 | Flexibility and Efficiency | 2 | Presets and speed help, but no scrubber, direct jump, or keyboard affordance. |
| 8 | Aesthetic and Minimalist Design | 2 | The debugger shell is focused but over-dense, with small type and weak hierarchy. |
| 9 | Error Recovery | 1 | Few visible recovery paths for bad custom examples. |
| 10 | Help and Documentation | 2 | Step descriptions help, but pages lack compact learning framing and final insight summaries. |
| **Total** | | **20/40** | **Needs structural polish** |

Design Specificity Verdict

The collection is credible as a coding-practice debugger, but not yet authored enough for Code Kata's learning promise. Most pages share the same split-pane shell, tiny uppercase labels, cyan actions, variable sidebar, and bottom playback. That creates consistency, but also makes dynamic programming, backtracking, graph shortest path, and pointer reversal feel too interchangeable.

Overall Impression

The core idea is strong: code, state, and visualization move together. The biggest opportunity is to make the algorithm object the hero and demote code/variables into supporting context when space is tight.

What's Working

- The code-plus-state model is right for this product.
- Theme variables keep the viz pages compatible with the app.
- Word Search and Reverse Linked List are the strongest sampled pages because their state is spatial and legible.

Priority Issues

[P1] Mobile and narrow layouts are structurally broken
Why it matters: In iframe or narrow panes, fixed horizontal panels clip the visualization and let the code/sidebar consume the learning surface.
Fix: Add responsive rules that collapse code/sidebar into tabs or stacked panels below the visualization. Keep the visualization first.
Suggested command: $impeccable adapt

[P1] Initial states feel blank or contradictory
Why it matters: Network Delay loads an active preset but does not build until Run; Coin Change can show Step 0 / 0 before meaningful content. This makes pages feel inert.
Fix: Auto-run default examples consistently, or show a deliberate setup preview state.
Suggested command: $impeccable polish

[P1] Network Delay violates the parent playback contract
Why it matters: The kata editor sends Reset by clicking #resetBtn. Network Delay has prev/step/play/speed but no resetBtn, so the shared Reset control cannot work.
Fix: Add the missing reset button element wired to buildAndRun/load current preset, even if hidden by the iframe bridge.
Suggested command: $impeccable harden

[P2] Visual hierarchy overweights code panels
Why it matters: The code is useful, but it often steals attention from the diagram. Graphs, DP arrays, and pointer choreography should dominate.
Fix: Give each algorithm family a stronger primary stage and make code/variables supporting panels.
Suggested command: $impeccable layout

[P2] Error handling is silent
Why it matters: Learners experimenting with custom inputs get no explanation when parsing fails.
Fix: Add inline validation under inputs with specific recovery text.
Suggested command: $impeccable clarify

Persona Red Flags

Interview Prep Learner: Blank starts, dense debugger chrome, and tiny status labels delay the "I get it" moment.

Visual Learner: On constrained widths, the diagram becomes secondary or clipped, so the visual explanation fails its own user.

Power User: Step/play/speed are useful, but there is no scrubber, direct step jump, keyboard affordance, or compare mode.

Minor Observations

- Detector flagged flat type hierarchy in Two Sum, Coin Change, Network Delay, and Reverse Linked List.
- Random button styling is inconsistent across pages.
- Network Delay has an All Algorithms back link while most sampled pages do not.
- Several pages rely on hardcoded colors, weakening theme quality.
- Resize handles exist but are not discoverable.

Questions to Consider

- What if every viz opened at the first meaningful algorithm state?
- What if code and variables became supporting tabs, while the algorithm object owned the viewport?
- Should these feel like debuggers, lessons, or interactive whiteboards?
