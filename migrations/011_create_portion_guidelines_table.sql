-- Migration to create portion_guidelines table
CREATE TABLE IF NOT EXISTS portion_guidelines (
  id VARCHAR(36) PRIMARY KEY,
  food_category VARCHAR(50) NOT NULL,
  food_type VARCHAR(100) NOT NULL,
  small_portion TEXT NOT NULL,
  medium_portion TEXT NOT NULL,
  large_portion TEXT NOT NULL,
  calories_per_unit INT,
  created_at DATETIME NOT NULL
);

-- Insert sample portion guidelines
INSERT INTO portion_guidelines (id, food_category, food_type, small_portion, medium_portion, large_portion, calories_per_unit, created_at) VALUES
('pg-001', 'grains', 'rice', '1/2 cup cooked', '3/4 cup cooked', '1 cup cooked', 103, NOW()),
('pg-002', 'grains', 'pasta', '1/2 cup cooked', '3/4 cup cooked', '1 cup cooked', 111, NOW()),
('pg-003', 'grains', 'bread', '1 slice', '1.5 slices', '2 slices', 80, NOW()),
('pg-004', 'protein', 'chicken', '3 oz (palm size)', '4 oz', '6 oz', 140, NOW()),
('pg-005', 'protein', 'fish', '3 oz (palm size)', '4 oz', '6 oz', 120, NOW()),
('pg-006', 'protein', 'tofu', '1/2 cup', '3/4 cup', '1 cup', 94, NOW()),
('pg-007', 'vegetables', 'leafy greens', '1 cup raw', '2 cups raw', '3 cups raw', 5, NOW()),
('pg-008', 'vegetables', 'non-leafy', '1/2 cup cooked', '3/4 cup cooked', '1 cup cooked', 25, NOW()),
('pg-009', 'fruits', 'berries', '1/2 cup', '3/4 cup', '1 cup', 42, NOW()),
('pg-010', 'fruits', 'apple', '1 small (3" dia)', '1 medium (3.25" dia)', '1 large (3.75" dia)', 80, NOW()),
('pg-011', 'dairy', 'milk', '1/2 cup', '3/4 cup', '1 cup', 60, NOW()),
('pg-012', 'dairy', 'cheese', '1 oz (1 slice)', '1.5 oz', '2 oz', 115, NOW()),
('pg-013', 'fats', 'oil', '1 tsp', '1.5 tsp', '1 tbsp', 45, NOW()),
('pg-014', 'fats', 'nuts', '1/4 cup', '1/3 cup', '1/2 cup', 170, NOW());