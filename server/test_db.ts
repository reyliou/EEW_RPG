import 'dotenv/config';
import { supabase } from './src/db/supabase';

async function testConnection() {
  console.log('🔄 正在測試 Supabase 連線...');
  
  if (!supabase) {
    console.error('❌ 錯誤：Supabase 客戶端未初始化。請檢查 .env 檔案。');
    process.exit(1);
  }

  // 嘗試讀取 profiles 表格的一筆資料來驗證連線與 Service Role Key 是否正確
  const { data, error } = await supabase.from('profiles').select('*').limit(1);

  if (error) {
    console.error('❌ 連線失敗或權限錯誤：', error.message);
  } else {
    console.log('✅ Supabase 連線成功！Service Role Key 權限正常。');
    console.log('當前資料庫中的 Profiles 數量：', data.length);
  }
  
  process.exit(0);
}

testConnection();
