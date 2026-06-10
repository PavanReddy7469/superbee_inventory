const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load env variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

let csrfToken = '';
let csrfCookie = '';

async function secureFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.headers['Origin'] = 'http://localhost:5173';
  
  // Attach CSRF header for state-modifying requests
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    if (csrfToken) {
      options.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // Combine cookies (JWT authToken and CSRF _csrf)
  const cookieList = [];
  if (options.cookie) {
    cookieList.push(options.cookie);
  }
  if (csrfCookie) {
    cookieList.push(csrfCookie);
  }
  if (cookieList.length > 0) {
    options.headers['Cookie'] = cookieList.join('; ');
  }

  return fetch(url, options);
}

async function runTests() {
  console.log('==========================================================');
  console.log('🛡️  SBA-IMS Phase 2 Hardening Verification Suite');
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

  let adminEmail = '';
  let adminPassword = '';
  let techEmail = '';
  let techPassword = '';

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

    adminEmail = adminMatch[1];
    adminPassword = adminMatch[2];
    techEmail = techMatch[1];
    techPassword = techMatch[2];

    // Reset login attempts before starting tests
    await connection.query('DELETE FROM login_attempts');
    await connection.query('DELETE FROM audit_logs');
    console.log('🧹 Cleaned up existing login_attempts and audit_logs.');

    // Upgrade ram to superadmin temporarily so we can create users in tests
    await connection.query("UPDATE users SET role_id = 'role-003' WHERE email = ?", [adminEmail]);
    console.log('⚡ Temporarily upgraded admin to superadmin role.');

    // ----------------------------------------------------
    // INITIALIZATION: CSRF Token Fetching
    // ----------------------------------------------------
    console.log('\n--- INITIALIZATION: CSRF Token Fetching ---');
    const csrfRes = await fetch(`${BASE_URL}/auth/csrf-token`, {
      headers: { 'Origin': 'http://localhost:5173' }
    });
    if (csrfRes.status !== 200) {
      throw new Error(`Failed to fetch CSRF token: ${csrfRes.status}`);
    }
    const csrfData = await csrfRes.json();
    csrfToken = csrfData.csrfToken;

    const csrfSetCookie = csrfRes.headers.get('set-cookie');
    if (csrfSetCookie) {
      const match = csrfSetCookie.match(/_csrf=([^;]+)/);
      if (match) {
        csrfCookie = match[0];
      }
    }
    console.log('✅ CSRF token and cookie loaded successfully.');

    // ----------------------------------------------------
    // TEST 1: Login and Secure Cookie Issuance
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Login and Secure Cookie Issuance ---');
    const loginRes = await secureFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    console.log('Response body:', JSON.stringify(loginData, null, 2));

    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie || !setCookie.includes('authToken=')) {
      throw new Error('No authToken cookie found in response headers.');
    }
    console.log('Raw set-cookie header:', setCookie);

    const adminTokenMatch = setCookie.match(/authToken=([^;]+)/);
    const adminCookie = adminTokenMatch ? adminTokenMatch[0] : '';
    console.log('✅ Login cookie issued successfully.');

    // ----------------------------------------------------
    // TEST 2: CSRF Validation Enforcement
    // ----------------------------------------------------
    console.log('\n--- TEST 2: CSRF Validation Enforcement ---');
    // POST request without CSRF token should return 403 Forbidden
    const noCsrfRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    console.log('POST without CSRF status:', noCsrfRes.status);
    if (noCsrfRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden without CSRF token, got ${noCsrfRes.status}`);
    }
    console.log('✅ CSRF validation blocked request successfully (403).');

    // ----------------------------------------------------
    // TEST 3: CORS Whitelist Rejections
    // ----------------------------------------------------
    console.log('\n--- TEST 3: CORS Whitelist Rejections ---');
    // Request with unwhitelisted origin should be blocked
    const corsRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://malicioussite.com',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    console.log('CORS with malicious origin status:', corsRes.status);
    if (corsRes.status !== 500) { // CORS plugin throws error, handled as 500
      throw new Error(`Expected CORS failure block, got status ${corsRes.status}`);
    }
    console.log('✅ Unwhitelisted CORS origin rejected successfully.');

    // ----------------------------------------------------
    // TEST 4: Input Validation (Fix-07)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Input Validation ---');
    
    // Check user registration with a weak password (returns HTTP 400)
    console.log('Testing user creation with weak password "123"...');
    const weakPwdRes = await secureFetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cookie: adminCookie,
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'test-weak-pwd@superbee.com',
        password: '123',
        mobile_number: '+12345678901',
        employee_id: 'EMP321',
        role_name: 'technician'
      })
    });
    console.log('Weak password registration status:', weakPwdRes.status);
    if (weakPwdRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${weakPwdRes.status}`);
    }
    const weakPwdData = await weakPwdRes.json();
    console.log('Weak password response details:', JSON.stringify(weakPwdData));
    console.log('✅ Weak password rejected correctly (400).');

    // Check AE requests validation (negative quantity returns HTTP 400)
    console.log('Testing AE request with negative quantity...');
    const invalidQtyRes = await secureFetch(`${BASE_URL}/ae-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cookie: adminCookie,
      body: JSON.stringify({
        drone_number: 'Drone-XYZ',
        uin_number: 'UIN-XYZ',
        requested_by: 'Test Tech',
        email: 'ae@superbee.com',
        items: [{ part_id: 'sku-test-001', quantity: -5 }]
      })
    });
    console.log('Negative quantity AE request status:', invalidQtyRes.status);
    if (invalidQtyRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${invalidQtyRes.status}`);
    }
    const invalidQtyData = await invalidQtyRes.json();
    console.log('Negative quantity response details:', JSON.stringify(invalidQtyData));
    console.log('✅ Negative quantity AE request rejected correctly (400).');

    // ----------------------------------------------------
    // TEST 5: Security Response Headers (Fix-08)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Security Response Headers ---');
    const healthRes = await secureFetch(`${BASE_URL}/auth/me`, {
      cookie: adminCookie
    });
    
    const cspHeader = healthRes.headers.get('content-security-policy');
    const hstsHeader = healthRes.headers.get('strict-transport-security');
    const xFrameHeader = healthRes.headers.get('x-frame-options');

    console.log('Content-Security-Policy:', cspHeader);
    console.log('Strict-Transport-Security:', hstsHeader);
    console.log('X-Frame-Options:', xFrameHeader);

    if (!cspHeader) {
      throw new Error('Response headers missing Content-Security-Policy.');
    }
    console.log('✅ Response headers include Content-Security-Policy.');

    if (!hstsHeader) {
      throw new Error('Response headers missing Strict-Transport-Security.');
    }
    console.log('✅ Response headers include Strict-Transport-Security.');

    if (xFrameHeader !== 'DENY') {
      throw new Error(`Expected X-Frame-Options: DENY, got: ${xFrameHeader}`);
    }
    console.log('✅ Response headers include X-Frame-Options: DENY.');

    // ----------------------------------------------------
    // TEST 6: Audit Logging Verification (Fix-09)
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Audit Logging Verification ---');
    
    // Create a valid user
    const uniqueId = Date.now();
    const newUserEmail = `test-user-${uniqueId}@superbee.com`;
    const newUserEmpId = `EMP${uniqueId}`;
    
    console.log(`Creating valid user ${newUserEmail}...`);
    const validUserRes = await secureFetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cookie: adminCookie,
      body: JSON.stringify({
        name: 'Valid User',
        email: newUserEmail,
        password: 'Password@1234',
        mobile_number: '+12345678901',
        employee_id: newUserEmpId,
        role_name: 'technician'
      })
    });
    if (validUserRes.status !== 201) {
      const errBody = await validUserRes.json();
      throw new Error(`Valid user creation failed: ${JSON.stringify(errBody)}`);
    }

    // Verify audit logs table contains CREATE_USER entry
    const [userAuditLogs] = await connection.query(
      "SELECT * FROM audit_logs WHERE action = 'CREATE_USER' ORDER BY timestamp DESC LIMIT 1"
    );
    if (userAuditLogs.length === 0) {
      throw new Error('Audit logs table is missing CREATE_USER entry.');
    }
    console.log('✅ CREATE_USER audit log verified:', userAuditLogs[0].description);

    // Create and approve an AE request to verify APPROVE_AE_REQUEST log entry
    // Setup part
    const testCatId = 'cat-test-888';
    const testPartSku = 'sku-test-888';
    const testReqId = 'req-test-888';
    await connection.query('DELETE FROM ae_requests WHERE id = ?', [testReqId]);
    await connection.query('DELETE FROM inventory_parts WHERE sku = ?', [testPartSku]);
    await connection.query('DELETE FROM categories WHERE id = ?', [testCatId]);

    await connection.query(`INSERT INTO categories (id, name, status) VALUES (?, 'Test Cat', 'active')`, [testCatId]);
    await connection.query(`INSERT INTO inventory_parts (id, sku, name, category_id, quantity, price, status) VALUES (?, ?, 'Part X', ?, 10, 1.00, 'active')`, ['part-test-888', testPartSku, testCatId]);
    
    const requestItems = [{ part_id: testPartSku, quantity: 1 }];
    await connection.query(
      `INSERT INTO ae_requests (id, drone_number, uin_number, requested_by, email, items, status)
       VALUES (?, 'Drone-1', 'UIN-1', 'Test Tech', ?, ?, 'pending')`,
      [testReqId, techEmail, JSON.stringify(requestItems)]
    );

    // Approve request
    console.log('Approving AE Request to trigger APPROVE_AE_REQUEST audit log...');
    const approveRes = await secureFetch(`${BASE_URL}/ae-requests/${testReqId}/accept`, {
      method: 'POST',
      cookie: adminCookie
    });
    if (approveRes.status !== 200) {
      throw new Error(`Approval failed with status ${approveRes.status}`);
    }

    // Verify audit logs contains APPROVE_AE_REQUEST entry
    const [approveAuditLogs] = await connection.query(
      "SELECT * FROM audit_logs WHERE action = 'APPROVE_AE_REQUEST' ORDER BY timestamp DESC LIMIT 1"
    );
    if (approveAuditLogs.length === 0) {
      throw new Error('Audit logs table is missing APPROVE_AE_REQUEST entry.');
    }
    console.log('✅ APPROVE_AE_REQUEST audit log verified:', approveAuditLogs[0].description);

    // Clean up valid user and test request
    await connection.query('DELETE FROM users WHERE email = ?', [newUserEmail]);
    await connection.query('DELETE FROM ae_requests WHERE id = ?', [testReqId]);
    await connection.query('DELETE FROM inventory_parts WHERE sku = ?', [testPartSku]);
    await connection.query('DELETE FROM categories WHERE id = ?', [testCatId]);

    // ----------------------------------------------------
    // TEST 7: DB Connection TLS Enforcement (Fix-10)
    // ----------------------------------------------------
    console.log('\n--- TEST 7: DB Connection TLS Enforcement ---');
    // Clear require cache for db configuration and test SSL parameters
    delete require.cache[require.resolve('../config/database')];
    process.env.NODE_ENV = 'production';
    const prodDb = require('../config/database');
    const sslConfig = prodDb.pool.config?.connectionConfig?.ssl;
    
    if (!sslConfig || sslConfig.rejectUnauthorized !== true) {
      throw new Error(`Database connection does not enforce SSL/TLS rejectUnauthorized in production.`);
    }
    console.log('✅ Database config correctly enforces TLS rejectUnauthorized in production.');
    
    // Restore dev configuration
    process.env.NODE_ENV = 'development';
    delete require.cache[require.resolve('../config/database')];

    // ----------------------------------------------------
    // TEST 8: Error Message Leak Mitigations (Fix-14)
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Error Message Leak Mitigations ---');
    // Hitting trigger-error route should return masked generic error or raw stack depending on server mode
    const errorRes = await secureFetch(`${BASE_URL}/trigger-error`);
    const errorData = await errorRes.json();
    console.log('Error endpoint response:', errorData);

    if (errorData.error === 'An internal error occurred.') {
      if (errorData.stack) {
        throw new Error('Error response leaked stack trace in production mode.');
      }
      console.log('✅ Production error masking verified successfully (no stacks or internal details leaked).');
    } else if (errorData.error === 'Internal Database Crash Mock') {
      if (!errorData.stack) {
        throw new Error('Expected stack trace to be present in development mode.');
      }
      console.log('✅ Development error response verified successfully (stack trace is present as expected).');
    } else {
      throw new Error(`Unexpected error message: ${errorData.error}`);
    }

    // Downgrade ram back to admin role
    await connection.query("UPDATE users SET role_id = 'role-001' WHERE email = ?", [adminEmail]);
    console.log('⚡ Restored admin user role.');

    console.log('\n==========================================================');
    console.log('🎉 ALL PHASE 2 SECURITY VERIFICATION TESTS PASSED!');
    console.log('==========================================================');

  } catch (err) {
    // Restore admin user role if upgraded
    await connection.query("UPDATE users SET role_id = 'role-001' WHERE email = ?", [adminEmail]).catch(() => {});
    console.error('\n❌ Security verification failed:');
    console.error(err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runTests();
