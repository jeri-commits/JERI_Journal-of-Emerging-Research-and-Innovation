import { createClient } from 'jsr:@supabase/supabase-js@2'

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
// into every Edge Function's environment by Supabase -- never set by
// hand, never exposed to the frontend. This client bypasses RLS, which
// is exactly why all the mutation logic lives here instead of in the
// browser: every check below is real server-side enforcement.
export const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
)
