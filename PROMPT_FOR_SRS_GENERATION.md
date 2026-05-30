# Prompt for Generating SRS Document

## Context
I need you to create a comprehensive Software Requirements Specification (SRS) document for the SuperBee Aeronautics Inventory Management System. I'm providing you with:
1. A reference SRS document (MINT - Money Instant Transaction system)
2. Complete access to the SuperBee Aeronautics project codebase

## Your Task
Create a professional SRS document following the structure and format of the reference MINT SRS document, but tailored specifically for the SuperBee Aeronautics Inventory Management System.

## Reference Document Structure to Follow
Use the MINT SRS document structure as a template:
- Document amendment record
- Table of Contents
- Introduction (Purpose, Scope, Definitions, References)
- Overview (Current product, Proposed system)
- Modules of the Product
- Overview of the Modules
- Functional requirements of the modules
- Detailed functional requirements (with subsections for each module)
- Operating environment (Hardware, Software, Network, Communication)

## Project Information

### Project Name
SuperBee Aeronautics - Inventory Management System

### Organization
SuperBee Aeronautics

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Tailwind CSS

### Current Status
- Version: 1.0.0
- Status: Production Ready
- Deployment: Ready for organization server deployment

## Key Modules to Document

### 1. Admin Module
**Purpose:** Complete system administration and monitoring
**Key Features:**
- User management (create, update, delete, activate/deactivate users)
- Inventory management (CRUD operations on parts)
- Category management
- AE request approval/rejection workflow
- Dashboard with real-time statistics
- Performance monitoring
- Transaction monitoring

**User Roles:**
- Superadmin: Full system access
- Admin: Manage inventory, users, and requests

### 2. Assembly Engineer (Technician) Module
**Purpose:** Part request and inventory viewing
**Key Features:**
- View inventory catalog
- Add parts to cart
- Submit part requests (with drone number and UIN)
- Track request status (pending, approved, rejected)
- View personal request history
- Dashboard with personal statistics

**User Role:**
- Technician/Assembly Engineer: Limited access for requesting parts

### 3. Inventory Management Module
**Purpose:** Manage all inventory parts and categories
**Key Features:**
- Add new inventory parts (SKU, name, category, manufacturer, quantity, price)
- Edit existing parts
- Delete parts
- View all parts with filtering
- Stock level monitoring
- Low stock alerts (≤5 units)
- Category-based organization

### 4. Request Workflow Module
**Purpose:** Handle part request lifecycle
**Key Features:**
- Request submission by assembly engineers
- Request validation
- Admin approval/rejection
- Automatic inventory decrement on approval
- Request status tracking
- Email notifications (future enhancement)

### 5. Authentication & Authorization Module
**Purpose:** Secure access control
**Key Features:**
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- Token expiration (24 hours)
- Protected API routes
- Session management

### 6. Dashboard & Analytics Module
**Purpose:** Real-time statistics and insights
**Key Features:**
- Total users count
- Total inventory count
- Total requests count
- Request status breakdown (pending, approved, rejected)
- Recent requests display
- Product browsing by category
- Live clock display

## Functional Requirements to Document

### Authentication
1. User login with email and password
2. JWT token generation and validation
3. Token expiration handling
4. Role-based route protection
5. Logout functionality

### User Management (Admin Only)
1. Create new users (name, email, password, role)
2. View all users with role filtering
3. Update user status (active/inactive)
4. Delete users
5. Password validation (minimum 6 characters)

### Inventory Management
1. Add inventory parts with all details
2. Edit part details (name, quantity, price, etc.)
3. Delete parts
4. View all parts with search/filter
5. Stock level validation
6. Automatic quantity updates on request approval

### Category Management
1. View all categories
2. Add new categories
3. Category-based product filtering

### Request Workflow
1. Assembly engineer adds parts to cart
2. Submit request with drone number and UIN
3. Admin views pending requests
4. Admin approves request (inventory auto-decrements)
5. Admin rejects request
6. Status updates in real-time
7. Request history tracking

### Dashboard
1. Display total counts (users, inventory, requests)
2. Show request status breakdown
3. Display recent requests
4. Product catalog by category
5. Real-time data updates

## API Endpoints to Document

### Authentication APIs
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile
- POST /api/auth/logout - User logout

### User Management APIs (Admin)
- GET /api/users - Get all users
- POST /api/users - Create new user
- PATCH /api/users/:id/status - Update user status
- DELETE /api/users/:id - Delete user

### Inventory APIs
- GET /api/inventory - Get all parts
- POST /api/inventory - Create new part
- PUT /api/inventory/:id - Update part
- DELETE /api/inventory/:id - Delete part

### Category APIs
- GET /api/categories - Get all categories
- POST /api/categories - Create category

### Request APIs
- GET /api/ae-requests - Get all requests
- POST /api/ae-requests - Create request
- POST /api/ae-requests/:id/accept - Approve request
- POST /api/ae-requests/:id/reject - Reject request

### Dashboard APIs
- GET /api/dashboard/stats - Get statistics
- GET /api/dashboard/products - Get products by category

## Database Schema to Document

