# Plan: Release Readiness Check Script

## Context

Sprint 05 completed. Before pushing to `origin/main` there is no automated gate — a developer must manually verify tests pass, commits are clean, and the branch is in a shippable state. This sprint adds `scripts/release-check.sh`: an interactive terminal script that runs all checks and requires an explicit `YES` to tag + push.

**Stack:** bash, `git`, `bun test` (Playwright), `jq` (optional — only for package.json parsing).

---

## Output format (target)

```
════════════════════════════════════════════════════════

RELEASE READINESS CHECK — v0.1.0

Sprint status:    PASS ✓  (5/5 tasks done, 0 backlog)
Test suite:       PASS ✓  (16 passed, 2 pre-existing skipped)
Uncommitted:      CLEAN ✓  (nothing to commit)
Remote sync:      3 commits ahead of origin/main ✓

Commits to release (3 total):
  06198bc chore: mark sprint-05 all tasks done
  451e2ea fix(sprint-05/T3): fix dev-nav bottom
  82a305f feat(sprint-05/T2): extract MobileSlide wrapper

This will tag v0.1.0 and push to origin/main.
This action cannot be undone without a revert commit.

════════════════════════════════════════════════════════

Type YES to proceed:
```

---

## Tasks

### T1 — Script scaffold + header
**File:** `scripts/release-check.sh`

- Read version from `package.json` using `grep`/`sed` (no `jq` dependency)
- Print separator line + "RELEASE READINESS CHECK — vX.Y.Z" header
- Exit immediately on any unhandled error (`set -euo pipefail`)

**Acceptance:** `bash scripts/release-check.sh` prints the header and exits cleanly.

---

### T2 — Sprint status check
Parse `tasks/README.md` and count `✓ done` vs `· backlog` rows.

```bash
done=$(grep -c "✓ done" tasks/README.md)
backlog=$(grep -c "· backlog" tasks/README.md)
```

- PASS if `backlog == 0`
- FAIL if any backlog items remain (prints which sprint)

**Acceptance:** Manually adding a `· backlog` row to README makes the check FAIL.

---

### T3 — Test suite runner
Run `bun test` (Playwright), capture exit code and parse summary line.

```bash
output=$(bun test 2>&1)
exit_code=$?
# parse "N passed" and "N failed" from output
```

- PASS if exit code 0 (or only pre-existing failures — detect by comparing count to known baseline)
- FAIL if new failures appear

**Note:** 2 pre-existing failures (`each slide has a distinct height`) are known and excluded from the gate. Baseline count is stored as a constant in the script.

**Acceptance:** Breaking a test causes check to FAIL. Pre-existing failures do not.

---

### T4 — Branch / remote state check
Two sub-checks:

1. **Uncommitted changes** — `git status --porcelain`: CLEAN if empty, DIRTY if not
2. **Remote sync** — `git fetch origin` then `git rev-list origin/main..HEAD --count`: prints N commits ahead

- Gate blocks on DIRTY working tree
- Gate does NOT block on 0 commits ahead (just warns "nothing to push")

**Acceptance:** Creating an uncommitted file makes DIRTY appear; the gate blocks.

---

### T5 — Recent commits list
```bash
git log origin/main..HEAD --oneline
```

Formatted with 2-space indent. Falls back to last 10 commits if nothing ahead of remote.

---

### T6 — Gate summary + color output
Print all check results in aligned columns using ANSI codes:
- `✓` in green for PASS / CLEAN
- `✗` in red for FAIL / DIRTY
- `~` in yellow for WARN / SKIP

Print the "This will tag vX.Y.Z and push to origin/main" warning only if all gates pass.

**Acceptance:** FAIL on any check suppresses the confirmation prompt and exits non-zero.

---

### T7 — Confirmation: tag + push
If all gates pass:

1. Print the warning block
2. Prompt: `Type YES to proceed:`
3. On `YES`:
   - `git tag vX.Y.Z`
   - `git push origin main`
   - `git push origin vX.Y.Z`
4. On anything else: print "Aborted." and exit 0

**Acceptance:** Typing `YES` tags + pushes. Typing `no` or pressing Enter aborts cleanly.

---

## Dependency graph

```
T1 (scaffold) → T2 (sprint check) → T6 (summary)
             → T3 (tests)        ↗
             → T4 (git state)    ↗
             → T5 (commits)      ↗
                                  → T7 (confirm + push)
```

---

## Verification

1. `bash scripts/release-check.sh` — all checks PASS, confirmation prompt appears
2. Type `no` → "Aborted." printed, no tag created, no push
3. Introduce a failing test → T3 shows FAIL, prompt suppressed, script exits 1
4. Create an uncommitted file → T4 shows DIRTY, prompt suppressed
5. Add a `· backlog` row to README → T2 shows FAIL
