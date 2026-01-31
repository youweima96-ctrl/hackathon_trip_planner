-- 修改用户表，添加邮箱验证状态
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT TRUE;