ALTER TABLE ads_cards
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO'));

ALTER TABLE ads_cards
ADD COLUMN IF NOT EXISTS media_url VARCHAR(500);


UPDATE ads_cards
SET media_url = image_url,
    media_type = 'IMAGE'
WHERE media_url IS NULL AND image_url IS NOT NULL;


ALTER TABLE ads_cards
ALTER COLUMN media_url SET NOT NULL;


-- Drop the old image_url column as it's no longer needed
ALTER TABLE ads_cards
DROP COLUMN IF EXISTS image_url;


CREATE INDEX IF NOT EXISTS idx_ads_cards_media_type
ON ads_cards(media_type);

