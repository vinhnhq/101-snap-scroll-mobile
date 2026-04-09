# ADR-007: Use CSS blur-to-clear class toggle instead of React `<ViewTransition>` for entrance animations

## Status

Accepted

## Date

2026-04-09

## Context

Sprint 04 added entrance animations to each snap slide's content. The initial implementation used React 19's `<ViewTransition>` API:

```tsx
<ViewTransition
  key={activeSlide === id ? `active-${id}` : `inactive-${id}`}
  enter="slide-up"
  default="none"
>
  <div>{/* slide content */}</div>
</ViewTransition>
```

`IntersectionObserver` detected slide visibility and called `startTransition(() => setActiveSlide(id))`, triggering a React state change that caused the `<ViewTransition>` key to flip and the enter animation to play.

**Problem observed:** On fast scrolling, this produced a visible flash. The root cause is that toggling `key` on `<ViewTransition>` forces React to unmount and remount the subtree on every IntersectionObserver trigger. During rapid scrolling, multiple triggers fire in quick succession, and each unmount/remount cycle creates a brief flash of invisible content.

## Decision

Replace `<ViewTransition>` with a plain CSS class toggle driven by `IntersectionObserver`:

```tsx
// IntersectionObserver callback
const content = entry.target.querySelector('.slide-content');
if (content) content.classList.toggle('is-visible', entry.isIntersecting);
```

```css
.slide-content {
  opacity: 0;
  filter: blur(8px);
  transition: opacity 250ms ease-out, filter 250ms ease-out;
}
.slide-content.is-visible {
  opacity: 1;
  filter: blur(0);
}
```

No React state. No `startTransition`. No remounting.

## Alternatives Considered

### Keep ViewTransition with debouncing

Debounce `setActiveSlide` calls to prevent rapid-fire remounts.

**Rejected:** Adds latency to animation start. The perception of responsiveness matters more than the debounce benefit. Also adds complexity (ref for timer, cleanup) for a workaround, not a fix.

### ViewTransition without key toggling (always same key)

Use a stable key and rely on `default` prop transitions instead of `enter`.

**Rejected:** Without key change, `<ViewTransition>` doesn't re-trigger the enter animation when scrolling back to a slide. Re-animation on return scroll is a requirement.

### Framer Motion / GSAP

Third-party animation library.

**Rejected:** Adds bundle weight. The animation is simple enough that a CSS transition is the correct tool.

### CSS animation (not transition) with class toggle

Use `@keyframes` + `animation:` property instead of `transition:`.

**Considered but not chosen:** `transition` is simpler for a two-state toggle (`is-visible` on/off). `animation:` would require resetting the animation when the class is removed, which adds complexity. `transition` handles both directions automatically.

## Consequences

- **No flash on fast scrolling** — class toggle has no React reconciliation cost
- **Runs off main thread** — CSS transitions are compositor-driven; they don't block JS
- **Simpler code** — removed `useState`, `startTransition`, `ViewTransition` import, and React 19 experimental config from `next.config.ts`
- **Trade-off:** Less control over exit animation. CSS transition plays the reverse automatically (blur-in on exit). This is acceptable — the exit is fast enough (250ms) that it doesn't feel wrong.
- **`prefers-reduced-motion` requires explicit opacity reset** — `transition: none` alone isn't enough. The element starts at `opacity: 0`; without `opacity: 1` in the media query, content becomes permanently invisible when reduced motion is enabled.
