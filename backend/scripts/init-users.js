const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
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

    // FIX-02: Use the customized default password "Superbee@123"
    const adminPw = 'Superbee@123';
    const techPw = 'Superbee@123';

    // FIX-02: Increase bcrypt rounds from 10 to 12 for stronger work factor
    const adminPassword = await bcrypt.hash(adminPw, 12);
    const techPassword = await bcrypt.hash(techPw, 12);

    // Delete existing users
    await connection.query('DELETE FROM users');
    console.log('🗑️  Cleared existing users');

    // Insert admin user (must_change_password defaults to TRUE)
    await connection.query(`
      INSERT INTO users (id, email, password_hash, name, employee_id, designation, role_id, is_active, must_change_password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['user-admin-001', 'ram@superbee.com', adminPassword, 'Ram', 'EMP001', 'Administrator', 'role-001', true, true]);

    // Insert technician user (must_change_password defaults to TRUE)
    await connection.query(`
      INSERT INTO users (id, email, password_hash, name, employee_id, designation, role_id, is_active, must_change_password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['user-tech-001', 'ae@superbee.com', techPassword, 'Assembly Engineer', 'AE001', 'Assembly Engineer', 'role-002', true, true]);

    await connection.end();

    // FIX-02: Write credentials securely with read/write permissions for owner only (0o600)
    const credentialsPath = path.join(__dirname, '../.setup-credentials.txt');
    const credentialsText = `Admin: ram@superbee.com / ${adminPw}\nTechnician: ae@superbee.com / ${techPw}\n`;
    fs.writeFileSync(credentialsPath, credentialsText, { mode: 0o600 });

    console.log('✅ Credentials saved to .setup-credentials.txt — DELETE after use');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initUsers();
