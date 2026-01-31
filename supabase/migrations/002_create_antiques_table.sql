-- 创建古董表
CREATE TABLE antiques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    era VARCHAR(100),
    material VARCHAR(100),
    dimensions VARCHAR(100),
    is_sold BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_antiques_user_id ON antiques(user_id);
CREATE INDEX idx_antiques_category ON antiques(category);
CREATE INDEX idx_antiques_price ON antiques(price);
CREATE INDEX idx_antiques_created_at ON antiques(created_at DESC);

-- 授权访问权限
GRANT SELECT ON antiques TO anon;
GRANT ALL PRIVILEGES ON antiques TO authenticated;