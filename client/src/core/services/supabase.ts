import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[DB] Supabase credentials not found in frontend environment variables.');
}

// 建立供前端使用的 Supabase Client
// 前端的請求會受到 Supabase 中 Row Level Security (RLS) 的保護
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
