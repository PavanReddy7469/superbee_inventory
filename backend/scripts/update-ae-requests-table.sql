-- Update ae_requests table to match new schema
USE superbee_inventory;

-- Drop the existing table
DROP TABLE IF EXISTS ae_requests;

-- Recreate with new schema
CREATE TABLE ae_requests (
  id VARCHAR(36) PRIMARY KEY,
  drone_number VARCHAR(50) NOT NULL,
  uin_number VARCHAR(50) NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  items JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
  notes TEXT,
  updated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_drone_number (drone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'ae_requests table updated successfully!' as message;
