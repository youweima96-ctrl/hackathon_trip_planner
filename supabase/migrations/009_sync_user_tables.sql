-- 删除现有的策略以避免冲突
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;

-- 确保用户表结构与auth.users同步
-- 修改id字段为uuid类型以匹配auth.users
ALTER TABLE public.users 
ALTER COLUMN id TYPE uuid USING id::uuid;

-- 确保email字段唯一性
ALTER TABLE public.users 
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- 添加缺失的字段
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz,
ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS raw_app_meta_data jsonb DEFAULT '{}';

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- 重新创建策略
CREATE POLICY "Allow anonymous insert" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 确保触发器正确工作
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- 当auth.users有新用户时，自动创建public.users记录
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, email, nickname, is_verified, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
      true,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除现有触发器
DROP TRIGGER IF EXISTS sync_user_profile_trigger ON auth.users;

-- 创建新触发器
CREATE TRIGGER sync_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();