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
  node backend/scripts/setup-db.js
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
