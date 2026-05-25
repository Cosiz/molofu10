# Feature Spec: A1 — Minimal Family Account + RBAC Scaffolding

**Status:** Approved (human gate 2026-05-25)  
**Feature slug:** a1-minimal-family-account  
**Stage:** 1 (Spec)  
**Created:** 2026-05-25  
**Standards applied:** architecture.md, security.md, ux-ui.md, llm-guardrails.md (N/A for LLM), coding.md (for future stages)  
**Product context:** CONTEXT.md (family data isolation, RBAC for parent/helper, handshake real-time status, working parents in HK)

## Problem statement
Working parents in Hong Kong need a single source of truth for their children's logistics. Currently information is scattered across WhatsApp groups, school apps, and physical handbooks. A minimal family account with parent-as-owner and invite-by-link for a helper role provides the foundational RBAC and data isolation layer so that helpers can contribute real-time handshakes without exposing full family data.

## Functional requirements
1. A parent can create a family (single owner per family for A1).
2. Parent can generate a single-use invite link (token) for the helper role.
3. Invite link expires after 7 days if unused.
4. Any user with a valid unused invite token can redeem it to join the family as helper.
5. Helper role grants read-only access to family schedules + ability to create handshake events (picked up, arrived) for the family's children.
6. Helper has no rights to edit schedules or other family data.
7. All family-scoped data is isolated via row-level security; helpers only see data for families they are members of.
8. Redemption of an already-used or expired token returns a clear client error and does not create a membership.
9. A user already in the family cannot redeem another invite for the same family.

## Non-functional requirements
- Latency: Invite generation < 200ms, redemption + membership creation < 500ms (p95).
- Security: All family data access enforced by Postgres RLS policies. Service-role keys never reach client.
- Idempotency: Invite redemption is idempotent (same token always produces same outcome after first use).
- Cost: No LLM calls in A1 → token budget N/A.
- Scalability: Supports at least one helper per family (future roles out of scope for A1).

## Architecture impact
- New domain module: `family` (bounded context).
- New tables (migrations): `families`, `family_memberships`, `family_invites`.
- New NestJS module: `FamilyModule` with controllers/services for family creation, invite generation, and redemption.
- Auth integration: Extend Supabase JWT claims with `family_id` and `role` on membership creation (via trigger or post-redemption update).
- No changes to existing schedule or handshake modules yet — they will later depend on `FamilyModule` via explicit interfaces.
- Dependency graph remains DAG (presentation → application → domain → infrastructure).

## UX surfaces
None for A1. This feature is backend/API scaffolding only. No new screens, modals, or frontend flows. Future stages may add "Invite helper" UI.

## Error-handling contract
- `POST /families` (parent only): 201 on success, 401/403 on auth failure.
- `POST /families/:id/invites`: 201 (returns token), 403 if caller is not parent of family.
- `POST /invites/:token/redeem`: 
  - 200 + membership on success
  - 410 Gone if token expired or already used
  - 409 Conflict if user already member
  - 400 Bad Request for malformed token
- All errors return JSON `{ error: string, code: string, correlation_id }`.
- Correlation ID propagated on every request.

## Security & data-handling (per security.md)
- S.1–S.3: Secrets in env only; auth on every endpoint; row-level Postgres RLS on all family_* tables (`family_id = (auth.jwt() ->> 'family_id')::uuid`).
- S.4: Zod validation on all DTOs at controller boundaries.
- S.7: Invite token redemption uses the token itself as natural idempotency key.
- S.8: Rate limit invite generation (10/min per parent).
- S.9: Never log tokens or PII.
- S.11: `families` and `family_memberships` marked `restricted`; RLS + explicit role checks required.
- Data classification applied to new tables.

## Observability (per architecture.md §4)
- Every endpoint emits structured JSON logs with `correlation_id`, `module: "family"`, `event`, `user_id`, `family_id`.
- Metrics: request rate, error rate, latency p50/p95/p99 for `/families*` and `/invites*` endpoints.
- No LLM calls → no token/cost logging required for A1.

## Out-of-scope
- Co-parent, grandparent, tutor, driver roles (only 'parent' and 'helper' for A1).
- Email/SMS delivery of invite links.
- Multiple families per parent.
- Any schedule editing, child management, or ECA features.
- Frontend UI components or pages.
- LLM-powered features.
- Multi-tenant support beyond single-family isolation.

## Open questions
(none — all resolved via user clarifications on 2026-05-25)

---

**Human gate required:** Owner approval via Telegram/WhatsApp before Stage 2.  
Spec drafted via system-development-pipeline skill (Stage 1).