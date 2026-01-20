-- Create orders table with JSONB items
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY,

    -- Customer information
    phone_number VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    street_name VARCHAR(255),
    building_number VARCHAR(255),
    additional_notes TEXT,
    delivery_agent_name VARCHAR(255) NOT NULL,

    -- Payment
    payment_method VARCHAR(50) NOT NULL
        CHECK (payment_method IN ('cash_on_delivery', 'electronic_payment')),

    -- Order status
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'ordered' ,'rejected', 'in_progress')),

    -- Financial
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),

    -- Order number - sequential numbering starting from 10000
    order_number SERIAL UNIQUE,

    -- Order items stored as JSONB array
    -- Each item contains: {id, product_id, quantity, price, createdAt, updatedAt}
    items JSONB NOT NULL DEFAULT '[]'::JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_phone_number
ON orders(phone_number);

CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_delivery_agent_name
ON orders(delivery_agent_name);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at DESC);

-- GIN index for JSONB items array for efficient querying
CREATE INDEX IF NOT EXISTS idx_orders_items_gin
ON orders USING GIN (items);

-- Index for searching by product_id within items
CREATE INDEX IF NOT EXISTS idx_orders_items_product_id
ON orders USING GIN ((items -> 'product_id'));

-- Create sequence for order numbers starting from 10000
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 10000 INCREMENT BY 1;

-- Set the default value for order_number to use the sequence
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT nextval('order_number_seq');

-- Additional index for order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Comments
COMMENT ON TABLE orders IS 'Consolidated orders table containing order details and items in JSONB format';
COMMENT ON COLUMN orders.items IS 'Array of order items stored as JSONB. Each item contains: id, product_id, quantity, price, createdAt, updatedAt';
COMMENT ON COLUMN orders.order_number IS 'Sequential order number starting from 10000';
COMMENT ON SEQUENCE order_number_seq IS 'Sequence for generating order numbers starting from 10000';
