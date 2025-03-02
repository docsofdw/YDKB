import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Create a Supabase client for client-side components
 * This is safe to use in client components
 */
export function createSafeClient() {
  const supabase = createClientComponentClient({
    options: {
      global: {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      },
    },
  });
  return supabase;
} 