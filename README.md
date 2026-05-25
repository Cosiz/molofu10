# molofu10

> Replace this README when you bootstrap a real project. For now, it documents the template itself.

## What's in here

This project was bootstrapped from the **Darren AI-pipeline template**. It comes with:

- A 4-stage development pipeline (Spec → Test-first → Implementation → Hardening)
- Modular standards under `docs/standards/`
- Hermes skill that orchestrates the pipeline
- AGENTS.md for OpenCode / Claude Code / Codex / Cursor
- CONTEXT.md for shared domain language
- ADR folder for architecture decisions
- Vendored-skills support (Matt Pocock, others)

## Quick start

1. **Read** `AGENTS.md` — the rules of engagement
2. **Read** `docs/standards/README.md` — the standards index
3. **Fill in** `CONTEXT.md` — replace the TBDs with your project's actual domain language
4. **(Optional)** Sync Matt Pocock's skills:
   ```bash
   cp scripts/sync-vendored-skills.sh.example scripts/sync-vendored-skills.sh
   chmod +x scripts/sync-vendored-skills.sh
   ./scripts/sync-vendored-skills.sh
   ```
5. **Stage 1 — spec your first feature:**
   ```bash
   hermes
   > Use the system-development-pipeline skill. I want to build <feature>.
   ```
6. **Stage 2/3 — tests and code in OpenCode:**
   ```bash
   opencode
   # Tab to plan mode → write failing tests
   # Tab to build mode → implement
   ```
7. **Stage 4 — hardening:**
   ```bash
   costrict review --strict
   ```

## Folder map

```
.
├── AGENTS.md                          ← rules for coding agents
├── CONTEXT.md                         ← shared domain language
├── README.md                          ← this file
├── docs/
│   ├── adr/                           ← architecture decision records
│   ├── specs/                         ← feature specs (Stage 1 output)
│   └── standards/                     ← modular standards (architecture, UX, etc.)
├── scripts/
│   └── sync-vendored-skills.sh.example
├── src/                               ← application code
├── tests/                             ← test suite
└── .hermes/
    └── skills/
        ├── system-development-pipeline.md  ← pipeline orchestrator
        ├── vendored/                       ← third-party skills (Matt Pocock, etc.)
        └── house/                          ← project-specific skills
```

## Updating the template itself

If you improve a standard, the pipeline, or AGENTS.md while building a feature, propagate it back to your template repo so future projects benefit. See `scripts/upgrade-from-template.sh.example` for the reverse direction (pulling updates *into* an existing project).
