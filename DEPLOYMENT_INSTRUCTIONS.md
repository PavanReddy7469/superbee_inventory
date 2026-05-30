# SuperBee Aeronautics - Deployment Instructions

**For IT Department / System Administrators**

**Date:** May 14, 2026  
**Status:** Production Ready

---

## 📋 Overview

This is a complete inventory management system with:
- **Backend:** Node.js + Express + MySQL
- **Frontend:** React + TypeScript + Vite
- **Database:** MySQL 8.0

---

## 🔧 Server Requirements

### Minimum Requirements
- **OS:** Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- **Node.js:** v18.x or higher
- **MySQL:** 8.0 or higher
- **RAM:** 2GB minimum (4GB recommended)
- **Storage:** 10GB minimum
- **Ports:** 80, 443, 5000, 3306

### Software Dependencies
- Node.js & npm
- MySQL Server
- PM2 (process manager)
- Nginx (reverse proxy)
- SSL Certificate (Let's Encrypt or organization certificate)

---

## 📦 Deployment Files

### Essential Files (DO NOT DELETE)
```
backend/                    # Backend API server
├── config/                 # Database configuration
├── controllers/            # API logic
├── middleware/             # Authentication
├── routes/                 # API routes
├── scripts/                # Database initialization scripts
├── package.json            # Backend dependencies
└── server.js               # Main server file

backend-setup/              # Database setup
├── database-schema.sql     # Complete database schema

src/                        # Frontend application
├── components/             # React components
├── contexts/               # State management
├── lib/                    # API client
├── pages/                  # Application pages
└── utils/                  # Utilities

Configuration Files:
├── package.json            # Frontend dependencies
├── vite.config.ts          # Build configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Styling configuration
└── index.html              # Entry point
```

---

## 🗄️ Database Setup

### Step 1: Create Database
```sql
CREATE DATABASE superbee_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Create Database User
```sql
CREATE USER 'superbee_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON superbee_inventory.* TO 'superbee_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Load Schema
```bash
mysql -u superbee_user -p superbee_inventory < backend-setup/database-schema.sql
```

### Step 4: Verify Tables
```sql
USE superbee_inventory;
SHOW TABLES;
-- Should show 14 tables
```

---

## 🖥️ Backend Deployment

### Step 1: Install Dependencies
```bash
cd backend
npm install --production
```

### Step 2: Configure Environment
Create `backend/.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=superbee_user
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_NAME=superbee_inventory

# JWT Configuration (IMPORTANT: Already generated - use as is)
JWT_SECRET=zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-domain.com
```

### Step 3: Initialize Users
```bash
node scripts/init-users.js
```

This creates default users:
- **Admin:** ram@superbee.com / 123456
- **Technician:** ae@superbee.com / 123456

**IMPORTANT:** Change these passwords after first login!

### Step 4: Start Backend
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start server.js --name superbee-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 5: Verify Backend
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","timestamp":"..."}
```

---

## 🌐 Frontend Deployment

### Step 1: Configure Environment
Create `.env` file in root directory:
```env
VITE_API_URL=https://your-domain.com/api
```

**Note:** If backend is on same server, use: `https://your-domain.com/api`

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Frontend
```bash
npm run build
```

This creates a `dist/` folder with production-ready files.

### Step 4: Deploy Files
Copy `dist/` folder contents to web server directory:
```bash
# Example for Nginx
cp -r dist/* /var/www/superbee-frontend/
```

---

## 🔧 Nginx Configuration

### Backend Reverse Proxy
Create `/etc/nginx/sites-available/superbee-backend`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:5000/health;
    }
}
```

### Frontend Static Files
Create `/etc/nginx/sites-available/superbee-frontend`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/superbee-frontend;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Enable Sites
```bash
ln -s /etc/nginx/sites-available/superbee-backend /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/superbee-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🔒 SSL Configuration

### Using Let's Encrypt
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### Using Organization Certificate
Place certificate files and update Nginx configuration:
```nginx
ssl_certificate /path/to/certificate.crt;
ssl_certificate_key /path/to/private.key;
```

---

## 🔥 Firewall Configuration

```bash
# Allow necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

**Note:** Port 5000 (backend) should NOT be exposed externally. Access via Nginx reverse proxy only.

---

## ✅ Post-Deployment Verification

### 1. Backend Health Check
```bash
curl https://your-domain.com/health
# Expected: {"status":"OK","timestamp":"..."}
```

### 2. Frontend Access
Open browser: `https://your-domain.com`
- Should load login page
- No console errors (F12)

### 3. Login Test
- Email: `ram@superbee.com`
- Password: `123456`
- Should redirect to dashboard

### 4. API Test
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ram@superbee.com","password":"123456"}'
# Should return token
```

### 5. Database Connection
```bash
mysql -u superbee_user -p superbee_inventory -e "SELECT COUNT(*) FROM users;"
# Should show user count
```

---

## 🔧 Maintenance Commands

### Backend
```bash
# View logs
pm2 logs superbee-backend

