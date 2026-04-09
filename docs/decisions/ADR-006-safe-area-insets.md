---
# ADR-006: Safe Area Inset CSS Utilities for Notch / Dynamic Island / Home Indicator

## Status
Accepted

## Date
2026-04-09

## Context
Modern iPhones (iPhone X+) have a notch or Dynamic Island at the top and a home indicator bar at the bottom. These OS chrome elements physically overlap the web content when `viewportFit: "cover"` is set (required for content to extend edge-to-edge behind system chrome).

Without safe area handling, content (text, buttons, inputs) is hidden behind the notch or home indicator.

## Decision
Define three CSS utility classes using `env(safe-area-inset-*)` and apply them to every snap section:

```css
/* globals.css — inside @layer utilities */
@layer utilities {
  .pt-safe      { padding-top: env(safe-area-inset-top); }
  .pb-safe      { padding-bottom: env(safe-area-inset-bottom); }
  .pb-safe-min  { padding-bottom: max(env(safe-area-inset-bottom), 2.5rem); }
}
```

### Viewport meta — required

```tsx
// layout.tsx
export const viewport: Viewport = {
  viewportFit: "cover",   // extends content under notch + home indicator
  userScalable: false,
  maximumScale: 1,
};
```

Without `viewportFit: "cover"`, `env(safe-area-inset-*)` returns `0` — the utilities have no effect.

### Usage per section type

```tsx
// Sections with bottom content (CTAs, buttons, hero)
className="... pt-safe pb-safe-min"

// Sections with centered content
className="... pt-safe pb-safe"

// Inner-scrollable sections (reviews list)
className="... overflow-y-auto pt-safe pb-safe-min"
```

`.pb-safe-min` uses `max()` to guarantee at least `2.5rem` (40px) clearance below the home indicator — avoids accidental taps on the home gesture area.

## Alternatives Considered

### Fixed padding values (e.g. `pt-12 pb-16`)
- Pros: Simple, predictable
- Cons: Hardcoded values break on different devices (SE vs Pro Max) or when home indicator is absent
- Rejected: `env()` adapts per device automatically

### JS-based inset detection (`visualViewport` API)
- Pros: Can detect exact inset values at runtime
- Cons: More complex, requires re-layout on orientation change, SSR-unsafe
- Rejected: CSS `env()` is the standard, simpler, and works without JS

## Consequences
- `viewportFit: "cover"` is required — without it, insets are always 0
- `env(safe-area-inset-top)` is ~47px on iPhone 14 Pro (Dynamic Island), ~44px on iPhone X
- `env(safe-area-inset-bottom)` is ~34px on iPhones with home indicator
- On devices without notch/home indicator, `env()` returns `0` — no extra padding added
- Android Chrome also respects these insets for devices with display cutouts
