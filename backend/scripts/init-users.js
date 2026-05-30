const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initUsers() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Hash passwords
    const adminPassword = await bcrypt.hash('123456', 10);
    const techPassword = await bcrypt.hash('123456', 10);

    // Delete existing users
    await connection.query('DELETE FROM users');
    console.log('🗑️  Cleared existing users');

    // Insert admin user
    await connection.query(`
      INSERT INTO users (id, email, password_hash, name, employee_id, designation, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['user-admin-001', 'ram@superbee.com', adminPassword, 'Ram', 'EMP001', 'Administrator', 'role-001', true]);

    console.log('✅ Created admin user: ram@superbee.com / 123456');

    // Insert technician user
    await connection.query(`
      INSERT INTO users (id, email, password_hash, name, employee_id, designation, role_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['user-tech-001', 'ae@superbee.com', techPassword, 'Assembly Engineer', 'AE001', 'Assembly Engineer', 'role-002', true]);

    console.log('✅ Created technician user: ae@superbee.com / 123456');

    await connection.end();
    console.log('\n🎉 User initialization complete!');
    console.log('\nYou can now login with:');
    console.log('  Admin: ram@superbee.com / 123456');
    console.log('  Technician: ae@superbee.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initUsers();
