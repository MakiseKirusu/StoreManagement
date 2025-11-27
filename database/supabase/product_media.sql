-- ============================================================
-- Product Media Table for Image and Video Support
-- ============================================================
-- This script adds support for multiple images and videos per product
-- Run this in Supabase SQL Editor
--
-- Features:
-- - Multiple media files per product
-- - Support for both images and videos
-- - Ordering for gallery display
-- - Alt text for accessibility
-- - Backward compatible (keeps existing image_url field)
-- ============================================================

-- Create product_media table
CREATE TABLE IF NOT EXISTS product_media (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO')),
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_product_media_product_id ON product_media(product_id);
CREATE INDEX idx_product_media_order ON product_media(product_id, display_order);
CREATE INDEX idx_product_media_type ON product_media(product_id, media_type);

-- Add trigger for updated_at
CREATE TRIGGER update_product_media_updated_at BEFORE UPDATE ON product_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE product_media IS 'Stores multiple images and videos for products';
COMMENT ON COLUMN product_media.media_type IS 'Type of media: IMAGE or VIDEO';
COMMENT ON COLUMN product_media.url IS 'URL to the media file (from Supabase Storage or external)';
COMMENT ON COLUMN product_media.alt_text IS 'Alternative text for images (accessibility)';
COMMENT ON COLUMN product_media.display_order IS 'Order in which media should be displayed (0 = first)';

-- ============================================================
-- Migration Notes:
-- ============================================================
-- 1. This script is safe to run - it won't affect existing products
-- 2. Existing products will continue using the `image_url` field
-- 3. New products can use both methods:
--    - image_url: For simple single image (backward compatible)
--    - product_media: For multiple images/videos (new feature)
-- 4. Frontend can display image_url as fallback if no product_media exists
-- ============================================================

-- Example query to get all media for a product:
-- SELECT * FROM product_media WHERE product_id = 1 ORDER BY display_order;

-- Example query to get only images for a product:
-- SELECT * FROM product_media WHERE product_id = 1 AND media_type = 'IMAGE' ORDER BY display_order;
