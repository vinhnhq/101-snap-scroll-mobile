---
# ADR-002: Use Inner `<div>` as Snap Scroll Container (Not `<body>`)

## Status
Accepted

## Date
2026-04-09

## Context
Snap scroll requires a defined scroll container with `overflow-y: scroll` and `scroll-snap-type: y mandatory`. There are two options:
1. Make `<body>` the scroll container (native body scroll)
2. Use an inner `<div>` that fills the viewport

We attempted the body-as-scroll-container approach to leverage Safari's UIKit body scroll (which can trigger bottom toolbar color updates). The attempt was reverted after discovering a fundamental height mismatch.

### The body scroll problem

When `<body>` is the scroll container, each snap section needs `height: 100%` of the viewport. The viewport height unit Safari uses for the body scroll port is `dvh` (dynamic viewport height) — the *current* available height as the toolbar animates in/out.

Our snap sections used `h-lvh` (largest viewport height — toolbar retracted). As the Safari toolbar animates in, `dvh` shrinks but `lvh` stays constant → sections are taller than the scroll port → snap points jump and jitter during toolbar animation.

### Attempted fix
Using `h-dvh` on sections would match the scroll port size, but snap points themselves move as `dvh` changes → snapping becomes unreliable and visually glitchy.

## Decision
Use a **full-viewport inner `<div>`** as the scroll container:

```tsx
<div className="h-lvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
     style={{ WebkitOverflowScrolling: "touch" }}>
  <section className="snap-start snap-always h-lvh w-full">...</section>
</div>
```

The inner div's scroll port is always `lvh` (fixed, largest). Sections are also `lvh`. Snap points are stable regardless of Safari toolbar state.

## Alternatives Considered

### Body as scroll container
- Pros: Native body scroll can trigger Safari UIKit bottom toolbar color updates
- Cons: Height mismatch between `dvh` scroll port and `lvh` sections causes snap jitter
- Rejected: Snap reliability is more important than bottom toolbar color control

### `100dvh` for both container and sections
- Pros: Consistent height, no mismatch
- Cons: Snap points move as toolbar animates → visible jitter on every scroll
- Rejected: Terrible UX on mobile

## Consequences
- Snap points are always stable — no jitter during Safari toolbar animation
- Bottom Safari toolbar color cannot be reliably controlled (see ADR-004)
- `WebkitOverflowScrolling: "touch"` added for smooth momentum scrolling on older iOS
- `scrollbar-hide` utility needed to suppress the scrollbar on the inner div (see globals.css)
