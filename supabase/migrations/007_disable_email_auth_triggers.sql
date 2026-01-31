-- 完全禁用邮箱验证触发器
-- 设置所有新用户的邮箱为已验证状态
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 自动设置邮箱验证时间
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，在插入新用户时自动验证邮箱
DROP TRIGGER IF EXISTS auto_verify_email ON auth.users;
CREATE TRIGGER auto_verify_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 更新现有用户的邮箱验证状态
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;