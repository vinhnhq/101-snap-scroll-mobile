---
# ADR-003: Use `next-themes` for Dark/Light Mode

## Status
Accepted

## Date
2026-04-09

## Context
The app needs to support system-level dark/light mode and allow user override. Key requirements:
- No flash of wrong theme on load (hydration-safe)
- Works with Tailwind's `dark:` variants
- Persists user preference across sessions
- Syncs with OS color scheme by default

React doesn't have built-in theme management. Options include: manual `localStorage` + `prefers-color-scheme` listener, CSS-only `prefers-color-scheme`, or a library.

## Decision
Use **`next-themes`** with the following setup:

```tsx
// layout.tsx
<html suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" storageKey="color-scheme" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  </body>
</html>
```

`next-themes` injects an inline script before React hydration that reads `localStorage` and sets `class="dark"` on `<html>` before the first paint — eliminating flash.

## Hydration guard pattern

`resolvedTheme` is `undefined` on the server. Always use a `mounted` guard in client components:

```tsx
"use client";
const { resolvedTheme } = useTheme();
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted) return <div className="h-dvh" />;  // empty shell during SSR
```

## Flash prevention — CSS layer

CSS handles the very first paint before JS runs:

```css
/* globals.css */
:root { --page-bg: #ffffff; }
@media (prefers-color-scheme: dark) {
  :root { --page-bg: #000000; }
}
html, body { background-color: var(--page-bg); }
```

This is synchronous — correct color on first paint. `next-themes` then takes over via the `class="dark"` toggle.

## Alternatives Considered

### Manual `localStorage` + media query listener
- Pros: No dependency
- Cons: Must reimplement flash prevention, storage sync, SSR guard manually
- Rejected: `next-themes` solves all of this correctly

### CSS-only `prefers-color-scheme`
- Pros: Zero JS, no hydration issues
- Cons: Cannot persist user override (always follows OS)
- Rejected: We want user override capability

### CSS custom property on `:root` with class toggle
- Pros: Flexible, works without a library
- Cons: Same flash problem as manual approach without careful SSR handling
- Rejected: `next-themes` does this plus handles edge cases

## Consequences
- `suppressHydrationWarning` is required on `<html>` because `next-themes` modifies it before React hydrates
- `attribute="class"` means Tailwind `dark:` variants work automatically
- `disableTransitionOnChange` prevents flicker of CSS transitions during theme switch
- `storageKey="color-scheme"` keeps the cookie/localStorage key predictable
- Do NOT set `themeColor` in Next.js `viewport` export — it re-injects a static meta tag that conflicts with runtime `ThemeColorSync` updates
