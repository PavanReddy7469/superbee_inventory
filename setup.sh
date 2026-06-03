#!/bin/bash

# Exit on error
set -e

echo "=========================================================="
echo "🚀 SuperBee Inventory System - Setup Script"
echo "=========================================================="

# 1. Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# 2. Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# 3. Create backend .env configuration if it doesn't exist
if [ ! -f backend/.env ]; then
  echo "📄 Creating backend/.env from template..."
  cp backend/.env.production backend/.env
  echo "⚠️  Please update 'backend/.env' with your local/target database credentials."
else
  echo "✅ backend/.env already exists."
fi

# 4. Database Setup
echo ""
echo "🗄️  Database Setup"
echo "Would you like to import the database schema into MySQL now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Enter MySQL Host (default: localhost):"
  read -r db_host
  db_host=${db_host:-localhost}

  echo "Enter MySQL Port (default: 3306):"
  read -r db_port
  db_port=${db_port:-3306}

  echo "Enter MySQL Username (default: root):"
  read -r db_user
  db_user=${db_user:-root}

  echo "Importing schema (you will be prompted for your MySQL password)..."
  mysql -h "$db_host" -P "$db_port" -u "$db_user" -p < backend-setup/database-schema.sql
  
  echo "✅ Database schema imported successfully!"
  
  # Initialize users
  echo "🔑 Initializing default users..."
  cd backend
  node scripts/init-users.js
  cd ..
  echo "✅ Default users initialized successfully!"
else
  echo "⏭️  Skipping database setup. Remember to load 'backend-setup/database-schema.sql' manually."
fi

echo ""
echo "=========================================================="
echo "🎉 Setup Completed Successfully!"
echo "=========================================================="
echo "To run the application locally:"
echo "  1. Start Backend: cd backend && npm run dev"
echo "  2. Start Frontend: npm run dev"
echo "=========================================================="
