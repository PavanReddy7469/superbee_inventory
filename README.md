# SuperBee Aeronautics - Inventory Management System

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Date:** May 14, 2026

A complete inventory management system for SuperBee Aeronautics with MySQL backend and React frontend.

---

## 📋 System Overview

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Tailwind CSS

### Features
- ✅ User Authentication & Authorization
- ✅ Inventory Management (CRUD operations)
- ✅ Category Management
- ✅ User Management (Admin only)
- ✅ Assembly Engineer Request Workflow
- ✅ Dashboard with Real-time Statistics
- ✅ Cart System for Part Requests
- ✅ Automatic Inventory Decrement on Approval
- ✅ Role-based Access Control

---

## 🚀 Local & Server Deployment

This repository is ready for local running and hosting on your organization's servers.

- **Local Preview**: Fully configured to connect to your local MySQL database.
- **Server Deployment**: Ready for deployment on your private servers (such as Nginx proxying to the Node.js backend).

---

## 🏠 For Local Development

### Prerequisites
- Node.js v18 or higher
- MySQL 8.0
- npm or yarn

### Quick Start

#### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend runs on: **http://localhost:5000**

#### 2. Start Frontend Server
```bash
npm install
npm run dev
```
Frontend runs on: **http://localhost:5173**

#### 3. Login Credentials
- **Admin:** ram@superbee.com / 123456
- **Technician:** ae@superbee.com / 123456

**⚠️ IMPORTANT:** Change these passwords after deployment!

---

## 📁 Project Structure

```
project/
├── backend/                    # Backend API
│   ├── config/                # Database configuration
│   ├── controllers/           # API controllers
│   ├── middleware/            # Authentication middleware
│   ├── routes/                # API routes
│   ├── scripts/               # Database scripts
│   │   ├── init-users.js     # Initialize default users
│   │   └── update-ae-requests.js
│   ├── .env                   # Environment variables (create this)
│   ├── package.json           # Backend dependencies
│   └── server.js              # Main server file
│
├── backend-setup/             # Database setup
│   └── database-schema.sql    # Complete database schema
│
├── src/                       # Frontend application
│   ├── components/            # Reusable components
│   ├── contexts/              # React contexts (Auth, Cart)
│   ├── lib/                   # API client & utilities
│   ├── pages/                 # Application pages
│   └── utils/                 # Utility functions
│
├── .env                       # Frontend environment variables
├── package.json               # Frontend dependencies
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── index.html                 # Entry point
```

---

## 🗄️ Database

### Database Name
`superbee_inventory`

### Tables (14)
- users
- roles
- categories
- inventory_parts
- drone_types
- drones
- ae_requests
- invoices
- acceptance_orders
- refresh_tokens
- inventory_audit_log
- part_invoices
- buyers
- po_requests

### Setup Database
```bash
# Create database and user
mysql -u root -p

CREATE DATABASE superbee_inventory;
CREATE USER 'superbee_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON superbee_inventory.* TO 'superbee_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Load schema
mysql -u superbee_user -p superbee_inventory < backend-setup/database-schema.sql

# Initialize users
cd backend
node scripts/init-users.js
```

---

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=superbee_user
DB_PASSWORD=your_password
DB_NAME=superbee_inventory
JWT_SECRET=zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables
Create `.env` in root:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout

### Inventory
- `GET /api/inventory` - Get all parts
- `POST /api/inventory` - Create part
- `PUT /api/inventory/:id` - Update part
- `DELETE /api/inventory/:id` - Delete part

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### AE Requests
- `GET /api/ae-requests` - Get all requests
- `POST /api/ae-requests` - Create request
- `POST /api/ae-requests/:id/accept` - Accept request
- `POST /api/ae-requests/:id/reject` - Reject request

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/products` - Get products by category

**Total:** 28 API endpoints

---

## 👥 User Roles

### 1. Superadmin / Admin
- Full system access
- Manage inventory
- Manage users
- Approve/reject requests
- View all statistics

### 2. Technician (Assembly Engineer)
- View inventory
- Submit part requests
- View own requests
- Track request status

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Protected API routes
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Token expiration handling
- ✅ Role-based access control

---

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ram@superbee.com","password":"123456"}'
```

### Test Frontend
1. Open http://localhost:5173
2. Login with test credentials
3. Navigate through all pages
4. Test inventory operations
5. Test request workflow

---

## 🐛 Troubleshooting

### Backend Not Starting
- Check if MySQL is running: `systemctl status mysql`
- Verify database credentials in `backend/.env`
- Check if port 5000 is available: `lsof -i :5000`
- Run `npm install` in backend folder

### Frontend Not Loading
- Clear browser cache (Ctrl + Shift + Delete)
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Run `npm install` in root folder

### Database Connection Error
- Verify MySQL is running
- Check database exists: `SHOW DATABASES;`
- Check user permissions
- Verify credentials in `backend/.env`

### CORS Errors
- Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
- Restart backend after changing environment variables

---

## 📊 Production Deployment

To run this application in a production environment:
1. Ensure your local MySQL database has the schema loaded from `backend-setup/database-schema.sql`.
2. Populate the default users by running `node scripts/init-users.js` inside the `backend` folder.
3. Configure `backend/.env` with your secure database passwords, port, and correct CORS domain.
4. Run `npm run build` at the root of the project to create the production frontend bundle in the `dist` directory.
5. Serve the frontend using a web server (like Nginx) and keep the backend Node server active using a process manager like `pm2`.

---

## 📝 Important Notes

### Default Credentials
**⚠️ CHANGE THESE AFTER DEPLOYMENT:**
- Admin: ram@superbee.com / 123456
- Technician: ae@superbee.com / 123456

### JWT Secret
The JWT secret is already generated and configured:
```
zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly
```
Do not change unless necessary.

### Database Backups
Set up automated daily backups:
```bash
mysqldump -u superbee_user -p superbee_inventory > backup_$(date +%Y%m%d).sql
```

---

## 📞 Support

### For Deployment/Running Issues
- Review backend node process logs
- Verify database configuration in `backend/.env`
- Check firewall settings and port 5000 access

### For Development Issues
- Check browser console (F12)
- Review backend logs
- Verify database connection
- Check API endpoints

---

## ✅ Production Checklist

Before deploying to production:
- [ ] Database created and schema loaded
- [ ] Default users initialized
- [ ] Environment variables configured
- [ ] Backend tested and running
- [ ] Frontend built successfully
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Default passwords changed
- [ ] Backups scheduled
- [ ] Monitoring set up

---

## 📄 License

Proprietary - SuperBee Aeronautics

---

## 🎯 Quick Commands

```bash
# Start development
npm run dev                    # Frontend
cd backend && npm run dev      # Backend

# Build for production
npm run build                  # Creates dist/ folder

# Database setup
mysql -u root -p < backend-setup/database-schema.sql
cd backend && node scripts/init-users.js

# Production deployment
pm2 start backend/server.js --name superbee-backend
pm2 save
```

---

**Application Status:** ✅ Production Ready  
**Last Updated:** May 14, 2026  
**Version:** 1.0.0  
**Developed For:** SuperBee Aeronautics

---

**Deploy ready on your private organization servers!**
