# Development Workflow

A structured, repeatable process for shipping features cleanly — spec before code, tests before merge, gate before release. Copy this doc and the conventions below into any new repo to enforce the same discipline.

---

## Pipeline at a Glance

```
SPEC → PLAN → IMPLEMENT → TEST → REVIEW → RELEASE
```

Each phase has a hard entry and exit condition. You don't move forward until the exit condition is met.

---

## Phase 1 — Spec

**Entry:** A feature request or task description exists.  
**Exit:** A written spec with acceptance criteria exists. No code written yet.

### What to produce

A spec document (or inline in `plan.md`) with:
- **Context** — what problem this solves and why now
- **What we're building** — concrete deliverable, not goals
- **Acceptance criteria** — specific, testable, binary (pass/fail)
- **Out of scope** — what we are explicitly not doing

### Rules

- If the request is outcome-only ("add login", "fix the bug"), ask for: which files, function signatures, data shapes. Do not guess.
- If multiple interpretations exist, list them and ask. Do not pick silently.
- No code until the spec is agreed on.

---

## Phase 2 — Plan

**Entry:** Spec is agreed on.  
**Exit:** `tasks/README.md` updated with new tasks in backlog. Sprint folder created with `plan.md` and `todo.md`.

### File structure

```
__project__/
  tasks/
    README.md                        ← master task board (parsed by release gate)
    sprint-NN-name/
      plan.md                        ← per-task context + acceptance criteria
      todo.md                        ← checkbox list mirroring plan.md tasks
  docs/
    <domain>.md                      ← implementation reference per domain
    decisions/
      README.md                      ← ADR index
      ADR-NNN-title.md               ← one ADR per significant decision
    knowledge-ownership.md           ← who drove what, per sprint row
  RELEASES.md                        ← append-only release log (written by release gate)
```

### `tasks/README.md` format

```markdown
# Project Tasks

Status legend: ✓ done · → in progress · · backlog

---

## Sprint NN — Name
| # | Task | Status |
|---|------|--------|
| NNN | [Task title](sprint-NN-name/NNN-task-slug.md) | · backlog |
```

Status values: `✓ done`, `→ in progress`, `· backlog`. The release gate counts backlog rows — a non-zero count blocks release.

### `plan.md` format

```markdown
# Plan: <Sprint Name>

## Context
<Why this sprint exists. What the state is before. What changes.>

## Tasks

### Task N: <Title>
**File:** `path/to/file.ts`
**Change:** <What changes and why>
**Acceptance:** <Binary pass/fail criteria>
```

### `todo.md` format

```markdown
# Todo: <Sprint Name>

- [ ] Task 1: <title>
- [ ] Task 2: <title>
```

### ADR format

Create one ADR per significant architectural decision — technology choice, pattern selection, anything you'd want to explain to a future team member.

```markdown
# ADR-NNN — <Decision Title>

**Context:** <What situation forced a decision>  
**Decision:** <What we chose>  
**Alternatives:** <What we considered and rejected, and why>  
**Consequences:** <What this means going forward — costs and benefits>
```

---

## Phase 3 — Implement

**Entry:** Plan is written, tasks are in backlog.  
**Exit:** All tasks in sprint are `✓ done`. All tests pass.

### Rules

- **Thin slices only.** One task → test → commit → next. Never batch a sprint and review a wall of changes at the end.
- **Surgical changes.** Every changed line traces directly to the current task. Do not "improve" adjacent code.
- **When your changes create orphans**, remove imports/variables/functions that your changes made unused. Do not remove pre-existing dead code unless asked.
- **No speculative features.** No abstractions for single-use code. No flexibility that wasn't requested.

### Commit message convention

```
<type>(<scope>): <description>

Types: feat | fix | chore | plan | refactor | docs | test
Scope: sprint-NN/TN (sprint number / task number)

Examples:
  feat(sprint-04/T2): add CSS animation keyframes
  fix(sprint-05/T1): correct clamp() formula for iPhone SE
  chore: bump version to 0.4.0
  plan(sprint-07): add entrance animation spec
```

### Updating task status

Update `tasks/README.md` as each task completes:
- `· backlog` → `→ in progress` when you start
- `→ in progress` → `✓ done` when the task's acceptance criteria pass

---

## Phase 4 — Test

**Entry:** Implementation complete for the task.  
**Exit:** Tests pass (or failing tests are understood and baselined).

### Test runner

Use Playwright for end-to-end / integration tests. No unit tests unless the unit has complex isolated logic.

```ts
// playwright.config.ts essentials
{
  testDir: '__tests__',
  projects: [
    { name: 'iPhone 14', use: { ...devices['iPhone 14'] } },
    { name: 'iPhone SE', use: { ...devices['iPhone SE'] } },
  ],
  webServer: { command: 'npm run dev', url: 'http://localhost:3000' },
}
```

### Known failures

If a test fails by design (an assertion that is intentionally wrong, or a platform constraint), baseline it:

```bash
# In release-check.sh
KNOWN_FAILURES=2  # number of pre-approved failing tests
```

Document each known failure with a comment in the test file explaining why it is expected.

---

## Phase 5 — Review (Knowledge Capture)

**Entry:** Sprint tasks are done and tests pass.  
**Exit:** Docs updated, ADRs finalized, ownership recorded.

### What to update

