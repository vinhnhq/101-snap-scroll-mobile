# Task List: Snap Scroll ViewTransition Animations

- [ ] **Task 1** — Add `experimental: { viewTransition: true }` to `next.config.ts`
- [ ] **Task 2** — Copy CSS recipes (timing vars, keyframes, slide-up, reduced motion) into `app/globals.css`
- [x] **Task 3** — ~~Polyfill loader~~ — `@view-transitions/polyfill` does not exist on npm. React 19's `<ViewTransition>` has built-in graceful degradation; polyfill not needed.
- [ ] **Task 4** — Convert `app/page.tsx` to `'use client'`, add IntersectionObserver + ViewTransition wrapping
- [ ] **Task 5** — Run `npm test` — all 6 Playwright tests pass
