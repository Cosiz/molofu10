import type { SupabaseClient } from './types';

export { type SupabaseClient } from './types';

export function createClient(): SupabaseClient {
  throw new Error('createClient should not be called in tests');
}
