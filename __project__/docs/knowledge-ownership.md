# Knowledge Ownership Map

## Test Strategy

**Framework:** Playwright (via `bun test` / `npx playwright test`)
**Test location:** `e2e/` — browser-level tests only (no separate unit test suite currently)

**Three levels, applied per task:**

| Level | Tool | When to use |
|-------|------|-------------|
| Unit | Playwright component or `bun test` | Logic that can be verified without a browser (pure functions, class toggles) |
| Integration | Playwright | Wired components — `data-testid` selectors, scroll behavior, snap engagement |
| Browser smoke | Chrome DevTools + manual checklist | Full golden path before merge — run the spec's Success Criteria end-to-end |

**Key principle:** The spec's Success Criteria = the smoke test checklist. Write observable browser behaviors in the spec, not code behaviors. The smoke test is just running that list in a real browser.

**Merge gate:** all three levels green before a PR merges.

---

Track who drove each solution — **you** (owned it), **AI** (AI proposed, you accepted), or **collab** (iterated together).
Use this to find domains where you're relying on AI without understanding deeply.

Legend:
- **you** — You understood the problem and drove the solution
- **AI** — AI proposed; you accepted without deep verification
- **collab** — Back-and-forth; you understand the tradeoffs now

---

## Sprint 01 — Foundation

| Area | Solution | Owner | Notes / Gap to close |
|------|----------|-------|----------------------|
| Snap scroll container | `overflow-y: scroll; scroll-snap-type: y mandatory` on inner div (not html/body) | AI | ADR-002: tried body scroll first, AI debugged the dvh/lvh jitter issue and proposed inner div |
| Safe area insets | `env(safe-area-inset-*)` + custom Tailwind utilities | AI | ADR-006: standard iOS pattern but implementation detail was AI-led |
| Scrollbar hide | `scrollbar-hide` utility class | AI | Simple — but did you know the class or did AI suggest it? |
| Viewport height | `100lvh` over `100vh` / `dvh` | AI | ADR-005: the 3-unit comparison (vh/dvh/lvh) and why lvh wins for stable snap points — AI-driven discovery |

## Sprint 02 — Theming

| Area | Solution | Owner | Notes / Gap to close |
|------|----------|-------|----------------------|
| Dark/light mode | `next-themes` + CSS variables | collab | ADR-003: `next-themes` is a well-known Next.js pattern; you likely knew the library, AI handled wiring |
| Status bar color sync | `<meta name="theme-color">` updated via `useEffect` | AI | ADR-004: the meta tag + JS update pattern is not obvious; AI-proposed |
| Safari bottom toolbar | Cannot be colored; documented as limitation | AI | ADR-004: AI exhaustively tested every method and confirmed the platform limitation |
| Tailwind version choice | Stayed on v3 (v4 breaks Safari scroll snap + tap events) | AI | ADR-001: v4 CSS variable approach breaking Safari was an AI-debugged discovery |

## Sprint 03 — Knowledge Base

| Area | Solution | Owner | Notes / Gap to close |
|------|----------|-------|----------------------|
| Agent skills setup | Installed `agent-skills` skill collection | you | You initiated this — goal was structured AI workflow |
| ADR process | ADR docs in `docs/decisions/` | collab | You wanted decisions recorded; AI wrote the ADRs |

## Sprint 04 — View Transitions

| Area | Solution | Owner | Notes / Gap to close |
|------|----------|-------|----------------------|
| Initial approach | React 19 `<ViewTransition>` with key-flip pattern | AI | commit `6f98c1d` — AI proposed this; worked but had flash bug |
| Bug discovery | Key-flip causes unmount/remount → flash on fast scroll | AI | ADR-007: AI identified root cause of the flash |
| Final approach | CSS blur-to-clear class toggle via `IntersectionObserver` | AI | commit `026c09c` — AI-proposed refactor after discovering ViewTransition flaw |
| One-shot trigger | `IntersectionObserver` fires only once per element | AI | The `{ once: true }` / `unobserve()` pattern — do you understand why this is needed? |
| Skill packaging | `vinhn-scroll-entrance-animations` skill | collab | You directed the packaging; AI wrote the skill file |

## Sprint 05 — Responsive Sizing

| Area | Solution | Owner | Notes / Gap to close |
|------|----------|-------|----------------------|
| Root font scaling | `font-size: clamp(14px, 2vw + 1vh, 18px)` on `:root` | collab | You directed the clamp values; AI implemented and wrote Playwright viewport tests |
| Component wrapper | `MobileSlide` composition component | AI | AI proposed the wrapper to centralise `snap-start h-lvh pt-safe pb-safe-min` |
| Home indicator floor | `max(env(safe-area-inset-bottom), 24px)` on dev nav | AI | AI proposed `max()` as the floor pattern — do you understand why `padding-bottom: env(...)` alone isn't sufficient? |

## Sprint 06 — Release Tooling

| Area | Solution | Owner | Notes / Gap to close |
|------|----------|-------|----------------------|
| Release gate script | `scripts/release-check.sh` — sprint/test/git checks + merge | collab | You drove the spec; AI wrote the bash; you debugged grep/awk bugs together |
| Dev→main merge model | `git merge dev --no-ff` instead of tags | collab | You decided the model; AI implemented and explained tradeoffs |
| Bash test harness | `__tests__/test-release-check.sh` with `SKIP_TESTS` / `FORCE_PASS` | AI | AI proposed the test harness pattern — do you understand the pipe-to-bash env var inheritance fix? |
| `vinhn-dev-principles` skill | Prompt-first behavioral guidelines as global Claude skill | collab | You sourced the principles; AI packaged them into the skill + install flow |

---

## Domains to Watch

Based on the ownership map above. `AI`-heavy rows = gaps to close.

| Domain | Inferred Confidence | Gap to Close |
|--------|---------------------|--------------|
| CSS scroll snap mechanics | low — all key decisions were AI-driven | Can you explain why `scroll-snap-type: y mandatory` on an inner div is required? |
| iOS Safari viewport quirks | low — vh/dvh/lvh tradeoffs were AI-discovered | Can you explain from memory why `dvh` causes snap jitter? |
| Safari toolbar limitations | low — AI did the research | Read ADR-004 end-to-end and verify you can reproduce the reasoning |
| `meta[name="theme-color"]` pattern | low | Can you write the `useEffect` sync from scratch? |
| `IntersectionObserver` API | low — AI wrote the one-shot pattern | Study MDN; write an observer from scratch once |
| Tailwind v3 vs v4 CSS variable model | low | Can you explain *why* v4 breaks Safari scroll snap? |
| `next-themes` wiring | medium — you knew the library | Do you understand `suppressHydrationWarning` and why it's needed? |
| React `<ViewTransition>` API | low — AI proposed and debugged it | You learned it was flawed; do you understand the key-flip unmount cycle? |
| `clamp()` responsive sizing | medium — you directed the values | Can you derive the `2vw + 1vh` formula and explain what each term contributes? |
| Bash `grep -cF` with cell anchoring | low — AI debugged the false-positive | Can you explain why anchoring to `\| · backlog \|` was necessary? |
| Pipe-to-bash env var inheritance | low — AI proposed the fix | Can you explain why `SKIP_TESTS=1 echo "x" \| bash script.sh` does NOT pass the var to bash? |

---

## How to Use

1. After each sprint, fill in the **Owner** column for every row.
2. Rows marked `AI` where you can't explain the solution yourself = **gap**.
3. For each gap, add an **Action** in the Domains table (e.g., "read MDN article", "write it from scratch once").
4. Over time, `AI` rows should shrink as you absorb the patterns.
