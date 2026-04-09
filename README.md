# 101 Snap Scroll Mobile

A vertical snap-scroll mobile web app built for iOS Safari and Android Chrome. Demonstrates safe area handling, dark/light mode theming, and Safari toolbar color management.

**Stack:** Next.js · React 19 · Tailwind CSS v3.4 · TypeScript · next-themes

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — use browser DevTools mobile emulation or a real device for best results.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run Biome linter |
| `npm run format` | Auto-format with Biome |
| `npm test` | Run Playwright e2e tests |
| `npm run test:ui` | Playwright UI mode |

## Architecture

Vertical snap scroll with 5 full-screen slides. Key decisions:

- **`h-lvh` not `dvh`** — stable snap points regardless of Safari toolbar animation
- **Inner `<div>` scroll container** — body scroll breaks snap stability on iOS
- **Tailwind v3.4** — v4's CSS variable approach breaks Safari scroll snap
- **`next-themes`** — flash-free dark/light mode with system preference sync
- **`theme-color` top bar only** — Safari bottom toolbar cannot be reliably controlled

Full rationale in [`docs/decisions/`](docs/decisions/) (ADR-001 through ADR-007).  
Implementation patterns in [`docs/mobile-web-snap-scroll-theming.md`](docs/mobile-web-snap-scroll-theming.md) and [`docs/snap-scroll-animations.md`](docs/snap-scroll-animations.md).

## Agent Skills

This repo ships a reusable Claude Code skill that encodes all mobile snap scroll knowledge (viewport units, safe areas, scroll container architecture, entrance animations, Safari gotchas).

**Install without cloning:**

```bash
npx degit vinhnhq/101-snap-scroll-mobile/.agents/skills/vinhn-scroll-entrance-animations ~/.claude/skills/vinhn-scroll-entrance-animations
```

**Install from this repo:**

```bash
node scripts/install-skill.mjs vinhn-scroll-entrance-animations
```

The skill is installed to `~/.claude/skills/` where Claude Code auto-discovers it.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main 5-slide snap scroll demo |
| `/theme-test` | Dark/light mode + theme-color testing |
