-- Add lab results table for tracking BP, cholesterol, HbA1c
CREATE TABLE IF NOT EXISTS lab_results (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('bloodPressure', 'cholesterol', 'hba1c') NOT NULL,
  -- Blood pressure fields
  systolic INT,
  diastolic INT,
  -- Cholesterol fields
  total_cholesterol INT,
  ldl INT,
  hdl INT,
  triglycerides INT,
  -- HbA1c field
  hba1c INT,
  date DATETIME NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_type ON lab_results(type);
CREATE INDEX IF NOT EXISTS idx_lab_results_date ON lab_results(date);