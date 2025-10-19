-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id VARCHAR(36) PRIMARY KEY,
  title TEXT NOT NULL,
  duration_min INT,
  intensity ENUM('low', 'moderate', 'high'),
  instructions JSON, -- JSON array of step-by-step instructions
  gif_url TEXT,
  lottie_url TEXT,
  safety_considerations JSON, -- JSON array of safety considerations
  accessibility_options JSON, -- JSON array of accessibility options
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_intensity ON exercises(intensity);
CREATE INDEX IF NOT EXISTS idx_exercises_title ON exercises(title(255));