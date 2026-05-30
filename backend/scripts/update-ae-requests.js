const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updateTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    const sql = fs.readFileSync(path.join(__dirname, 'update-ae-requests-table.sql'), 'utf8');
    await connection.query(sql);

    console.log('✅ ae_requests table updated successfully!');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateTable();
