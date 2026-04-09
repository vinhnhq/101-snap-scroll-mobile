# 002 — Safe Area Insets

**Status:** ✓ done  
**Sprint:** 01 — Foundation  
**ADRs:** [ADR-006](../../docs/decisions/ADR-006-safe-area-insets.md)

## Goal
Ensure content on every slide is never overlapped by the iOS notch, Dynamic Island, or home indicator bar.

## Acceptance Criteria
- [x] `viewportFit: "cover"` set in layout viewport export
- [x] `.pt-safe`, `.pb-safe`, `.pb-safe-min` utilities defined in `globals.css`
- [x] All 5 slides apply `pt-safe` at minimum
- [x] Slides with bottom content (hero CTA, newsletter) use `pb-safe-min`
- [x] On devices without notch/home indicator, padding falls back to 0

## Files touched
- `app/globals.css` — utility definitions inside `@layer utilities`
- `app/layout.tsx` — `viewportFit: "cover"` in viewport export
- `app/page.tsx` — `pt-safe`/`pb-safe`/`pb-safe-min` applied per section
