-- Create video_cards table
CREATE TABLE IF NOT EXISTS video_cards (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'visible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_video_cards_status ON video_cards(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_video_cards_created_at ON video_cards(created_at DESC);
