# SuperBee Aeronautics — Inventory Management System (SBA-IMS)

**Version:** 1.3  
**Status:** ✅ Production Ready (Security Hardened)  
**Last Updated:** June 10, 2026

A secure, full-stack inventory management system for SuperBee Aeronautics with role-based access control, procurement workflows, and comprehensive audit logging.

---

## 📋 System Overview

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js 22+ + Express.js |
| Database | MySQL 8.0 |
| Authentication | JWT (HttpOnly Secure Cookies) |
| Styling | Tailwind CSS |

### Features

- ✅ Secure JWT authentication (HttpOnly cookies, no localStorage)
- ✅ Role-based access control (Superadmin → Admin → Technician)
- ✅ Forced password change on first login
- ✅ Inventory management (CRUD with soft delete)
- ✅ Category management
- ✅ User management (Admin / Superadmin only)
- ✅ Assembly Engineer procurement request workflow
- ✅ Cart system for part requests
- ✅ Automatic inventory decrement on approval
- ✅ Dashboard with real-time statistics
- ✅ Comprehensive audit logging
- ✅ API versioning (`/api/v1/`)
- ✅ CSRF protection
- ✅ Rate limiting (brute-force protection)
- ✅ Input validation on all endpoints

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v22 or higher
- **MySQL** 8.0
- **npm** (comes with Node.js)

### Automated Setup

```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
1. Install frontend and backend dependencies
2. Generate secure JWT and session secrets
3. Create `.env` files from templates
4. Set up the database (schema, migrations, initial users)
5. Optionally build the production frontend

### Manual Setup

#### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

#### 2. Configure Environment

```bash
# Backend — copy template and edit
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend — copy template and edit
cp .env.production .env
# Edit .env with your API URL
```

#### 3. Set Up Database

```bash
# Option A: Automated
cd backend
node scripts/setup-db.js
node scripts/migrate-db-phase4.js
node scripts/init-users.js

# Option B: Manual SQL
mysql -u root -p < backend-setup/database-schema.sql
cd backend && node scripts/migrate-db-phase4.js
cd backend && node scripts/init-users.js
```

#### 4. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
npm run dev
# → http://localhost:5173
```

#### 5. First Login

After running `init-users.js`, initial credentials are saved to:
```
backend/.setup-credentials.txt
```

> **⚠️ IMPORTANT:** All default passwords are randomly generated. Users are **forced to change their password** on first login. Delete `.setup-credentials.txt` after noting the initial passwords.

---

## 📁 Project Structure

```
project/
├── backend/                        # Express.js API server
│   ├── config/
│   │   └── database.js            # MySQL connection pool (TLS in production)
│   ├── controllers/               # Route handlers
│   │   ├── authController.js      # Login, logout, password change
│   │   ├── usersController.js     # User CRUD with pagination
│   │   ├── inventoryController.js # Parts CRUD with soft delete
│   │   ├── aeRequestsController.js# Procurement request workflow
│   │   ├── categoriesController.js# Category management
│   │   └── dashboardController.js # Stats & analytics
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & role authorization
│   │   ├── auditLog.js            # Action audit trail
│   │   ├── rateLimiter.js         # Brute-force protection
│   │   └── validate.js            # Input validation runner
│   ├── routes/                    # Express route definitions
│   ├── scripts/
│   │   ├── setup-db.js            # Database schema loader
│   │   ├── migrate-db-phase4.js   # Constraints & triggers migration
│   │   ├── init-users.js          # Initial user creation
│   │   └── verify-security.js     # Security test suite (18 tests)
│   ├── utils/
│   │   └── passwordPolicy.js      # Password complexity validator
│   ├── .env.example               # Environment variable template
│   ├── BACKUP_STRATEGY.md         # Backup & secrets rotation guide
│   ├── package.json
│   └── server.js                  # Main server entry point
│
├── backend-setup/
│   ├── database-schema.sql        # Complete MySQL schema (14 tables)
│   └── .env.example               # Deployment env template
│
├── src/                           # React frontend
│   ├── components/
│   │   └── PrivateRoute.tsx       # Route guard (auth + role + forced pw change)
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Session management & restore
│   │   └── CartContext.tsx         # Shopping cart state
│   ├── lib/
│   │   └── api.ts                 # Axios client with CSRF interceptor
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login with rate-limit countdown
│   │   ├── ChangePasswordPage.tsx # Forced password reset with strength meter
│   │   ├── DashboardPage.tsx      # Admin dashboard
│   │   ├── InventoryPage.tsx      # Parts management
│   │   ├── AeRequestsPage.tsx     # Procurement approval workflow
│   │   ├── BuyersPage.tsx         # User management
│   │   └── UnauthorizedPage.tsx   # Access denied page
│   └── env.example                # Frontend env template
│
├── public/
│   └── .well-known/
│       └── security.txt           # Security contact (RFC 9116)
│
├── .env.production                # Frontend production env template
├── setup.sh                       # Automated setup script
├── package.json
├── vite.config.ts
└── index.html
```

