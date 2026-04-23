# vinhn-dev-principles

Five always-on behavioral guidelines for LLM-assisted development. Unlike project skills, this one is **global** — the install script automatically injects it into `~/.claude/CLAUDE.md` so it applies to every project on the machine.

## What This Skill Covers

1. **Think Before Coding** — surface assumptions, name confusion, present tradeoffs
2. **Simplicity First** — minimum code, no speculative abstractions
3. **Surgical Changes** — touch only what the task requires
4. **Goal-Driven Execution** — verifiable success criteria, loop until proven
5. **Spec Before Code** — outcome-only prompts get a how-question before implementation

## Install via degit (recommended for new machines)

```bash
npx degit vinhnhq/101-snap-scroll-mobile/.agents/skills/vinhn-dev-principles ~/.claude/skills/vinhn-dev-principles
```

Then inject into global CLAUDE.md (one-time):

```bash
echo '' >> ~/.claude/CLAUDE.md
echo '@skills/vinhn-dev-principles/SKILL.md' >> ~/.claude/CLAUDE.md
```

## Install from cloned repo

```bash
node scripts/install-skill.mjs vinhn-dev-principles
```

The install script detects `"global": true` in `metadata.json` and automatically appends the `@` import to `~/.claude/CLAUDE.md`.

## Skill Structure

```
vinhn-dev-principles/
├── SKILL.md       # The five guidelines (loaded by Claude Code)
├── README.md      # This file
└── metadata.json  # Version + global flag
```
