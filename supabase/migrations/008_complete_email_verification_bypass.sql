-- 完全绕过Supabase邮箱验证系统
-- 创建函数来自动验证所有新用户
CREATE OR REPLACE FUNCTION public.auto_verify_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 立即设置邮箱验证时间
  NEW.email_confirmed_at = NOW();
  -- 确保用户状态为已验证
  NEW.raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', ARRAY['email']);
  NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除现有的触发器（如果存在）
DROP TRIGGER IF EXISTS trigger_auto_verify_user ON auth.users;

-- 创建新的触发器，在插入新用户时自动验证邮箱
CREATE TRIGGER trigger_auto_verify_user
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_verify_new_user();

-- 更新所有现有未验证的用户
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', ARRAY['email'])
WHERE email_confirmed_at IS NULL;

-- 确保public.users表的RLS策略允许匿名和认证用户访问
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 创建允许匿名用户插入的策略（用于注册）
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.users;
CREATE POLICY "Allow anonymous insert" ON public.users
  FOR INSERT WITH CHECK (true);

-- 创建允许认证用户查看的策略
DROP POLICY IF EXISTS "Allow authenticated users to view" ON public.users;
CREATE POLICY "Allow authenticated users to view" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 创建允许用户更新自己资料的策略
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
CREATE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 授予权限
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;