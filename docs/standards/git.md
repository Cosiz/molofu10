# Git & PR Standards

## Applies to

Stages 3 (implementation), 4 (Costrict).

## Rules

**G.1** Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `perf:`, `style:`.
**G.2** One concern per PR. PRs touching >400 lines of production code (excluding tests, generated files, snapshots) must be split.
**G.3** PR description template (enforced via PR template):
  - Link to spec file
  - Summary (2–4 sentences)
  - Test plan (what you ran, what passed)
  - Risk & rollback
  - Screenshots if UI changed
**G.4** Branch naming: `<type>/<short-slug>` (`feat/webhook-idempotency`, `fix/order-rounding`).
**G.5** Squash-merge to main. Linear history. No merge commits on main.
**G.6** Required status checks before merge: tests green, Costrict Pass A + B clean of critical/high.
**G.7** Hotfixes follow the same pipeline, just compressed. They do not skip stages.

## Sources

- Conventional Commits 1.0
- Trunk-Based Development (Paul Hammant)

## Changelog

- **1.0.0** — Initial Git standards.
