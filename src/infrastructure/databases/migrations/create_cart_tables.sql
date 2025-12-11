-- Create cart_items table with product + customer information
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY,

    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    street_name VARCHAR(255),
    building_number VARCHAR(255),
    additional_notes TEXT,

    -- Payment
    payment_method VARCHAR(50) NOT NULL
        CHECK (payment_method IN ('cash_on_delivery', 'electronic_payment')),

    -- Product information
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relations
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

    -- Prevent duplicate product in cart per phone number
    UNIQUE(phone_number, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_phone
ON cart_items(phone_number);

CREATE INDEX IF NOT EXISTS idx_cart_items_payment_method
ON cart_items(payment_method);

CREATE INDEX IF NOT EXISTS idx_cart_items_area_name
ON cart_items(area_name);
