# vinhn: Mobile Snap Scroll with Entrance Animations

Use this skill when building mobile-first CSS snap scroll UIs with entrance animations. Covers the full setup: viewport units, safe areas, scroll container architecture, IntersectionObserver-driven blur animations, and hard-won Safari/mobile gotchas from production.

---

## 1. Scroll Container Architecture (ADR-002)

**Use an inner `<div>` as the scroll container — not `<body>`.**

```tsx
<div
  className="h-lvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
  style={{ WebkitOverflowScrolling: 'touch' }}
>
  <section className="snap-start snap-always h-lvh w-full">...</section>
</div>
```

**Why not body scroll?** Body scroll on iOS Safari uses `dvh` as the scroll port. Snap sections sized to `lvh` are taller → snap points jitter as the Safari toolbar animates. The inner div is always `lvh` × `lvh` → stable snap points regardless of toolbar state.

---

## 2. Viewport Units — Always `lvh` (ADR-005)

| Unit | Problem |
|---|---|
| `vh` | Fixed at page load → sections undersized once toolbar retracts → gaps |
| `dvh` | Changes as toolbar animates → snap anchors recalculate mid-scroll → jitter |
| `lvh` | Fixed at largest possible height → stable snap points always ✓ |

**Must use `h-lvh` on both container AND sections.** Mismatched units = snap failures.

Trade-off: on initial load, bottom ~50px of slide-1 is behind the Safari toolbar. Once the user scrolls, toolbar retracts and everything fits. Matches how production mobile web apps behave.

---

## 3. Tailwind Version — v3.4, Not v4 (ADR-001)

Tailwind v4 generates utilities using CSS custom properties at runtime. On iOS Safari this causes:
- Scroll snap not engaging
- Button tap events failing

Tailwind v3.4 generates static, fully-resolved CSS — Safari parses it correctly. When upgrading to v4, re-test scroll snap and touch interactivity on iOS Safari first.

```js
// tailwind.config.js (CommonJS — required for v3)
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

---

## 4. Safe Area Insets (ADR-006)

Notch, Dynamic Island, and home indicator overlap content when `viewportFit: "cover"` is set. Add these utilities:

```css
@layer utilities {
  .pt-safe     { padding-top: env(safe-area-inset-top); }
  .pb-safe     { padding-bottom: env(safe-area-inset-bottom); }
  .pb-safe-min { padding-bottom: max(env(safe-area-inset-bottom), 2.5rem); }
}
```

Require `viewportFit: "cover"` in the Next.js viewport export — without it, `env()` always returns `0`:

```ts
export const viewport: Viewport = {
  viewportFit: 'cover',
  userScalable: false,
  maximumScale: 1,
};
```

| Section content | Classes |
|---|---|
| Bottom content (CTAs, buttons, hero) | `pt-safe pb-safe-min` |
| Centered content | `pt-safe pb-safe` |
| Inner-scrollable tall lists | `pt-safe pb-safe-min` on section + `flex-1 overflow-y-auto` on `.slide-content` |

`.pb-safe-min` uses `max()` — guarantees at least 40px clearance below the home indicator.

---

## 5. Scrollbar Hide

Must be **outside `@layer`** — `::-webkit-scrollbar` is ignored inside Tailwind layers:

```css
/* Outside @layer */
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

---

## 6. Entrance Animation Pattern

IntersectionObserver toggles `.is-visible` on `.slide-content` — no React state, no remounting.

```tsx
'use client';
import { useEffect, useRef } from 'react';

export default function Page() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    history.scrollRestoration = 'manual'; // prevent browser restoring scroll position and breaking initial state

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
          {/* ALL children as one unit — do not wrap individually */}
        </div>
      </section>
    </div>
  );
}
```

### Critical: `root` Must Be the Scroll Container

```ts
// WRONG — never fires inside overflow div
new IntersectionObserver(callback, { threshold: 0.6 })

// CORRECT
new IntersectionObserver(callback, { root: container, threshold: 0.6 })
```

### Critical: `overflow-y-auto` on Content, Not the Section

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

## 7. CSS Animation Recipe

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
    opacity: 1; /* must reset opacity — otherwise content starts invisible and stays that way */
    filter: none;
  }
}
```

- `ease-out` for entering content — fast start feels responsive
- 250ms — within the 150–250ms standard UI range
- No `will-change` on the base rule — 250ms transition doesn't need GPU compositor promotion for all slides
- Blur under 20px — Safari performance threshold

---

## 8. Why Not React `<ViewTransition>` for This

`<ViewTransition key="active-1/inactive-1">` forces React to unmount + remount on every IntersectionObserver trigger. During fast scrolling → visible flash.

CSS class toggle: no reconciliation, runs off main thread, no `useState`/`startTransition`.

Use `<ViewTransition>` for route changes and Suspense reveals — not scroll-triggered animations.

---

## 9. Threshold Guidelines

| Use case | Threshold |
|---|---|
| Full-screen snap slides | `0.6` |
| Card grid / partial reveals | `0.2–0.3` |
| Hero sections | `0.4` |

---

## 10. Safari Bottom Toolbar (ADR-004)

**Accept the limitation — control only the top status bar.**

Every approach to update the bottom Safari toolbar was tested and failed or was not production-viable:

| Method | Result |
|---|---|
| `meta[name="theme-color"]` | Top bar only |
| `document.body.style.backgroundColor` | No effect |
| `window.scrollBy(0, ±1)` | Unreliable |
| `alert()` | Works but blocks UI — not viable |
| Body as scroll container | Works but breaks snap stability (ADR-002) |

Production pattern: set `theme-color` to black/white. The bottom toolbar naturally reflects `body { background-color }` over time as Safari snapshots.

Do NOT set `themeColor` in Next.js `viewport` export — it injects a static meta that conflicts with dynamic updates.

---

## 11. Dark/Light Mode (ADR-003)

Use `next-themes` with `attribute="class"` for Tailwind `dark:` support. Flash prevention — CSS handles first paint before JS:

```css
:root { --page-bg: #ffffff; }
@media (prefers-color-scheme: dark) { :root { --page-bg: #000000; } }
html, body { background-color: var(--page-bg); }
```

`resolvedTheme` is `undefined` on the server. Always use a `mounted` guard:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <div className="h-dvh" />;
```
