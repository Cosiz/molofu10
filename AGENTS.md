# AGENTS.md

Project context for OpenCode and any AGENTS.md-compatible coding agent (Claude Code, Codex, Cursor, etc.) operating in this repository.

This file is intentionally **thin**. It declares the pipeline, the gates, and the standards index. Long-form rules live in `docs/standards/` and are referenced below. Reusable procedural skills live in `.hermes/skills/` and are loaded by Hermes.

**Read order for any agent starting in this repo:**

1. This file (`AGENTS.md`) — pipeline + rules of engagement
2. `CONTEXT.md` — ubiquitous language and domain glossary
3. `docs/standards/README.md` — index of active standards
4. The specific standards referenced by your current stage
5. Relevant ADRs in `docs/adr/` (architecture decisions)
6. The current `docs/specs/<feature>.spec.md` (if mid-feature)

---

## 1. Pipeline overview

All non-trivial work moves through four sequential stages. Each stage produces a versioned artifact that is the **sole input** to the next stage.

| Stage | Purpose | Primary tool | Primary model | Backup | Output |
|---|---|---|---|---|---|
| 1. Spec | Unambiguous requirements | Hermes / Perplexity Computer | Grok 4.3 | Claude Opus 4.7 (via Perplexity Computer) | `docs/specs/<feature>.spec.md` |
| 2. Test-first | Failing tests from spec | OpenCode **plan mode** | MiniMax M2.7 | Grok 4.3 | `tests/**` + `<feature>.tests.md` |
| 3. Implementation | Make failing tests pass | OpenCode **build mode** | M2.7 (refactor) / Grok 4.3 (greenfield) | — | Source + green suite |
| 4. Hardening | Strict review | Costrict | Costrict default | — | Costrict report + merged PR |

**Cardinal rule:** Do not skip stages. Do not start stage N+1 before stage N's artifact is approved.

Detailed stage procedures live in `.hermes/skills/system-development-pipeline.md`.

---

## 2. Standards index — `docs/standards/`

Standards are modular, versioned markdown files. Each agent reads only what applies to its current stage. **Adding a new standard = add a file + one row below.** No need to edit the pipeline.

| Standard | File | Applies to stages | Status |
|---|---|---|---|
| Architecture principles | `docs/standards/architecture.md` | 1, 3, 4 | Active |
| UX/UI principles | `docs/standards/ux-ui.md` | 1, 3, 4 | Active |
| Coding standards (per language) | `docs/standards/coding.md` | 2, 3, 4 | Active |
| Testing strategy | `docs/standards/testing.md` | 2, 3, 4 | Active |
| Security & data | `docs/standards/security.md` | 1, 3, 4 | Active |
| LLM & cost guardrails | `docs/standards/llm-guardrails.md` | 1, 3, 4 | Active |
| Commit & PR hygiene | `docs/standards/git.md` | 3, 4 | Active |

**Convention:** standards files have a `## Applies to` section at the top declaring stages, a `## Rules` section with numbered, testable rules, and a `## Sources` section citing external influences (e.g., Matt Pocock skill X, Karpathy talk Y).

---

## 3. Vendored skills — `.hermes/skills/vendored/`

Third-party skills (Matt Pocock, Karpathy patterns, future authors) live untouched under `vendored/<author>/`. They are **read-only** in this repo — never edit them in place. Pull updates via `scripts/sync-vendored-skills.sh`.

Currently vendored (run `./scripts/sync-vendored-skills.sh` to populate):

| Source | Path | Sync method | Last synced |
|---|---|---|---|
| Matt Pocock (`mattpocock/skills`) | `.hermes/skills/vendored/mattpocock/` | git clone via script | _run sync to populate_ |

**Matt Pocock skills most relevant to our pipeline:**
- `skills/engineering/grill-with-docs` — Stage 1 companion (drives spec drafting through interrogation)
- `skills/engineering/tdd` — Stage 2 companion (test-first discipline)
- `skills/engineering/improve-codebase-architecture` — Stage 4 companion (hardening)
- `skills/engineering/to-prd`, `to-issues` — Upstream feeders into Stage 1
- `skills/engineering/diagnose`, `zoom-out` — General debugging / context-shift aids

Agents may invoke these by name from within Hermes once vendored, e.g., `Use the grill-with-docs skill to interrogate this plan.`

