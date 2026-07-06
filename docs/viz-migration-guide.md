# Algo Viz Migration / Style Guide

How to build or migrate an algorithm visualization page so it matches the style
of `public/algo-viz/two-sum/index.html` and `public/algo-viz/valid-anagram/index.html`.

These are the two canonical references — read one of them side by side with this
guide before starting.

## File layout

```
public/algo-viz/<slug>/index.html   # single self-contained file, no build step
```

Add the new viz in two more places once it works:
1. A card in `public/algo-viz/index.html` (the hub page).
2. An entry in `VIZ_MAP` in `src/components/kata-editor.tsx`, mapping the kata name
   to `<slug>`.

## Required `<head>` includes

```html
<link rel="stylesheet" href="../shared/style.css" />
<script src="../shared/gsap.min.js"></script>
<script src="../shared/viz.js"></script>
```

`shared/style.css` is the Tokyo Night theme — use its CSS vars (`--bg`,
`--surface`, `--accent`, `--green`, `--blue`, `--orange`, `--purple`,
`--text`, `--text-muted`, `--text-dim`, `--border`, `--radius-sm`, etc.)
instead of hardcoding colors.

## Page skeleton (top to bottom)

```html
<div class="viz-inputs"> ... presets / inputs / Run / Random ... </div>
<div class="controls"></div>          <!-- empty; nav buttons rendered below live in #nav-row -->

<div id="header">
  <span id="phase-badge">Setup</span>
  <span>Viz Title</span>
  <span id="step-counter">Step 0 / 0</span>
</div>

<div id="main">
  <div id="viz-area"> ... the actual visualization ... </div>
  <div id="resize-handle"></div>
  <div id="code-panel"> ... code lines with highlight classes ... </div>
  <div id="sidebar"> ... live variable values ... </div>
</div>

<div id="nav-row">
  <button id="prevBtn">Prev</button>
  <button id="stepBtn">Step</button>
  <button id="playBtn">Play</button>
  <button id="resetBtn">Reset</button>
  <select id="speedSel">...</select>
</div>
```

`body` should be `height: 100vh; display: flex; flex-direction: column; overflow: hidden;`
so nothing scrolls the whole page — only `#viz-area`, `#code-panel`, `#sidebar`
scroll internally if needed.

## The `.viz-inputs` rule (critical)

The parent app (`kata-editor.tsx`) loads every viz in an iframe and injects CSS
that **hides** these classes/IDs:

```
.controls, .input-row, .step-nav, .nav-bar, .nav-row, .nav-strip, .nav-box,
.nav-panel, .bottom-bar, .ctrl-row, .controls-row, #nav-bar, #nav-controls,
.control-group
```

It also walks the DOM from `#prevBtn` and hides whatever ancestor also contains
`#playBtn` (so `#nav-row` above is hidden intentionally — that's fine, since
playback is driven by `postMessage` from the parent, not by clicking those
buttons directly).

**Any user-facing input (preset dropdown, text/number fields, Run button,
Random button) must live inside `<div class="viz-inputs">`.** That class is
NOT in the hidden list. Never put inputs inside `.controls` — they'll be
invisible in the app even though they render fine when you open the file
directly in a browser.

```html
<div class="viz-inputs">
  <div>
    <label>Preset</label>
    <select id="presetSel" onchange="loadPreset()">...</select>
  </div>
  <div>
    <label>Array</label>
    <input type="text" id="arrayInput" value="2,7,11,15" />
  </div>
  <button class="vi-btn-run" onclick="buildAndRun()">Run</button>
  <button class="vi-btn-rand" onclick="randomExample()">Random</button>
</div>
<div class="controls"></div>
```

Every viz must define `loadPreset()` and `randomExample()`, wired to the
`onchange`/`onclick` handlers above.

## VizNav bridge (playback controls)

The parent app drives playback via `postMessage` messages `'prev'`, `'play'`,
`'step'`, `'reset'`, `{type:'speed', value}`. For this to work, button IDs
must be exactly `prevBtn`, `stepBtn`, `playBtn`, `resetBtn`, `speedSel`.

