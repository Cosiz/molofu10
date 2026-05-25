---
name: system-development-pipeline
description: End-to-end 4-stage pipeline for building production-grade features. Use this skill whenever a new feature, refactor, or non-trivial change is requested. Routes work through Spec → Test-first → Implementation → Hardening with explicit model selection, modular standards, and artifact handoffs.
version: 2.0.0
author: Darren Tsang
tags: [pipeline, development, multi-agent, quality, costrict, opencode, minimax, grok]
---

# System Development Pipeline

A disciplined 4-stage workflow for building features with minimal human intervention while maintaining enterprise-grade code quality. Each stage has a single concern, a designated model, a versioned artifact, and an explicit list of standards files to load.

This skill is **modular**: it does not embed coding/architecture/UX rules inline. Instead, each stage loads the relevant `docs/standards/*.md` files from the repo. Adding a new standard is a file drop + an AGENTS.md edit — this skill rarely needs to change.

## When to invoke

Invoke for any of:

- New feature or capability beyond a one-line fix
- Refactor touching more than one file
- Bug fix requiring changes outside the failing test's immediate scope
- Integration with a new external service
- Any change to security, auth, payments, or data-handling code

**Do not invoke for:** typo fixes, dependency bumps, formatting-only, doc-only edits.

## Pipeline summary

```
┌─────────┐   ┌────────────┐   ┌──────────────┐   ┌───────────┐
│ Stage 1 │ → │  Stage 2   │ → │   Stage 3    │ → │  Stage 4  │
│  Spec   │   │ Test-first │   │  Implement   │   │  Harden   │
└─────────┘   └────────────┘   └──────────────┘   └───────────┘
   Grok 4.3      M2.7 in         M2.7 / Grok        Costrict
   (Opus 4.7     OpenCode        in OpenCode        strict mode
    backup)      plan mode       build mode
   [HUMAN GATE]                                  [HUMAN GATE if
                                                  critical/high]
```

Cardinal rule: each stage consumes only the prior stage's artifact. No skipping. No verbal handoffs.

---

## Stage 1 — Spec

**Goal:** Produce an unambiguous, testable specification.

**Standards to load before drafting:**
- `docs/standards/architecture.md` (modules, boundaries, failure modes)
- `docs/standards/ux-ui.md` (if the feature has a UI surface)
- `docs/standards/security.md`
- `docs/standards/llm-guardrails.md` (if the feature uses LLMs)

**Tool & model:**
- Primary: Hermes with **Grok 4.3** (cached prompt prefix)
- Backup when Grok 4.3 quota exhausted: Perplexity Computer with **Claude Opus 4.7**. Save share link in spec footer.

**Procedure:**

1. Ask user for the feature intent in 1–3 sentences. Do not start drafting until you have this.
2. Read all standards files listed above. Treat them as constraints, not suggestions.
3. Generate a draft `docs/specs/<feature-slug>.spec.md` with these sections:
   - **Problem statement** (1–3 sentences)
   - **Functional requirements** (numbered, each independently testable)
   - **Non-functional requirements** (perf, cost, latency budgets, LLM token budgets per `llm-guardrails.md` L.3)
   - **Architecture impact** (which modules touched, new ones added, any DAG impact per `architecture.md` §1.3)
   - **UX surfaces** (screens/flows touched, with empty/loading/error states per `ux-ui.md` §1.4 — omit if no UI)
   - **Error-handling contract** (per `architecture.md` §3)
   - **Security & data-handling** (per `security.md`)
   - **Observability** (logs, metrics, correlation IDs per `architecture.md` §4)
   - **Out-of-scope** (explicit)
   - **Open questions** (must be empty before exit)
4. Surface every assumption as an open question. Do not silently assume.
5. Loop with user until open questions is empty.
6. Write spec file, request approval via Telegram/WhatsApp.

