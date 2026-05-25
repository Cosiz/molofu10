import type { SupabaseClient, User } from '@/lib/types';
import { FamilyError } from '@/lib/errors';

export class FamilyService {
  constructor(private supabase: SupabaseClient) {}

  async createFamily(input: { name: string }, user: User): Promise<{ id: string; name: string; owner_id: string }> {
    const { data: existingFamily, error: selectError } = await this.supabase
      .from('families')
      .select()
      .maybeSingle();

    if (selectError) {
      throw new FamilyError('DATABASE_ERROR', 500, 'Failed to check existing family');
    }

    if (existingFamily) {
      throw new FamilyError('FAMILY_LIMIT_EXCEEDED', 400, 'Parent already has a family');
    }

    const { data: newFamily, error: insertError } = await this.supabase
      .from('families')
      .insert({ name: input.name, owner_id: user.id })
      .select()
      .single();

    if (insertError) {
      throw new FamilyError('INSERT_FAILED', 500, 'Failed to create family');
    }

    return newFamily;
  }
}
