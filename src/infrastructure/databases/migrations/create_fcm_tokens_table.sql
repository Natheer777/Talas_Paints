-- Create FCM tokens table for push notifications
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20),
    admin_email VARCHAR(255),
    token TEXT NOT NULL,
    device_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_phone_number
ON fcm_tokens(phone_number);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_admin_email
ON fcm_tokens(admin_email);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token
ON fcm_tokens(token);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fcm_tokens_conflict 
ON fcm_tokens (COALESCE(phone_number, ''), COALESCE(admin_email, ''), token);

-- Comments
COMMENT ON TABLE fcm_tokens IS 'Stores Firebase Cloud Messaging tokens for push notifications';
COMMENT ON COLUMN fcm_tokens.phone_number IS 'User phone number to associate with the FCM token';
COMMENT ON COLUMN fcm_tokens.admin_email IS 'Admin email to associate with the FCM token';
COMMENT ON COLUMN fcm_tokens.token IS 'Firebase Cloud Messaging registration token';
COMMENT ON COLUMN fcm_tokens.device_type IS 'Optional device type (e.g., android, ios, web)';

