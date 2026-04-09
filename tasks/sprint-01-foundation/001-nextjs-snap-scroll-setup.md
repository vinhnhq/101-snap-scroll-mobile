# 001 — Next.js Snap Scroll Setup

**Status:** ✓ done  
**Sprint:** 01 — Foundation  
**ADRs:** [ADR-002](../../docs/decisions/ADR-002-inner-div-snap-scroll-container.md) · [ADR-005](../../docs/decisions/ADR-005-lvh-viewport-units.md) · [ADR-001](../../docs/decisions/ADR-001-tailwind-v3-over-v4.md)

## Goal
Bootstrap a Next.js app with a working 5-slide vertical snap scroll layout targeting iOS Safari and Android Chrome.

## Acceptance Criteria
- [x] 5 full-screen sections, each snapping cleanly on mobile
- [x] No scroll jitter when Safari toolbar animates in/out
- [x] `scroll-snap-stop: always` — no slide skipping on fast swipe
- [x] Tailwind v3.4 configured (not v4 — breaks Safari snap)
- [x] Inner `<div>` is the scroll container (not body)
- [x] All sections use `h-lvh` (not `dvh` or `vh`)

## Files touched
- `app/page.tsx` — scroll container + 5 slide sections
- `tailwind.config.js` — v3.4 config
- `postcss.config.mjs` — tailwindcss + autoprefixer

## Notes
Attempted body-as-scroll-container to enable Safari UIKit bottom bar updates. Reverted — `dvh` scroll port vs `lvh` sections caused snap point jitter. Inner div approach is stable.
