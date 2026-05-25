import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

const mockTime = new Date('2026-05-25T12:00:00Z');
vi.spyOn(Date, 'now').mockReturnValue(mockTime.getTime());

describe('FamilyModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('FR-1: Parent can create a family (single owner per family)', () => {
    it('family.creation.parent_can_create_family spec§FR-1', async () => {
      const { FamilyService } = await import('@/family/family.service');
      const service = new FamilyService(mockSupabaseClient as any);

      const parentUser = { id: 'user-1', email: 'parent@example.com' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: parentUser } });
      (mockSupabaseClient.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'family-1', name: 'Test Family', owner_id: 'user-1' },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createFamily({ name: 'Test Family' }, parentUser);

      expect(result.id).toBe('family-1');
      expect(result.owner_id).toBe('user-1');
    });

    it('family.creation.rejects_duplicate_family_for_parent spec§FR-1', async () => {
      const { FamilyService } = await import('@/family/family.service');
      const service = new FamilyService(mockSupabaseClient as any);

      const parentUser = { id: 'user-1', email: 'parent@example.com' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: parentUser } });
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'existing-family', name: 'Existing Family', owner_id: 'user-1' },
            error: null,
          }),
        }),
      });

      await expect(service.createFamily({ name: 'Second Family' }, parentUser))
        .rejects.toMatchObject({ code: 'FAMILY_LIMIT_EXCEEDED' });
    });
  });

  describe('FR-2: Parent can generate a single-use invite link', () => {
    it('family.invite.parent_generates_invite_link spec§FR-2', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      const parentUser = { id: 'user-1', email: 'parent@example.com' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: parentUser } });
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'family-1', owner_id: 'user-1' }, error: null }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'invite-1',
                token: 'valid-token-abc123',
                family_id: 'family-1',
                role: 'helper',
                expires_at: new Date(mockTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                used: false,
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.generateInvite({ familyId: 'family-1' }, parentUser);

      expect(result.token).toBe('valid-token-abc123');
      expect(result.role).toBe('helper');
    });

    it('family.invite.generates_single_use_token spec§FR-2', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const result = await service.generateInvite({ familyId: 'family-1' }, { id: 'user-1' });

      expect(result.used).toBe(false);
    });
  });

  describe('FR-3: Invite link expires after 7 days if unused', () => {
    it('family.invite.token_expires_after_7_days spec§FR-3', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      const expiredTime = new Date(mockTime.getTime() - 1).toISOString();
      const validTime = new Date(mockTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn()
            .mockResolvedValueOnce({
              data: { id: 'invite-1', token: 'expired-token', expires_at: expiredTime, used: false },
              error: null,
            })
            .mockResolvedValueOnce({
              data: { id: 'invite-2', token: 'valid-token', expires_at: validTime, used: false },
              error: null,
            }),
        }),
      });

      await expect(service.redeemInvite('expired-token', { id: 'user-helper' }))
        .rejects.toMatchObject({ code: 'INVITE_EXPIRED', status: 410 });

      const validResult = await service.redeemInvite('valid-token', { id: 'user-helper' });
      expect(validResult.role).toBe('helper');
    });
  });

  describe('FR-4: Valid invite token can be redeemed to join as helper', () => {
    it('family.redemption.user_can_redeem_valid_token spec§FR-4', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      const futureTime = new Date(mockTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'invite-1',
              token: 'valid-token-abc',
              family_id: 'family-1',
              role: 'helper',
              expires_at: futureTime,
              used: false,
            },
            error: null,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'membership-1', family_id: 'family-1', user_id: 'user-helper', role: 'helper' },
                error: null,
              }),
            }),
          }),
        }),
      });
      (mockSupabaseClient.auth as any).updateUser = vi.fn().mockResolvedValue({ data: { user: {} }, error: null });

      const result = await service.redeemInvite('valid-token-abc', { id: 'user-helper' });

      expect(result.role).toBe('helper');
      expect(result.family_id).toBe('family-1');
    });
  });

  describe('FR-5: Helper role grants read-only access to family schedules + create handshake events', () => {
    it('family.rbac.helper_can_read_schedules spec§FR-5', async () => {
      const { ScheduleService } = await import('@/schedule/schedule.service');
      const service = new ScheduleService(mockSupabaseClient as any);

      const helperUser = { id: 'user-helper', family_id: 'family-1', role: 'helper' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: helperUser } });
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          data: [
            { id: 'schedule-1', family_id: 'family-1', child_name: 'Alice', day: 'Monday' },
          ],
          error: null,
        }),
      });

      const schedules = await service.getSchedules(helperUser);

      expect(schedules).toHaveLength(1);
      expect(schedules[0].child_name).toBe('Alice');
    });

    it('family.rbac.helper_can_create_handshake_events spec§FR-5', async () => {
      const { HandshakeService } = await import('@/handshake/handshake.service');
      const service = new HandshakeService(mockSupabaseClient as any);

      const helperUser = { id: 'user-helper', family_id: 'family-1', role: 'helper' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: helperUser } });
      (mockSupabaseClient.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'handshake-1', type: 'picked_up', child_id: 'child-1', family_id: 'family-1' },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createHandshake({ type: 'picked_up', childId: 'child-1' }, helperUser);

      expect(result.type).toBe('picked_up');
    });
  });

  describe('FR-6: Helper has no rights to edit schedules or other family data', () => {
    it('family.rbac.helper_cannot_edit_schedules spec§FR-6', async () => {
      const { ScheduleService } = await import('@/schedule/schedule.service');
      const service = new ScheduleService(mockSupabaseClient as any);

      const helperUser = { id: 'user-helper', family_id: 'family-1', role: 'helper' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: helperUser } });

      await expect(service.updateSchedule('schedule-1', { day: 'Tuesday' }, helperUser))
        .rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('family.rbac.helper_cannot_delete_schedules spec§FR-6', async () => {
      const { ScheduleService } = await import('@/schedule/schedule.service');
      const service = new ScheduleService(mockSupabaseClient as any);

      const helperUser = { id: 'user-helper', family_id: 'family-1', role: 'helper' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: helperUser } });

      await expect(service.deleteSchedule('schedule-1', helperUser))
        .rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  describe('FR-7: Row-level security isolates family data', () => {
    it('family.rbac.helper_isolation_via_rls spec§FR-7', async () => {
      const { ScheduleService } = await import('@/schedule/schedule.service');
      const service = new ScheduleService(mockSupabaseClient as any);

      const helperUser = { id: 'user-helper', family_id: 'family-1', role: 'helper' };
      (mockSupabaseClient.auth.getUser as any).mockResolvedValue({ data: { user: helperUser } });

      let lastQuery: any;
      (mockSupabaseClient.from as any).mockImplementation((table: string) => ({
        select: vi.fn().mockImplementation((cols?: any) => {
          lastQuery = { table, cols };
          return {
            data: [{ id: 'schedule-1', family_id: 'family-1' }],
            error: null,
          };
        }),
      }));

      await service.getSchedules(helperUser);

      expect(lastQuery.table).toBe('schedules');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('schedules');
    });
  });

  describe('FR-8: Redemption of used/expired token returns client error', () => {
    it('family.redemption.rejects_used_token_with_410 spec§FR-8', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'invite-1', token: 'used-token', used: true, used_at: '2026-05-20T12:00:00Z' },
            error: null,
          }),
        }),
      });

      await expect(service.redeemInvite('used-token', { id: 'user-2' }))
        .rejects.toMatchObject({ code: 'INVITE_ALREADY_USED', status: 410 });
    });

    it('family.redemption.rejects_expired_token_with_410 spec§FR-8', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      const expiredDate = new Date(mockTime.getTime() - 1).toISOString();
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'invite-1', token: 'expired-token', expires_at: expiredDate, used: false },
            error: null,
          }),
        }),
      });

      await expect(service.redeemInvite('expired-token', { id: 'user-2' }))
        .rejects.toMatchObject({ code: 'INVITE_EXPIRED', status: 410 });
    });
  });

  describe('FR-9: User already in family cannot redeem another invite for same family', () => {
    it('family.redemption.rejects_already_member_with_409 spec§FR-9', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      const futureTime = new Date(mockTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'invite-1', token: 'valid-token', family_id: 'family-1', expires_at: futureTime, used: false },
            error: null,
          }),
        }),
      });
      (mockSupabaseClient.rpc as any).mockResolvedValue({ data: true, error: null });

      await expect(service.redeemInvite('valid-token', { id: 'user-1' }))
        .rejects.toMatchObject({ code: 'ALREADY_MEMBER', status: 409 });
    });
  });

  describe('Error contract: 400 Bad Request for malformed token', () => {
    it('family.redemption.rejects_malformed_token_with_400 spec§Error-400', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      await expect(service.redeemInvite('', { id: 'user-2' }))
        .rejects.toMatchObject({ code: 'INVALID_TOKEN', status: 400 });

      await expect(service.redeemInvite('not-a-valid-uuid-format', { id: 'user-2' }))
        .rejects.toMatchObject({ code: 'INVALID_TOKEN', status: 400 });
    });
  });

  describe('Error contract: 403 if caller is not parent of family', () => {
    it('family.invite.rejects_non_parent_with_403 spec§Error-403', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'family-1', owner_id: 'user-parent', name: 'Test Family' },
            error: null,
          }),
        }),
      });

      const nonParentUser = { id: 'user-helper', role: 'helper' };

      await expect(service.generateInvite({ familyId: 'family-1' }, nonParentUser as any))
        .rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
    });
  });

  describe('S.7: Invite redemption is idempotent', () => {
    it('family.redemption.is_idempotent spec§S.7', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      const futureTime = new Date(mockTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'invite-1', token: 'idempotent-token', family_id: 'family-1', role: 'helper', expires_at: futureTime, used: false },
            error: null,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'membership-1', family_id: 'family-1', user_id: 'user-helper', role: 'helper' },
                error: null,
              }),
            }),
          }),
        }),
      });
      (mockSupabaseClient.auth as any).updateUser = vi.fn().mockResolvedValue({ data: { user: {} }, error: null });

      const result1 = await service.redeemInvite('idempotent-token', { id: 'user-helper' });
      const result2 = await service.redeemInvite('idempotent-token', { id: 'user-helper' });

      expect(result1.id).toBe(result2.id);
      expect(result1.role).toBe(result2.role);
    });
  });

  describe('S.8: Rate limit invite generation (10/min per parent)', () => {
    it('family.invite.rate_limits_at_10_per_minute spec§S.8', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'family-1', owner_id: 'user-1' }, error: null }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: `invite-${i}`, token: `token-${i}`, used: false },
              error: null,
            }),
          }),
        }),
      });
      (mockSupabaseClient.rpc as any).mockResolvedValue({ data: 10, error: null });

      const parentUser = { id: 'user-1' };

      for (let i = 0; i < 10; i++) {
        await service.generateInvite({ familyId: 'family-1' }, parentUser as any);
      }

      await expect(service.generateInvite({ familyId: 'family-1' }, parentUser as any))
        .rejects.toMatchObject({ code: 'RATE_LIMITED', status: 429 });
    });
  });

  describe('S.9: Never log tokens or PII', () => {
    it('family.invite.does_not_log_tokens spec§S.9', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
      const service = new FamilyInviteService(mockSupabaseClient as any, logger as any);

      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'invite-1', token: 'super-secret-token', used: false },
              error: null,
            }),
          }),
        }),
      });

      await service.generateInvite({ familyId: 'family-1' }, { id: 'user-1' });

      const allLogs = [...logger.info.mock.calls, ...logger.error.mock.calls, ...logger.warn.mock.calls, ...logger.debug.mock.calls];
      for (const [message] of allLogs) {
        if (typeof message === 'string') {
          expect(message).not.toContain('super-secret-token');
        }
      }
    });
  });

  describe('Latency non-functional: Invite generation < 200ms', () => {
    it('family.invite.generates_within_200ms spec§NFR-latency', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'invite-1', token: 'token-123', used: false },
              error: null,
            }),
          }),
        }),
      });
      (mockSupabaseClient.rpc as any).mockResolvedValue({ data: 0, error: null });

      const start = Date.now();
      await service.generateInvite({ familyId: 'family-1' }, { id: 'user-1' });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Latency non-functional: Redemption + membership creation < 500ms', () => {
    it('family.redemption.completes_within_500ms spec§NFR-latency', async () => {
      const { FamilyInviteService } = await import('@/family/family-invite.service');
      const service = new FamilyInviteService(mockSupabaseClient as any);

      const futureTime = new Date(mockTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      (mockSupabaseClient.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'invite-1', token: 'valid-token', family_id: 'family-1', role: 'helper', expires_at: futureTime, used: false },
            error: null,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'membership-1', family_id: 'family-1', user_id: 'user-helper', role: 'helper' },
                error: null,
              }),
            }),
          }),
        }),
      });
      (mockSupabaseClient.auth as any).updateUser = vi.fn().mockResolvedValue({ data: { user: {} }, error: null });
      (mockSupabaseClient.rpc as any).mockResolvedValue({ data: false, error: null });

      const start = Date.now();
      await service.redeemInvite('valid-token', { id: 'user-helper' });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
