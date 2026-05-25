# Testing Standards

## Applies to

Stages 2 (test-first), 3 (implementation), 4 (Costrict).

## Rules

**T.1** Test framework: Vitest (TS) / pytest (Python). One per language, no mixing.
**T.2** Coverage floor on **changed** code: 80% line, 70% branch. Untouched legacy code is exempt until touched.
**T.3** Every bug fix lands with a regression test that fails without the fix.
**T.4** Mock only at external boundaries (network, DB, time, randomness). Never mock the system under test.
**T.5** Test names describe behavior, not implementation: `it("rejects orders below the minimum amount")` not `it("returns false when amount < 100")`.
**T.6** Tests reference spec section numbers in their names or docstrings (e.g., `// spec §3.2`).
**T.7** No conditional logic in tests. If you need `if`, you have two tests.
**T.8** Each test is independent. No order dependencies, no shared mutable fixtures.
**T.9** Property-based tests (fast-check, Hypothesis) for any function with a non-trivial input space and a clear invariant.
**T.10** Snapshot tests only for genuinely stable output (rendered HTML, JSON schemas). Never for arbitrary string output.
**T.11** Time and randomness are injected, never read directly inside the system under test.
**T.12** Integration tests cover the happy path end-to-end per major user journey. Don't drown in integration tests; unit tests catch most regressions cheaper.

## Test pyramid for this project

- Unit (fast, many): pure logic, edge cases
- Integration (medium, fewer): module-to-module, real DB in containers
- E2E (slow, fewest): top user journeys only

If you're writing more E2E tests than integration tests, something is wrong.

## Sources

- *Working Effectively with Legacy Code* (Michael Feathers)
- Kent C. Dodds testing trophy
- *Inspirations to add as you adopt them.*

## Changelog

- **1.0.0** — Initial testing standards.
