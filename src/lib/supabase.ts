import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('visitor_leads')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    return { status: 'connected' as const, error: null };
  } catch (err) {
    console.error('Supabase Connection Test Failed:', err);
    return { status: 'error' as const, error: err instanceof Error ? err.message : String(err) };
  }
};

