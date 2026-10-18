import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylexaqwlnssobqksgihu.supabase.co';
const supabaseAnonKey = 'sb_publishable_VZ5egCxBphUC_GsRsuC1qw_qT5x9gcI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
