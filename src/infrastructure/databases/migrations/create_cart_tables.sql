-- Create single table for cart items, identified by phone_number
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(phone_number, product_id)
);

-- Add index for faster lookups by phone number
CREATE INDEX IF NOT EXISTS idx_cart_items_phone ON cart_items(phone_number);
