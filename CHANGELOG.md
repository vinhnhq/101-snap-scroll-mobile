# Changelog

## [0.1.0] - 2026-04-09

### Features

- **5-slide vertical snap scroll** — full-screen sections with CSS snap (`snap-mandatory`, `snap-always`, `h-lvh`)
- **Slide entrance animations** — blur-to-clear fade as each slide snaps into view (CSS class toggle + IntersectionObserver)
- **Dark/light mode** — system preference sync + user override via `next-themes`, flash-free on first paint
- **Safe area handling** — notch, Dynamic Island, and home indicator support via `env(safe-area-inset-*)` utilities
- **Safari top bar theming** — `theme-color` meta tag synced to active theme (black/white)
- **Mobile-optimized** — tested on iOS Safari and Android Chrome

### Architecture

- Inner `<div>` scroll container (not body) for stable snap points — see ADR-002
- `h-lvh` throughout for snap stability during Safari toolbar animation — see ADR-005
- Tailwind CSS v3.4 (not v4) — v4 breaks iOS Safari snap and touch events — see ADR-001
- CSS class toggle animation (not React `<ViewTransition>`) — ViewTransition key toggling causes flash on fast scroll — see ADR-007

### Known Limitations

- Safari bottom toolbar color cannot be reliably controlled — see ADR-004
- 2 Playwright test assertions fail ("each slide has a distinct height") — test assertion is incorrect (all slides use `h-lvh` by design, same height is correct behavior). Pre-existing, not introduced by any sprint.
