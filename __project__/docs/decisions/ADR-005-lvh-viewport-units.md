---
# ADR-005: Use `lvh` (Largest Viewport Height) for Snap Scroll Sections

## Status
Accepted

## Date
2026-04-09

## Context
Each snap scroll section needs to fill exactly one viewport height. On mobile Safari, the viewport height changes as the browser toolbar animates in and out during scroll. Three CSS units are available:

| Unit | Definition | Behavior |
|------|-----------|---------|
| `vh` | 1% of initial containing block height | Fixed to the viewport at page load — mismatches as Safari toolbar animates |
| `dvh` | Dynamic viewport height | Changes in real-time as toolbar shows/hides — snap points move = jitter |
| `lvh` | Largest viewport height (toolbar fully retracted) | Stable, fixed value — does not change |

For snap scroll, the critical requirement is **stable snap points**. If section height changes while the user is scrolling, the snap engine re-calculates anchor positions mid-scroll, causing visible jitter and failed snaps.

## Decision
Use **`lvh`** (Tailwind class: `h-lvh`) for both the scroll container and all snap sections.

```tsx
// Scroll container
<div className="h-lvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide">

// Each section
<section className="snap-start snap-always h-lvh w-full">
```

## Why not `dvh`?

`dvh` tracks the current available height. On Safari, as the bottom toolbar animates in, `dvh` shrinks. With snap sections sized to `dvh`, every section shrinks simultaneously → snap anchor positions recalculate → the snap engine fights the ongoing animation. Result: jittery, unreliable snapping.

## Why not `vh`?

`vh` is calculated at page load time using the initial viewport size (with toolbar visible). Once Safari hides the toolbar (on scroll), the true available height becomes larger than `vh`. Sections are undersized → gaps appear between snap sections.

## Trade-off with `lvh`

`lvh` assumes the toolbar is always hidden. On first page load (toolbar visible), sections will be slightly taller than the visible area — the bottom of a section is hidden behind the toolbar by ~50px. This is acceptable: as soon as the user scrolls, Safari hides the toolbar and sections fill perfectly. This matches behavior seen on high-quality mobile web apps.

## Consequences
- Sections are sized to the largest possible viewport — stable snap points
- Initial load: bottom ~50px of first section may be behind Safari toolbar (acceptable)
- After first scroll: toolbar retracts, perfect fit
- Tailwind utility: `h-lvh` (requires Tailwind v3.2+ or v4)
- Must use `h-lvh` on both container AND sections — mismatched units = snap failures
