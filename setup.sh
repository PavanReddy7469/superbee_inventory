#!/bin/bash

# Exit on error
set -e

echo "=========================================================="
echo "🚀 SuperBee Aeronautics - Inventory Management System"
echo "   Setup Script v1.3"
echo "=========================================================="
echo ""

# ─────────────────────────────────────────────────
# 1. Install Dependencies
# ─────────────────────────────────────────────────
echo "📦 [1/6] Installing frontend dependencies..."
npm install

echo ""
echo "📦 [2/6] Installing backend dependencies..."
cd backend
npm install
cd ..

# ─────────────────────────────────────────────────
# 2. Backend Environment Configuration
# ─────────────────────────────────────────────────
echo ""
echo "🔧 [3/6] Configuring backend environment..."

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env

  # Generate a secure random JWT secret (64 chars hex)
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

  # Replace placeholder secrets in .env
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed
    sed -i '' "s|generate_64_char_random_string|${JWT_SECRET}|g" backend/.env
    sed -i '' "s|generate_32_char_random_string|${SESSION_SECRET}|g" backend/.env
  else
    # Linux sed
    sed -i "s|generate_64_char_random_string|${JWT_SECRET}|g" backend/.env
    sed -i "s|generate_32_char_random_string|${SESSION_SECRET}|g" backend/.env
  fi

  echo "  ✅ backend/.env created with auto-generated JWT & session secrets."
  echo ""
  echo "  ⚠️  You MUST update the following values in backend/.env:"
  echo "     • DB_HOST       → your MySQL host"
  echo "     • DB_USER       → least-privilege DB user (NOT root)"
  echo "     • DB_PASSWORD   → strong database password"
  echo "     • DB_NAME       → your database name (default: superbee_ims)"
  echo "     • CORS_ORIGIN   → your frontend domain (e.g., https://superbee.yourdomain.com)"
  echo "     • COOKIE_DOMAIN → your domain (e.g., yourdomain.com)"
else
  echo "  ✅ backend/.env already exists — skipping."
fi

# ─────────────────────────────────────────────────
# 3. Frontend Environment Configuration
# ─────────────────────────────────────────────────
echo ""
echo "🔧 [4/6] Configuring frontend environment..."

if [ ! -f .env ]; then
  if [ -f .env.production ]; then
    cp .env.production .env
    echo "  ✅ .env created from .env.production template."
  else
    echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
    echo "  ✅ .env created with default local API URL."
  fi
  echo "  ⚠️  For production, update VITE_API_URL to your backend URL (e.g., https://api.superbee.com/api)"
else
  echo "  ✅ .env already exists — skipping."
fi

# ─────────────────────────────────────────────────
# 4. Database Setup
# ─────────────────────────────────────────────────
echo ""
echo "🗄️  [5/6] Database Setup"
echo ""
echo "Choose an option:"
echo "  1) Auto-setup database (runs schema + migrations via Node.js)"
echo "  2) Skip (I will set up the database manually)"
echo ""
read -r -p "Enter choice [1/2]: " db_choice

if [[ "$db_choice" == "1" ]]; then
  echo ""
  echo "  Running database setup script..."
  cd backend
  node scripts/setup-db.js

  echo ""
  echo "  Running Phase 4 migration (constraints & triggers)..."
  node scripts/migrate-db-phase4.js

  echo ""
  echo "  Initializing default users..."
  node scripts/init-users.js
  cd ..

  echo ""
  echo "  ✅ Database setup complete."
  echo "  ⚠️  Default user passwords are randomly generated."
  echo "     Check backend/.setup-credentials.txt for initial credentials."
  echo "     Users will be forced to change passwords on first login."
else
  echo ""
  echo "  ⏭️  Skipping automatic database setup."
  echo "  Manual steps required:"
  echo "    1. Create database: mysql -u root -p < backend-setup/database-schema.sql"
  echo "    2. Run migrations: cd backend && node scripts/migrate-db-phase4.js"
  echo "    3. Create users:   cd backend && node scripts/init-users.js"
fi

# ─────────────────────────────────────────────────
# 5. Build Frontend (Optional)
# ─────────────────────────────────────────────────
echo ""
echo "🏗️  [6/6] Frontend Build"
echo ""
read -r -p "Build the production frontend bundle now? (y/n): " build_choice

if [[ "$build_choice" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "  Building frontend..."
  npm run build
  echo "  ✅ Production build created in ./dist/"
else
  echo "  ⏭️  Skipping frontend build."
  echo "  Run 'npm run build' later to create the production bundle."
fi

# ─────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────
echo ""
echo "=========================================================="
echo "🎉 Setup Complete — SBA-IMS v1.3"
echo "=========================================================="
echo ""
echo "📌 Development Mode:"
echo "   Backend:   cd backend && npm run dev"
echo "   Frontend:  npm run dev"
echo ""
echo "📌 Production Mode:"
echo "   Backend:   cd backend && NODE_ENV=production npm start"
echo "   Frontend:  Deploy ./dist/ via Nginx or similar"
echo ""
echo "🔒 Security Reminders:"
echo "   • Change default user passwords on first login"
echo "   • Delete backend/.setup-credentials.txt after noting passwords"
echo "   • Use HTTPS in production (configure SSL/TLS certificates)"
echo "   • Set CORS_ORIGIN to your actual production domain"
echo "   • Create a least-privilege MySQL user (not root)"
echo "   • Review backend/BACKUP_STRATEGY.md for backup procedures"
echo "   • Rotate JWT_SECRET and DB_PASSWORD every 90 days"
echo "=========================================================="
