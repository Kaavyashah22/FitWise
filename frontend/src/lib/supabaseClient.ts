import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lmltaotszrbrplyvrodh.supabase.co";
// Using the anon/publishable key from the user's backend setup
const SUPABASE_KEY = "sb_publishable_q4fWis_DTy2vwwU3prsZ3A_png8o5gL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
