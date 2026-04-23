---
# ADR-001: Use Tailwind CSS v3.4 Instead of v4

## Status
Accepted

## Date
2026-04-09

## Context
We needed a utility CSS framework for styling a snap-scroll mobile web app targeting iOS Safari and Android Chrome.

Tailwind v4 was available and is the latest major version. However, v4 changed how utility classes are generated: it now uses CSS custom properties (variables) for all utilities at runtime. For example, `scroll-snap-type: y mandatory` becomes `scroll-snap-type: y var(--tw-scroll-snap-strictness)`.

During testing on iOS Safari, this caused two critical failures:
1. **Scroll snap not engaging** — the CSS variable wasn't resolved correctly in Safari's rendering pipeline for snap-related properties
2. **Buttons not firing tap events** — interactivity issues caused by unresolved CSS custom properties in layout-affecting utilities

## Decision
Use **Tailwind CSS v3.4** which generates static, fully-resolved CSS without runtime CSS variables.

## Alternatives Considered

### Tailwind v4
- Pros: Latest features, better DX, smaller output via CSS layers
- Cons: CSS variable approach breaks Safari scroll snap and touch interactivity
- Rejected: Confirmed broken on iOS Safari for the specific utilities we need

### Vanilla CSS / CSS Modules
- Pros: No framework dependency, full control
- Cons: Loses Tailwind's utility-first DX and responsive/dark mode variants
- Rejected: Too much boilerplate for a prototype; Tailwind v3 solves the Safari issue

## Consequences
- All snap-scroll, overflow, and interactive utilities generate static CSS — Safari parses them correctly
- Must use `tailwind.config.js` (CommonJS) with v3 config format
- `postcss.config.mjs` needs `tailwindcss` + `autoprefixer` plugins
- When upgrading to v4 in the future, must re-test snap scroll on iOS Safari first

## Config

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
