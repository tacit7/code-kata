# Missing Number Visualization Plan

## Algorithm
Given an array containing n distinct numbers taken from `0..n`, find the missing one.
Default approach for viz: **XOR scan** (showcases bit manipulation tag). Also offer a sum-diff secondary view.

XOR approach:
```
result = n
for i in range(n):
    result ^= i ^ nums[i]
return result
```

Sum approach:
```
expected = n * (n + 1) // 2
actual = sum(nums)
return expected - actual
```

## Step Breakdown
Each step is a snapshot recorded into `steps[]`:

1. **init** — show array, n, initial `result = n` (XOR) or `expected/actual` (sum). lines: highlight init line.
2. **iterate** — for each index i (0..n-1):
   - **xor-index**: highlight cell i, show `result ^= i`, update result.
   - **xor-value**: highlight cell i, show `result ^= nums[i]`, update result.
   (For sum: single per-iter step accumulating `actual += nums[i]`.)
3. **done** — final result; flash the missing value.

## Snapshot Shape
```js
{
  i: number,            // current index, -1 before loop, n after
  arr: number[],        // input nums
  n: number,
  result: number,       // running XOR (or actual sum)
  mode: 'xor' | 'sum',
  phase: 'init' | 'xor-index' | 'xor-value' | 'sum-add' | 'done',
  xorWith: number|null, // value being XORed this step (for highlight)
  missing: number|null, // set on 'done'
  desc: string,         // narration
  lines: number[]       // pseudocode lines to highlight
}
```

## Layout
- **Top bar**: title "Missing Number", mode toggle (XOR / Sum), input field for custom array, randomize button, VizNav controls.
- **Main (flex:1, two-column)**:
  - **Left (array panel)**: array cells `[3,0,1]` rendered as squares. Cell i highlighted when active. Below cells: index row. Show `n = arr.length`.
  - **Right (state panel)**:
    - Variables card: `i`, `result` (binary + decimal for XOR mode), `xorWith` current op.
    - Pseudocode card with line highlights based on `phase`.
    - Description / narration line at bottom.
- **Bottom**: step counter, narration strip.

Follow bfs/index.html structure: viewport sized, queue-hints style, dynamic right panel.

## GSAP Effects
- **Cell highlight**: scale 1.0 → 1.15 → 1.0 with bg color flash when i advances.
- **Result pop-in**: scale from 0.8 → 1.0, color flash on result change.
- **XOR op chip**: fade-in showing `result ^ i ^ nums[i] = new`.
- **Missing value reveal**: on 'done', the missing number badge pops in with bounce, plus draw a "ghost" cell at the missing index.
- **Mode toggle**: cross-fade between XOR and Sum views.

## Input Controls
- Custom array input: comma-separated, must be permutation-like of `0..n` with one missing.
- Validate: all unique, all in `[0..n]` where `n = len+1`.
- Preset examples: `[3,0,1]`, `[0,1]`, `[9,6,4,2,3,5,7,0,1]`.
- Mode toggle: XOR (default, ties to Bit Manipulation tag) vs Sum.

## Files
- `public/algo-viz/missing-number/index.html` — single page with embedded JS using shared viz.js + style.css + gsap.min.js (local).
- Hub card in `public/algo-viz/index.html` under Bit Manipulation tag.
- Back-link guard for iframe embedding.
