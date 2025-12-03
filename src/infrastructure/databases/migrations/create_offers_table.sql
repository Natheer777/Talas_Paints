CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    type VARCHAR(50) NOT NULL CHECK (type IN (
        'PERCENTAGE_DISCOUNT',
        'BUY_X_GET_Y_FREE'
    )),

    product_id UUID NOT NULL,

 
    discount_percentage DECIMAL(5, 2) CHECK (
        discount_percentage >= 0 AND discount_percentage <= 100
    ),


    buy_quantity INTEGER CHECK (buy_quantity > 0),
    get_quantity INTEGER CHECK (get_quantity > 0),


    status VARCHAR(20) NOT NULL CHECK (status IN (
        'VISIBLE',
        'HIDDEN'
    )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,



    CONSTRAINT offer_type_validation CHECK (
        (type = 'PERCENTAGE_DISCOUNT'
            AND discount_percentage IS NOT NULL
            AND buy_quantity IS NULL
            AND get_quantity IS NULL)
        OR
        (type = 'BUY_X_GET_Y_FREE'
            AND discount_percentage IS NULL
            AND buy_quantity IS NOT NULL
            AND get_quantity IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_offers_product_id
ON offers(product_id);

CREATE INDEX IF NOT EXISTS idx_offers_status
ON offers(status);
