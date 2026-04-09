# Scroll Entrance Animations

Use this skill when adding entrance animations to elements that appear as the user scrolls — in any scrollable container (snap scroll, regular scroll, overflow div). Covers the IntersectionObserver + CSS class toggle pattern, pitfalls to avoid, and the CSS recipe.

---

## The Pattern

IntersectionObserver watches elements inside a scroll container. When an element becomes sufficiently visible, toggle a CSS class on its content wrapper. CSS handles the animation — no React state, no remounting.

```tsx
'use client';

import { useEffect, useRef } from 'react';

export default function Page() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    history.scrollRestoration = 'manual'; // prevent browser scroll restoration breaking initial state

    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const content = entry.target.querySelector('.slide-content');
          if (content) {
            content.classList.toggle('is-visible', entry.isIntersecting);
          }
        }
      },
      { root: container, threshold: 0.6 }, // root MUST be the scroll container, not window
    );

    const slides = container.querySelectorAll<HTMLElement>('[data-testid^="slide-"]');
    for (const slide of slides) observer.observe(slide);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={scrollContainerRef} className="overflow-y-scroll ...">
      <section data-testid="slide-1" className="...">
        <div className="slide-content">
          {/* all content as one unit — do NOT wrap children individually */}
        </div>
      </section>
    </div>
  );
}
```

## CSS Recipe

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

@media (prefers-reduced-motion: reduce) {
  .slide-content {
    transition: none;
    opacity: 1;
    filter: none;
  }
}
```

**Animation design notes:**
- `ease-out` is correct for entering content — fast start feels responsive
- 250ms is within the 150–250ms standard UI range
- No `will-change` on the base rule — promoting all elements to GPU compositor layers permanently is wasteful for a 250ms transition
- Blur under 20px avoids Safari performance issues
- `prefers-reduced-motion` must skip `opacity` too, not just `transition` — otherwise content starts invisible and stays that way

---

## Critical: `root` Must Be the Scroll Container

If the scroll container is a `div` with `overflow-y-scroll` (not the window), the IntersectionObserver **must** use `root: container`. Without it, the observer uses the window viewport, and elements inside an overflow div will never reach the threshold.

```ts
// WRONG — uses window as root, never fires inside overflow div
new IntersectionObserver(callback, { threshold: 0.6 })

// CORRECT
new IntersectionObserver(callback, { root: container, threshold: 0.6 })
```

---

## Critical: overflow-y-auto on Content, Not the Section

If a slide/section has `overflow-y-auto` for internal scrolling, put it on the `.slide-content` wrapper — not on the `<section>` itself. Otherwise the blur animation only covers the heading that sticks out of the clipped container, not the full visible area.

```tsx
// WRONG — overflow on section, blur only covers heading
<section className="h-lvh flex flex-col overflow-y-auto">
  <div className="slide-content">...</div>
</section>

// CORRECT — overflow on content wrapper, blur covers everything visible
<section className="h-lvh flex flex-col">
  <div className="slide-content flex-1 overflow-y-auto">...</div>
</section>
```

---

## Why Not React ViewTransition for This

The obvious first attempt is using React's `<ViewTransition>` with a `key` prop that toggles between `active-${id}` and `inactive-${id}`. **Don't.** The key change forces React to unmount and remount the component on every IntersectionObserver trigger. During fast scrolling this fires rapidly → visible flash.

The CSS class toggle approach is:
- Faster (no React reconciliation)
- Smoother (CSS transitions run off main thread)
- Simpler (no `useState`, `startTransition`, or React imports)

Use `<ViewTransition>` for route changes and Suspense reveals — not for scroll-triggered animations.

---

## scroll-snap Specifics

For CSS scroll snap (`snap-mandatory`, `snap-start`):

- Snap containers need `scrollbar-hide` utility for clean mobile appearance
- Use `h-lvh` (not `100vh`) for full-height slides — `lvh` accounts for dynamic viewport on mobile browsers
- Use `snap-always` alongside `snap-start` to prevent snap skipping on fast flicks
- Safe area insets (`env(safe-area-inset-top/bottom)`) needed on every section for notch/Dynamic Island/home indicator

```css
@layer utilities {
  .pt-safe { padding-top: env(safe-area-inset-top); }
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  .pb-safe-min { padding-bottom: max(env(safe-area-inset-bottom), 2.5rem); }
}
```

---

## Threshold Guidelines

| Use case | Threshold |
|---|---|
| Snap scroll (full-screen slides) | `0.6` — slide must be mostly in view |
| Card grid / partial reveals | `0.2–0.3` — animate earlier |
| Hero sections | `0.4` — generous entry point |

---

## Wrap Content as One Unit

Wrap all of a section's direct children together in one `.slide-content` div. Wrapping each child individually causes staggered independent animations and forces you to manage multiple observers or timers.

```tsx
// CORRECT — one unit, one animation
<div className="slide-content">
  <h1>Title</h1>
  <p>Body</p>
  <button>CTA</button>
</div>

// WRONG — independent animations per element, much more complex
<h1 className="slide-content">Title</h1>
<p className="slide-content">Body</p>
<button className="slide-content">CTA</button>
```
