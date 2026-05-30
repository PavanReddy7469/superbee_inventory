# 📋 Deployment Checklist for IT Department

**SuperBee Aeronautics - Inventory Management System**

**Date:** May 14, 2026  
**Version:** 1.0.0  
**Status:** Ready for Production Deployment

---

## ✅ Pre-Deployment Verification

### Application Files
- [x] All source code present
- [x] Dependencies listed in package.json
- [x] Database schema available
- [x] Configuration templates provided
- [x] Documentation complete

### System Requirements Met
- [ ] Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- [ ] Node.js v18.x or higher installed
- [ ] MySQL 8.0 installed and running
- [ ] Minimum 2GB RAM available
- [ ] 10GB storage available
- [ ] Ports 80, 443, 5000 available

---

## 📦 Files to Deploy

### Essential Files (Copy to Server)
```
✅ backend/                    # Backend API (entire folder)
✅ backend-setup/              # Database schema
✅ src/                        # Frontend source (for building)
✅ package.json                # Frontend dependencies
✅ package-lock.json           # Dependency lock file
✅ vite.config.ts              # Build configuration
✅ tsconfig.json               # TypeScript config
✅ tailwind.config.js          # Styling config
✅ postcss.config.js           # PostCSS config
✅ index.html                  # Entry point
✅ .env.production             # Frontend env template
✅ backend/.env.production     # Backend env template
```

### Documentation Files (For Reference)
```
✅ README.md                   # Project overview
✅ DEPLOYMENT_INSTRUCTIONS.md  # Complete deployment guide
✅ DEPLOYMENT_CHECKLIST.md     # This file
```

### Files NOT Needed (Already Removed)
```
❌ node_modules/              # Will be installed on server
❌ .bolt/                     # Development tool (removed)
❌ All other .md files        # Removed unnecessary docs
```

---

## 🗄️ Database Setup

### Step 1: Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE superbee_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
- [ ] Database created successfully

### Step 2: Create Database User
```sql
CREATE USER 'superbee_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON superbee_inventory.* TO 'superbee_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
- [ ] User created with secure password
- [ ] Password documented securely
- [ ] Privileges granted

### Step 3: Load Database Schema
```bash
mysql -u superbee_user -p superbee_inventory < backend-setup/database-schema.sql
```
- [ ] Schema loaded without errors

### Step 4: Verify Tables
```bash
mysql -u superbee_user -p superbee_inventory -e "SHOW TABLES;"
```
Expected: 14 tables
- [ ] All 14 tables created
- [ ] Sample data loaded (3 roles, 8 categories, 5 drone types)

---

## 🖥️ Backend Deployment

### Step 1: Install Dependencies
```bash
cd backend
npm install --production
```
- [ ] Dependencies installed successfully
- [ ] No errors during installation

### Step 2: Configure Environment
Create `backend/.env` from `backend/.env.production`:
```bash
cp .env.production .env
nano .env
```

Update these values:
- [ ] `DB_PASSWORD` - Set secure password
- [ ] `CORS_ORIGIN` - Set to your domain (e.g., https://superbee.yourdomain.com)
- [ ] `DB_HOST` - Verify (localhost if same server)
- [ ] `JWT_SECRET` - Already set (do not change)

### Step 3: Initialize Default Users
```bash
node scripts/init-users.js
```
- [ ] Script executed successfully
- [ ] Default users created (ram@superbee.com, ae@superbee.com)

### Step 4: Install PM2
```bash
npm install -g pm2
```
- [ ] PM2 installed globally

### Step 5: Start Backend
```bash
pm2 start server.js --name superbee-backend
pm2 save
pm2 startup
```
- [ ] Backend started successfully
- [ ] PM2 configured for auto-restart
- [ ] Startup command executed

### Step 6: Verify Backend
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"OK","timestamp":"..."}`
- [ ] Health check passes
- [ ] No errors in logs: `pm2 logs superbee-backend`

---

## 🌐 Frontend Deployment

### Step 1: Configure Environment
Create `.env` from `.env.production`:
```bash
cp .env.production .env
nano .env
```

