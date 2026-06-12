#!/bin/bash

# Exit on error
set -e

# Helper logging functions
log_info() {
  echo -e "\e[34m[INFO]\e[0m $1"
}
log_success() {
  echo -e "\e[32m[SUCCESS]\e[0m $1"
}
log_warn() {
  echo -e "\e[33m[WARNING]\e[0m $1"
}
log_error() {
  echo -e "\e[31m[ERROR]\e[0m $1" >&2
}

echo "=========================================================="
echo "🚀 SuperBee Aeronautics - Inventory Management System"
echo "   Setup Script v1.4"
echo "=========================================================="
echo ""

# ─────────────────────────────────────────────────
# 1. Parse Options
# ─────────────────────────────────────────────────
NON_INTERACTIVE=false
AUTO_DB=false
AUTO_BUILD=false

for arg in "$@"; do
  case $arg in
    --non-interactive)
      NON_INTERACTIVE=true
      ;;
    --auto-db)
      AUTO_DB=true
      ;;
    --auto-build)
      AUTO_BUILD=true
      ;;
  esac
done

# ─────────────────────────────────────────────────
# 2. Environment Verification
# ─────────────────────────────────────────────────
log_info "Verifying OS and requirements..."

# Check if running on Ubuntu/Debian
OS_DISTRO="unknown"
if [ -f /etc/os-release ]; then
  OS_DISTRO=$(grep -E "^ID=" /etc/os-release | cut -d'=' -f2 | tr -d '"')
fi

log_info "Detected OS: $OS_DISTRO"

# Detect and install Node.js v22 LTS if missing
if ! command -v node >/dev/null 2>&1; then
  log_warn "Node.js is not installed!"
  if [ "$OS_DISTRO" = "ubuntu" ] || [ "$OS_DISTRO" = "debian" ]; then
    log_info "Running on Ubuntu/Debian. Attempting to install Node.js v22 LTS automatically..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
    sudo apt-get update
    sudo apt-get install nodejs -y
  else
    log_error "Please install Node.js v22+ manually from https://nodejs.org/"
    exit 1
  fi
fi

# Verify Node.js Version (>= v22.0.0)
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
  log_error "Node.js version v$NODE_VERSION detected. SBA-IMS requires Node.js v22.0.0 or higher."
  exit 1
else
  log_success "Node.js version v$NODE_VERSION verified (>= v22.0.0)."
fi

# Verify npm is available
if ! command -v npm >/dev/null 2>&1; then
  log_error "npm is not installed. Please install npm to proceed."
  exit 1
else
  log_success "npm version $(npm -v) detected."
fi

# Check Database Engines
log_info "Scanning for database services..."
MYSQL_FOUND=false
if command -v mysql >/dev/null 2>&1; then
  log_success "MySQL client detected: $(mysql --version | head -n 1)"
  MYSQL_FOUND=true
else
  log_warn "MySQL client is not installed. SBA-IMS requires MySQL 8.0."
fi

if command -v psql >/dev/null 2>&1; then
  log_success "PostgreSQL client detected: $(psql --version | head -n 1)"
else
  log_info "PostgreSQL client is not installed (Optional for SBA-IMS, MySQL is the primary DB)."
fi

if command -v docker >/dev/null 2>&1; then
  log_success "Docker engine detected: $(docker --version)"
else
  log_info "Docker is not installed (Optional: can be used for containerized DB services)."
fi

# ─────────────────────────────────────────────────
# 3. Install Dependencies
# ─────────────────────────────────────────────────
echo ""
log_info "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps

