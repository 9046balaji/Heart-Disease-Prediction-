-- Migration: 20251016_120200_normalize_recipe_data.sql
-- Normalize recipe tags, ingredients and related data for better querying and FK constraints

-- UP: Normalize recipe data into separate tables
-- ================================================

-- Create recipe_tags table for standardized tags
CREATE TABLE IF NOT EXISTS recipe_tags (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(50) NOT NULL UNIQUE,
  category ENUM('dietary', 'meal_type', 'cuisine', 'health', 'other') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create recipe_tag_map table to link recipes to tags (many-to-many relationship)
CREATE TABLE IF NOT EXISTS recipe_tag_map (
  recipe_id VARCHAR(36) NOT NULL,
  tag_id VARCHAR(36) NOT NULL,
  
  PRIMARY KEY (recipe_id, tag_id),
  CONSTRAINT fk_recipe_tags_recipe 
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_tags_tag 
    FOREIGN KEY (tag_id) REFERENCES recipe_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ingredients table for standardized ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  common_allergens JSON, -- specific allergens in this ingredient
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create recipe_ingredients table to link recipes to ingredients with quantities
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  recipe_id VARCHAR(36) NOT NULL,
  ingredient_id VARCHAR(36) NOT NULL,
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  preparation_notes TEXT,
  
  CONSTRAINT fk_recipe_ingredients_recipe 
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_ingredients_ingredient 
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  
  UNIQUE KEY uk_recipe_ingredient (recipe_id, ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- Pre-populate common tags
INSERT INTO recipe_tags (name, category) VALUES
('heart-healthy', 'health'),
('low-sodium', 'health'),
('diabetic-friendly', 'health'),
('high-protein', 'health'),
('vegetarian', 'dietary'),
('vegan', 'dietary'),
('gluten-free', 'dietary'),
('breakfast', 'meal_type'),
('lunch', 'meal_type'),
('dinner', 'meal_type'),
('mediterranean', 'cuisine'),
('asian', 'cuisine');

-- ================================================
-- DOWN: Rollback recipe data normalization
-- ================================================

-- DROP TABLE IF EXISTS recipe_ingredients;
-- DROP TABLE IF EXISTS recipe_tag_map;
-- DROP TABLE IF EXISTS ingredients;
-- DROP TABLE IF EXISTS recipe_tags;