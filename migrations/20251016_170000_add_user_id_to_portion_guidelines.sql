-- Migration to add user_id column to portion_guidelines table
-- This resolves the foreign key constraint issue in migration 013

-- Add user_id column to portion_guidelines table
ALTER TABLE portion_guidelines 
ADD COLUMN user_id VARCHAR(36) NOT NULL DEFAULT 'system';

-- Add foreign key constraint
ALTER TABLE portion_guidelines 
ADD CONSTRAINT fk_portion_guidelines_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_portion_guidelines_user_id ON portion_guidelines(user_id);

-- Update existing records to have a default user_id
-- In a real scenario, you might want to link these to a specific system user
UPDATE portion_guidelines 
SET user_id = 'system' 
WHERE user_id = 'system';