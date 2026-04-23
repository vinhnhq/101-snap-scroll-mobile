# Snap Scroll Slide Content Animations

## Summary

Each slide's content reveals with a blur-to-clear fade as it snaps into view. The animation is driven by `IntersectionObserver` toggling a CSS class — no React state, no remounting.

> **Decision:** CSS class toggle (not React `<ViewTransition>`). See [ADR-007](decisions/ADR-007-css-blur-animation-over-view-transition.md).

---

## How It Works

```
User scrolls
  → CSS snap aligns slide to viewport
  → IntersectionObserver fires (threshold: 0.6, root: scroll container div)
  → .slide-content receives `is-visible` class toggle
  → CSS transition plays: blur(8px) opacity:0 → blur(0) opacity:1
```

No `useState`, no `startTransition`, no remounting.

---

## Implementation

### app/page.tsx

```tsx
'use client';
import { useEffect, useRef } from 'react';

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    history.scrollRestoration = 'manual'; // prevent browser restoring scroll position

    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const content = entry.target.querySelector('.slide-content');
          if (content) content.classList.toggle('is-visible', entry.isIntersecting);
        }
      },
      { root: container, threshold: 0.6 }, // root MUST be the scroll container, not window
    );

    const slides = container.querySelectorAll<HTMLElement>('[data-testid^="slide-"]');
    for (const slide of slides) observer.observe(slide);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={scrollContainerRef}
      className="h-lvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch' }}>
      <section data-testid="slide-1"
        className="snap-start snap-always h-lvh w-full flex flex-col pt-safe pb-safe-min">
        <div className="slide-content">
          {/* ALL children as one unit */}
        </div>
      </section>
    </div>
  );
}
```

### app/globals.css

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
    opacity: 1; /* must reset opacity — otherwise content starts invisible and stays invisible */
    filter: none;
  }
}
```

---

## Critical Rules

### IntersectionObserver root must be the scroll container

```ts
// WRONG — never fires inside overflow div
new IntersectionObserver(callback, { threshold: 0.6 })

// CORRECT
new IntersectionObserver(callback, { root: container, threshold: 0.6 })
```

The scroll container is a `div` with `overflow-y-scroll`, not the window. Without `root: container`, slides never reach 60% of the window viewport and the observer never fires.

### overflow-y-auto on content, not the section

```tsx
// WRONG — blur only covers heading peeking out of clipped container
<section className="h-lvh flex flex-col overflow-y-auto">
  <div className="slide-content">...</div>
</section>

// CORRECT — blur covers the full visible area
<section className="h-lvh flex flex-col">
  <div className="slide-content flex-1 overflow-y-auto">...</div>
</section>
```

---

## Design Decisions

| Decision | Choice | Why |
|---|---|---|
| Animation trigger | IntersectionObserver class toggle | No React reconciliation, runs off main thread |
| Animation type | blur(8px) → blur(0) + opacity | Subtle, professional; stays under Safari's 20px blur perf threshold |
| Duration | 250ms | Within 150–250ms standard UI range; fast enough to not feel slow |
| Easing | ease-out | Fast start feels responsive for entering content |
| Threshold | 0.6 | 60% visible — fires reliably for full-screen snap slides |
| `prefers-reduced-motion` | opacity: 1; transition: none | Must reset opacity or content stays invisible |
| `will-change` | Not added | 250ms transition doesn't need GPU compositor promotion for all slides |

---

## Why Not React `<ViewTransition>`

Initial implementation used `<ViewTransition key={active ? 'active-N' : 'inactive-N'}>`. This caused a visible flash on fast scrolling because key changes force React to unmount + remount the component on every IntersectionObserver trigger.

CSS class toggle has no reconciliation cost and runs off the main thread.

See [ADR-007](decisions/ADR-007-css-blur-animation-over-view-transition.md) for the full decision record.

---

## Boundaries

**Preserve exactly:**
- All snap scroll CSS classes: `h-lvh`, `snap-mandatory`, `snap-start`, `snap-always`
- `data-testid` attributes on sections — Playwright tests query by these
- Safe area utilities: `pt-safe`, `pb-safe`, `pb-safe-min`

**Never:**
- Animate the `<section>` snap containers (only animate `.slide-content` inside them)
- Add `will-change: transform` to all slides (wasteful; only add during active animation if needed)
- Upgrade Tailwind to v4 (breaks iOS Safari snap — see ADR-001)
- Install animation libraries (Framer Motion, GSAP, etc.)
