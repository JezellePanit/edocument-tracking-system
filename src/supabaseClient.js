import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://szuyhfrrfiqaqggefchm.supabase.co";
const supabaseKey = "sb_publishable_RcFPAjjgbCI76UuQpnRcaA_ThQmB3UZ";

export const supabase = createClient(supabaseUrl, supabaseKey);