**Exit criteria:**
- [ ] All required sections populated
- [ ] Open questions empty
- [ ] Spec respects every active standard file (or documents an explicit deviation with justification)
- [ ] Human approval received
- [ ] Spec committed

**Anti-patterns:**
- Drafting without reading the standards files first
- Vague non-functional requirements (always include numbers)
- Hiding assumptions inside functional requirements

---

## Stage 2 — Test-first

**Goal:** Encode the spec as failing tests before any implementation exists.

**Standards to load:**
- `docs/standards/testing.md`
- `docs/standards/coding.md` (for the test language)

**Tool & model:**
- OpenCode in **plan mode** (Tab to switch). Plan mode is structurally read-only on impl files.
- Model: **MiniMax M2.7** (deep context reading ideal here)
- Fallback: Grok 4.3 if M2.7 times out

**Procedure:**

1. Load approved `spec.md` as sole source of truth.
2. Load `docs/standards/testing.md` and apply its rules.
3. For each functional requirement → ≥1 test. Reference spec section in test name: `// spec §3.2` or `def test_spec_3_2_<name>`.
4. For each error-handling case → ≥1 test asserting the documented failure surface.
5. For each testable non-functional requirement (latency, token count, cost ceiling) → assertion.
6. Run suite. Confirm tests fail with expected assertions, not infra errors. "Honest red" only.
7. Write `docs/specs/<feature-slug>.tests.md` mapping each test to its spec section.

**Exit criteria:**
- [ ] Every functional requirement has ≥1 failing test
- [ ] Every error case has ≥1 failing test
- [ ] All new tests fail honestly
- [ ] `testing.md` rules respected (no conditional logic in tests, mocking only at boundaries, etc.)
- [ ] `tests.md` traceability committed

---

## Stage 3 — Implementation

**Goal:** Make stage 2 tests pass without modifying them.

**Standards to load (ALL active):**
- `docs/standards/architecture.md`
- `docs/standards/coding.md`
- `docs/standards/ux-ui.md` (if UI work)
- `docs/standards/security.md`
- `docs/standards/llm-guardrails.md` (if LLM work)
- `docs/standards/git.md`

**Tool & model:**
- OpenCode in **build mode**
- Model routing:
  - **MiniMax M2.7** for refactors, codebase-aware changes, modules with substantial existing context
  - **Grok 4.3** for greenfield modules with little repo context
- Parallel sessions encouraged: one per module / git worktree

**Procedure:**

1. Read spec, tests, and ALL applicable standards files.
2. Read existing repo via Costrict MCP. Do not start writing until you understand the patterns this change must respect.
3. Plan the change as a short bullet list. Post it before writing code.
4. Write smallest implementation that turns one failing test green. Run that test.
5. Repeat per test.
6. After every file write:
   - LSP diagnostic-free
   - Cyclomatic complexity ≤ 10 (per `coding.md` G.4)
   - No new dead code
7. After every logical unit: run relevant test subset.
8. If a stage 2 test looks wrong: **STOP**. Surface as spec ambiguity. Loop back to stage 1. Never edit tests to make them pass.

**Exit criteria:**
- [ ] All stage 2 tests pass
- [ ] No regression in existing tests
- [ ] LSP clean across changed files
- [ ] All loaded standards respected
- [ ] PR drafted per `git.md` template

---

## Stage 4 — Hardening

**Goal:** Strict-mode review for security, architecture, quality, and UX (if applicable).

**Standards consulted by Costrict prompts:**
- Pass A: `docs/standards/security.md` (esp. Costrict Pass A coverage section)
- Pass B: `docs/standards/architecture.md` (esp. Costrict enforcement section)
- Pass C (optional, if UI): `docs/standards/ux-ui.md`

**Procedure — run separate passes with distinct prompts:**

**Pass A — Security & data**
Prompt Costrict with `security.md`'s "Costrict Pass A coverage" section. Output: findings with severity, location, remediation.

