# Project Knowledge Base

Documentation for architectural decisions, implementation patterns, and domain knowledge.
Each domain has its own reference doc. All architectural decisions live in [`decisions/`](decisions/).

---

## Domains

| Domain | Reference Doc | Related ADRs |
|--------|--------------|-------------|
| Mobile snap scroll + Safari theming | [mobile-web-snap-scroll-theming.md](mobile-web-snap-scroll-theming.md) | ADR-001, 002, 003, 004, 005, 006 |
| Slide entrance animations | [snap-scroll-animations.md](snap-scroll-animations.md) | ADR-007 |

---

## How to add a new domain

1. Create `docs/<domain-name>.md` — implementation patterns, code snippets, quick reference
2. For each significant decision in that domain, add an ADR in `docs/decisions/` with the next sequential number
3. Cross-link: add `> **Decision:** [ADR-XXX]` callouts in the reference doc, add a row to the table above

## How to add a new ADR

1. Find the next number in [`decisions/README.md`](decisions/README.md)
2. Copy the ADR template: Context → Decision → Alternatives Considered → Consequences
3. Add a row to [`decisions/README.md`](decisions/README.md)
4. Link it from the relevant domain reference doc

---

## All Decisions

See [`decisions/README.md`](decisions/README.md) for the full ADR index.
