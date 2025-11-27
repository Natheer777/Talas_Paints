-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Update products table to use category_id foreign key
ALTER TABLE products 
DROP COLUMN IF EXISTS category;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add index for faster joins
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