**Pass B — Architecture & quality**
Prompt Costrict with `architecture.md`'s "Costrict enforcement" section + coupling/cohesion/SOLID/error-handling completeness.

**Pass C — UX (only if feature has UI)**
Prompt Costrict with `ux-ui.md`'s rules for accessibility (§4), interaction (§2), and consistency (§3).

**Merge gates:**
- **Critical / High** finding from any pass → block, loop to stage 3
- **Medium** → PR comment, 7-day triage
- **Low** → PR comment, advisory

**Exit criteria:**
- [ ] All applicable passes completed
- [ ] Zero critical/high open
- [ ] Medium triaged with owner + due date
- [ ] PR merged per `git.md`

---

## Modularity & extension

This skill is intentionally thin. Concrete rules live in `docs/standards/*.md`. To extend the pipeline:

| What you want to do | What to change |
|---|---|
| Add a new standard (e.g., "data engineering") | New file in `docs/standards/`, row in AGENTS.md table |
| Adopt a Matt Pocock skill | Vendor under `.hermes/skills/vendored/mattpocock/`, reference from `coding.md` Sources |
| Add a Karpathy pattern | Vendor or cite in the relevant standard's Sources section |
| Add a new gate (e.g., performance budget) | Add rule to relevant standard with Costrict enforcement section, update AGENTS.md section 7 |
| Add a new stage | Significant change — fork this skill to version 3.0 |

**Rule of thumb:** if a change applies to a discipline (security, UX, architecture), it goes in `docs/standards/`. If it changes the pipeline flow itself, it goes here.

---

## Self-improvement loop

After each completed pipeline run, before closing:

1. Reflect: which step was slowest, most error-prone, or required the most human intervention?
2. If a pattern emerges across ≥2 runs: propose a new dedicated skill (e.g., `webhook-idempotency-check.md`) under `.hermes/skills/house/`, or a new standards file under `docs/standards/`.
3. If a stage prompt produced ambiguity: refine the prompt template in this file.
4. Log learnings to procedural memory via Hermes.

**Cadence target:** ≥1 skill refinement or new standard per 5 pipeline runs.

---

## Human gates (the minimal set)

Two gates, no more:

1. **Spec approval** (end of stage 1) — non-negotiable
2. **Pre-merge** (end of stage 4, only if critical/high findings) — auto-merge otherwise

Both fire via Telegram/WhatsApp.

---

## Model routing cheat sheet

(Canonical version lives in `docs/standards/llm-guardrails.md`. Duplicated here for convenience.)

| Task | Model |
|---|---|
| Spec drafting | Grok 4.3 (Opus 4.7 backup) |
| Reading large repo | MiniMax M2.7 |
| Codebase-aware refactor | MiniMax M2.7 |
| Greenfield, low context | Grok 4.3 |
| Live incident debug | MiniMax M2.7 |
| Test generation | MiniMax M2.7 |
| Quick edits | Smaller/faster model |

---

## Failure modes & recovery

| Symptom | Likely cause | Recovery |
|---|---|---|
| Stage 2 tests pass on empty impl | Tests not testing spec | Rewrite; fix this skill if pattern recurs |
| Stage 3 keeps modifying tests | Spec ambiguity | Stop, return to stage 1 |
| M2.7 timing out | Task too large | Decompose; parallel sessions |
| Costrict floods with criticals | Stages 1–3 cut corners | Don't patch individually — return to stage 1 |
| Grok 4.3 quota exhausted | Heavy spec use | Switch stage 1 to Perplexity Computer + Opus 4.7 |
| Same bug class recurs | Missing skill or standard | Author it, add to relevant docs/standards file |

---

## Changelog

- **2.0.0** — Modularized. Standards extracted to `docs/standards/`. Pipeline now references standards rather than embedding them. Vendored/house skill structure added for third-party (Matt Pocock, Karpathy) integration.
- **1.0.0** — Initial 4-stage pipeline.
