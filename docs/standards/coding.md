# Coding Standards

## Applies to

Stages 2 (test-first), 3 (implementation), 4 (Costrict).

## Rules

### General

**G.1** Names describe purpose, not type. `userList` is fine; `arrayOfUsers` is not.
**G.2** Functions do one thing. If you need "and" to describe what a function does, split it.
**G.3** Pure functions by default. Side effects pushed to the edges (see `architecture.md` §2.3).
**G.4** Cyclomatic complexity ≤ 10 per function. Costrict blocks anything higher.
**G.5** No dead code. No commented-out code. Delete; git remembers.
**G.6** Comments explain *why*, not *what*. The code says what.

### TypeScript / JavaScript

**TS.1** `strict: true` in tsconfig, no exceptions. No `any` without an inline `// eslint-disable` plus comment justifying it.
**TS.2** ESM modules only. No CommonJS in new code.
**TS.3** Prefer `unknown` over `any` at module boundaries. Narrow with type guards.
**TS.4** Discriminated unions for state machines (`type State = { status: 'idle' } | { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T }`).
**TS.5** Branded types for primitives that aren't interchangeable (`UserId`, `OrderId` — not bare `string`).
**TS.6** Zod (or equivalent) schemas at all external boundaries. Parse at the edge, trust inside.
**TS.7** Async error handling: `Result<T, E>` types or explicit `try/catch` — no silent promise rejections.

### Python

**P.1** Python 3.11+. Type hints required on all public functions and methods.
**P.2** `ruff` + `mypy --strict` clean.
**P.3** Dataclasses or Pydantic for structured data. No dict-shaped contracts across module boundaries.
**P.4** `pathlib.Path`, not `os.path`. `httpx`, not `requests`, for new code.
**P.5** Logging via the stdlib `logging` module with structured extras, never `print()`.

### SQL

**SQL.1** Parameterized queries only. String interpolation is a security bug, full stop.
**SQL.2** Migrations are forward-compatible. Document the rollback in the migration file.
**SQL.3** Every user-facing Postgres table has RLS enabled. No service-role keys in client code.
**SQL.4** Indexes are added with measurement, not by guess. Capture the query and `EXPLAIN ANALYZE` in the PR description.

### Bash

**B.1** `set -euo pipefail` at the top of every script.
**B.2** Quote every variable expansion (`"$var"` not `$var`).
**B.3** Shellcheck clean.

## Sources

- *Clean Code* (Robert C. Martin) — used selectively
- *A Philosophy of Software Design* (John Ousterhout) — strongly preferred over Clean Code where they conflict
- Matt Pocock's TypeScript skills (see vendored skills)
- Effective Python (Brett Slatkin)
- *Extend as you adopt patterns.*

## Changelog

- **1.0.0** — Initial coding standards.
