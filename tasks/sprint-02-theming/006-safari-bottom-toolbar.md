# 006 — Safari Bottom Toolbar Investigation

**Status:** ✓ done (accepted limitation)  
**Sprint:** 02 — Theming  
**ADRs:** [ADR-004](../../docs/decisions/ADR-004-safari-toolbar-color-strategy.md)

## Goal
Investigate whether the Safari bottom navigation bar color can be controlled from web JS/CSS, and decide on a strategy.

## Acceptance Criteria
- [x] All known methods tested and documented
- [x] Decision made on production approach
- [x] No production UX regression from the investigation

## Methods tested

| Method | Result |
|--------|--------|
| `meta[name="theme-color"]` | Top bar only |
| `document.body.style.backgroundColor` | No effect |
| `window.scrollBy(0, ±1)` + `html::after { height: 1px }` | Unreliable |
| `display: none` → reflow | No effect |
| `input.focus()` + blur | No color change |
| `alert()` | **Works** — forces UIKit snapshot |
| Body as scroll container | Works but breaks snap stability |

## Outcome
Accepted limitation. `alert()` confirmed working but not production-viable. Strategy: set `theme-color` to `#ffffff`/`#000000` for the top bar only. Bottom toolbar naturally reflects body background over time. Matches industry pattern (major news/media sites).
