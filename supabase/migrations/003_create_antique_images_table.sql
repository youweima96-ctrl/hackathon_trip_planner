-- 创建古董图片表
CREATE TABLE antique_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    antique_id UUID NOT NULL REFERENCES antiques(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_antique_images_antique_id ON antique_images(antique_id);
CREATE INDEX idx_antique_images_primary ON antique_images(antique_id, is_primary) WHERE is_primary = TRUE;

-- 授权访问权限
GRANT SELECT ON antique_images TO anon;
GRANT ALL PRIVILEGES ON antique_images TO authenticated;