Update:
- [ ] `VITE_API_URL` - Set to backend URL (e.g., https://superbee.yourdomain.com/api)

### Step 2: Install Dependencies
```bash
npm install
```
- [ ] Dependencies installed successfully

### Step 3: Build Frontend
```bash
npm run build
```
- [ ] Build completed successfully
- [ ] `dist/` folder created
- [ ] No build errors

### Step 4: Deploy Files
```bash
# Create web directory
mkdir -p /var/www/superbee-frontend

# Copy built files
cp -r dist/* /var/www/superbee-frontend/

# Set permissions
chown -R www-data:www-data /var/www/superbee-frontend
```
- [ ] Files copied to web directory
- [ ] Permissions set correctly

---

## 🔧 Nginx Configuration

### Step 1: Install Nginx
```bash
apt install nginx  # Ubuntu/Debian
# or
yum install nginx  # CentOS/RHEL
```
- [ ] Nginx installed

### Step 2: Configure Backend Proxy
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
- [ ] Backend proxy configured
- [ ] Domain name updated

### Step 3: Configure Frontend
Create `/etc/nginx/sites-available/superbee-frontend`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/superbee-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```
- [ ] Frontend configuration created
- [ ] Domain name updated
- [ ] Root path correct

### Step 4: Enable Sites
```bash
ln -s /etc/nginx/sites-available/superbee-backend /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/superbee-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```
- [ ] Sites enabled
- [ ] Nginx configuration valid
- [ ] Nginx restarted successfully

---

## 🔒 SSL Configuration

### Option 1: Let's Encrypt (Free)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Auto-renewal configured

### Option 2: Organization Certificate
```bash
# Place certificate files
cp certificate.crt /etc/ssl/certs/
cp private.key /etc/ssl/private/

# Update Nginx configuration
ssl_certificate /etc/ssl/certs/certificate.crt;
ssl_certificate_key /etc/ssl/private/private.key;
```
- [ ] Certificate files placed
- [ ] Nginx configuration updated
- [ ] SSL working

---

## 🔥 Firewall Configuration

```bash
ufw allow 22     # SSH
ufw allow 80     # HTTP
ufw allow 443    # HTTPS
ufw enable
```
- [ ] Firewall rules configured
- [ ] SSH access maintained
- [ ] HTTP/HTTPS allowed
- [ ] Port 5000 NOT exposed (backend accessed via Nginx only)

---

## ✅ Post-Deployment Testing

### 1. Backend Health Check
```bash
curl https://your-domain.com/health
```
Expected: `{"status":"OK","timestamp":"..."}`
- [ ] Health check passes

### 2. Frontend Access
Open browser: `https://your-domain.com`
- [ ] Login page loads
- [ ] No console errors (F12)
- [ ] HTTPS working (green padlock)

### 3. Login Test
Credentials: `ram@superbee.com` / `123456`
- [ ] Login successful
- [ ] Redirects to dashboard
- [ ] Dashboard loads correctly

### 4. Inventory Test
- [ ] Can view inventory list
- [ ] Can add new item
- [ ] Can edit item
- [ ] Can delete item

### 5. User Management Test (Admin)
- [ ] Can view users
- [ ] Can create new user
- [ ] Can activate/deactivate user

### 6. AE Request Test
Login as: `ae@superbee.com` / `123456`
- [ ] Can add items to cart
- [ ] Can submit request
- [ ] Request appears in dashboard

Login as admin:
- [ ] Can see pending request
- [ ] Can approve request
- [ ] Inventory decrements automatically

### 7. API Test
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ram@superbee.com","password":"123456"}'
```
- [ ] Returns JWT token
- [ ] No errors

---

## 🔐 Security Checklist

### Passwords
- [ ] Database password is strong and secure
- [ ] Database password documented in secure location
- [ ] Default user passwords will be changed after handover

### Configuration
- [ ] JWT_SECRET is secure (already generated)
- [ ] CORS_ORIGIN matches frontend domain exactly
- [ ] NODE_ENV set to "production"
- [ ] No sensitive data in logs

### Network Security
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] Backend port 5000 not exposed externally
- [ ] Database port 3306 not exposed externally

### Access Control
- [ ] Only necessary ports open
- [ ] SSH access restricted (if applicable)
- [ ] Database accessible only from localhost
- [ ] File permissions set correctly

---

## 📊 Monitoring Setup

### PM2 Monitoring
```bash
pm2 monit
```
- [ ] PM2 monitoring accessible

### Log Locations
- Backend logs: `pm2 logs superbee-backend`
- Nginx access: `/var/log/nginx/access.log`
- Nginx error: `/var/log/nginx/error.log`
- MySQL error: `/var/log/mysql/error.log`

- [ ] Log locations documented
- [ ] Log rotation configured

### Backup Configuration
```bash
# Add to crontab
0 2 * * * mysqldump -u superbee_user -p'PASSWORD' superbee_inventory > /backups/superbee_$(date +\%Y\%m\%d).sql
```
- [ ] Daily backup scheduled
- [ ] Backup location configured
- [ ] Backup retention policy set

---

## 📝 Handover Information

### Application URLs
- **Frontend:** https://your-domain.com
- **Backend API:** https://your-domain.com/api
- **Health Check:** https://your-domain.com/health

### Default Credentials (TO BE CHANGED)
- **Admin:** ram@superbee.com / 123456
- **Technician:** ae@superbee.com / 123456

### Database Information
- **Host:** localhost
- **Port:** 3306
- **Database:** superbee_inventory
- **User:** superbee_user
- **Password:** [Documented securely]

### Important Commands
```bash
# Restart backend
pm2 restart superbee-backend

# View backend logs
pm2 logs superbee-backend

# Restart Nginx
systemctl restart nginx

# Backup database
mysqldump -u superbee_user -p superbee_inventory > backup.sql

# Check system status
pm2 status
systemctl status nginx
systemctl status mysql
```

### Support Contacts
- **Developer:** [Your contact]
- **IT Department:** [IT contact]
- **Database Admin:** [DBA contact]

---

## ✅ Final Verification

### All Systems Operational
- [ ] Backend running and healthy
- [ ] Frontend accessible
- [ ] Database connected
- [ ] SSL working
- [ ] All features tested
- [ ] No errors in logs
- [ ] Monitoring configured
- [ ] Backups scheduled

### Documentation Provided
- [ ] README.md (project overview)
- [ ] DEPLOYMENT_INSTRUCTIONS.md (detailed guide)
- [ ] DEPLOYMENT_CHECKLIST.md (this file)
- [ ] Database credentials documented
- [ ] Server access information provided

### Handover Complete
- [ ] Application deployed successfully
- [ ] All tests passed
- [ ] Documentation provided
- [ ] Credentials shared securely
- [ ] Support contact information provided
- [ ] User training scheduled (if applicable)

---

## 🎉 Deployment Complete!

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  
**Handed Over To:** _______________

**Status:** ✅ Production Ready and Operational

---

**For any issues or questions, refer to DEPLOYMENT_INSTRUCTIONS.md**

---

**Document Version:** 1.0  
**Last Updated:** May 14, 2026  
**Prepared For:** IT Department / System Administrators
