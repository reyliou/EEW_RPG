-- 1. 啟用 UUID 擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 建立 Profiles (玩家帳號)
-- 連結至 Supabase Auth 的 users 表
-- ==========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 建立 Characters (角色表)
-- 儲存玩家的長線資產與六維屬性
-- ==========================================
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- 六維屬性 (對應 TRPG 檢定)
  strength INTEGER DEFAULT 10,
  dexterity INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  constitution INTEGER DEFAULT 10,
  charisma INTEGER DEFAULT 10,
  wisdom INTEGER DEFAULT 10,
  
  -- 狀態與進度
  max_hp INTEGER DEFAULT 100,
  current_hp INTEGER DEFAULT 100,
  luck INTEGER DEFAULT 10,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  
  status_effects JSONB DEFAULT '[]'::jsonb,
  is_dead BOOLEAN DEFAULT FALSE, -- 撕卡標記

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 建立 Runs (遊戲局)
-- 紀錄每一次出征 (Expedition) 的大狀態
-- ==========================================
CREATE TABLE public.runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  seed TEXT, -- 用於 Roguelike 隨機生成的種子
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 建立 Lore States (世界觀狀態)
-- 持久化遊戲中的重要里程碑或改變
-- ==========================================
CREATE TABLE public.lore_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES public.runs(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  value_data TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (run_id, key_name) -- 一局內每個 key 只能有一筆
);

-- ==========================================
-- 設定 RLS (Row Level Security) 政策
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_states ENABLE ROW LEVEL SECURITY;

-- 允許已登入的使用者讀取自己的 Profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 允許已登入的使用者更新自己的 Profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 允許使用者讀取自己擁有的角色
CREATE POLICY "Users can view own characters" 
ON public.characters FOR SELECT USING (auth.uid() = player_id);

-- 允許使用者創建自己的角色
CREATE POLICY "Users can create own characters" 
ON public.characters FOR INSERT WITH CHECK (auth.uid() = player_id);

-- 允許使用者更新自己的角色
CREATE POLICY "Users can update own characters" 
ON public.characters FOR UPDATE USING (auth.uid() = player_id);

-- ==========================================
-- 建立 Updated_At 自動更新 Trigger 函數
-- ==========================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_characters_modtime
BEFORE UPDATE ON public.characters
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
