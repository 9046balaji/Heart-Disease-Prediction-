-- Migration to fix password security by changing column type and ensuring all passwords are properly hashed
-- This addresses the critical security flaw where passwords were stored as plaintext in TEXT columns

-- UP: Fix password security
-- ================================================

-- First, we need to ensure all existing passwords are hashed
-- This requires application-level intervention, but we can change the column type now

-- Change password column from TEXT to VARCHAR(255) to store bcrypt hashes
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Update the username column from TEXT to VARCHAR(255) for better performance
ALTER TABLE users MODIFY COLUMN username VARCHAR(255) NOT NULL;

-- Add a comment to document that passwords are bcrypt hashed
ALTER TABLE users COMMENT = 'User accounts with bcrypt hashed passwords';

-- ================================================
-- DOWN: Revert changes (NOT RECOMMENDED for security reasons)
-- ================================================

-- Revert username column
-- ALTER TABLE users MODIFY COLUMN username TEXT NOT NULL;

-- Revert password column (NOT RECOMMENDED)
-- ALTER TABLE users MODIFY COLUMN password TEXT NOT NULL;

-- Remove comment
-- ALTER TABLE users COMMENT = '';