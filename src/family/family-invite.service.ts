import type { SupabaseClient, User } from '@/lib/types';
import { InviteError } from '@/lib/errors';

interface InviteResult {
  id: string;
  token: string;
  family_id: string;
  role: string;
  expires_at: string;
  used: boolean;
}

interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

export class FamilyInviteService {
  private logger: Logger;
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient, logger?: Logger) {
    this.supabase = supabase;
    this.logger = logger || {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {},
    };
  }

  private isValidTokenFormat(token: string): boolean {
    if (!token || token.trim().length === 0) {
      return false;
    }
    return true;
  }

  async generateInvite(input: { familyId: string }, user: User): Promise<InviteResult> {
    const familyResult = await this.supabase
      .from('families')
      .select()
      .eq('id', input.familyId)
      .maybeSingle();

    if (!familyResult || familyResult.error) {
      throw new InviteError('DATABASE_ERROR', 500, 'Failed to fetch family');
    }

    const family = familyResult.data;
    if (!family || family.owner_id !== user.id) {
      throw new InviteError('FORBIDDEN', 403, 'Only family owner can generate invites');
    }

    const rpcResult = await this.supabase.rpc(
      'get_family_invite_count',
      { p_family_id: input.familyId, p_owner_id: user.id }
    );

    if (rpcResult && rpcResult.data !== undefined && rpcResult.data >= 10) {
      throw new InviteError('RATE_LIMITED', 429, 'Rate limit exceeded for invite generation');
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const token = crypto.randomUUID();

    const { data: invite, error: insertError } = await this.supabase
      .from('family_invites')
      .insert({
        family_id: input.familyId,
        token,
        role: 'helper',
        expires_at: expiresAt,
        used: false,
      })
      .select()
      .single();

    if (insertError) {
      throw new InviteError('INSERT_FAILED', 500, 'Failed to create invite');
    }

    this.logger.info('Invite generated', { familyId: input.familyId });

    return invite;
  }

  async redeemInvite(token: string, user: User): Promise<{ id: string; family_id: string; user_id: string; role: string }> {
    if (!this.isValidTokenFormat(token)) {
      throw new InviteError('INVALID_TOKEN', 400, 'Invalid token format');
    }

    const inviteResult = await this.supabase
      .from('family_invites')
      .select()
      .maybeSingle();

    if (!inviteResult || inviteResult.error) {
      throw new InviteError('DATABASE_ERROR', 500, 'Failed to fetch invite');
    }

    const invite = inviteResult.data;
    if (!invite) {
      throw new InviteError('INVALID_TOKEN', 400, 'Invite not found');
    }

    if (invite.used) {
      throw new InviteError('INVITE_ALREADY_USED', 410, 'Invite has already been used');
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new InviteError('INVITE_EXPIRED', 410, 'Invite has expired');
    }

    const rpcResult = await this.supabase.rpc(
      'user_has_membership',
      { p_user_id: user.id, p_family_id: invite.family_id }
    );

    if (rpcResult && rpcResult.data === true) {
      throw new InviteError('ALREADY_MEMBER', 409, 'User is already a member of this family');
    }

    const { data: updatedInvite, error: updateError } = await this.supabase
      .from('family_invites')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', invite.id)
      .select()
      .single();

    if (updateError) {
      throw new InviteError('UPDATE_FAILED', 500, 'Failed to update invite');
    }

    const { data: membership, error: membershipError } = await this.supabase
      .from('family_members')
      .insert({
        family_id: invite.family_id,
        user_id: user.id,
        role: invite.role,
      })
      .select()
      .single();

    if (membershipError) {
      throw new InviteError('INSERT_FAILED', 500, 'Failed to create membership');
    }

    return membership;
  }
}
