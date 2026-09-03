import { createClient } from '@supabase/supabase-js';

const PLACEHOLDER_URL = 'https://placeholder-project.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key-for-build';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
// Sanitize Supabase URL to ensure no trailing '/rest/v1' path breaks Auth endpoints
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== PLACEHOLDER_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== PLACEHOLDER_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function getSupabaseClient() {
  return supabase;
}
