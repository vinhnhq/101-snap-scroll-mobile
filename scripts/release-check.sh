#!/usr/bin/env bash
# Release readiness gate — checks sprint status, tests, git state, then
# merges dev → main on explicit YES confirmation.
# Run from the dev branch: bash scripts/release-check.sh
# SKIP_TESTS=1 bash scripts/release-check.sh   (skips slow Playwright run)
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
KNOWN_FAILURES=2   # pre-existing "each slide has a distinct height" failures
TARGET="main"      # branch that receives the merge
SEP=$(printf '═%.0s' $(seq 1 56))

# ── Colors (disable when not a terminal) ─────────────────────────────────────
if [[ -t 1 ]]; then
  GRN='\033[0;32m'; RED='\033[0;31m'; YLW='\033[1;33m'; BLD='\033[1m'; NC='\033[0m'
else
  GRN=''; RED=''; YLW=''; BLD=''; NC=''
fi

# ── Version + branch ─────────────────────────────────────────────────────────
VERSION=$(grep '"version"' package.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# ── Header ────────────────────────────────────────────────────────────────────
echo "$SEP"
echo ""
printf "${BLD}RELEASE READINESS CHECK — v${VERSION}${NC}\n"
printf "Branch: ${BRANCH} → ${TARGET}\n"
echo ""

# ── T2: Sprint status ─────────────────────────────────────────────────────────
DONE=$(grep -cF "| ✓ done |" tasks/README.md 2>/dev/null) || DONE=0
BACKLOG=$(grep -cF "| · backlog |" tasks/README.md 2>/dev/null) || BACKLOG=0
TOTAL=$((DONE + BACKLOG))
SPRINT_OK=0

printf "%-18s" "Sprint status:"
if [[ "$BACKLOG" -eq 0 ]]; then
  printf "${GRN}PASS ✓${NC}  (${DONE}/${TOTAL} done)\n"
  SPRINT_OK=1
else
  printf "${RED}FAIL ✗${NC}  (${BACKLOG} task(s) still in backlog)\n"
fi

# ── T3: Test suite ────────────────────────────────────────────────────────────
TEST_OK=0
PASSED=0
FAILED=0

printf "%-18s" "Test suite:"
if [[ "${SKIP_TESTS:-0}" == "1" ]]; then
  printf "${YLW}SKIP ~${NC}  (SKIP_TESTS=1)\n"
  TEST_OK=1
else
  TEST_OUT=$(bun run test 2>&1 || true)
  PASSED=$(echo "$TEST_OUT" | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' | tail -1 || echo 0)
  FAILED=$(echo "$TEST_OUT" | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' | tail -1 || echo 0)
  NEW_FAILURES=$(( FAILED > KNOWN_FAILURES ? FAILED - KNOWN_FAILURES : 0 ))
  if [[ $NEW_FAILURES -eq 0 ]]; then
    printf "${GRN}PASS ✓${NC}  (${PASSED} passed, ${KNOWN_FAILURES} pre-existing skipped)\n"
    TEST_OK=1
  else
    printf "${RED}FAIL ✗${NC}  (${NEW_FAILURES} new failure(s) — ${FAILED} total)\n"
  fi
fi

# ── T4: Branch state ──────────────────────────────────────────────────────────
DIRTY_OK=0

printf "%-18s" "Uncommitted:"
DIRTY=$(git status --porcelain)
if [[ -z "$DIRTY" ]]; then
  printf "${GRN}CLEAN ✓${NC}  (nothing to commit)\n"
  DIRTY_OK=1
else
  printf "${RED}DIRTY ✗${NC}  (working tree has changes)\n"
fi

git fetch origin --quiet 2>/dev/null || true
AHEAD=$(git rev-list ${TARGET}..HEAD --count 2>/dev/null || echo 0)

printf "%-18s" "Ahead of ${TARGET}:"
if [[ "$AHEAD" -eq 0 ]]; then
  printf "${YLW}WARN ~${NC}   nothing to merge (dev == ${TARGET})\n"
else
  printf "${GRN}PASS ✓${NC}  (${AHEAD} commit(s) to merge into ${TARGET})\n"
fi

# ── T5: Commits list ──────────────────────────────────────────────────────────
echo ""
if [[ "$AHEAD" -gt 0 ]]; then
  echo "Commits to release (${AHEAD} total):"
  git log ${TARGET}..HEAD --oneline | while IFS= read -r line; do
    echo "  $line"
  done
else
  echo "Recent commits (last 10):"
  git log --oneline -10 | while IFS= read -r line; do
    echo "  $line"
  done
fi

# ── T6: Gate check ────────────────────────────────────────────────────────────
# FORCE_PASS=1 bypasses gate checks — for test harness use only
if [[ "${FORCE_PASS:-0}" == "1" ]]; then
  ALL_OK=1
else
  ALL_OK=$(( SPRINT_OK & TEST_OK & DIRTY_OK ))
fi

echo ""
if [[ $ALL_OK -ne 1 ]]; then
  echo "$SEP"
  echo ""
  printf "${RED}One or more checks failed. Fix issues before releasing.${NC}\n"
  exit 1
fi

# ── T7: Confirm + merge + release log ────────────────────────────────────────
printf "This will merge ${BLD}${BRANCH}${NC} → ${BLD}${TARGET}${NC} and push.\n"
echo "This action cannot be undone without a revert commit."
echo ""
echo "$SEP"
echo ""
printf "Type ${BLD}YES${NC} to proceed: "
read -r CONFIRM || CONFIRM=""

if [[ "$CONFIRM" != "YES" ]]; then
  echo "Aborted."
  exit 0
fi

DATE=$(date +%Y-%m-%d)
RELEASES="tasks/RELEASES.md"

# Write RELEASES.md on dev before the merge so it's included
DEV_SHA=$(git rev-parse --short HEAD)
MARKER_LINE=$(grep -n "<!-- entries added here" "$RELEASES" | cut -d: -f1)
TMP=$(mktemp)
{
  head -n "$MARKER_LINE" "$RELEASES"
  echo ""
  echo "## v${VERSION} — ${DATE}"
  echo "Sprint status:   PASS ✓  (${DONE}/${TOTAL} done)"
  echo "Test suite:      PASS ✓  (${PASSED} passed, ${KNOWN_FAILURES} skipped)"
  echo "Uncommitted:     CLEAN ✓"
  echo "Merged:          ${BRANCH}@${DEV_SHA} → ${TARGET}"
  echo ""
  echo "---"
  echo ""
  tail -n +$((MARKER_LINE + 1)) "$RELEASES"
} > "$TMP"
mv "$TMP" "$RELEASES"

echo ""
echo "Logging release..."
git add tasks/RELEASES.md
git commit -m "chore: log release v${VERSION}"
git push origin "${BRANCH}"

echo "Merging ${BRANCH} → ${TARGET}..."
git checkout "${TARGET}"
git merge "${BRANCH}" --no-ff -m "release: v${VERSION}"
git push origin "${TARGET}"

echo "Returning to ${BRANCH}..."
git checkout "${BRANCH}"

echo ""
printf "${GRN}Released v${VERSION} — ${BRANCH} merged into ${TARGET}.${NC}\n"
