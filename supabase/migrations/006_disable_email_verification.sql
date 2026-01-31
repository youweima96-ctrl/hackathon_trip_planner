-- 禁用邮箱验证，允许直接注册
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT NOW();