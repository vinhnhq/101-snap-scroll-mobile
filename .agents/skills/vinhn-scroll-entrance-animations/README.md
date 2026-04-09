# vinhn-scroll-entrance-animations

An agent skill for building mobile-first CSS snap scroll UIs with entrance animations. Covers the full setup: viewport units, safe areas, scroll container architecture, IntersectionObserver-driven blur animations, and hard-won Safari/mobile gotchas from production.

## What This Skill Covers

- **Scroll container architecture** — inner `<div>` vs body scroll (ADR-002)
- **Viewport units** — always `lvh`, why not `dvh` or `vh` (ADR-005)
- **Tailwind v3.4** — why v4 breaks iOS Safari snap and touch (ADR-001)
- **Safe area insets** — notch, Dynamic Island, home indicator (ADR-006)
- **IntersectionObserver + CSS class toggle** — no React state, no remounting
- **CSS blur-to-clear recipe** — `filter:blur(8px) opacity:0` → clear in 250ms ease-out
- **Why not `<ViewTransition>` for this** — key-toggling causes flash on fast scroll (ADR)
- **Safari bottom toolbar** — what works, what doesn't (ADR-004)
- **Dark/Light mode** — `next-themes` with flash prevention (ADR-003)
- **`prefers-reduced-motion`** — correct handling (includes opacity reset)

## Install via degit (no clone needed)

```bash
npx degit vinhnhq/101-snap-scroll-mobile/.agents/skills/vinhn-scroll-entrance-animations ~/.claude/skills/vinhn-scroll-entrance-animations
```

## Install from cloned repo

```bash
node scripts/install-skill.mjs vinhn-scroll-entrance-animations
```

Both install to `~/.claude/skills/vinhn-scroll-entrance-animations/` where Claude Code auto-discovers it.

## Skill Structure

```
vinhn-scroll-entrance-animations/
├── SKILL.md       # Full skill content (loaded by agent)
├── README.md      # This file
└── metadata.json  # Version and abstract
```
