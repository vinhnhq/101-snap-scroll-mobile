---
# ADR-004: Accept Safari Bottom Toolbar Limitation — Control Top Bar Only

## Status
Accepted

## Date
2026-04-09

## Context
On iOS Safari, the browser UI has two chrome elements:
- **Top status bar** — controllable via `meta[name="theme-color"]`
- **Bottom navigation toolbar** — not reliably controllable via any web API in regular (non-standalone) Safari

We spent significant time trying to update the bottom toolbar color when the snap scroll slide changes. Every approach was tested and documented:

| Method | Result |
|--------|--------|
| `meta[name="theme-color"]` | Top bar only |
| `document.body.style.backgroundColor` | No effect in regular Safari |
| `window.scrollBy(0, 0)` | No-op if window is not scrollable |
| `window.scrollBy(0, 1)` + `html::after { height: 1px }` | Occasionally worked, unreliable |
| `display: none` → reflow → `display: block` | No effect |
| `history.replaceState` | No effect |
| `input.focus()` + immediate blur | Moves bar position but no color change |
| **`alert()`** | **Works** — forces UIKit snapshot, updates color |
| Body as scroll container | Works — but breaks snap scroll stability (see ADR-002) |

`alert()` was confirmed working in our tests (user verified: "it works :)))") but is not a production-viable approach — it creates a blocking modal dialog, terrible UX.

We then looked at how major sites handle this (stripchat.com referenced as example). The industry pattern is to use a transparent/opaque `theme-color` for the top bar and leave the bottom toolbar to naturally reflect the body background color over time.

## Decision
**Accept the limitation.** Control only the top status bar via `theme-color`. Do not fight the bottom toolbar.

### Implementation

```tsx
// app/theme-color-sync.tsx — sets theme-color to black/white per system scheme
const color = isDark() ? "#000000" : "#ffffff";
```

Platform defaults pre-defined:

| Platform | Light | Dark |
|----------|-------|------|
| iOS Safari | `#ffffff` | `#000000` (true black) |
| Android Chrome | `#ffffff` | `#121212` (Material surface) |

The bottom toolbar naturally reflects `body { background-color }` over time as Safari takes UIKit snapshots. Since our `--page-bg` is `#ffffff`/`#000000`, the toolbar will eventually match.

## Alternatives Considered

### `alert()` on every slide change
- Pros: Confirmed working
- Cons: Shows a blocking modal dialog on every scroll — catastrophic UX
- Rejected: Not production viable

### Body as scroll container
- Pros: Native body scroll triggers UIKit snapshot → bottom bar updates
- Cons: Snap point instability (see ADR-002), sections jitter on toolbar animation
- Rejected: Snap reliability > bottom bar color

### Per-slide `theme-color` updates (top bar only)
- Pros: Top bar changes color per slide, more immersive
- Cons: Jarring UX — top bar flashes between colors on every snap
- Rejected: After testing, static black/white `theme-color` looks cleaner

## Consequences
- Bottom Safari toolbar color will naturally match body background (`#ffffff`/`#000000`) after a short delay
- `ThemeColorSync` component in layout handles top bar updates globally across all pages
- No per-slide `theme-color` changes — simplifies the codebase
- No `themeColor` in Next.js `viewport` export (it would conflict with dynamic updates)
- This behavior matches major production sites (news apps, media sites)
