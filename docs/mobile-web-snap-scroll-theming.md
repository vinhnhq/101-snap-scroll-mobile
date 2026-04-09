# Mobile Web — Snap Scroll & Safari Theming

> Knowledge captured from building a snap-scroll mobile web app targeting iOS Safari and Android Chrome.
> Stack: Next.js 16 · React 19 · Tailwind CSS v3.4 · TypeScript · next-themes
>
> ADRs (decision rationale): [`docs/decisions/`](decisions/)

---

## 1. Snap Scroll on Mobile
> **Decision:** [ADR-002](decisions/ADR-002-inner-div-snap-scroll-container.md) · [ADR-005](decisions/ADR-005-lvh-viewport-units.md)

### Core CSS

```css
/* Scroll container */
.container {
  height: 100lvh;          /* largest viewport height — stable snap points */
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;   /* hide scrollbar Firefox */
  -ms-overflow-style: none;
}
.container::-webkit-scrollbar { display: none; } /* hide scrollbar WebKit */

/* Each slide */
.slide {
  height: 100lvh;
  scroll-snap-align: start;
  scroll-snap-stop: always; /* prevents fast-scroll skipping slides */
}
```

### Why `100lvh` not `100dvh` or `100vh`

| Unit | Behaviour | Problem |
|------|-----------|---------|
| `vh` | Fixed to initial viewport | Mismatches as Safari toolbar animates |
| `dvh` | Dynamic — changes as toolbar shows/hides | Snap points jump = jitter |
| `lvh` | **Largest** (toolbar retracted) | **Stable snap points, no jitter ✓** |

### Tailwind classes

```tsx
// Container
<div className="h-lvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide">

// Slide
<section className="snap-start snap-always h-lvh w-full">
```

---

## 2. Safe Area Insets (Notch / Dynamic Island / Home Indicator)
> **Decision:** [ADR-006](decisions/ADR-006-safe-area-insets.md)

Always apply safe area padding so content is never overlapped by OS chrome.

### CSS Utilities

```css
@layer utilities {
  .pt-safe      { padding-top: env(safe-area-inset-top); }
  .pb-safe      { padding-bottom: env(safe-area-inset-bottom); }
  .pb-safe-min  { padding-bottom: max(env(safe-area-inset-bottom), 2.5rem); }
}
```

### Usage per slide

```tsx
// Content at bottom (hero, CTA)
<section className="... pt-safe pb-safe-min">

// Content centred
<section className="... pt-safe pb-safe">

// Inner-scrollable slide (reviews)
<section className="... overflow-y-auto pt-safe pb-safe-min">
```

### Viewport meta — required

```tsx
// Next.js viewport export
export const viewport: Viewport = {
  viewportFit: "cover",   // content extends under notch + home indicator
  userScalable: false,
  maximumScale: 1,
};
```

---

## 3. Safari Toolbar Theming
> **Decision:** [ADR-004](decisions/ADR-004-safari-toolbar-color-strategy.md)

### Top status bar — `theme-color` meta tag

Works on iOS Safari 15+ and Android Chrome. Controls the browser status bar colour.

```ts
function setThemeColor(color: string) {
  const old = document.querySelector('meta[name="theme-color"]');
  if (old) old.remove();
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = color;
  document.head.appendChild(meta);
}
```

**Platform defaults:**

| Platform | Light | Dark |
|----------|-------|------|
| iOS Safari | `#ffffff` | `#000000` (true black) |
| Android Chrome | `#ffffff` | `#121212` (Material surface) |
| Desktop | Not supported (regular browsing) | — |

### Bottom toolbar — the hard truth

The Safari bottom navigation bar colour **cannot be reliably controlled via web APIs**.

| Method | Result |
|--------|--------|
| `meta[name="theme-color"]` | Top bar only |
| `document.body.style.backgroundColor` | No effect in regular Safari |
| `window.scrollBy(0, 0)` | No-op if window is not scrollable |
| `display: none` → reflow → `display: block` | No effect |
| `history.replaceState` | No effect |
| `input.focus()` + immediate blur | Moves bar but no colour change |
| `alert()` | **Works** — forces UIKit snapshot, updates colour |
| Body IS the scroll container | Works — native body scroll triggers UIKit |

**Recommended pattern** (same as 24h.com.vn, major news sites):
- Set `theme-color` to `#ffffff` (light) or `#000000` (dark) — matches system chrome
- Leave bottom toolbar alone — it naturally reflects body background over time
- Do not fight it

---

