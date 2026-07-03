const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Load existing environment variables if available
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Utility to prompt user
function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Utility to prompt for password without showing characters
function askPassword(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    process.stdout.write(query);
    
    // Mute stdout output
    const stdin = process.stdin;
    const originalWrite = process.stdout.write;
    process.stdout.write = (chunk, encoding, callback) => {
      // Only write if it's the query prompt or newline
      if (chunk.toString().includes(query) || chunk.toString() === '\n' || chunk.toString() === '\r\n') {
        originalWrite.call(process.stdout, chunk, encoding, callback);
      }
      return true;
    };
    
    rl.question('', (answer) => {
      process.stdout.write = originalWrite;
      rl.close();
      console.log(''); // Print newline after entering password
      resolve(answer);
    });
  });
}

function updateEnvFile(host, port, user, password, database) {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  } else {
    const prodEnvPath = path.join(__dirname, '../.env.production');
    if (fs.existsSync(prodEnvPath)) {
      content = fs.readFileSync(prodEnvPath, 'utf8');
    }
  }

  const updates = {
    DB_HOST: host,
    DB_PORT: port,
    DB_USER: user,
    DB_PASSWORD: password,
    DB_NAME: database
  };

  for (const [key, val] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${val}`);
    } else {
      content += `\n${key}=${val}`;
    }
  }

  fs.writeFileSync(envPath, content, 'utf8');
}

async function run() {
  console.log('==========================================================');
  console.log('🗄️  SuperBee Inventory - Database Auto-Setup');
  console.log('==========================================================\n');

  try {
    let db_host, db_port, db_user, db_password;
    const db_name = 'superbee_inventory';

    if (process.env.CI) {
      // In CI environments, skip interactive prompts and use env vars directly
      console.log('🤖 CI environment detected — using .env variables directly.');
      db_host = process.env.DB_HOST || 'localhost';
      db_port = parseInt(process.env.DB_PORT || '3306', 10);
      db_user = process.env.DB_USER || 'root';
      db_password = process.env.DB_PASSWORD || '';
    } else {
      // 1. Prompt for connection details
      const defaultHost = process.env.DB_HOST || 'localhost';
      const inputHost = await ask(`Enter MySQL Host (default: ${defaultHost}): `);
      db_host = inputHost.trim() || defaultHost;

      const defaultPort = process.env.DB_PORT || '3306';
      const inputPort = await ask(`Enter MySQL Port (default: ${defaultPort}): `);
      db_port = parseInt(inputPort.trim() || defaultPort, 10);

      const defaultUser = process.env.DB_USER || 'root';
      const inputUser = await ask(`Enter MySQL Username (default: ${defaultUser}): `);
      db_user = inputUser.trim() || defaultUser;

      db_password = await askPassword('Enter MySQL Password (default: empty): ');
    }

    // 2. Connect to MySQL server (without specifying DB, as it might not exist yet)
    console.log('\n⏳ Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: db_host,
      port: db_port,
      user: db_user,
      password: db_password,
      multipleStatements: true
    });

    console.log('✅ Connected successfully.');

    // 3. Read schema file
    console.log('⏳ Reading database schema...');
    const schemaPath = path.resolve(__dirname, '../../backend-setup/database-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    let sqlSchema = fs.readFileSync(schemaPath, 'utf8');

    // Clean up DELIMITER statements for mysql2 compatibility
    sqlSchema = sqlSchema
      .replace(/^\s*DELIMITER\s+\S+/gim, '') // Remove DELIMITER lines
      .replace(/\/\/\s*$/gm, ';');           // Replace delimiter enders (//) with semicolon

    // 4. Import database & tables
    console.log('⏳ Recreating database superbee_inventory...');
    await connection.query('DROP DATABASE IF EXISTS superbee_inventory;');
    console.log('⏳ Importing schema and tables...');
    await connection.query(sqlSchema);
    console.log('✅ Schema imported successfully.');

    await connection.end();

    // 5. Update environment variables configuration
    console.log('⏳ Updating backend environment file (.env)...');
    updateEnvFile(db_host, db_port, db_user, db_password, db_name);
    console.log('✅ Environment file updated successfully.');

    // 6. Initialize default users
    console.log('\n🔑 Initializing default users...');
    execSync(`node "${path.join(__dirname, 'init-users.js')}"`, { stdio: 'inherit' });

    console.log('\n==========================================================');
    console.log('🎉 Database Setup & Seeding Completed Successfully!');
    console.log('==========================================================');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database setup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

run();
