# Task List: Fluid Responsive Content Sizing

- [ ] **Task 1** — Add `font-size: clamp(14px, 2vw + 1vh, 18px)` to `html` in `app/globals.css`
- [ ] **Task 2** — Create `components/mobile-slide.tsx` wrapper, refactor all 5 slides to use it
- [ ] **Task 3** — Audit and update hardcoded corner/edge `bottom`/`top` values to use `clamp()` + `env(safe-area-inset-*)`
- [ ] **Task 4** — Run `bun test`, verify DevTools at iPhone SE and Pro Max sizes
