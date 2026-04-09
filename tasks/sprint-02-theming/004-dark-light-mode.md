# 004 — Dark/Light Mode with next-themes

**Status:** ✓ done  
**Sprint:** 02 — Theming  
**ADRs:** [ADR-003](../../docs/decisions/ADR-003-next-themes-dark-light-mode.md)

## Goal
Add system-aware dark/light mode that persists user preference, works with Tailwind `dark:` variants, and produces zero flash on load.

## Acceptance Criteria
- [x] `next-themes` installed and configured in `layout.tsx`
- [x] `suppressHydrationWarning` on `<html>` — prevents React hydration error
- [x] `attribute="class"` — Tailwind `dark:` variants work automatically
- [x] `enableSystem` — follows OS color scheme by default
- [x] `--page-bg` CSS variable in `globals.css` set via `prefers-color-scheme` media query — zero flash before JS runs
- [x] `mounted` guard pattern used in any client component reading `resolvedTheme`
- [x] `themeColor` removed from viewport export — was conflicting with dynamic JS updates

## Files touched
- `app/layout.tsx` — ThemeProvider wrapper, suppressHydrationWarning
- `app/globals.css` — `--page-bg` CSS variable, media query fallback
- `package.json` — next-themes dependency
