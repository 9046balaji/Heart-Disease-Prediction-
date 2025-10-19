-- Migration to add image_url and dietary_restrictions columns to recipes table
ALTER TABLE recipes 
ADD COLUMN image_url TEXT,
ADD COLUMN dietary_restrictions JSON,
ADD COLUMN cooking_time INT;

-- Note: Removed ineffective JSON index on dietary_restrictions
-- The previous index (CAST(dietary_restrictions AS CHAR(255))) was ineffective
-- A proper solution would require normalizing this data into separate tables

-- Update existing recipes to have empty dietary restrictions array
UPDATE recipes 
SET dietary_restrictions = '[]' 
WHERE dietary_restrictions IS NULL;