Wire them up with the shared helper:

```js
window.nav = VizNav({
  btnPrev:  document.getElementById('prevBtn'),
  btnNext:  document.getElementById('stepBtn'),
  btnPlay:  document.getElementById('playBtn'),
  speedSel: document.getElementById('speedSel'),
  render: function(snap, cur, total) {
    applyStep(snap);
    updateStatus(snap, cur, total);
  }
});
```

`VizNav` returns `{ load(steps), goTo(idx), stopPlay(), cursor(), total() }`.
Call `window.nav.load(steps)` whenever you (re)build the simulation.

This snapshot/VizNav pattern is for **new** vizzes. Some older animated pages
(`kadanes`, `house-robber`, `bfs-grid`, `bfs-traversal`) use a different
transition-based pattern and are not VizNav-compatible — don't copy those for
new work.

## Simulation pattern (snapshot-based)

Precompute the entire run as an array of step snapshots, then let `VizNav`
step/play/reset through them. Each snapshot should carry everything `render()`
needs to redraw the UI from scratch — don't rely on incremental DOM diffing.

```js
function simulate(nums, target) {
  const steps = [];
  // ... push a snapshot object per meaningful state change ...
  steps.push({
    phase: 'Loop i=' + i,          // shown in #phase-badge
    desc: 'human-readable line',    // shown in #desc
    lines: [2, 3],                  // code-panel line indices to highlight
    // ...whatever state your render() needs (indices, maps, results)...
  });
  return steps;
}

function applyStep(snap) {
  // clear + reapply CSS classes on cells/nodes based on snap
  // highlight code lines: snap.lines.forEach(i => cl-i.classList.add('hl'))
  // update sidebar variable list
}

function updateStatus(snap, cur, total) {
  document.getElementById('phase-badge').textContent = snap.phase;
  document.getElementById('step-counter').textContent = 'Step ' + cur + ' / ' + total;
}
```

## Code panel

Build highlightable code lines from a plain array, not raw HTML in the DOM:

```js
const codeLines = [
  { n: 1, t: '<span class="kw">def</span> <span class="nb">two_sum</span>(nums, target):' },
  { n: 2, t: '  seen = {}  <span class="cm"># value -> index</span>' },
];
```

Reuse the `.kw` (keyword), `.nb` (name/builtin), `.cm` (comment) span classes
from `shared/style.css` for basic syntax coloring. Each rendered line gets
`id="cl-<index>"` and class `cl`; add `.hl` to highlight it for the current
step.

## Sidebar + resize handle

`#sidebar` shows live variable values as simple key/value rows
(`.var-item` / `.var-key` / `.var-val`). `#resize-handle` between the viz area
and code panel lets the user drag to resize `#code-panel` — copy the drag
handler verbatim from two-sum, it's generic (min 120px, max 560px).

## GSAP conventions

- `gsap.to(el, { attr: { fill, stroke } })` for SVG elements
- `gsap.to(el, { backgroundColor })` for DOM/CSS-grid elements
- `gsap.fromTo(el, { scale: 0.7 }, { scale: 1, ease: 'back.out(1.7)' })` for pop-in emphasis

## Checklist for a new/migrated viz

- [ ] Single file at `public/algo-viz/<slug>/index.html`, includes shared CSS/JS
- [ ] All user inputs inside `.viz-inputs`, `.controls` left empty
- [ ] `loadPreset()` and `randomExample()` implemented
- [ ] Nav buttons use exact IDs `prevBtn` / `stepBtn` / `playBtn` / `resetBtn` / `speedSel`
- [ ] Simulation precomputes `steps[]`; `render(snap, cur, total)` rebuilds UI from the snapshot
- [ ] Code panel lines highlightable via `snap.lines`
- [ ] Card added to `public/algo-viz/index.html`
- [ ] Entry added to `VIZ_MAP` in `src/components/kata-editor.tsx`
