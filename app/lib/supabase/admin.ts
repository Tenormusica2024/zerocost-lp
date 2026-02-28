import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase admin クライアント（service_role キーで RLS をバイパス）
// globalThis に保持することで dev hot reload 時にも同一インスタンスを再利用する
declare global {
  // eslint-disable-next-line no-var
  var _supabaseAdmin: SupabaseClient | undefined;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (globalThis._supabaseAdmin) return globalThis._supabaseAdmin;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }

  globalThis._supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return globalThis._supabaseAdmin;
}
