# 003 — Scrollbar Hide

**Status:** ✓ done  
**Sprint:** 01 — Foundation

## Goal
Hide the scrollbar on the snap scroll container across all browsers without breaking scroll functionality.

## Acceptance Criteria
- [x] Scrollbar hidden on Chrome/Safari (WebKit)
- [x] Scrollbar hidden on Firefox (`scrollbar-width: none`)
- [x] Scrollbar hidden on IE/Edge (`-ms-overflow-style: none`)
- [x] Scroll still works — only the visual indicator is hidden

## Files touched
- `app/globals.css` — `.scrollbar-hide` class defined **outside** `@layer utilities`

## Notes
`::-webkit-scrollbar { display: none }` must be outside `@layer utilities` — Tailwind discards pseudo-element rules inside layers. This was a bug that required moving the rule out of the layer block.
