-- SuperBee Aeronautics Database Schema
-- MySQL 8.0+

-- Create Database
CREATE DATABASE IF NOT EXISTS superbee_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE superbee_inventory;

-- ============================================
-- 1. ROLES TABLE
-- ============================================
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  level INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO roles (id, name, level) VALUES
('role-001', 'admin', 2),
('role-002', 'technician', 1),
('role-003', 'superadmin', 3);

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  designation VARCHAR(100),
  role_id VARCHAR(36) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_email (email),
  INDEX idx_employee_id (employee_id),
  INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_name (name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. INVENTORY PARTS TABLE
-- ============================================
CREATE TABLE inventory_parts (
  id VARCHAR(36) PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(36),
  manufacturer VARCHAR(255),
  serial_number VARCHAR(255),
  quantity INT DEFAULT 0,
  price DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sku (sku),
  INDEX idx_name (name),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. DRONE TYPES TABLE
-- ============================================
CREATE TABLE drone_types (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  specifications JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. DRONES TABLE
-- ============================================
CREATE TABLE drones (
  id VARCHAR(36) PRIMARY KEY,
  drone_type_id VARCHAR(36),
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  registration_number VARCHAR(255),
  status ENUM('active', 'maintenance', 'retired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (drone_type_id) REFERENCES drone_types(id) ON DELETE SET NULL,
  INDEX idx_serial_number (serial_number),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. AE REQUESTS TABLE (Assembly Engineer)
-- ============================================
CREATE TABLE ae_requests (
  id VARCHAR(36) PRIMARY KEY,
  drone_number VARCHAR(50) NOT NULL,
  uin_number VARCHAR(50) NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  items JSON NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  notes TEXT,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_drone_number (drone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. INVOICES TABLE
-- ============================================
CREATE TABLE invoices (
  id VARCHAR(36) PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  buyer_name VARCHAR(255),
  buyer_address TEXT,
  buyer_contact VARCHAR(100),
  items JSON NOT NULL,
  total_amount DECIMAL(10, 2),
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. ACCEPTANCE ORDERS TABLE
-- ============================================
CREATE TABLE acceptance_orders (
  id VARCHAR(36) PRIMARY KEY,
  ao_number VARCHAR(100) UNIQUE NOT NULL,
  drone_id VARCHAR(36),
  parts JSON NOT NULL,
  total_amount DECIMAL(10, 2),
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (drone_id) REFERENCES drones(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ao_number (ao_number),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. REFRESH TOKENS TABLE (for JWT)
-- ============================================
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token(255)),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Categories
INSERT INTO categories (id, name, description, status) VALUES
('cat-001', 'Propellers', 'Drone propellers and blades', 'active'),
('cat-002', 'Motors', 'Brushless motors', 'active'),
('cat-003', 'Batteries', 'LiPo batteries', 'active'),
('cat-004', 'Controllers', 'Flight controllers', 'active'),
('cat-005', 'Cameras', 'Cameras and gimbals', 'active'),
('cat-006', 'Frames', 'Drone frames and bodies', 'active'),
('cat-007', 'Electronics', 'ESCs, receivers, transmitters', 'active'),
('cat-008', 'Accessories', 'Miscellaneous accessories', 'active');

-- Sample Drone Types
INSERT INTO drone_types (id, name, description, specifications) VALUES
('dt-001', 'Quadcopter X500', 'Medium-sized quadcopter', '{"max_weight": "2kg", "flight_time": "25min"}'),
('dt-002', 'Hexacopter H800', 'Heavy-lift hexacopter', '{"max_weight": "5kg", "flight_time": "20min"}'),
('dt-003', 'Racing Drone R250', 'FPV racing drone', '{"max_speed": "120km/h", "flight_time": "8min"}'),
('dt-004', 'Surveillance S1000', 'Long-range surveillance', '{"range": "10km", "flight_time": "40min"}'),
('dt-005', 'Agricultural A600', 'Crop spraying drone', '{"tank_capacity": "10L", "flight_time": "15min"}');

-- ============================================
-- VIEWS (Optional - for easier queries)
-- ============================================

-- View: Inventory with Category Names
CREATE VIEW v_inventory_with_categories AS
SELECT 
  ip.*,
  c.name AS category_name
FROM inventory_parts ip
LEFT JOIN categories c ON ip.category_id = c.id;

-- View: Users with Role Names
CREATE VIEW v_users_with_roles AS
SELECT 
  u.*,
  r.name AS role_name,
  r.level AS role_level
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- View: AE Requests with User Details
CREATE VIEW v_ae_requests_detailed AS
SELECT 
  ar.*,
  ar.requested_by AS requester_name,
  ar.email AS requester_email,
  NULL AS reviewer_name
FROM ae_requests ar;

-- ============================================
-- STORED PROCEDURES (Optional)
-- ============================================

DELIMITER //

-- Procedure: Update Inventory Quantity
CREATE PROCEDURE sp_update_inventory_quantity(
  IN p_part_id VARCHAR(36),
  IN p_quantity_change INT
)
BEGIN
  UPDATE inventory_parts 
  SET quantity = quantity + p_quantity_change,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_part_id;
END //

-- Procedure: Approve AE Request
CREATE PROCEDURE sp_approve_ae_request(
  IN p_request_id VARCHAR(36)
)
BEGIN
  UPDATE ae_requests 
  SET status = 'approved',
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_request_id;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS (Optional - for audit logging)
-- ============================================

-- Trigger: Log inventory changes
CREATE TABLE inventory_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_id VARCHAR(36),
  action VARCHAR(50),
  old_quantity INT,
  new_quantity INT,
  changed_by VARCHAR(36),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DELIMITER //

CREATE TRIGGER trg_inventory_update
AFTER UPDATE ON inventory_parts
FOR EACH ROW
BEGIN
  IF OLD.quantity != NEW.quantity THEN
    INSERT INTO inventory_audit_log (part_id, action, old_quantity, new_quantity)
    VALUES (NEW.id, 'UPDATE', OLD.quantity, NEW.quantity);
  END IF;
END //

DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_inventory_category_status ON inventory_parts(category_id, status);
CREATE INDEX idx_ae_requests_status_created ON ae_requests(status, created_at);
CREATE INDEX idx_users_role_active ON users(role_id, is_active);

-- ============================================
-- GRANTS (Security - adjust as needed)
-- ============================================

-- Create application user (recommended for production)
-- CREATE USER 'superbee_app'@'localhost' IDENTIFIED BY 'strong_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON superbee_inventory.* TO 'superbee_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Database schema created successfully!' AS message;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'superbee_inventory';