# Restart backend
pm2 restart superbee-backend

# Stop backend
pm2 stop superbee-backend

# Check status
pm2 status
```

### Database
```bash
# Backup database
mysqldump -u superbee_user -p superbee_inventory > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u superbee_user -p superbee_inventory < backup_20260514.sql
```

### Nginx
```bash
# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# View logs
tail -f /var/log/nginx/error.log
```

---

## 🆘 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs superbee-backend

# Common issues:
# 1. Database connection failed - Check credentials in .env
# 2. Port already in use - Check: lsof -i :5000
# 3. Missing dependencies - Run: npm install
```

### Frontend Not Loading
```bash
# Check Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Verify files exist
ls -la /var/www/superbee-frontend/
```

### Database Connection Error
```bash
# Test database connection
mysql -u superbee_user -p superbee_inventory

# Check MySQL is running
systemctl status mysql

# Check user permissions
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='superbee_user';"
```

### CORS Errors
- Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL exactly
- No trailing slash in CORS_ORIGIN
- Restart backend after changing: `pm2 restart superbee-backend`

---

## 📊 System Monitoring

### Recommended Tools
- **PM2 Monitoring:** `pm2 monit`
- **Disk Space:** `df -h`
- **Memory Usage:** `free -h`
- **CPU Usage:** `top` or `htop`
- **Database Size:** 
  ```sql
  SELECT table_schema AS 'Database', 
         ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
  FROM information_schema.tables 
  WHERE table_schema='superbee_inventory';
  ```

---

## 🔐 Security Checklist

- [ ] Changed default user passwords
- [ ] Strong database password set
- [ ] JWT_SECRET is secure (already generated)
- [ ] HTTPS/SSL enabled
- [ ] Firewall configured
- [ ] Only necessary ports open
- [ ] Backend not directly accessible (only via Nginx)
- [ ] Database not accessible from outside
- [ ] Regular backups scheduled
- [ ] PM2 configured to restart on failure

---

## 📞 Support Information

### Default Credentials (CHANGE AFTER FIRST LOGIN)
- **Admin:** ram@superbee.com / 123456
- **Technician:** ae@superbee.com / 123456

### API Endpoints
- Health Check: `GET /health`
- Login: `POST /api/auth/login`
- Inventory: `GET /api/inventory`
- Full API documentation: 28 endpoints available

### Database
- **Name:** superbee_inventory
- **Tables:** 14 tables
- **Default Port:** 3306

---

## 📝 Important Notes

1. **JWT Secret:** Already generated and configured. Do not change unless necessary.
2. **Database Schema:** Complete schema is in `backend-setup/database-schema.sql`
3. **User Passwords:** Change default passwords immediately after deployment
4. **Backups:** Set up automated daily database backups
5. **Monitoring:** Monitor PM2 logs and Nginx logs regularly
6. **Updates:** Keep Node.js and MySQL updated with security patches

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Server meets minimum requirements
- [ ] MySQL installed and running
- [ ] Node.js v18+ installed
- [ ] Domain name configured
- [ ] SSL certificate ready

### Database Setup
- [ ] Database created
- [ ] User created with secure password
- [ ] Schema loaded successfully
- [ ] Default users initialized
- [ ] Tables verified (14 tables)

### Backend Deployment
- [ ] Dependencies installed
- [ ] .env file configured
- [ ] Backend started with PM2
- [ ] Health check passes
- [ ] PM2 configured for auto-restart

### Frontend Deployment
- [ ] .env file configured with API URL
- [ ] Build completed successfully
- [ ] Files copied to web directory
- [ ] Nginx configured
- [ ] Static files accessible

### Security
- [ ] HTTPS enabled
- [ ] Firewall configured
- [ ] Default passwords changed
- [ ] CORS configured correctly
- [ ] Security headers set

### Verification
- [ ] Frontend loads without errors
- [ ] Login works
- [ ] API calls successful
- [ ] Database queries work
- [ ] All features tested

---

## 🎯 Quick Start Commands

```bash
# 1. Setup Database
mysql -u root -p < backend-setup/database-schema.sql

# 2. Start Backend
cd backend
npm install --production
node scripts/init-users.js
pm2 start server.js --name superbee-backend
pm2 save

# 3. Build Frontend
cd ..
npm install
npm run build

# 4. Deploy Frontend
cp -r dist/* /var/www/superbee-frontend/

# 5. Configure Nginx
# (Copy configurations from above)
systemctl restart nginx

# 6. Verify
curl https://your-domain.com/health
```

---

**Deployment Ready:** ✅  
**Estimated Deployment Time:** 2-4 hours  
**Difficulty:** Medium  
**Support:** All necessary files and configurations included

---

**Document Version:** 1.0  
**Last Updated:** May 14, 2026  
**Prepared For:** IT Department / System Administrators
