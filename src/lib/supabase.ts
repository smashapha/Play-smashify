import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://akclwguqzeijscftatqp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
