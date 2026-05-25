# LLM & Cost Guardrails

## Applies to

Stages 1 (spec — token budgets), 3 (implementation), 4 (Costrict).

## Rules

**L.1** Every LLM call specifies model, temperature, max tokens explicitly. No "default" calls.
**L.2** Every LLM call logs: model, input tokens, output tokens, latency, cost estimate, cache hit/miss, correlation ID. Non-negotiable for cost analysis.
**L.3** Per-feature token budget declared in the spec's non-functional requirements. CI fails if a representative test run exceeds the budget by >20%.
**L.4** Prompt caching used wherever the prefix is stable (Grok 4.3: $0.20/M cached vs $1.25/M fresh — a 6.25× cost difference).
**L.5** Model routing per task character (see pipeline skill cheat sheet). Do not default everything to the most capable model.
**L.6** Treat LLM output as untrusted input. Validate with schemas (Zod, Pydantic) before use. Never `eval()` LLM output. Never let LLM output reach SQL or shell without parsing.
**L.7** Defensive prompting against injection: system prompts use clear delimiters, user input is wrapped, instructions are restated after user input where critical.
**L.8** Retries: max 2 retries with exponential backoff on transient errors (5xx, timeout). Never retry on 4xx without changing the request.
**L.9** Streaming where latency matters; non-streaming where structured output is required.
**L.10** Fallback model declared for every critical path. If primary fails twice, fall back. Log the fallback event.
**L.11** Cost dashboards per feature, refreshed daily. Anomalies (>2× baseline) trigger a Telegram alert.

## Model routing cheat sheet

| Task | Model | Rationale |
|---|---|---|
| Spec drafting, reasoning | Grok 4.3 | Strong reasoning, cacheable prefix |
| Reading large repo before coding | MiniMax M2.7 | Designed to read extensively before writing |
| Codebase-aware refactor | MiniMax M2.7 | Deep-context behavior |
| Greenfield, low repo context | Grok 4.3 | Faster, less over-exploration |
| Live incident debug | MiniMax M2.7 | Sub-3-min MTTR profile per model card |
| Test generation from spec | MiniMax M2.7 | Reads spec + repo thoroughly |
| Quick edits, lint fixes | Smaller / faster model | Don't pay M2.7 latency for trivial work |
| Stage 1 backup | Claude Opus 4.7 via Perplexity Computer | When Grok 4.3 quota exhausted |

## Sources

- xAI Grok 4.3 pricing & caching ([VentureBeat](https://venturebeat.com/technology/xai-launches-grok-4-3-at-an-aggressively-low-price-and-a-new-fast-powerful-voice-cloning-suite))
- MiniMax M2.7 model card ([NVIDIA NIM](https://build.nvidia.com/minimaxai/minimax-m2.7/modelcard))
- *Inspirations to add as you adopt them.*

## Changelog

- **1.0.0** — Initial LLM guardrails.