### Tables (14 total)
1. **users** - User accounts (id, name, email, password_hash, role_id, is_active, created_at)
2. **roles** - User roles (id, name, description)
3. **categories** - Part categories (id, name, description, created_at)
4. **inventory_parts** - Inventory items (id, sku, name, category_id, manufacturer, quantity, price, status, created_at)
5. **drone_types** - Drone type definitions
6. **drones** - Drone records
7. **ae_requests** - Assembly engineer requests (id, drone_number, uin_number, items, requested_by, email, status, created_at)
8. **invoices** - Invoice records
9. **acceptance_orders** - Acceptance order records
10. **refresh_tokens** - JWT refresh tokens
11. **inventory_audit_log** - Inventory change history
12. **part_invoices** - Part invoice records
13. **buyers** - Buyer information
14. **po_requests** - Purchase order requests

## Security Requirements to Document

1. **Authentication Security:**
   - JWT token-based authentication
   - Secure token storage (localStorage)
   - Token expiration (24 hours)
   - Automatic logout on token expiration

2. **Password Security:**
   - bcrypt hashing (10 rounds)
   - Minimum 6 characters
   - No plain text storage

3. **API Security:**
   - Protected routes with JWT middleware
   - Role-based access control
   - CORS configuration
   - Input validation

4. **Database Security:**
   - Parameterized queries (SQL injection prevention)
   - Connection pooling
   - Secure credentials storage

5. **Network Security:**
   - HTTPS/SSL for production
   - Secure cookie flags
   - Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)

## Operating Environment to Document

### Hardware Requirements
**Server (Production):**
- CPU: 2 cores minimum
- RAM: 2GB minimum (4GB recommended)
- Storage: 10GB minimum
- Network: Stable internet connection

**Client (User Devices):**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum 2GB RAM
- Internet connection

### Software Requirements
**Server:**
- OS: Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- Node.js: v18.x or higher
- MySQL: 8.0 or higher
- PM2: Process manager
- Nginx: Reverse proxy and web server

**Client:**
- Modern web browser with JavaScript enabled
- HTML5 support
- CSS3 support

### Network Requirements
- Minimum 1 Mbps internet connection
- Ports: 80 (HTTP), 443 (HTTPS)
- Backend port: 5000 (internal only, accessed via Nginx)
- Database port: 3306 (internal only)

## Validation Rules to Document

### Inventory Validations
- SKU: Required, unique
- Name: Required, max 255 characters
- Quantity: Required, integer, ≥0
- Price: Required, decimal, ≥0
- Category: Required, must exist

### User Validations
- Email: Required, valid email format, unique
- Password: Required, minimum 6 characters
- Name: Required, max 255 characters
- Role: Required, must be valid role ID

### Request Validations
- Drone Number: Required
- UIN Number: Required
- Items: Required, at least one item
- Quantity: Must not exceed available stock
- Requested by: Required (auto-filled from logged-in user)

### Transaction Validations
- Maximum items per request: No limit
- Stock validation: Cannot request more than available
- Status transitions: pending → approved/rejected only

## User Workflows to Document

### Admin Workflow
1. Login with admin credentials
2. View dashboard with statistics
3. Manage users (create, update, delete)
4. Manage inventory (add, edit, delete parts)
5. View pending requests
6. Approve/reject requests
7. Monitor inventory levels
8. View analytics and reports
9. Logout

### Assembly Engineer Workflow
1. Login with technician credentials
2. View dashboard with personal statistics
3. Browse inventory catalog
4. Add parts to cart
5. Enter drone number and UIN
6. Submit request
7. Track request status
8. View request history
9. Logout

## Output Format Requirements

Create the SRS document with:
1. **Professional formatting** matching the MINT SRS style
2. **Clear section numbering** (1.0, 1.1, 1.1.1, etc.)
3. **Tables** for module overviews and functional requirements
4. **Detailed subsections** for each module with inputs/outputs
5. **Workflow diagrams** descriptions (text-based)
6. **Validation rules** clearly listed
7. **Operating environment** specifications
8. **Document metadata** (version, date, prepared by, etc.)

## Specific Instructions

1. **Use the MINT SRS structure** but adapt content for SuperBee Aeronautics
2. **Include all modules** mentioned above
3. **Document all API endpoints** with request/response formats
4. **Specify all validations** and business rules
5. **Include security requirements** in detail
6. **Document database schema** with relationships
7. **Provide user workflows** for each role
8. **Include operating environment** specifications
9. **Add deployment considerations** (production vs development)
10. **Use professional language** suitable for stakeholders and developers

## Additional Context

### Current System Status
- Application is production-ready
- All features implemented and tested
- 28 API endpoints functional
- Real-time updates working
- Security implemented
- Database schema complete with 14 tables

### Default Users (for documentation)
- Admin: ram@superbee.com / 123456
- Technician: ae@superbee.com / 123456
- Note: Passwords must be changed after deployment

### Key Business Rules
1. Only admins can approve/reject requests
2. Inventory automatically decrements on approval
3. Assembly engineers can only view and request
4. Low stock alert at ≤5 units
5. All transactions are logged
6. JWT tokens expire after 24 hours

## Expected Output

Generate a complete SRS document (approximately 30-40 pages) that:
- Follows the MINT SRS structure and formatting
- Is tailored specifically for SuperBee Aeronautics
- Includes all modules, features, and requirements
- Provides detailed functional specifications
- Documents all APIs and database schema
- Specifies security and validation rules
- Includes operating environment details
- Is ready for stakeholder review and approval

Please create this SRS document now, ensuring it's comprehensive, professional, and suitable for both technical and non-technical stakeholders.