1. **`docs/<domain>.md`** — update with any patterns, gotchas, or critical rules discovered during the sprint
2. **`docs/decisions/`** — finalize any ADRs drafted during planning
3. **`docs/knowledge-ownership.md`** — record who drove what

### `knowledge-ownership.md` format

```markdown
# Knowledge Ownership

| Sprint | Task | Solution | Owner | Notes |
|--------|------|----------|-------|-------|
| 04 | ViewTransition animations | CSS class toggle | collab | Tried native ViewTransition first — not ready |

Owner values: `you` (developer), `AI` (agent), `collab` (iterated together)
```

---

## Phase 6 — Release

**Entry:** All tasks `✓ done`, tests pass, working on `dev` branch.  
**Exit:** `dev` merged to `main` with a non-fast-forward merge commit. Release logged.

### Branch model

- `dev` — working branch. All development happens here.
- `main` — release-only. Updated exclusively via the release gate script. Never commit directly to `main`.

### Version bump (manual, before running the gate)

1. Update `version` in `package.json`
2. Commit: `chore: bump version to X.Y.Z`

### Release gate script (`scripts/release-check.sh`)

The gate runs sequential checks. Any failure exits non-zero and blocks the release.

```
Gate 1: Sprint status     — grep "· backlog" in tasks/README.md. FAIL if count > 0.
Gate 2: Test suite        — run bun/npm test. FAIL if failures > KNOWN_FAILURES.
Gate 3: Git dirty check   — git status --porcelain. FAIL if working tree is dirty.
Gate 4: Commits ahead     — git rev-list main..HEAD --count. WARN if 0.
Gate 5: Commit list       — print git log main..HEAD --oneline for review.

→ Prompt: "Type YES to proceed:"

On YES:
  1. Append entry to __project__/RELEASES.md on dev
  2. git add + commit + push origin dev
  3. git checkout main && git merge dev --no-ff -m "release: vX.Y.Z"
  4. git push origin main
  5. git checkout dev
```

### `RELEASES.md` entry format (written by gate script)

```markdown
## vX.Y.Z — YYYY-MM-DD

- Sprint pass rate: N/N tasks done
- Tests: N passed, N known failures
- Commits merged: <dev SHA>
```

### Environment escape hatches (for testing the gate script itself)

```bash
SKIP_TESTS=1 bash scripts/release-check.sh      # skip Playwright run
FORCE_PASS=1 bash scripts/release-check.sh      # bypass all gates (test harness only)
```

---

## Agent Behavioral Rules

These apply to any AI agent (Claude Code or similar) working in the repo.

### Core principles

1. **Think before coding** — state assumptions explicitly; ask when unclear; surface tradeoffs before acting
2. **Simplicity first** — minimum code that solves the problem; no speculative features, no single-use abstractions
3. **Surgical changes** — touch only what the request requires; do not refactor adjacent code
4. **Goal-driven execution** — transform every task into verifiable criteria; state a plan before multi-step work
5. **Spec before code** — if the prompt is outcome-only, ask for files, function signatures, data shapes before writing anything

### CLAUDE.md / AGENTS.md setup

In `CLAUDE.md` at the repo root, reference your agent rules:

```markdown
@AGENTS.md
```

In `AGENTS.md`, add repo-specific agent constraints — e.g. framework version caveats, which docs to read before touching a given library.

### `.claude/settings.local.json` (gitignored)

Pre-approve common read-only and dev commands so the agent doesn't prompt on every call:

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm run *)",
      "Bash(bun run *)",
      "Bash(bash *)",
      "Bash(node *)",
      "Bash(npx playwright *)",
      "Bash(curl *)",
      "Write(*)",
      "Edit(*)"
    ]
  }
}
```

Add `.claude/settings.local.json` to `.gitignore` — these are personal overrides, not team config.

---

## Tooling Defaults

| Tool | Purpose |
|------|---------|
| Playwright | E2E / integration tests |
| Biome | Lint + format (replaces ESLint + Prettier) |
| `bun` | Package manager and test runner |

### Biome config essentials

```json
{
  "formatter": { "indentStyle": "tab" },
  "javascript": { "formatter": { "quoteStyle": "double" } },
  "linter": { "enabled": true, "rules": { "recommended": true } }
}
```

### `package.json` scripts baseline

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "biome check .",
    "format": "biome format --write .",
    "test": "playwright test"
  }
}
```

---

## Setup Checklist for a New Repo

```
[ ] Create __project__/tasks/README.md with status legend header
[ ] Create __project__/tasks/RELEASES.md (empty — gate script appends to it)
[ ] Create __project__/docs/ directory
[ ] Create __project__/docs/decisions/README.md (ADR index)
[ ] Create __project__/docs/knowledge-ownership.md with table header
[ ] Add CLAUDE.md → @AGENTS.md
[ ] Add AGENTS.md with repo-specific agent constraints
[ ] Install Biome: bun add -D @biomejs/biome && bunx biome init
[ ] Install Playwright: bun add -D @playwright/test && bunx playwright install
[ ] Create playwright.config.ts pointing to __tests__/ with mobile device projects
[ ] Create scripts/release-check.sh (see gate pattern above)
[ ] Add .claude/settings.local.json with pre-approved commands
[ ] Add .claude/settings.local.json to .gitignore
[ ] Protect main branch (no direct commits — release script only)
[ ] Work from dev branch from day one
```
