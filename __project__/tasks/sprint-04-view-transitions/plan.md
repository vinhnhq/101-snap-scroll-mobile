# Plan: Snap Scroll ViewTransition Animations

## Context

The 5-slide mobile snap scroll app currently has no content animations. The spec (`docs/snap-scroll-animations.md`) calls for adding entrance animations using React 19's `<ViewTransition>` API so content fades + slides up as each slide snaps into view. The scroll snap behavior itself stays pure CSS — only the content inside each slide animates.

**Stack:** Next.js 16.2.2, React 19.2.4, Tailwind 3.4, Biome formatting.

---

## Tasks

### Task 1: Enable ViewTransition in Next.js config
**File:** `next.config.ts`
**Change:** Add `experimental: { viewTransition: true }`
**Acceptance:** `npm run build` succeeds with the new flag.

---

### Task 2: Add CSS animation recipes to globals.css
**File:** `app/globals.css`
**Source:** Copy verbatim from `.agents/skills/vercel-react-view-transitions/references/css-recipes.md`

Add these blocks at the end of the file:
1. **Timing variables** — `:root` block with `--duration-exit: 150ms`, `--duration-enter: 210ms`, `--duration-move: 400ms`
2. **Shared keyframes** — `fade`, `slide-y` (skip `slide` — not needed)
3. **Slide vertical recipe** — `::view-transition-old(.slide-down)` and `::view-transition-new(.slide-up)`
4. **Reduced motion** — `@media (prefers-reduced-motion: reduce)` block
5. **Performance** — `will-change: transform` on animated elements

**Acceptance:** CSS parses without errors. No existing styles modified. Reduced motion block present.

---

### Task 3: Add polyfill loader
**File:** `app/layout.tsx` (create `app/view-transitions-polyfill.tsx`)

Create a `'use client'` component:
```tsx
'use client';
import { useEffect } from 'react';
export function ViewTransitionsPolyfill() {
  useEffect(() => {
    if (!document.startViewTransition) {
      import('@view-transitions/polyfill');
    }
  }, []);
  return null;
}
```
Import and render in `layout.tsx` inside the body.

**Pre-step:** Run `npm info @view-transitions/polyfill` to verify package name.

**Acceptance:** No console errors on supported or unsupported browsers.

---

### Task 4: Convert page.tsx to client component with ViewTransition animations
**File:** `app/page.tsx`

1. Add `'use client'` at top
2. Import `useState`, `useEffect`, `useRef`, `startTransition` from React
3. Import `ViewTransition` from React
4. Add `scrollContainerRef = useRef<HTMLDivElement>(null)` on the scroll container `div`
5. Add `activeSlide` state: `useState<number | null>(1)` (slide 1 active on mount)
6. Add `useEffect` with `IntersectionObserver`:
   - `root: scrollContainerRef.current`, `threshold: 0.6`
   - Observe all 5 `<section>` elements
   - On intersect: `startTransition(() => setActiveSlide(slideId))`
   - Cleanup: `observer.disconnect()`
7. Wrap each `<section>`'s children (not the section itself):
   ```tsx
   <ViewTransition
     key={activeSlide === id ? `active-${id}` : `inactive-${id}`}
     enter="slide-up"
     default="none"
   >
     <div>{/* existing slide content */}</div>
   </ViewTransition>
   ```
8. `<section>` elements unchanged — `className`, `data-testid`, snap CSS untouched

**Acceptance:**
- All 5 slides animate on scroll and on return scroll
- `data-testid` attributes unchanged
- Snap scroll behavior identical

---

### Task 5: Verify — run existing Playwright tests
**Command:** `npm test`

All 6 tests in `__tests__/snap-scroll.spec.ts` must pass unchanged.

---

## Dependency Graph

```
Task 1 (next.config.ts) ──┐
Task 2 (globals.css)    ──┼──→ Task 4 (page.tsx) ──→ Task 5 (tests)
Task 3 (polyfill)       ──┘
```

Tasks 1–3 are independent (parallel). Task 4 requires all three. Task 5 is the final gate.

---

## Verification

1. `npm run build` — no compilation errors
2. `npm test` — all 6 Playwright tests pass
3. Manual: scroll through slides → content animates in
4. Manual: scroll back up → animations replay
5. Manual: Reduce Motion enabled → no animations, content still visible
