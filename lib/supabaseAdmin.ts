import { createClient } from "@supabase/supabase-js";
import "server-only";

const getSupabaseUrl = () =>
  process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const getSupabaseServiceKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY?.trim();

let supabaseAdminClient: ReturnType<typeof createClient<any, any, any>> | null = null;

export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const supabaseUrl = getSupabaseUrl();
    const supabaseServiceKey = getSupabaseServiceKey();

    if (!supabaseUrl) {
      throw new Error(
        "Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL. Set it in your environment variables."
      );
    }

    if (!supabaseServiceKey) {
      throw new Error(
        "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ROLE_KEY. Set it in server environment variables."
      );
    }

    supabaseAdminClient = createClient<any, "public", any>(supabaseUrl, supabaseServiceKey);
  }

  return supabaseAdminClient;
}
