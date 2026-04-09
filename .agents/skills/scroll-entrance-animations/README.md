# Scroll Entrance Animations Skill

An agent skill for adding smooth entrance animations to scroll-driven UIs — snap scroll, regular scroll, or any overflow container.

## What This Skill Covers

- **IntersectionObserver + CSS class toggle** — the core pattern, no React state or remounting
- **CSS blur-to-clear recipe** — `filter:blur(8px) opacity:0` → clear in 250ms ease-out
- **Critical pitfalls** — ViewTransition key-toggling flash, `root` must be the scroll container, `overflow-y-auto` on content not section, scroll restoration
- **Why not `<ViewTransition>` for this** — explained with root cause
- **Snap scroll specifics** — safe area utilities, `h-lvh`, `snap-always`
- **Threshold guidelines** — by use case
- **`prefers-reduced-motion`** — correct handling (includes opacity reset)

## Skill Structure

```
scroll-entrance-animations/
├── SKILL.md       # Full skill content (loaded by agent)
├── README.md      # This file
└── metadata.json  # Version and abstract
```

## Installation

From this repo:

```bash
node scripts/install-skill.mjs scroll-entrance-animations
```

This copies the skill to `~/.claude/skills/scroll-entrance-animations/` where Claude Code will auto-discover it.
