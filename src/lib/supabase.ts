import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://akclwguqzeijscftatqp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrY2x3Z3VxemVpanNjZnRhdHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MzgyMDUsImV4cCI6MjA5MzExNDIwNX0.ZcPAVUWpxFE0ba0QjzzSK7xOucWYKPci6JFPeXwLalc';

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('Supabase Anon Key is missing! Please set VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'dummy_key');