To adopt a vendored skill into your house standards:

1. Pull it into `vendored/<author>/`
2. Decide whether you accept it as-is or want a tweaked version
3. If tweaked: create a thin wrapper in `.hermes/skills/house/` that references the vendored skill and overrides specific sections
4. Add a row to the table above and to `docs/standards/README.md` if it changes a standard

---

## 4. House skills — `.hermes/skills/house/`

Project-specific skills authored or refined for this codebase. The pipeline skill (`system-development-pipeline.md`) sits at the top level; everything else lives under `house/`.

Skills are invoked by name in Hermes:

```
Use the <skill-name> skill.
```

OpenCode does not have a skill system in the same shape — equivalent guidance is encoded in this AGENTS.md and `docs/standards/`.

---

## 5. Stage rules (summary — full procedure in pipeline skill)

### Stage 1 — Spec
- Produce `docs/specs/<feature-slug>.spec.md` per `.hermes/skills/system-development-pipeline.md`
- Apply: `docs/standards/architecture.md`, `docs/standards/ux-ui.md`, `docs/standards/security.md`, `docs/standards/llm-guardrails.md`
- Open questions section must be empty before exit
- **Human gate required:** owner approves via Telegram/WhatsApp

### Stage 2 — Test-first
- OpenCode in plan mode (Tab to switch). Plan mode is structurally read-only on implementation files.
- Apply: `docs/standards/testing.md`, `docs/standards/coding.md`
- Every spec functional requirement and error case has ≥1 failing test
- Tests reference spec section numbers in their names

### Stage 3 — Implementation
- OpenCode in build mode
- Apply: ALL active standards in `docs/standards/`
- Read existing repo via Costrict MCP before writing
- LSP clean after every write
- Cyclomatic complexity ≤ 10 per function
- Do not modify tests to make them pass — surface ambiguity as a spec issue

### Stage 4 — Hardening
- Costrict strict mode, **two passes**: security/data, then architecture/quality
- Critical/High → block merge
- Medium → 7-day triage
- Low → advisory comments

---

## 6. Tool-specific notes

### OpenCode

- Default model: `MiniMax-M2.7`. Switch to Grok 4.3 only for greenfield modules.
- `Tab` flips plan ↔ build. Never edit code in plan mode.
- Multi-session: one per module / git worktree.
- LSP must be green before a session ends.

### Hermes 0.14

- Skills directory: `.hermes/skills/`
- `system-development-pipeline.md` is the orchestrator — invoke it for any non-trivial change
- House skills self-improve via Hermes' learning loop; vendored skills do not (pull updates instead)

### Costrict

- Connect via MCP from both Hermes and OpenCode so the repo index is shared
- Strict mode required for stage 4
- Two-pass review per `docs/standards/security.md` and `docs/standards/architecture.md`

### Perplexity Computer (Stage 1 backup)

- Use Claude Opus 4.7 when Grok 4.3 quota is exhausted
- Paste the stage 1 section of the pipeline skill at conversation start
- Save the share link in the spec footer: `Spec drafted via: <link>`

---

## 7. Hard rules — agents must NOT

- Skip stage 1, even for "small" changes
- Edit tests in stage 3 to make implementation pass
- Commit secrets (use `.env.example` with placeholders only)
- Add a dependency without noting it in the spec's non-functional requirements
- Bypass Costrict on hotfixes
- Edit `.hermes/skills/vendored/**` — pull updates instead
- Edit `docs/standards/` mid-feature — propose a change as a separate PR

---

## 8. Escalation

If any stage produces ambiguity, blocked tests, or repeated failures (>2 retries on the same step), escalate to the owner via the Telegram/WhatsApp gate channel. Do not loop indefinitely.

---

## 9. Extending this file

To add a new standard, vendored skill, or house skill:

1. Drop the file in its correct directory (`docs/standards/`, `.hermes/skills/vendored/<author>/`, or `.hermes/skills/house/`)
2. Add a row to the relevant table in this file
3. If it changes a stage's behavior, update the **summary** in section 5 (not the full procedure — that lives in the pipeline skill)
4. If it introduces a new gate or blocks merge, update section 7

**Do not let this file grow beyond ~250 lines.** Everything substantive lives in `docs/standards/` and `.hermes/skills/`. AGENTS.md is the map, not the territory.