echo ""
log_info "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# ─────────────────────────────────────────────────
# 4. Backend Environment Configuration
# ─────────────────────────────────────────────────
echo ""
log_info "🔧 Configuring backend environment..."

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env

  # Generate secure random JWT and Session secrets (64 chars and 32 chars hex)
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

  log_success "backend/.env created with auto-generated JWT & session secrets."
  echo ""
  echo "  ⚠️  You MUST update the following database values in backend/.env:"
  echo "     • DB_HOST       → your database host (e.g., localhost)"
  echo "     • DB_USER       → your DB user (default: sba_app)"
  echo "     • DB_PASSWORD   → your DB user's password"
  echo "     • DB_NAME       → database name (default: superbee_inventory)"
  echo "     • CORS_ORIGIN   → frontend URL (e.g., http://localhost:5173)"
  echo "     • COOKIE_DOMAIN → domain host (e.g., localhost)"
else
  log_success "backend/.env already exists — skipping."
fi

# ─────────────────────────────────────────────────
# 5. Frontend Environment Configuration
# ─────────────────────────────────────────────────
echo ""
log_info "🔧 Configuring frontend environment..."

if [ ! -f .env ]; then
  if [ -f .env.production ]; then
    cp .env.production .env
    log_success ".env created from .env.production template."
  else
    echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
    log_success ".env created with default local API URL."
  fi
else
  log_success ".env already exists — skipping."
fi

# ─────────────────────────────────────────────────
# 6. Database Setup
# ─────────────────────────────────────────────────
echo ""
log_info "🗄️  Database Setup"
echo ""

db_choice=""
if [ "$NON_INTERACTIVE" = true ]; then
  if [ "$AUTO_DB" = true ]; then
    db_choice="1"
  else
    db_choice="2"
  fi
else
  echo "Choose an option:"
  echo "  1) Auto-setup database (runs schema + migrations + user seeder)"
  echo "  2) Skip (I will set up the database manually)"
  echo ""
  read -r -p "Enter choice [1/2]: " db_choice
fi

if [[ "$db_choice" == "1" ]]; then
  if [ "$MYSQL_FOUND" = false ]; then
    log_warn "MySQL client not detected! Attempting to run migrations anyway, but database connection may fail if server is not reachable."
  fi
  
  log_info "Running database setup script..."
  cd backend
  node scripts/setup-db.js

  log_info "Running Phase 4 database migrations..."
  node scripts/migrate-db-phase4.js

  log_info "Seeding database default users..."
  node scripts/init-users.js
  cd ..

  log_success "Database setup and seeding complete."
  echo "  ⚠️  Default credentials have been created:"
  echo "     • Admin:      ram@superbee.com / Superbee@123"
  echo "     • Technician: ae@superbee.com  / Superbee@123"
  echo "     Credentials saved to backend/.setup-credentials.txt"
else
  log_info "Skipping automatic database setup."
  echo "  Manual steps required:"
  echo "    1. Import schema: mysql -u root -p < backend-setup/database-schema.sql"
  echo "    2. Run migration script: cd backend && node scripts/migrate-db-phase4.js"
  echo "    3. Seed default users:   cd backend && node scripts/init-users.js"
fi

# ─────────────────────────────────────────────────
# 7. Build Frontend
# ─────────────────────────────────────────────────
echo ""
log_info "🏗️  Frontend Build"
echo ""

build_choice=""
if [ "$NON_INTERACTIVE" = true ]; then
  if [ "$AUTO_BUILD" = true ]; then
    build_choice="y"
  else
    build_choice="n"
  fi
else
  read -r -p "Build the production frontend bundle now? (y/n): " build_choice
fi

if [[ "$build_choice" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  log_info "Building frontend..."
  npm run build
  log_success "Production build created successfully in ./dist/"
else
  log_info "Skipping frontend build."
fi

echo ""
echo "=========================================================="
echo "🎉 Setup Complete — SBA-IMS v1.4"
echo "=========================================================="
echo "📌 Running the application:"
echo "   Backend Development:  cd backend && npm run dev"
echo "   Frontend Development:  npm run dev"
echo ""
echo "   Backend Production:   cd backend && NODE_ENV=production npm start"
echo "   Frontend Production:  Serve ./dist/ static bundle (via Nginx/Apache)"
echo "=========================================================="
echo ""
