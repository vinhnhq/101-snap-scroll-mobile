# Task List: Snap Scroll ViewTransition Animations

- [x] **Task 1** — Add `experimental: { viewTransition: true }` to `next.config.ts`
- [x] **Task 2** — Copy CSS recipes (timing vars, keyframes, slide-up, reduced motion) into `app/globals.css`
- [x] **Task 3** — ~~Polyfill loader~~ — `@view-transitions/polyfill` does not exist on npm. React 19's `<ViewTransition>` has built-in graceful degradation; polyfill not needed.
- [x] **Task 4** — Convert `app/page.tsx` to `'use client'`, add IntersectionObserver + ViewTransition wrapping
- [x] **Task 5** — 10/12 tests pass. 2 pre-existing failures on "each slide has a distinct height" (all slides are `h-lvh` — same height by design, test assertion is incorrect). Not introduced by this change.
