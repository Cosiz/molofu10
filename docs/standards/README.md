# Standards Index

This directory holds the project's modular standards. Each file declares which pipeline stages it applies to and contains numbered, testable rules.

## Active standards

| File | Domain | Applies to stages |
|---|---|---|
| `architecture.md` | System architecture principles | 1, 3, 4 |
| `ux-ui.md` | UX/UI principles | 1, 3, 4 |
| `coding.md` | Per-language coding standards | 2, 3, 4 |
| `testing.md` | Test strategy and coverage | 2, 3, 4 |
| `security.md` | Security & data handling | 1, 3, 4 |
| `llm-guardrails.md` | LLM usage and cost guardrails | 1, 3, 4 |
| `git.md` | Commit & PR hygiene | 3, 4 |

## How to add a standard

1. Create a new `.md` file in this folder
2. Use the structure: `## Applies to`, `## Rules`, `## Sources`
3. Add a row to the table above and to `AGENTS.md` section 2
4. If the standard introduces a new merge gate, also update `AGENTS.md` section 7

## How to adopt an external standard (e.g., Matt Pocock skill)

Three paths in increasing depth of integration:

1. **Reference only** — cite it in the `## Sources` section of an existing standard. Useful for inspiration without binding adoption.
2. **Vendor** — copy the source markdown into `.hermes/skills/vendored/<author>/`. Hermes can load it directly. Useful for skills that are already in a compatible format.
3. **Internalize** — extract the rules into one of the standards files in this directory, citing the source. Useful when you want to *enforce* the rules through Costrict and stage gates, not just suggest them to agents.

Default to (1) for new external sources; promote to (2) or (3) only after a feature run validates the rules in your context.

## Versioning

Each standard file has a `## Changelog` section at the bottom. Bump and append on every change. Standards changes are PRs of their own — do not bundle them with feature work.
