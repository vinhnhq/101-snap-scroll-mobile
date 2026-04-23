# Task List: Release Readiness Check Script

- [x] **T1** — Script scaffold: `scripts/release-check.sh`, read version from `package.json`, print header
- [x] **T2** — Sprint status: parse `tasks/README.md`, FAIL if any `· backlog` rows remain
- [x] **T3** — Test suite: run `bun test`, FAIL if new failures beyond 2 known pre-existing
- [x] **T4** — Branch state: DIRTY check (`git status --porcelain`), commits ahead of `origin/main`
- [x] **T5** — Commits list: `git log origin/main..HEAD --oneline`, formatted with indent
- [x] **T6** — Gate summary: aligned columns, ANSI color (green/red/yellow), block prompt on any FAIL
- [x] **T7** — Confirmation: `YES` → `git tag vX.Y.Z` + `git push origin main` + `git push origin vX.Y.Z`
