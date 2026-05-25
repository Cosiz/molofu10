# System Architecture Standards

## Applies to

Stages 1 (spec), 3 (implementation), 4 (Costrict architecture pass).

## Purpose

Enforce architectural discipline so that AI-generated code does not erode the system over time. Most agent-built systems decay because each feature is locally optimal but globally incoherent. These rules counter that.

## Rules

### 1. Boundaries

**1.1** Every module declares a single, documented responsibility in a top-of-file comment. If you cannot describe it in one sentence without "and", split it.

**1.2** Modules communicate through explicit interfaces (TypeScript interfaces, Python protocols, or function signatures with typed payloads). No reaching into another module's internals.

**1.3** The dependency graph must be a DAG. No cycles, ever. Costrict architecture pass enforces this — a cycle blocks merge.

**1.4** Layer rule: `presentation → application → domain → infrastructure`. Dependencies point inward only. Domain logic must not import from infrastructure.

### 2. State & data flow

**2.1** Single source of truth for every piece of state. Document where it lives (DB table, store slice, cache key) in the spec.

**2.2** No hidden mutation. Functions that mutate inputs declare it in their name (`mutateX`, `applyX`) or return new state.

**2.3** Side effects (DB writes, network calls, file I/O, LLM calls) are pushed to the edges. Pure business logic in the middle. This is the functional core / imperative shell pattern.

**2.4** Idempotency is a first-class concern. Every external-effect operation has an explicit idempotency key, documented in its docstring. Webhook handlers, payments, message sends — all idempotent by construction.

### 3. Failure modes

**3.1** Every external dependency has a documented failure mode in the spec. What happens when the LLM API is down? When the DB is slow? When a webhook is duplicated? Costrict will ask.

**3.2** Timeouts on every network call. Default 30s, justify anything longer. No infinite waits.

**3.3** Retries with exponential backoff + jitter on transient failures. Circuit breakers on persistent ones.

**3.4** Errors propagate as typed values, not exceptions across module boundaries (where the language supports it). Exceptions are for truly exceptional conditions.

### 4. Observability

**4.1** Every request gets a correlation ID. Logged at entry, propagated to all downstream calls, returned in error responses.

**4.2** Structured logging (JSON), never plain strings. Fields: `correlation_id`, `level`, `module`, `event`, plus event-specific payload.

**4.3** Three metric types minimum per externally-facing endpoint: request rate, error rate, latency p50/p95/p99. Standard names per service.

**4.4** LLM calls log: model, input tokens, output tokens, latency, cost estimate, cache hit/miss. Non-negotiable — your cost analysis depends on it.

### 5. Configuration

**5.1** Twelve-factor: configuration in environment, code in repo. No environment-specific code paths.

**5.2** No magic numbers. Constants live in a named config module, with comments explaining their values.

**5.3** Feature flags for any change that could be reverted without a code change. Document the flag's owner and removal criteria.

### 6. Evolution

**6.1** New service or major module requires an ADR (Architecture Decision Record) in `docs/adr/NNN-title.md`. Template: context, decision, alternatives considered, consequences.

**6.2** Schema changes require migrations, never destructive in-place edits. Forward-compatible by default; document the rollback path.

**6.3** API versioning at the URL or header level for anything consumed externally. Deprecation policy: ≥30 days notice, parallel versions during migration.

## Costrict enforcement

The Costrict architecture pass (Stage 4 Pass B) checks rules 1.3, 1.4, 2.3, 3.2, 3.3, 4.1, 4.4, 5.1. The remainder rely on spec discipline and code review.

## Sources

- Domain-Driven Design (Evans, Vernon)
- Twelve-Factor App (Heroku)
- Functional Core / Imperative Shell (Gary Bernhardt)
- ADR pattern (Michael Nygard)
- Observability standards (Honeycomb / Charity Majors)
- *Inspirations to add as you adopt them: Matt Pocock TypeScript patterns, Karpathy software 1.0/2.0 boundaries, etc.*

## Changelog

- **1.0.0** — Initial architecture standards.