## 4. Dark / Light Mode — next-themes
> **Decision:** [ADR-003](decisions/ADR-003-next-themes-dark-light-mode.md)

### Setup

```bash
npm install next-themes
```

```tsx
// layout.tsx
import { ThemeProvider } from "next-themes";

<html suppressHydrationWarning>  {/* suppress because next-themes injects class before hydration */}
  <body>
    <ThemeProvider attribute="class" storageKey="color-scheme" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  </body>
</html>
```

### Usage in a page

```tsx
"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function Page() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Prevent hydration mismatch — server renders empty shell
  if (!mounted) return <div className="h-dvh" />;

  const isDark = resolvedTheme === "dark";
  // ...
}
```

### Why `mounted` guard?

`resolvedTheme` is `undefined` on the server. Without the guard, React sees a mismatch between server HTML (light) and client HTML (dark) → hydration error.

### Tailwind dark: variants

`ThemeProvider attribute="class"` adds `class="dark"` to `<html>`. Tailwind responds automatically:

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
```

### Detecting scheme changes in plain JS (outside React)

```ts
const isDark = () => document.documentElement.classList.contains("dark");

const observer = new MutationObserver(() => {
  // scheme changed — re-apply colors
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
```

---

## 5. ThemeColorSync Pattern

A layout-level client component that keeps `theme-color` in sync with the system scheme across all pages.

```tsx
// app/theme-color-sync.tsx
"use client";
import { useEffect } from "react";

export function ThemeColorSync() {
  useEffect(() => {
    const isDark = () => document.documentElement.classList.contains("dark");

    const apply = () => {
      const color = isDark() ? "#000000" : "#ffffff";
      const meta =
        document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ??
        Object.assign(document.createElement("meta"), { name: "theme-color" });
      if (!meta.parentNode) document.head.appendChild(meta);
      if (meta.content !== color) meta.content = color;
    };

    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    apply();
    return () => observer.disconnect();
  }, []);

  return null;
}
```

---

## 6. Platform Detection

```ts
type Platform = "ios" | "android" | "web";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "web";
}
```

> ⚠️ iPadOS 13+ reports as desktop Safari — `detectPlatform()` returns `"web"` on iPad.
> Call only inside `useEffect` (not during SSR).

---

## 7. Hydration & Flash Prevention

### `--page-bg` CSS variable pattern

```css
/* globals.css */
:root { --page-bg: #ffffff; }
@media (prefers-color-scheme: dark) {
  :root { --page-bg: #000000; }
}
html, body { background-color: var(--page-bg); }
```

- CSS media query is synchronous — correct colour on first paint, zero flash
- JS then overrides `--page-bg` via `document.documentElement.style.setProperty(...)` if needed

### Cleanup effect pattern

```ts
useEffect(() => {
  document.documentElement.style.setProperty("--page-bg", color);
  return () => {
    document.documentElement.style.removeProperty("--page-bg"); // clean up on unmount
  };
}, [color]);
```

---

## 8. Tailwind v3.4 vs v4 on Safari
> **Decision:** [ADR-001](decisions/ADR-001-tailwind-v3-over-v4.md)

Tailwind v4 uses CSS custom properties for all utilities (e.g. `scroll-snap-type: y var(--tw-scroll-snap-strictness)`). On iOS Safari this caused interactivity issues (buttons not firing, scroll snap not engaging).

**Fix: use Tailwind v3.4** — generates static CSS without runtime CSS variables.

```js
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

```js
// postcss.config.mjs
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

---

## 9. Apple PWA Meta Tags

For standalone-mode web apps (Add to Home Screen):

```tsx
export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // status bar overlays content, shows page colour
    title: "App Name",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#000000",
};
```

> `statusBarStyle: "black-translucent"` only applies in standalone PWA mode.
> In regular Safari, the status bar is always opaque system chrome.

---

## 10. Quick Reference Checklist

```
[ ] viewport: viewportFit = "cover"
[ ] viewport: userScalable = false, maximumScale = 1
[ ] Scroll container: h-lvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide
[ ] Each slide: snap-start snap-always h-lvh
[ ] Safe area: pt-safe on all slides, pb-safe / pb-safe-min on slides with bottom content
[ ] ThemeColorSync in layout — sets theme-color black/white per system scheme
[ ] next-themes ThemeProvider with suppressHydrationWarning on <html>
[ ] globals.css --page-bg: white/black via prefers-color-scheme media query
[ ] Tailwind v3.4 (not v4) for Safari compatibility
```
