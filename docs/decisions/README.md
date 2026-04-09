# Architecture Decision Records

Decisions made while building the snap-scroll mobile web app (Next.js + Tailwind + iOS Safari target).

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](ADR-001-tailwind-v3-over-v4.md) | Use Tailwind CSS v3.4 instead of v4 | Accepted |
| [ADR-002](ADR-002-inner-div-snap-scroll-container.md) | Use inner `<div>` as snap scroll container (not body) | Accepted |
| [ADR-003](ADR-003-next-themes-dark-light-mode.md) | Use `next-themes` for dark/light mode | Accepted |
| [ADR-004](ADR-004-safari-toolbar-color-strategy.md) | Accept Safari bottom toolbar limitation — control top bar only | Accepted |
| [ADR-005](ADR-005-lvh-viewport-units.md) | Use `lvh` viewport units for stable snap points | Accepted |
| [ADR-006](ADR-006-safe-area-insets.md) | Safe area inset CSS utilities for notch/home indicator | Accepted |

## How to Read These

Each ADR answers: **what was decided, why, and what was rejected**.

For the full implementation reference (code snippets, quick checklist), see [`../mobile-web-snap-scroll-theming.md`](../mobile-web-snap-scroll-theming.md).
