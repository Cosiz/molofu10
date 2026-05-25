# Security & Data Standards

## Applies to

Stages 1 (spec), 3 (implementation), 4 (Costrict security pass).

## Rules

**S.1** Secrets via environment only. No secrets in code, config files, logs, or error messages. Costrict scans for secret patterns at stage 4.
**S.2** Authentication on every non-public endpoint. Costrict will flag missing auth checks.
**S.3** Authorization at the row level (Postgres RLS) for any multi-tenant data. Service-role keys never reach the client.
**S.4** Input validation at every external boundary via Zod / Pydantic. Never trust client input, never trust LLM output.
**S.5** Output encoding by default. React escapes by default; never use `dangerouslySetInnerHTML` without an explicit sanitizer + justification.
**S.6** SQL: parameterized only. Prompt: treat LLM input as untrusted; use defensive prompting and output validation.
**S.7** Idempotency keys on every webhook handler, payment endpoint, and message sender. Document the key in the function docstring.
**S.8** Rate limiting on every externally-facing endpoint. Defaults documented; per-endpoint overrides justified in the spec.
**S.9** Logs: never log secrets, tokens, PII without explicit redaction. Use structured logging with field-level redaction rules.
**S.10** Dependencies: weekly automated dependency scanning. Critical CVEs patched within 7 days.
**S.11** Data classification: every table column tagged as `public | internal | confidential | restricted`. Restricted data has additional handling rules — document them.
**S.12** Crypto: use vetted libraries, never roll your own. AES-256-GCM, Argon2id for passwords, Ed25519 for signing.

## Costrict Pass A coverage

Pass A (security & data) at stage 4 must cover at minimum:
- OWASP Top 10
- Secret leakage scan (S.1)
- Auth coverage (S.2, S.3)
- Input validation (S.4)
- Injection vectors — SQL, prompt, command, log (S.6)
- Idempotency coverage (S.7)
- PII handling per data classification (S.9, S.11)

## Sources

- OWASP Top 10
- OWASP ASVS
- *Designing Data-Intensive Applications* (Kleppmann) — Ch. 5, 7 on data integrity
- *Inspirations to add as you adopt them.*

## Changelog

- **1.0.0** — Initial security standards.
