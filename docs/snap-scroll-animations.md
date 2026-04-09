# Spec: Snap Scroll Slide Content Animations

## 1. Objective

Enhance the existing 5-slide snap scroll app with professional content entrance animations using React's `<ViewTransition>` API. Each slide's content should gracefully reveal as it snaps into the viewport, reinforcing the "arriving at a new section" spatial feel.

**Target users:** End users viewing the mobile marketing demo on modern iOS/Android browsers.

**Non-goal:** Animating the physical scroll/snap movement itself — that stays native browser behavior.

---

## 2. Acceptance Criteria

- [ ] Each slide's content fades and slides up when the slide snaps into view
- [ ] Animation fires on both initial arrival and on return scrolling
- [ ] Animations use React `<ViewTransition>` wrapped in `startTransition`
- [ ] On unsupported browsers (Safari < 18.2, Firefox < 144, Chrome < 111): content renders normally, no animation — no errors
- [ ] `@view-transitions/polyfill` loaded for browsers that support the API partially or need CSS pseudo-element shims
- [ ] `prefers-reduced-motion: reduce` disables all animations
- [ ] All existing snap scroll behavior preserved exactly: `snap-mandatory`, `snap-start`, `snap-always`, `h-lvh`, safe area utilities, dark/light mode, Tailwind v3.4
- [ ] Playwright e2e tests pass unchanged (snap alignment tests are unaffected)
- [ ] No new `npm` dependencies beyond `@view-transitions/polyfill` (verify package exists: `npm info @view-transitions/polyfill` before installing)

---

## 3. Architecture

### The Core Constraint

The snap scroll is pure CSS — there is no JavaScript scroll controller. React's `<ViewTransition>` only activates when React state changes inside `startTransition`. Therefore:

- The **scroll snap movement** stays native (cannot be intercepted — correct behavior)
- What animates is the **content inside each slide** as it enters the viewport
- Trigger: `IntersectionObserver` detects slide visibility → `startTransition(() => setActiveSlide(id))` → `<ViewTransition>` fires

### Detection → Animation Flow

```
User scrolls
  → CSS snap aligns slide to viewport
  → IntersectionObserver fires (threshold: 0.6, root: scroll container div)
  → startTransition(() => setActiveSlide(slideId))
  → React state change causes <ViewTransition key={...}> remount
  → ViewTransition enter animation plays (fade + slide-up)
```

### Key Prop Strategy

Each slide's content `<ViewTransition>` uses `key` to force remount on activation:

```tsx
// key changes when slide becomes active → triggers enter animation
<ViewTransition
  key={activeSlide === id ? `active-${id}` : `inactive-${id}`}
  enter="slide-up"
  default="none"
>
  {/* ALL direct children of the section as one unit — do not wrap children individually */}
</ViewTransition>
```

The `<section>` snap containers are **not** wrapped in ViewTransition — their CSS classes (`snap-start`, `h-lvh`, etc.) must remain untouched.

> **Important:** Each `<section>`'s direct children are wrapped together in one `<ViewTransition>` container — not wrapped individually per element. Individual wrapping would cause staggered independent animations and complicate the CSS.

### IntersectionObserver Root

The scroll container is a `div` with `overflow-y-scroll`, not the window. The `IntersectionObserver` **must** use `root: scrollContainerRef.current`, otherwise slides will never reach 60% of the window viewport and the observer will never fire.

```tsx
const observer = new IntersectionObserver(callback, {
  root: scrollContainerRef.current,
  threshold: 0.6,
});
```

### Polyfill Strategy

React's `<ViewTransition>` has built-in graceful degradation — on unsupported browsers, state changes still apply but animations are skipped silently.

`@view-transitions/polyfill` patches `document.startViewTransition` and CSS pseudo-elements for browsers that lack support. Load it as a dynamic import (client-side only) in `app/layout.tsx` or a dedicated client component.

```tsx
// Load polyfill only when needed
if (typeof document !== 'undefined' && !document.startViewTransition) {
  import('@view-transitions/polyfill');
}
```

---

## 4. Files to Change

| File | Change |
|------|--------|
| `app/page.tsx` | Add `'use client'`, `useState`, `useEffect` for `IntersectionObserver`, wrap slide content in `<ViewTransition>` |
| `app/globals.css` | Add timing variables, `@keyframes`, and `.slide-up` CSS recipe from css-recipes.md + reduced motion |
| `next.config.ts` | Add `experimental: { viewTransition: true }` |
| `app/layout.tsx` | Add polyfill loader (or create `app/view-transitions-polyfill.tsx`) |

No new components, no new routes, no changes to `slide-config.ts`, `theme-color-sync.tsx`, or test files.

---

## 5. CSS Animation

Copy exactly from the vercel-react-view-transitions skill's `references/css-recipes.md`. Do not write custom animation CSS.

> **Pre-implementation check:** Verify the skill is installed at `~/.claude/skills/vercel-react-view-transitions/references/css-recipes.md` before starting. If missing, install the skill first — do not write custom animation CSS as a substitute.

**Recipes to include:**
- Timing variables (`:root` block)
- Shared keyframes (`fade`, `slide-y`)
- Slide vertical (`.slide-down`, `.slide-up`)
- Reduced motion (`prefers-reduced-motion: reduce`)

**Animation character:** `slide-up` — content enters from slightly below with a blur-fade. Duration ~210ms enter, 150ms exit. Professional, not flashy.

**Animation constraints (non-negotiable):**
- Start from `scale(0.95) + opacity: 0`, never `scale(0)` — starting from zero makes content appear from nowhere, feeling unnatural
- Easing: `ease-out` for enter, `ease-in` for exit — fast start creates a responsive, arriving feel
- Add `will-change: transform` to the animated element to prevent 1px GPU/CPU handoff shaking at animation boundaries

---

## 6. Code Style

- Match existing file conventions: Biome formatting, tab indentation
- No new abstractions or helper components unless the pattern repeats 3+ times
- `'use client'` directive only where needed (`page.tsx` will need it)
- TypeScript: no `any`, use `number | null` for `activeSlide` state
- Keep `IntersectionObserver` cleanup in `useEffect` return function
- Do not add comments unless logic is non-obvious

---

## 7. Testing Strategy

**Existing tests:** `tests/snap-scroll.spec.ts` must pass unchanged. The animation is additive — it doesn't change DOM structure, snap alignment, or slide count.

**Manual verification checklist:**
- [ ] Scroll to each slide on iPhone 14 (Playwright) — content animates in
- [ ] Scroll back up — content re-animates on return
- [ ] Enable "Reduce Motion" in accessibility settings — no animation, content still visible
- [ ] Test on Safari < 18.2 (or disable `document.startViewTransition`) — no animation, no console errors

No new automated tests are required for this change.

---

## 8. Boundaries

**Always do:**
- Preserve all snap scroll CSS classes exactly as-is
- Keep `h-lvh`, `snap-mandatory`, `snap-start`, `snap-always`, `scrollbar-hide` unchanged
- Use CSS recipes verbatim from the skill reference
- Respect `prefers-reduced-motion`

**Decided:**
- IntersectionObserver threshold: `0.6`
- Slide 1 animates on initial mount (same enter animation, fires immediately)

**Ask first about:**
- Any change to the IntersectionObserver threshold
- Polyfill loading strategy changes

**Never do:**
- Replace native CSS snap with a JavaScript scroll controller
- Animate the `<section>` snap containers (only animate content inside them)
- Upgrade Tailwind to v4
- Add `viewTransitionName` raw CSS styles (use `<ViewTransition>` components only)
- Install additional animation libraries (Framer Motion, GSAP, etc.)
