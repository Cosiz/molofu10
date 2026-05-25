# Test Mapping: A1 — Minimal Family Account + RBAC Scaffolding

**Spec file:** `docs/specs/a1-minimal-family-account.spec.md`
**Test file:** `tests/family/family.spec.ts`
**Framework:** Vitest
**Stage:** 2 (Test-first)

---

## Test-to-Spec Mapping

| Test Name | Spec Section | Description |
|-----------|-------------|-------------|
| `family.creation.parent_can_create_family spec§FR-1` | §FR-1 | Parent can create a family; single owner per family for A1 |
| `family.creation.rejects_duplicate_family_for_parent spec§FR-1` | §FR-1 | Parent cannot create a second family (enforces "one family per parent" out-of-scope rule) |
| `family.invite.parent_generates_invite_link spec§FR-2` | §FR-2 | Parent can generate a single-use invite link for helper role |
| `family.invite.generates_single_use_token spec§FR-2` | §FR-2 | Invite token is single-use (used flag starts false) |
| `family.invite.token_expires_after_7_days spec§FR-3` | §FR-3 | Unused token is rejected after 7 days; valid token within window succeeds |
| `family.redemption.user_can_redeem_valid_token spec§FR-4` | §FR-4 | User with valid unused token can redeem it to join family as helper |
| `family.rbac.helper_can_read_schedules spec§FR-5` | §FR-5 | Helper role grants read-only access to family schedules |
| `family.rbac.helper_can_create_handshake_events spec§FR-5` | §FR-5 | Helper can create `picked_up` and `arrived` handshake events |
| `family.rbac.helper_cannot_edit_schedules spec§FR-6` | §FR-6 | Helper cannot edit any schedule data |
| `family.rbac.helper_cannot_delete_schedules spec§FR-6` | §FR-6 | Helper cannot delete any family data |
| `family.rbac.helper_isolation_via_rls spec§FR-7` | §FR-7 | Helpers only see data for families they are members of (RLS enforcement) |
| `family.redemption.rejects_used_token_with_410 spec§FR-8` | §FR-8 | Redemption of already-used token returns 410 Gone |
| `family.redemption.rejects_expired_token_with_410 spec§FR-8` | §FR-8 | Redemption of expired token returns 410 Gone |
| `family.redemption.rejects_already_member_with_409 spec§FR-9` | §FR-9 | User already in family cannot redeem another invite for the same family |
| `family.redemption.rejects_malformed_token_with_400 spec§Error-400` | §Error-400 | Malformed token (empty, invalid format) returns 400 Bad Request |
| `family.invite.rejects_non_parent_with_403 spec§Error-403` | §Error-403 | Non-parent cannot generate invite link (403 Forbidden) |
| `family.redemption.is_idempotent spec§S.7` | §S.7 | Same token always produces same outcome after first redemption |
| `family.invite.rate_limits_at_10_per_minute spec§S.8` | §S.8 | Invite generation rate-limited to 10/min per parent |
| `family.invite.does_not_log_tokens spec§S.9` | §S.9 | Tokens and PII are never written to logs |
| `family.invite.generates_within_200ms spec§NFR-latency` | §NFR-latency | Invite generation completes in < 200ms (p95) |
| `family.redemption.completes_within_500ms spec§NFR-latency` | §NFR-latency | Redemption + membership creation completes in < 500ms (p95) |

---

## Coverage Summary

| Spec Section | Tests | Status |
|--------------|-------|--------|
| §FR-1 (Parent creates family) | 2 | `family.creation.parent_can_create_family`, `family.creation.rejects_duplicate_family_for_parent` |
| §FR-2 (Invite generation) | 2 | `family.invite.parent_generates_invite_link`, `family.invite.generates_single_use_token` |
| §FR-3 (Invite expiration) | 1 | `family.invite.token_expires_after_7_days` |
| §FR-4 (Valid token redemption) | 1 | `family.redemption.user_can_redeem_valid_token` |
| §FR-5 (Helper RBAC - read + handshake) | 2 | `family.rbac.helper_can_read_schedules`, `family.rbac.helper_can_create_handshake_events` |
| §FR-6 (Helper RBAC - no edit) | 2 | `family.rbac.helper_cannot_edit_schedules`, `family.rbac.helper_cannot_delete_schedules` |
| §FR-7 (RLS isolation) | 1 | `family.rbac.helper_isolation_via_rls` |
| §FR-8 (Error: used/expired token) | 2 | `family.redemption.rejects_used_token_with_410`, `family.redemption.rejects_expired_token_with_410` |
| §FR-9 (Error: already member) | 1 | `family.redemption.rejects_already_member_with_409` |
| §Error-400 (Malformed token) | 1 | `family.redemption.rejects_malformed_token_with_400` |
| §Error-403 (Non-parent) | 1 | `family.invite.rejects_non_parent_with_403` |
| §S.7 (Idempotency) | 1 | `family.redemption.is_idempotent` |
| §S.8 (Rate limiting) | 1 | `family.invite.rate_limits_at_10_per_minute` |
| §S.9 (No token logging) | 1 | `family.invite.does_not_log_tokens` |
| §NFR-latency (Performance) | 2 | `family.invite.generates_within_200ms`, `family.redemption.completes_within_500ms` |

**Total: 21 tests covering all 13 functional/error requirements + NFRs.**

---

## Implementation Dependencies

The following modules must exist for tests to pass:

```
src/
├── family/
│   ├── family.service.ts      # createFamily, getFamily
│   ├── family-invite.service.ts  # generateInvite, redeemInvite
│   └── family.controller.ts   # REST endpoints
├── schedule/
│   └── schedule.service.ts    # getSchedules, updateSchedule, deleteSchedule
└── handshake/
    └── handshake.service.ts   # createHandshake
```

---

## Error Code Registry

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `FAMILY_LIMIT_EXCEEDED` | 409 | Parent already has a family (A1 constraint) |
| `INVITE_EXPIRED` | 410 | Invite token has passed its 7-day window |
| `INVITE_ALREADY_USED` | 410 | Invite token has already been redeemed |
| `ALREADY_MEMBER` | 409 | User is already a member of this family |
| `INVALID_TOKEN` | 400 | Token format is malformed or empty |
| `FORBIDDEN` | 403 | Caller lacks permission for this action |
| `RATE_LIMITED` | 429 | Invite generation exceeds 10/min limit |

---

**Human gate required:** Owner approval via Telegram/WhatsApp before Stage 3.
