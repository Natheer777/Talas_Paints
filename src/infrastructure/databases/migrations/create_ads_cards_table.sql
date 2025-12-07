CREATE TABLE IF NOT EXISTS ads_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE',
        'INACTIVE'
    )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ads_cards_status
ON ads_cards(status);

CREATE INDEX IF NOT EXISTS idx_ads_cards_created_at
ON ads_cards(created_at DESC);







