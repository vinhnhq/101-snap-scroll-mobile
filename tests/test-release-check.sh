#!/usr/bin/env bash
# Test harness for scripts/release-check.sh
# Run from repo root: bash tests/test-release-check.sh
set -uo pipefail

SCRIPT="scripts/release-check.sh"
PASS=0
FAIL=0

ok()   { echo "  PASS  $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL  $1"; FAIL=$((FAIL + 1)); }

run_script() {
  # SKIP_TESTS=1 skips the slow bun test run
  # Feed /dev/null so read builtin gets EOF (simulates pressing Enter / abort)
  SKIP_TESTS=1 bash "$SCRIPT" 2>&1 < /dev/null || true
}

run_script_with_input() {
  # env vars must come before bash, not before echo, to be inherited by bash
  printf '%s\n' "$1" | SKIP_TESTS=1 bash "$SCRIPT" 2>&1 || true
}

run_script_force_pass() {
  # FORCE_PASS=1 skips gate checks — used to reach T7 confirmation regardless of state
  printf '%s\n' "$1" | SKIP_TESTS=1 FORCE_PASS=1 bash "$SCRIPT" 2>&1 || true
}

echo "═══════════════════════════════════════"
echo "  release-check tests"
echo "═══════════════════════════════════════"
echo ""

# ── T1: Scaffold ────────────────────────────────────────────────────────────
echo "T1 — Scaffold + header"

if [[ ! -f "$SCRIPT" ]]; then
  fail "script not found at $SCRIPT"
else
  ok "script exists"

  VERSION=$(grep '"version"' package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
  OUT=$(run_script)

  if echo "$OUT" | grep -q "RELEASE READINESS CHECK.*v${VERSION}"; then
    ok "header contains version v${VERSION}"
  else
    fail "header missing version — got: $(echo "$OUT" | head -4)"
  fi
fi

# ── T2: Sprint status ────────────────────────────────────────────────────────
echo ""
echo "T2 — Sprint status"

OUT=$(run_script)
if echo "$OUT" | grep -q "Sprint status:"; then
  ok "sprint status line present"
else
  fail "sprint status line missing"
fi

# T2: Inject a backlog item, expect FAIL in output
echo "| X | [Fake task](x) | · backlog |" >> tasks/README.md
OUT_WITH_BACKLOG=$(run_script)
sed -i '' '/| X | \[Fake task\]/d' tasks/README.md

if echo "$OUT_WITH_BACKLOG" | grep -qE "FAIL.*backlog|backlog.*FAIL"; then
  ok "FAIL shown when backlog items exist"
else
  fail "FAIL not shown when backlog items exist — got: $(echo "$OUT_WITH_BACKLOG" | grep -i sprint || echo '(no sprint line)')"
fi

# ── T4: Branch state ─────────────────────────────────────────────────────────
echo ""
echo "T4 — Branch / remote state"

OUT=$(run_script)
if echo "$OUT" | grep -q "Uncommitted:"; then
  ok "uncommitted check present"
else
  fail "uncommitted check missing"
fi

if echo "$OUT" | grep -q "Remote sync:"; then
  ok "remote sync check present"
else
  fail "remote sync check missing"
fi

# T4: Dirty state detection
touch /tmp/release-check-dirty-test-$$.tmp
git add /tmp/release-check-dirty-test-$$.tmp 2>/dev/null || true
# Create an actual dirty file in the repo
echo "dirty" > dirty-test-$$.tmp
OUT_DIRTY=$(run_script)
rm -f dirty-test-$$.tmp
git restore --staged dirty-test-$$.tmp 2>/dev/null || true

if echo "$OUT_DIRTY" | grep -qiE "DIRTY|working tree"; then
  ok "DIRTY shown for uncommitted changes"
else
  fail "DIRTY not shown for uncommitted changes"
fi

# ── T5: Commits list ─────────────────────────────────────────────────────────
echo ""
echo "T5 — Commits list"

OUT=$(run_script)
if echo "$OUT" | grep -qE "Commits to release|Recent commits"; then
  ok "commits section present"
else
  fail "commits section missing"
fi

# ── T6: Gate blocks on failure ───────────────────────────────────────────────
echo ""
echo "T6 — Gate + color"

OUT=$(run_script)
if echo "$OUT" | grep -qE "PASS|FAIL|CLEAN|DIRTY"; then
  ok "status indicators present"
else
  fail "no status indicators found"
fi

# With backlog item injected, script should exit non-zero
echo "| X | [Fake task](x) | · backlog |" >> tasks/README.md
SKIP_TESTS=1 bash "$SCRIPT" < /dev/null > /dev/null 2>&1 && GATE_EXIT=0 || GATE_EXIT=$?
sed -i '' '/| X | \[Fake task\]/d' tasks/README.md

if [[ $GATE_EXIT -ne 0 ]]; then
  ok "script exits non-zero when gate fails"
else
  fail "script should exit non-zero when gate fails (got 0)"
fi

# ── T7: Abort path ───────────────────────────────────────────────────────────
echo ""
echo "T7 — Confirmation / abort"

# T7 uses FORCE_PASS=1 to bypass gate checks and reach the confirmation prompt
# without needing a clean sprint / clean tree state.
OUT=$(run_script_force_pass "no")
if echo "$OUT" | grep -q "Aborted\."; then
  ok "prints 'Aborted.' on non-YES input"
else
  fail "abort message missing — got: $(echo "$OUT" | tail -5)"
fi

OUT_ENTER=$(run_script_force_pass "")
if echo "$OUT_ENTER" | grep -q "Aborted\."; then
  ok "prints 'Aborted.' on empty input (Enter)"
else
  fail "abort message missing on empty input"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "  ${PASS} passed  ${FAIL} failed"
echo "═══════════════════════════════════════"

[[ $FAIL -eq 0 ]]
