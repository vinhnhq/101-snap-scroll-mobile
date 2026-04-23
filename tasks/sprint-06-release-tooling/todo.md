# Task List: Release Readiness Check Script

- [ ] **T1** — Script scaffold: `scripts/release-check.sh`, read version from `package.json`, print header
- [ ] **T2** — Sprint status: parse `tasks/README.md`, FAIL if any `· backlog` rows remain
- [ ] **T3** — Test suite: run `bun test`, FAIL if new failures beyond 2 known pre-existing
- [ ] **T4** — Branch state: DIRTY check (`git status --porcelain`), commits ahead of `origin/main`
- [ ] **T5** — Commits list: `git log origin/main..HEAD --oneline`, formatted with indent
- [ ] **T6** — Gate summary: aligned columns, ANSI color (green/red/yellow), block prompt on any FAIL
- [ ] **T7** — Confirmation: `YES` → `git tag vX.Y.Z` + `git push origin main` + `git push origin vX.Y.Z`
