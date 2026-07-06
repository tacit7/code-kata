# Lomuto Partition Viz

**File:** `public/algo-viz/quick-sort/index.html`

## What it shows

Visualizes Quicksort with the Lomuto partition scheme. The viz runs the full recursive sort and lets you step through every decision — partition calls, base cases, recursive calls, and the final sorted state.

## Algorithm

```python
def quicksort(arr, lo, hi):
    if lo < hi:
        p = partition(arr, lo, hi)
        quicksort(arr, lo, p - 1)
        quicksort(arr, p + 1, hi)

def partition(arr, lo, hi):
    pivot = arr[hi]
    boundary = lo
    for scan in range(lo, hi):
        if arr[scan] <= pivot:
            arr[boundary], arr[scan] = arr[scan], arr[boundary]
            boundary += 1
    arr[boundary], arr[hi] = arr[hi], arr[boundary]
    return boundary
```

## Visual Elements

### Array display
Each element is a box with its index below. Color coding:

| Color | Meaning |
|-------|---------|
| Amber | Pivot (`arr[hi]`) |
| Blue  | `boundary` — next slot for a value ≤ pivot |
| Red   | `scan` — current element being evaluated |
| Green | Confirmed sorted (pivot placed, or base case) |
| Accent border | In the active subarray range `[lo, hi]` |

### Bracket row
Shows the current `[lo … hi]` subarray range above the boxes using `[`, `─`, `]` characters.

### Pointer row
Labels above each box: `P` (pivot), `bnd` (boundary), `scn` (scan). Multiple pointers on the same index are joined with `/`.

### Sidebar
Live values for `lo`, `hi`, `pivot`, `boundary`, `scan`, and count of sorted elements.

### Message box
Plain-English description of what just happened at each step.

## Code Panel

Shows both functions. Lines highlight as the simulation steps through them:

- Lines 1–5: `quicksort` function
- Lines 7–15: `partition` function

Resize handle between the viz area and code panel — drag left/right to adjust width.

## Simulation

Steps are pre-computed on Run and stored in an array. Each step captures:

```js
{
  arr,       // array state at this moment
  lo, hi,    // active subarray bounds
  pivotIdx,  // index of the pivot element (-1 if not in partition)
  iPtr,      // boundary index (-1 if not applicable)
  jPtr,      // scan index (-1 if not applicable)
  sorted,    // Set of indices confirmed in final position
  codeLine,  // which code line to highlight
  msg        // description string
}
```

### Key simulation moments in `doPartition`

1. `pivot = arr[hi]` — snap with pivot colored
2. `boundary = lo` — snap showing initial boundary
3. Each `scan` iteration: two snaps — one to show scan landing, one for the `<=` check result
4. Swap (if `arr[scan] <= pivot` and `boundary !== scan`): DOM rebuild triggers GSAP FLIP animation
5. `boundary += 1` — snap after increment
6. Final pivot placement: snap with pivot moved to boundary, added to sorted set
7. `return boundary` — snap before returning

### Swap animation

Uses GSAP FLIP technique:
- Capture `getBoundingClientRect()` of both boxes before DOM rebuild
- After DOM rebuild, animate from old position to new with `gsap.fromTo(el, {x: delta}, {x: 0, duration: 0.35})`
- Only fires on forward steps where exactly 2 elements swapped

## Inputs

| Control | Description |
|---------|-------------|
| Preset dropdown | 8 presets covering edge cases (reverse sorted, all same, duplicates, single element) |
| Array input | Comma-separated integers |
| Run | Rebuilds simulation from current input |
| Random | Generates 5–9 random integers 1–20 |

## Playback

Uses manual playback (not VizNav) — custom `startPlay`/`stopPlay` with `setInterval`. Speed options: 0.5×, 1×, 2×, 4×.
