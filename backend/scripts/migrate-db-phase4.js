const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Migrating database schema to Phase 4...');

  // Helper to execute DDL, ignoring duplicate column/constraint errors
  async function execIgnore(sql, ignoreCodes = []) {
    try {
      await connection.query(sql);
      console.log(`✅ Success: ${sql.substring(0, 80)}...`);
    } catch (err) {
      const isIgnored = ignoreCodes.some(code => 
        err.code === code || 
        err.errno === code || 
        String(err.sqlState) === String(code)
      );
      if (isIgnored) {
        console.log(`ℹ️  Ignored (${err.code}): ${sql.substring(0, 80)}...`);
      } else {
        console.error(`❌ Error running: ${sql}`);
        console.error(err);
      }
    }
  }

  // 1. Alter quantity/price columns in inventory_parts
  await execIgnore('ALTER TABLE inventory_parts MODIFY quantity INT NOT NULL DEFAULT 0', ['ER_DUP_FIELDNAME']);
  await execIgnore('ALTER TABLE inventory_parts ADD CONSTRAINT chk_inventory_parts_quantity CHECK (quantity >= 0)', [1826, 3822, 1022, 'ER_DUP_CONSTRAINT_NAME', '23000']);
  
  // Set existing 0.00 prices to NULL so they satisfy CHECK (price > 0)
  await execIgnore('ALTER TABLE inventory_parts MODIFY price DECIMAL(10,2) DEFAULT NULL', []);
  await execIgnore('UPDATE inventory_parts SET price = NULL WHERE price = 0.00', []);
  await execIgnore('ALTER TABLE inventory_parts ADD CONSTRAINT chk_inventory_parts_price CHECK (price > 0)', [1826, 3822, 1022, 'ER_DUP_CONSTRAINT_NAME', '23000']);

  // 2. Add status column to users
  await execIgnore("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active'", [1060, 'ER_DUP_FIELDNAME', '42S21']);
  await execIgnore("ALTER TABLE users ADD CONSTRAINT chk_users_status CHECK (status IN ('active','inactive'))", [1826, 3822, 1022, 'ER_DUP_CONSTRAINT_NAME', '23000']);

  // 3. Alter status/items in ae_requests
  await execIgnore("ALTER TABLE ae_requests MODIFY COLUMN status VARCHAR(20) DEFAULT 'pending'", []);
  await execIgnore("ALTER TABLE ae_requests ADD CONSTRAINT chk_ae_requests_status CHECK (status IN ('pending','approved','rejected','withdrawn'))", [1826, 3822, 1022, 'ER_DUP_CONSTRAINT_NAME', '23000']);
  await execIgnore("ALTER TABLE ae_requests MODIFY COLUMN items JSON NOT NULL COMMENT 'Array of {part_id: string, quantity: int > 0}'", []);

  // 4. Create trigger protect last superadmin
  await execIgnore("DROP TRIGGER IF EXISTS prevent_last_superadmin_delete", []);
  
  const triggerSql = `
    CREATE TRIGGER prevent_last_superadmin_delete
    BEFORE UPDATE ON users
    FOR EACH ROW
    BEGIN
      IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        IF (SELECT r.name FROM roles r WHERE r.id = OLD.role_id) = 'superadmin' THEN
          IF (SELECT COUNT(*) FROM users u 
              JOIN roles r ON u.role_id = r.id
              WHERE r.name = 'superadmin' 
              AND u.is_deleted = FALSE) <= 1 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot delete the last superadmin account';
          END IF;
        END IF;
      END IF;
    END;
  `;
  await connection.query(triggerSql);
  console.log('✅ Success: Created trigger prevent_last_superadmin_delete');

  await connection.end();
  console.log('🎉 DB Migration Phase 4 complete!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
