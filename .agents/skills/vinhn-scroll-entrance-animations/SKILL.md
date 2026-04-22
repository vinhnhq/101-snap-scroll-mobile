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

## 10. Browser Toolbar Color — What Works and What Doesn't (ADR-004)

Browser toolbar theming behaves differently per browser. Know before you spend time on it:

| Browser | `theme-color` effect | Bottom toolbar |
|---|---|---|
| iOS Safari | ✓ Top status bar | Reflects `body { background-color }` over time — no JS control |
| Chrome Android | ✓ Status bar + address bar | Follows `theme-color` |
| Chrome iOS | ✗ No effect at all | Always grey — no workaround |

**Chrome iOS grey bars are unfixable in a regular browser tab.** Chrome iOS uses Apple's WKWebView (Apple policy) but renders its own browser shell. `theme-color` is ignored entirely. The only escape is PWA standalone mode (user adds to home screen), which removes all browser chrome — but you cannot force this.

**Safari bottom toolbar:** every approach was tested and failed or was not production-viable:

| Method | Result |
|---|---|
| `meta[name="theme-color"]` | Top bar only |
| `document.body.style.backgroundColor` | No effect |
| `window.scrollBy(0, ±1)` | Unreliable |
| `alert()` | Works but blocks UI — not viable |
| Body as scroll container | Works but breaks snap stability (ADR-002) |

**Production pattern:** set `theme-color` to black/white. Safari bottom toolbar naturally reflects `body { background-color }` over time as UIKit takes snapshots.

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

---

## 12. Fluid Content Sizing Across Devices

Snap slide height is always `h-lvh` (fixed). The challenge is sizing **content inside** slides so it looks right on both an iPhone SE and an iPhone 15 Pro Max without hardcoding px values.

### The units hierarchy

| Target | Unit | Why |
|---|---|---|
| Slide container height | `lvh` | Must be stable snap point — never rem/px |
| Corner/edge positioning | `vh` / `%` | Relative to slide height |
| Font sizes, padding, gaps | `clamp()` or `em` | Scales with viewport, not fixed root |

### Option A — Scale the root, use `rem` everywhere (one knob)

```css
html {
  font-size: clamp(14px, 2vw + 1vh, 18px);
}

/* All rem values now scale with viewport automatically */
.slide-title  { font-size: 1.5rem; }
.slide-button { padding: 0.75rem 1.5rem; }
```

Single place to tune. Good for projects where the entire page is mobile snap scroll.

### Option B — `clamp()` per element (more granular control)

```css
.slide-title   { font-size: clamp(18px, 5vw, 28px); }
.slide-button  { padding: clamp(8px, 2vw, 14px) clamp(16px, 4vw, 24px); }
.corner-badge  { bottom: clamp(80px, 12vh, 140px); }
```

Better when only some components are inside snap slides.

### Option C — Container font-size + `em` (composition wrapper pattern)

Set `font-size` on the slide container; all children use `em` and inherit:

```tsx
// MobileSlide wrapper — sets the scaling context
<div
  className="snap-start snap-always h-lvh w-full"
  style={{ fontSize: 'clamp(14px, 2vw + 1vh, 18px)' }}
>
  <SlideTitle />   {/* uses em — scales with parent */}
  <SlideButton />
</div>
```

```css
.slide-title  { font-size: 1.4em; }
.slide-button { padding: 0.6em 1.2em; }
```

The same `SlideTitle` component works in a desktop layout too — the desktop container sets its own `font-size` and `em` values adapt. No duplication.

### When to split into separate desktop/mobile components

Only when the **layout structure** is fundamentally different — not just differently sized:

- Mobile = full-screen stacked snap slides → Desktop = sidebar + grid → split
- Mobile = large text → Desktop = same layout, smaller text → use `clamp()`, don't split

Splitting for size alone risks drift: you update the mobile variant and forget the desktop one.

### Safe area insets for corner UI

Corner interactive elements (CTAs, badges, bottom nav) must account for the home indicator:

```css
.bottom-cta {
  bottom: max(env(safe-area-inset-bottom), 2.5rem);
}
```

`max()` guarantees minimum clearance even on devices without a home indicator.
