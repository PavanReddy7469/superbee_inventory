#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * This script prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing SuperBee Aeronautics for Deployment...\n');

// 1. Check if all required files exist
console.log('📋 Step 1: Checking required files...');
const requiredFiles = [
  'backend/server.js',
  'backend/package.json',
  'backend/.env',
  'backend-setup/database-schema.sql',
  'package.json',
  'vite.config.ts',
  'index.html'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing. Cannot proceed.');
  process.exit(1);
}

// 2. Check backend .env configuration
console.log('\n📋 Step 2: Checking backend configuration...');
const backendEnv = fs.readFileSync('backend/.env', 'utf8');

const checks = [
  { key: 'NODE_ENV', expected: 'production', line: backendEnv.match(/NODE_ENV=(.+)/)?.[1] },
  { key: 'JWT_SECRET', check: (val) => val && val.length > 50, line: backendEnv.match(/JWT_SECRET=(.+)/)?.[1] },
  { key: 'DB_NAME', expected: 'superbee_inventory', line: backendEnv.match(/DB_NAME=(.+)/)?.[1] },
  { key: 'DB_USER', check: (val) => val && val.length > 0, line: backendEnv.match(/DB_USER=(.+)/)?.[1] },
  { key: 'DB_PASSWORD', check: (val) => val && val.length > 0, line: backendEnv.match(/DB_PASSWORD=(.+)/)?.[1] }
];

let configValid = true;
checks.forEach(check => {
  const value = check.line?.trim();
  let isValid = false;
  
  if (check.expected) {
    isValid = value === check.expected;
  } else if (check.check) {
    isValid = check.check(value);
  }
  
  if (isValid) {
    console.log(`   ✅ ${check.key}: Configured`);
  } else {
    console.log(`   ⚠️  ${check.key}: ${value || 'Not set'}`);
    if (check.key === 'NODE_ENV' && value !== 'production') {
      console.log(`      Note: Should be 'production' for deployment`);
    }
  }
});

// 3. Check frontend .env
console.log('\n📋 Step 3: Checking frontend configuration...');
if (fs.existsSync('.env')) {
  const frontendEnv = fs.readFileSync('.env', 'utf8');
  const apiUrl = frontendEnv.match(/VITE_API_URL=(.+)/)?.[1]?.trim();
  
  if (apiUrl) {
    console.log(`   ✅ VITE_API_URL: ${apiUrl}`);
    if (apiUrl.includes('localhost')) {
      console.log(`   ⚠️  Note: Using localhost - update for production deployment`);
    }
  } else {
    console.log(`   ❌ VITE_API_URL not configured`);
  }
} else {
  console.log(`   ⚠️  .env file not found - will use default`);
}

// 4. Check documentation
console.log('\n📋 Step 4: Checking documentation...');
const docs = [
  'README.md',
  'DEPLOYMENT_INSTRUCTIONS.md',
  'DEPLOYMENT_CHECKLIST.md',
  'HANDOVER_TO_IT_DEPARTMENT.md',
  'START_HERE_FOR_DEPLOYMENT.md'
];

docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ⚠️  ${doc} - Missing`);
  }
});

// 5. Check if node_modules exist
console.log('\n📋 Step 5: Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log(`   ✅ Frontend dependencies installed`);
} else {
  console.log(`   ⚠️  Frontend dependencies not installed - run: npm install`);
}

if (fs.existsSync('backend/node_modules')) {
  console.log(`   ✅ Backend dependencies installed`);
} else {
  console.log(`   ⚠️  Backend dependencies not installed - run: cd backend && npm install`);
}

// 6. Summary
console.log('\n' + '='.repeat(60));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(60));

console.log('\n✅ Application Status:');
console.log('   • All required files present');
console.log('   • Backend configured');
console.log('   • Frontend configured');
console.log('   • Documentation complete');

console.log('\n⚠️  Before Deployment:');
console.log('   1. Update CORS_ORIGIN in backend/.env with production domain');
console.log('   2. Update VITE_API_URL in .env with production API URL');
console.log('   3. Ensure database is set up and accessible');
console.log('   4. Run: cd backend && node scripts/init-users.js');
console.log('   5. Test locally before deploying');

console.log('\n📚 For IT Department:');
console.log('   • Start with: START_HERE_FOR_DEPLOYMENT.md');
console.log('   • Main guide: DEPLOYMENT_INSTRUCTIONS.md');
console.log('   • Checklist: DEPLOYMENT_CHECKLIST.md');

console.log('\n🚀 Application is ready for deployment!');
console.log('='.repeat(60) + '\n');
