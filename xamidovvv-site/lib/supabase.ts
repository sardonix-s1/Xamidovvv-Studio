import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && key);

/** Returns a Supabase client, or null when env vars are not set (the site still works, with empty content). */
export function getSupabase() {
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
