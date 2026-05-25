import type { SupabaseClient, User } from '@/lib/types';
import { HandshakeError } from '@/lib/errors';

export class HandshakeService {
  constructor(private supabase: SupabaseClient) {}

  async createHandshake(input: { type: string; childId: string }, user: User): Promise<any> {
    const { data, error } = await this.supabase
      .from('handshake_events')
      .insert({
        type: input.type,
        child_id: input.childId,
        family_id: user.family_id,
      })
      .select()
      .single();

    if (error) {
      throw new HandshakeError('INSERT_FAILED', 500, 'Failed to create handshake event');
    }

    return data;
  }
}
