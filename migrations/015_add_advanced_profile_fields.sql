-- Add advanced profile fields to user_profiles table
-- Check if columns exist before adding to avoid errors

-- Add health_history column
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'health_history');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE user_profiles ADD COLUMN health_history JSON', 'SELECT ''Column health_history already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add family_medical_history column
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'family_medical_history');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE user_profiles ADD COLUMN family_medical_history JSON', 'SELECT ''Column family_medical_history already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add adverse_reactions column
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'adverse_reactions');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE user_profiles ADD COLUMN adverse_reactions JSON', 'SELECT ''Column adverse_reactions already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add privacy_settings column
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'privacy_settings');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE user_profiles ADD COLUMN privacy_settings JSON', 'SELECT ''Column privacy_settings already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add consent_history column
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'consent_history');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE user_profiles ADD COLUMN consent_history JSON', 'SELECT ''Column consent_history already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add data_sharing_preferences column
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_profiles' AND column_name = 'data_sharing_preferences');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE user_profiles ADD COLUMN data_sharing_preferences JSON', 'SELECT ''Column data_sharing_preferences already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;