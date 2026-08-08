import { createClient } from "@supabase/supabase-js";
import "server-only";

const supabaseUrl =
  process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey =
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY)?.trim();

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

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
