-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type TEXT NOT NULL,
  severity INT,
  duration TEXT,
  notes TEXT,
  timestamp DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  -- Foreign key constraint will be added in a separate migration to avoid conflicts
);

-- Create index for faster queries
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);

CREATE INDEX idx_symptoms_type ON symptoms(type);

CREATE INDEX idx_symptoms_timestamp ON symptoms(timestamp);