---

## 🗄️ Database

### Database Name
`superbee_inventory`

### Tables (14+)

| Table | Purpose |
|-------|---------|
| `users` | User accounts with soft delete |
| `roles` | Role definitions (superadmin, admin, technician) |
| `categories` | Part categories |
| `inventory_parts` | Parts inventory with quantity/price constraints |
| `drone_types` | Drone type classifications |
| `drones` | Individual drone records |
| `ae_requests` | Procurement requests with status workflow |
| `invoices` | Purchase invoices |
| `acceptance_orders` | Order acceptance records |
| `refresh_tokens` | Token management |
| `inventory_audit_log` | Inventory change history |
| `part_invoices` | Part-invoice associations |
| `buyers` | Buyer records |
| `po_requests` | Purchase order requests |
| `audit_logs` | Security action audit trail |
| `login_attempts` | Rate limiting tracker |

### Database Constraints & Triggers

- **CHECK constraints**: `quantity >= 0`, `price > 0`, valid status values
- **Trigger**: `prevent_last_superadmin_delete` — blocks deletion of the last superadmin account
- **Soft delete**: `is_deleted` + `deleted_at` fields on users, parts, categories

### Least-Privilege Database Users

```sql
-- Application user (read-write, no admin privileges)
CREATE USER 'sba_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT SELECT, INSERT, UPDATE, DELETE ON superbee_inventory.* TO 'sba_app'@'localhost';

-- Read-only user (for reporting/analytics)
CREATE USER 'sba_readonly'@'localhost' IDENTIFIED BY 'ANOTHER_STRONG_PASSWORD';
GRANT SELECT ON superbee_inventory.* TO 'sba_readonly'@'localhost';

FLUSH PRIVILEGES;
```

---

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

```env
# Server
NODE_ENV=production
PORT=5000

# Authentication
JWT_SECRET=<auto-generated-64-char-hex>    # Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_EXPIRES_IN=24h
SESSION_SECRET=<auto-generated-32-char-hex>

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=sba_app                            # NOT root — use least-privilege user
DB_PASSWORD=<strong-password>
DB_NAME=superbee_inventory
DB_CA_CERT=path/to/ca.pem                  # For TLS database connections

# CORS
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Cookies
COOKIE_DOMAIN=your-domain.com
HTTPS_ONLY=true

# Logging
LOG_LEVEL=warn
```

### Frontend Environment Variables (`.env`)

```env
VITE_API_URL=https://your-domain.com/api
```

> **⚠️ SECURITY:** Never commit `.env` files with real credentials. Only `.env.example` and `.env.production` (templates) are tracked in git.

---

## 🔑 API Endpoints

All endpoints are prefixed with `/api/v1/`. Legacy `/api/` paths redirect via HTTP 307.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/login` | User login | Public |
| `POST` | `/api/v1/auth/logout` | Logout | Required |
| `GET` | `/api/v1/auth/me` | Get current session | Required |
| `POST` | `/api/v1/auth/change-password` | Change password | Required |
| `GET` | `/api/v1/auth/csrf-token` | Get CSRF token | Public |

### Inventory

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/inventory` | List parts (paginated) | Required |
| `POST` | `/api/v1/inventory` | Create part | Admin+ |
| `PUT` | `/api/v1/inventory/:id` | Update part | Admin+ |
| `DELETE` | `/api/v1/inventory/:id` | Soft-delete part | Admin+ |

