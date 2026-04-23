---
# ADR-004: Browser Toolbar Color — What Works and What Doesn't

## Status
Accepted

## Date
2026-04-09

## Context
On mobile browsers, the browser UI has chrome elements (status bar, address bar, bottom toolbar) that web pages cannot fully control. Behavior differs significantly between browsers:

**iOS Safari:**
- **Top status bar** — controllable via `meta[name="theme-color"]`
- **Bottom navigation toolbar** — not reliably controllable via any web API in regular (non-standalone) Safari

**Chrome iOS:**
- `theme-color` has **no effect** on Chrome's browser UI on iOS
- Both address bar and bottom toolbar remain Chrome's default grey regardless of `theme-color`
- Chrome iOS is forced to use Apple's WKWebView (Apple policy) but renders its own browser shell independently
- No workaround available — it is a Chrome iOS platform limitation

**Chrome Android:**
- `theme-color` works well — colors the status bar and address bar

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

| Platform | `theme-color` works? | Light | Dark |
|----------|---------------------|-------|------|
| iOS Safari | ✓ Top bar | `#ffffff` | `#000000` (true black) |
| Chrome Android | ✓ Status + address bar | `#ffffff` | `#121212` (Material surface) |
| Chrome iOS | ✗ No effect | — grey — | — grey — |

The Safari bottom toolbar naturally reflects `body { background-color }` over time as Safari takes UIKit snapshots. Since our `--page-bg` is `#ffffff`/`#000000`, the toolbar will eventually match.

**Chrome iOS grey bars:** Unfixable in a regular browser tab. The only escape is PWA standalone mode (add to home screen), which removes the browser chrome entirely. Cannot be forced — requires user action.

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
- **Chrome iOS users will always see grey browser bars** — accepted, no fix exists for regular browser tabs
