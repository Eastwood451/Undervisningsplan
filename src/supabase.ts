import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wpriingzftsboauvkmsj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bSvkvx_Lqd5ZEt94oVdMaw_44WV2fYE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