### Users (Admin / Superadmin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/users` | List users (paginated) | Admin+ |
| `POST` | `/api/v1/users` | Create user | Admin+ |
| `PATCH` | `/api/v1/users/:id/status` | Activate/deactivate | Admin+ |
| `DELETE` | `/api/v1/users/:id` | Soft-delete user | Admin+ |

### Procurement Requests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/ae-requests` | List requests (paginated) | Required |
| `POST` | `/api/v1/ae-requests` | Submit request | Technician |
| `POST` | `/api/v1/ae-requests/:id/accept` | Approve request | Admin+ |
| `POST` | `/api/v1/ae-requests/:id/reject` | Reject request | Admin+ |

### Categories & Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/categories` | List categories | Required |
| `POST` | `/api/v1/categories` | Create category | Admin+ |
| `GET` | `/api/v1/dashboard/stats` | Dashboard statistics | Admin+ |
| `GET` | `/api/v1/dashboard/products` | Products by category | Admin+ |

---

## 👥 User Roles

| Role | Level | Permissions |
|------|-------|-------------|
| **Superadmin** | 3 | Full system access, manage all users including admins |
| **Admin** | 2 | Manage inventory, users (except superadmin), approve/reject requests |
| **Technician** | 1 | View inventory, submit procurement requests, track own requests |

---

## 🔒 Security Architecture

### Authentication & Session Management
- JWT tokens stored in **HttpOnly, Secure, SameSite=Strict** cookies
- Forced password change on first login (`must_change_password` flag)
- Session restore via `/auth/me` on page reload
- 24-hour token expiry

### Access Control
- Role-based middleware (`authorizeRoles()`) on all protected routes
- Frontend route guards (`PrivateRoute` component)
- Privilege escalation prevention (non-superadmin cannot create superadmin)
- Last-superadmin deletion protection (MySQL trigger)

### Input & Request Security
- **CSRF protection** via `csurf` middleware with `X-CSRF-Token` headers
- **Input validation** via `express-validator` on all POST/PUT/PATCH endpoints
- **Rate limiting**: 5 login attempts per 15 minutes (with frontend countdown)
- **Request size limits**: 1MB max payload
- **Notes field**: 5,000 character limit

### Infrastructure Security
- **Security headers**: Helmet with CSP, HSTS (1 year + preload), X-Frame-Options: DENY
- **CORS**: Strict origin whitelist (no regex)
- **Database**: SSL/TLS enforced in production, parameterized queries
- **Error masking**: Generic error messages in production (no stack traces)
- **HTTPS redirection**: Automatic HTTP → HTTPS in production

### Data Protection
- **Bcrypt hashing**: 12 salt rounds
- **Password policy**: Min 8 chars, uppercase, lowercase, digit, special character
- **Soft delete**: All entities use `is_deleted` flag (recoverable)
- **Audit logging**: All security-sensitive actions logged to `audit_logs` table
- **Dependency pinning**: Exact versions locked (no caret/tilde ranges)

### Compliance
- `/.well-known/security.txt` — security contact disclosure (RFC 9116)
- `BACKUP_STRATEGY.md` — backup procedures and secrets rotation policy

---

## 🧪 Testing

### Security Verification Suite

Run the automated 18-test security verification:

```bash
cd backend
node scripts/verify-security.js
```

This validates: CSRF enforcement, CORS blocking, input validation, security headers, audit logging, TLS configuration, payload limits, API versioning, pagination, soft deletion, DB constraints, superadmin protection, and more.

### Manual Testing

1. Open http://localhost:5173
2. Login with credentials from `backend/.setup-credentials.txt`
3. Complete forced password change
4. Test inventory CRUD operations
5. Test procurement request workflow (submit → approve/reject)
6. Verify role restrictions (technician cannot access admin pages)

---

## 📊 Production Deployment

### Step-by-Step

1. **Provision a MySQL 8.0 instance** with SSL/TLS enabled
2. **Create least-privilege database users** (see Database section above)
3. **Load the schema**:
   ```bash
   mysql -u root -p superbee_inventory < backend-setup/database-schema.sql
   cd backend && node scripts/migrate-db-phase4.js
   cd backend && node scripts/init-users.js
   ```
