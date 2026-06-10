const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load env variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function runTests() {
  console.log('==========================================================');
  console.log('🛡️  SBA-IMS Security Hardening Verification Suite');
  console.log('==========================================================\n');

  // Connect to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log('✅ Connected to database for status checks and setup.');

  try {
    // Read generated credentials
    const credentialsPath = path.join(__dirname, '../.setup-credentials.txt');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error('Verification requires .setup-credentials.txt. Run DB setup or init-users.js first.');
    }
    const credentialsText = fs.readFileSync(credentialsPath, 'utf8');
    const adminMatch = credentialsText.match(/Admin: (\S+) \/ (\S+)/);
    const techMatch = credentialsText.match(/Technician: (\S+) \/ (\S+)/);

    if (!adminMatch || !techMatch) {
      throw new Error('Could not parse credentials from .setup-credentials.txt');
    }

    const adminEmail = adminMatch[1];
    const adminPassword = adminMatch[2];
    const techEmail = techMatch[1];
    const techPassword = techMatch[2];

    console.log(`Credentials read successfully:\n - Admin: ${adminEmail}\n - Tech: ${techEmail}\n`);

    // Reset login attempts before starting tests
    await connection.query('DELETE FROM login_attempts');
    console.log('🧹 Cleaned up existing login_attempts logs.');

    // ----------------------------------------------------
    // TEST 1: Login and Secure Cookie Issuance
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Login and Secure Cookie Issuance ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    console.log('Response body:', JSON.stringify(loginData, null, 2));

    if (!loginData.requiresPasswordChange) {
      throw new Error('Expected requiresPasswordChange to be true for seeded accounts.');
    }
    console.log('✅ requiresPasswordChange flag is correctly present.');

    // Extract cookie
    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie || !setCookie.includes('authToken=')) {
      throw new Error('No authToken cookie found in response headers.');
    }
    console.log('Raw set-cookie header:', setCookie);

    if (!setCookie.includes('HttpOnly')) {
      throw new Error('Cookie is missing HttpOnly attribute.');
    }
    console.log('✅ Cookie contains HttpOnly attribute.');

    if (!setCookie.includes('SameSite=Strict')) {
      throw new Error('Cookie is missing SameSite=Strict attribute.');
    }
    console.log('✅ Cookie contains SameSite=Strict attribute.');

    const adminTokenMatch = setCookie.match(/authToken=([^;]+)/);
    const adminCookie = adminTokenMatch ? adminTokenMatch[0] : '';
    console.log('✅ Login cookie issued successfully.');

    // ----------------------------------------------------
    // TEST 2: Authentication via Cookie (/api/auth/me)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Authentication via Cookie (/api/auth/me) ---');
    
    // Without cookie
    const unauthRes = await fetch(`${BASE_URL}/auth/me`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log('✅ Access without cookie correctly rejected (401).');

    // With cookie
    const authRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: adminCookie }
    });
    if (authRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${authRes.status}`);
    }
    const profile = await authRes.json();
    console.log('Profile response:', JSON.stringify(profile, null, 2));
    if (profile.email !== adminEmail) {
      throw new Error(`Expected profile email to be ${adminEmail}, got ${profile.email}`);
    }
    console.log('✅ Access with HttpOnly cookie authenticated successfully.');

    // ----------------------------------------------------
    // TEST 3: RBAC (Role-Based Access Control) Enforcement
    // ----------------------------------------------------
    console.log('\n--- TEST 3: RBAC Enforcement ---');
    
    // Log in as Technician to get technician cookie
    const techLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: techEmail, password: techPassword })
    });
    const techSetCookie = techLoginRes.headers.get('set-cookie');
    const techTokenMatch = techSetCookie.match(/authToken=([^;]+)/);
    const techCookie = techTokenMatch ? techTokenMatch[0] : '';

    // Technician attempts to access list of users (Requires admin/superadmin)
    const techUsersRes = await fetch(`${BASE_URL}/users`, {
      headers: { Cookie: techCookie }
    });
    
    if (techUsersRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for Technician accessing users, got ${techUsersRes.status}`);
    }
    const techUsersData = await techUsersRes.json();
    console.log('Technician access response (403):', JSON.stringify(techUsersData));
    console.log('✅ Technician blocked with 403 Forbidden.');

    // Admin attempts to access list of users
    const adminUsersRes = await fetch(`${BASE_URL}/users`, {
      headers: { Cookie: adminCookie }
    });
    if (adminUsersRes.status !== 200) {
      throw new Error(`Expected 200 OK for Admin accessing users, got ${adminUsersRes.status}`);
    }
    console.log('✅ Admin successfully fetched users list.');

    // ----------------------------------------------------
    // TEST 4: Rate Limiting & User Enumeration / Account Lockout
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Rate Limiting & Lockout ---');
    
    // Send 5 incorrect login requests for a specific email
    console.log('Sending 5 incorrect login requests...');
    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: techEmail, password: 'wrong-password-here' })
      });
      console.log(`Attempt ${i} status: ${res.status}`);
    }

    // 6th attempt should result in 429 Rate Limit (either from Express Rate Limit or DB account lock)
    const limitRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: techEmail, password: techPassword })
    });
    console.log(`6th attempt (correct password, but locked) status: ${limitRes.status}`);
    
    if (limitRes.status !== 429) {
      throw new Error(`Expected 429 Too Many Requests, got ${limitRes.status}`);
    }
    const limitData = await limitRes.json();
    console.log('Rate limit response:', JSON.stringify(limitData));
    console.log('✅ 6th attempt correctly blocked with HTTP 429.');

    // Clean up login attempts table to restore access
    await connection.query('DELETE FROM login_attempts');
    console.log('🧹 Restored login_attempts to unlock account.');

    // ----------------------------------------------------
    // TEST 5: Double-Spend / Concurrent Approval Protection (FOR UPDATE locks)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Double-Spend / Concurrent Approval Protection ---');
    
    // Create temporary category & part
    const testCatId = 'cat-test-999';
    const testPartSku = 'sku-test-999';
    const testReqId = 'req-test-999';

    // Delete if existing
    await connection.query('DELETE FROM ae_requests WHERE id = ?', [testReqId]);
    await connection.query('DELETE FROM inventory_parts WHERE sku = ?', [testPartSku]);
    await connection.query('DELETE FROM categories WHERE id = ?', [testCatId]);

    // Insert category
    await connection.query(
      `INSERT INTO categories (id, name, description, status) 
       VALUES (?, 'Test Category', 'For security verification', 'active')`,
      [testCatId]
    );

    // Insert part with quantity = 2
    await connection.query(
      `INSERT INTO inventory_parts (id, sku, name, category_id, manufacturer, serial_number, quantity, price, status)
       VALUES (?, ?, 'Test Propeller X', ?, 'SuperBee', 'SN-TEST-001', 2, 50.00, 'active')`,
      ['part-test-999', testPartSku, testCatId]
    );

    // Create a pending request demanding 2 units of the part
    const requestItems = [{ part_id: testPartSku, quantity: 2 }];
    await connection.query(
      `INSERT INTO ae_requests (id, drone_number, uin_number, requested_by, email, items, status)
       VALUES (?, 'Drone-101', 'UIN-101', 'Test Engineer', ?, ?, 'pending')`,
      [testReqId, techEmail, JSON.stringify(requestItems)]
    );
    console.log('Test setup: Added sku-test-999 with quantity 2, and pending ae_request for 2 units.');

    // Fire two concurrent accept requests
    console.log('Sending two concurrent accept requests...');
    const acceptUrls = `${BASE_URL}/ae-requests/${testReqId}/accept`;
    const acceptReq1 = fetch(acceptUrls, {
      method: 'POST',
      headers: { Cookie: adminCookie }
    });
    const acceptReq2 = fetch(acceptUrls, {
      method: 'POST',
      headers: { Cookie: adminCookie }
    });

    const [res1, res2] = await Promise.all([acceptReq1, acceptReq2]);
    console.log(`Request 1 status: ${res1.status}`);
    console.log(`Request 2 status: ${res2.status}`);

    const data1 = await res1.json();
    const data2 = await res2.json();
    console.log('Request 1 response:', JSON.stringify(data1));
    console.log('Request 2 response:', JSON.stringify(data2));

    // One must succeed (200) and the other must fail (400)
    const statuses = [res1.status, res2.status];
    if (!statuses.includes(200) || !statuses.includes(400)) {
      throw new Error(`Double-spend check failed! Statuses should be [200, 400], got: [${res1.status}, ${res2.status}]`);
    }

    // Verify inventory is exactly 0
    const [parts] = await connection.query('SELECT quantity FROM inventory_parts WHERE sku = ?', [testPartSku]);
    console.log(`Final quantity of part ${testPartSku}: ${parts[0].quantity}`);
    if (parts[0].quantity !== 0) {
      throw new Error(`Expected final quantity to be 0, got ${parts[0].quantity}. Negative value or double deduction occurred!`);
    }
    console.log('✅ Double-spend prevented successfully. Only one request succeeded, inventory decremented accurately, and database locked records.');

    // Clean up test data
    await connection.query('DELETE FROM ae_requests WHERE id = ?', [testReqId]);
    await connection.query('DELETE FROM inventory_parts WHERE sku = ?', [testPartSku]);
    await connection.query('DELETE FROM categories WHERE id = ?', [testCatId]);
    console.log('🧹 Cleaned up test database records.');

    console.log('\n==========================================================');
    console.log('🎉 ALL SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==========================================================');

  } catch (err) {
    console.error('\n❌ Security verification failed:');
    console.error(err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runTests();
