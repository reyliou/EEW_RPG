import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using Service Role Key for backend authoritative operations

if (!supabaseUrl || !supabaseKey) {
  console.warn('[DB] Supabase credentials not found in environment variables. Falling back to Mock DB mode.');
}

// 建立帶有超級管理員權限的 Supabase Client，供後端伺服器 (Matrix) 使用
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