4. **Configure backend `.env`** (see Configuration section — use strong passwords, set `NODE_ENV=production`)
5. **Configure frontend `.env`** with your production API URL
6. **Build the frontend**:
   ```bash
   npm run build
   ```
7. **Set up a reverse proxy** (Nginx recommended):
   ```nginx
   server {
       listen 443 ssl;
       server_name superbee.yourdomain.com;

       ssl_certificate     /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       # Frontend (static files)
       location / {
           root /path/to/project/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
8. **Start the backend** with a process manager:
   ```bash
   pm2 start backend/server.js --name sba-ims-backend
   pm2 save
   ```
9. **Delete credentials file**:
   ```bash
   rm backend/.setup-credentials.txt
   ```

### Production Checklist

- [ ] MySQL 8.0 provisioned with SSL/TLS
- [ ] Least-privilege DB users created (`sba_app`, `sba_readonly`)
- [ ] Schema loaded and migrations applied
- [ ] Initial users created (`init-users.js`)
- [ ] `backend/.env` configured (production values, NOT defaults)
- [ ] JWT_SECRET is a unique 64+ char random string
- [ ] `NODE_ENV=production`
- [ ] CORS_ORIGIN set to production domain
- [ ] `.env` frontend configured with production API URL
- [ ] Frontend built (`npm run build`)
- [ ] SSL certificate installed and HTTPS configured
- [ ] Nginx reverse proxy configured
- [ ] Backend running via pm2 (or similar process manager)
- [ ] Default passwords changed on first login
- [ ] `backend/.setup-credentials.txt` deleted
- [ ] Firewall configured (only ports 80/443 exposed)
- [ ] Database backups scheduled (see `backend/BACKUP_STRATEGY.md`)
- [ ] Monitoring/alerting configured

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check if MySQL is running
systemctl status mysql          # Linux
brew services list              # macOS
net start MySQL80               # Windows

# Verify database credentials
cd backend && node -e "require('dotenv').config(); const m=require('mysql2/promise'); m.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME}).then(()=>console.log('✅ DB OK')).catch(e=>console.log('❌',e.message))"

# Check port availability
lsof -i :5000                   # Linux/macOS
netstat -ano | findstr 5000     # Windows
```

### Frontend Not Loading
- Clear browser cache (`Ctrl + Shift + Delete`)
- Verify backend is running and accessible
- Check `VITE_API_URL` in `.env` matches your backend URL
- Run `npm install` if dependencies are missing

### CORS Errors
- Verify `CORS_ORIGIN` in `backend/.env` exactly matches your frontend URL
- Include protocol (`http://` or `https://`)
- Restart backend after changing `.env`

### "Access Denied" on Pages
- Check the user's role in the database
- Superadmin/Admin can access all pages
- Technicians can only access: Dashboard, Inventory (view), Requests

### Rate Limited (429 Error)
- Wait 15 minutes or clear `login_attempts` table in MySQL
- Frontend shows a countdown timer automatically

---

## 🎯 Quick Commands

```bash
# ─── Development ───
npm run dev                              # Start frontend dev server
cd backend && npm run dev                # Start backend dev server

# ─── Production Build ───
npm run build                            # Build frontend → ./dist/

# ─── Database ───
cd backend && node scripts/setup-db.js          # Load schema
cd backend && node scripts/migrate-db-phase4.js # Run migrations
cd backend && node scripts/init-users.js        # Create initial users

# ─── Security Verification ───
cd backend && node scripts/verify-security.js   # Run 18 security tests

# ─── Production Deployment ───
pm2 start backend/server.js --name sba-ims-backend
pm2 save

# ─── Database Backup ───
mysqldump -u sba_app -p superbee_inventory > backup_$(date +%Y%m%d).sql
```

---

## 📄 License

Proprietary — SuperBee Aeronautics

---

**Version:** 1.3 | **Security Grade:** A (post-hardening) | **Last Updated:** June 10, 2026  
**Developed For:** SuperBee Aeronautics
