# 005 — ThemeColorSync — Top Status Bar

**Status:** ✓ done  
**Sprint:** 02 — Theming  
**ADRs:** [ADR-004](../../docs/decisions/ADR-004-safari-toolbar-color-strategy.md)

## Goal
Keep the iOS Safari / Android Chrome top status bar color in sync with the current dark/light scheme across all pages.

## Acceptance Criteria
- [x] `ThemeColorSync` component mounted at layout level (applies globally)
- [x] Sets `meta[name="theme-color"]` to `#000000` (dark) or `#ffffff` (light)
- [x] Reacts to `next-themes` toggling `class="dark"` on `<html>` via MutationObserver
- [x] Idempotent — reuses existing meta tag instead of creating duplicates
- [x] Platform-aware defaults: iOS uses true black `#000000`, Android uses `#121212`
- [x] No `themeColor` in Next.js viewport export (would conflict)

## Files touched
- `app/theme-color-sync.tsx` — MutationObserver + meta tag management
- `app/layout.tsx` — `<ThemeColorSync />` added to layout
- `app/slide-config.ts` — per-slide color map (defined but not used in ThemeColorSync — available for future use)
