import type { SupabaseClient, User } from '@/lib/types';
import { ScheduleError } from '@/lib/errors';

export class ScheduleService {
  constructor(private supabase: SupabaseClient) {}

  async getSchedules(user: User): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('schedules')
      .select();

    if (error) {
      throw new ScheduleError('DATABASE_ERROR', 500, 'Failed to fetch schedules');
    }

    return data || [];
  }

  async updateSchedule(scheduleId: string, updates: { day?: string }, user: User): Promise<any> {
    if (user.role === 'helper') {
      throw new ScheduleError('FORBIDDEN', 403, 'Helpers cannot update schedules');
    }

    const { data, error } = await this.supabase
      .from('schedules')
      .update(updates)
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      throw new ScheduleError('UPDATE_FAILED', 500, 'Failed to update schedule');
    }

    return data;
  }

  async deleteSchedule(scheduleId: string, user: User): Promise<void> {
    if (user.role === 'helper') {
      throw new ScheduleError('FORBIDDEN', 403, 'Helpers cannot delete schedules');
    }

    const { error } = await this.supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      throw new ScheduleError('DELETE_FAILED', 500, 'Failed to delete schedule');
    }
  }
}
