CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    qr_code_url VARCHAR(500) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN (
        'visible',
        'hidden'
    )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_status
ON payment_methods(status);

CREATE INDEX IF NOT EXISTS idx_payment_methods_created_at
ON payment_methods(created_at DESC);
