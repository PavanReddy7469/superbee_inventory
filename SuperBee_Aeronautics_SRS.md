# SuperBee Aeronautics Pvt. Ltd.

---

# Software Requirements Specification

## for

# Inventory Management System

---

**Version No:** 1.0  
**Prepared by:** Development Team  
**Date:** May 14, 2026  
**Approved by:** Management  
**Copy No:** 1  
**Issued to:** SuperBee Aeronautics

---

**SuperBee Aeronautics Pvt. Ltd.**  
Headquarters Address  
India

---

## Document Amendment Record

A – Added, M – Modified, D – Deleted

| S.No | Date | Version No | Page No | Change Mode (A/M/D) | Actioned By | Brief Description of Change |
|------|------|------------|---------|---------------------|-------------|----------------------------|
| 1 | 14/05/2026 | 1.0 | All | A | Development Team | Initial release |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |

---

## Table of Contents

1.0 Introduction
   1.1 Purpose
   1.2 Scope
   1.3 Definitions, Acronyms and Abbreviations
   1.4 References

2.0 Overview
   2.1 Current Product
   2.2 Proposed System

3.0 Modules of the Product

4.0 Overview of the Modules of the Product

5.0 Functional Requirements of the Modules

6.0 Detailed Functional Requirements
   6.1 Admin Module
   6.2 Assembly Engineer Module
   6.3 Inventory Management Module
   6.4 Request Workflow Module
   6.5 Authentication & Authorization Module
   6.6 Dashboard & Analytics Module

7.0 Operating Environment
   7.1 Hardware
   7.2 Software
   7.3 Network
   7.4 Communication

8.0 Security Requirements

9.0 Database Schema

10.0 API Specifications

---

## 1.0 Introduction

### 1.1 Purpose

SuperBee Aeronautics Pvt. Ltd. is a leading manufacturer and assembler of unmanned aerial vehicles (drones) for various commercial and defense applications. The company operates multiple assembly facilities and employs numerous assembly engineers who require timely access to drone parts and components.

Currently, SuperBee Aeronautics faces challenges in managing inventory, tracking part requests, and ensuring efficient distribution of components to assembly engineers. The manual process of requesting and approving parts leads to delays, inventory discrepancies, and reduced operational efficiency.

The purpose of this document is to clearly define the requirements of the proposed software solution - **SuperBee Aeronautics Inventory Management System** - which will streamline inventory operations, automate the request-approval workflow, and provide real-time visibility into stock levels and transactions.

### 1.2 Scope

The scope of this SRS is limited to SuperBee Aeronautics' inventory management and part request workflow activities. The system will cover:

- User management (Admin and Assembly Engineer roles)
- Inventory parts management (CRUD operations)
- Category management for organizing parts
- Part request submission and approval workflow
- Real-time dashboard and analytics
- Automated inventory updates upon request approval
- Role-based access control and security

### 1.3 Definitions, Acronyms and Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| RBAC | Role-Based Access Control |
| AE | Assembly Engineer |
| SKU | Stock Keeping Unit |
| UIN | Unique Identification Number |
| HTTPS | Hypertext Transfer Protocol Secure |
| SSL | Secure Sockets Layer |
| CORS | Cross-Origin Resource Sharing |

### 1.4 References

- System study conducted by Development Team at SuperBee Aeronautics facilities
- Stakeholder interviews with management and assembly engineers
- Industry best practices for inventory management systems
- Security standards: OWASP Top 10, JWT authentication standards

---

## 2.0 Overview

### 2.1 Current Product

SuperBee Aeronautics has been facing the following challenges with their current manual inventory management process:

**a) Operational Inefficiency:**
- Manual part request forms lead to delays in processing
- Paper-based tracking causes frequent errors and lost requests
- No real-time visibility into inventory levels
- Difficulty in tracking request status

**b) Inventory Management Issues:**
- Frequent stock discrepancies due to manual record-keeping
- No automated alerts for low stock levels
- Difficulty in tracking which parts are allocated to which projects
- Time-consuming reconciliation process

**c) Communication Gaps:**
- Assembly engineers have no visibility into request status
- Admins spend significant time manually communicating approvals/rejections
- No centralized system for tracking historical requests
- Difficulty in generating reports for management

**d) Security Concerns:**
- No proper authentication mechanism
- Lack of audit trail for inventory changes
- No role-based access control
- Difficulty in preventing unauthorized access

### 2.2 Proposed System

The main idea behind designing and developing this Inventory Management System is to provide a secure, efficient, and user-friendly platform for managing drone parts inventory and streamlining the request-approval workflow.

**Key Objectives:**
- Eliminate manual processes through automation
- Provide real-time inventory visibility
- Implement secure role-based access control
- Enable efficient request tracking and approval workflow
- Generate automated reports and analytics
- Ensure data integrity and audit trail

**System Benefits:**

**For Assembly Engineers:**
- Browse available parts in real-time
- Submit part requests digitally with drone details
- Track request status (pending, approved, rejected)
- View personal request history
- Receive instant notifications on request status

**For Administrators:**
- Centralized inventory management
- Efficient request approval workflow
- Real-time dashboard with key metrics
- User management capabilities
- Automated inventory updates upon approval
- Comprehensive reporting and analytics

**Services Provided:**

• **Inventory Management** - Add, edit, delete, and view parts
• **Category Management** - Organize parts by categories
• **User Management** - Create and manage user accounts
• **Request Workflow** - Submit, approve, and track part requests
• **Dashboard Analytics** - Real-time statistics and insights
• **Stock Monitoring** - Low stock alerts and notifications
• **Audit Trail** - Complete history of all transactions
• **Role-Based Access** - Secure access control based on user roles

---

## 3.0 Modules of the Product

The SuperBee Aeronautics Inventory Management System consists of the following major modules:

1. **Admin Module**
2. **Assembly Engineer Module**
3. **Inventory Management Module**
4. **Request Workflow Module**
5. **Authentication & Authorization Module**
6. **Dashboard & Analytics Module**

---

## 4.0 Overview of the Modules of the Product

| S.No | Module Name | Overview of the Module |
|------|-------------|------------------------|
| 1 | Admin Module | This module includes the following activities:<br>• User Management (Create, Update, Delete, Activate/Deactivate)<br>• Inventory Management (Full CRUD operations)<br>• Category Management<br>• Request Approval/Rejection<br>• Performance Monitoring<br>• System Configuration<br>• Analytics and Reporting |
| 2 | Assembly Engineer Module | This module includes the following activities:<br>• Login and Authentication<br>• Browse Inventory Catalog<br>• Add Parts to Cart<br>• Submit Part Requests<br>• Track Request Status<br>• View Request History<br>• Personal Dashboard<br>• View Available Stock |
| 3 | Inventory Management Module | This module includes the following activities:<br>• Add New Parts<br>• Edit Part Details<br>• Delete Parts<br>• View All Parts<br>• Search and Filter Parts<br>• Stock Level Monitoring<br>• Low Stock Alerts<br>• Category Assignment |
| 4 | Request Workflow Module | This module includes the following activities:<br>• Request Submission<br>• Request Validation<br>• Admin Review<br>• Approval/Rejection Process<br>• Automatic Inventory Update<br>• Status Tracking<br>• Notification System<br>• Request History |
| 5 | Authentication & Authorization Module | This module includes the following activities:<br>• User Login<br>• JWT Token Generation<br>• Token Validation<br>• Role-Based Access Control<br>• Session Management<br>• Password Security<br>• Logout Functionality<br>• Token Expiration Handling |
| 6 | Dashboard & Analytics Module | This module includes the following activities:<br>• Real-time Statistics<br>• User Count Display<br>• Inventory Count Display<br>• Request Status Breakdown<br>• Recent Requests View<br>• Product Catalog by Category<br>• Performance Metrics<br>• Live Data Updates |

---

## 5.0 Functional Requirements of the Modules

| S.No | Module Name | Function No | Functional Requirements of the Module |
|------|-------------|-------------|---------------------------------------|
| 1 | Admin Module | 1 | Email and Password required for login |
| | | 2 | Create new users with role assignment |
| | | 3 | Update user details and status |
| | | 4 | Delete users from system |
| | | 5 | Activate/Deactivate user accounts |
| | | 6 | Add new inventory parts |
| | | 7 | Edit existing inventory parts |
| | | 8 | Delete inventory parts |
| | | 9 | View all inventory with filters |
| | | 10 | Add new categories |
| | | 11 | View pending part requests |
| | | 12 | Approve part requests |
| | | 13 | Reject part requests |
| | | 14 | View request history |
| | | 15 | Generate analytics reports |
| 2 | Assembly Engineer Module | 1 | Email and Password required for login |
| | | 2 | Browse inventory catalog |
| | | 3 | Search parts by name/SKU |
| | | 4 | Filter parts by category |
| | | 5 | Add parts to cart |
| | | 6 | View cart items |
| | | 7 | Enter drone number |
| | | 8 | Enter UIN number |
| | | 9 | Submit part request |
| | | 10 | View request status |
| | | 11 | View request history |
| | | 12 | View personal dashboard |
| 3 | Inventory Management Module | 1 | Create new inventory part |
| | | 2 | Validate SKU uniqueness |
| | | 3 | Assign category to part |
| | | 4 | Set quantity and price |
| | | 5 | Update part details |
| | | 6 | Delete parts |
| | | 7 | View all parts |
| | | 8 | Monitor stock levels |
| | | 9 | Generate low stock alerts |
| | | 10 | Track inventory changes |
| 4 | Request Workflow Module | 1 | Validate request data |
| | | 2 | Check stock availability |
| | | 3 | Create request record |
| | | 4 | Assign pending status |
| | | 5 | Admin review interface |
| | | 6 | Approve request |
| | | 7 | Reject request |
| | | 8 | Update inventory on approval |
| | | 9 | Send notifications |
| | | 10 | Maintain request history |
| 5 | Authentication Module | 1 | Validate user credentials |
| | | 2 | Generate JWT token |
| | | 3 | Validate token on requests |
| | | 4 | Check token expiration |
| | | 5 | Implement role-based access |
| | | 6 | Hash passwords securely |
| | | 7 | Handle logout |
| | | 8 | Manage session state |
| 6 | Dashboard Module | 1 | Display total users count |
| | | 2 | Display total inventory count |
| | | 3 | Display total requests count |
| | | 4 | Show pending requests count |
| | | 5 | Show approved requests count |
| | | 6 | Show rejected requests count |
| | | 7 | Display recent requests |
| | | 8 | Show products by category |
| | | 9 | Real-time data refresh |
| | | 10 | Display live clock |

---

## 6.0 Detailed Functional Requirements

### 6.1 Admin Module

The Admin Module is the central control panel for system administrators. This web-based module provides comprehensive tools for managing users, inventory, categories, and part requests. Administrators have full access to all system features and are responsible for maintaining data integrity, approving requests, and monitoring system performance.

#### 6.1.1 User Management

##### 6.1.1.1 Adding Users

Administrators can create new user accounts for both admin and assembly engineer roles. The system validates all input data and ensures email uniqueness before creating the account.

**Inputs:**
- Name (Required, max 255 characters)
- Email (Required, valid email format, unique)
- Password (Required, minimum 6 characters)
- Role (Required, select from: Admin, Technician)

**Process:**
1. Admin navigates to User Management section
2. Clicks "Add New User" button
3. Fills in user details in the form
4. Selects appropriate role from dropdown
5. Submits the form
6. System validates all inputs
7. Password is hashed using bcrypt (10 rounds)
8. User record is created in database
9. User is set to active status by default

**Outputs:**
- Success message: "User created successfully"
- New user appears in user list
- User can login with provided credentials
- Error messages for validation failures

**Validations:**
- Email must be unique in the system
- Password must be at least 6 characters
- All required fields must be filled
- Email must be in valid format

##### 6.1.1.2 Updating User Status

Administrators can activate or deactivate user accounts. Deactivated users cannot login to the system.

**Inputs:**
- User ID (Selected from user list)
- New Status (Active/Inactive toggle)

**Process:**
1. Admin views user list
2. Clicks on status toggle for specific user
3. Confirms the status change
4. System updates user status in database
5. If deactivating, any active sessions are invalidated

**Outputs:**
- Success message: "User status updated successfully"
- Updated status reflected in user list
- Deactivated users cannot login
- Active users can login normally

##### 6.1.1.3 Deleting Users

Administrators can permanently delete user accounts from the system.

**Inputs:**
- User ID (Selected from user list)
- Confirmation (Yes/No)

**Process:**
1. Admin clicks delete button for specific user
2. System shows confirmation dialog
3. Admin confirms deletion
4. System checks for associated data
5. User record is deleted from database
6. Associated sessions are invalidated

**Outputs:**
- Success message: "User deleted successfully"
- User removed from user list
- User cannot login anymore
- Error if user has pending requests (optional business rule)

**Note:** Consider implementing soft delete (marking as deleted) instead of hard delete to maintain audit trail.

#### 6.1.2 Inventory Management

##### 6.1.2.1 Adding Inventory Parts

Administrators can add new parts to the inventory system with complete details.

**Inputs:**
- SKU (Required, unique, alphanumeric)
- Part Name (Required, max 255 characters)
- Category (Required, select from existing categories)
- Manufacturer (Required, max 255 characters)
- Quantity (Required, integer, ≥0)
- Price (Required, decimal, ≥0)
- Status (Optional, default: "available")

**Process:**
1. Admin navigates to Inventory section
2. Clicks "Add New Part" button
3. Fills in part details
4. Selects category from dropdown
5. Enters quantity and price
6. Submits the form
7. System validates all inputs
8. Part record is created in database
9. Inventory count is updated

**Outputs:**
- Success message: "Part added successfully"
- New part appears in inventory list
- Part is available for requests
- SKU is unique and searchable

**Validations:**
- SKU must be unique
- Quantity must be non-negative integer
- Price must be non-negative decimal
- Category must exist in system
- All required fields must be filled

##### 6.1.2.2 Editing Inventory Parts

Administrators can update existing part details including quantity and price.

**Inputs:**
- Part ID (Selected from inventory list)
- Updated fields (any combination of: name, category, manufacturer, quantity, price, status)

**Process:**
1. Admin clicks edit button for specific part
2. Form is populated with current values
3. Admin modifies desired fields
4. Submits the form
5. System validates inputs
6. Part record is updated in database
7. Changes are logged in audit trail

**Outputs:**
- Success message: "Part updated successfully"
- Updated details reflected in inventory list
- Audit log entry created
- Real-time update in dashboard

**Note:** SKU cannot be changed after creation to maintain data integrity.

##### 6.1.2.3 Deleting Inventory Parts

Administrators can remove parts from the inventory system.

**Inputs:**
- Part ID (Selected from inventory list)
- Confirmation (Yes/No)

**Process:**
1. Admin clicks delete button for specific part
2. System shows confirmation dialog
3. Admin confirms deletion
4. System checks for pending requests with this part
5. Part record is deleted from database
6. Inventory count is updated

**Outputs:**
- Success message: "Part deleted successfully"
- Part removed from inventory list
- Part no longer available for requests
- Warning if part is in pending requests

**Business Rule:** Parts with pending requests should not be deleted or should show warning.

#### 6.1.3 Category Management

##### 6.1.3.1 Adding Categories

Administrators can create new categories to organize inventory parts.

**Inputs:**
- Category Name (Required, unique, max 255 characters)
- Description (Optional, max 500 characters)

**Process:**
1. Admin navigates to Categories section
2. Clicks "Add Category" button
3. Enters category name and description
4. Submits the form
5. System validates uniqueness
6. Category record is created

**Outputs:**
- Success message: "Category added successfully"
- New category appears in category list
- Category available for part assignment
- Category appears in filter dropdowns

##### 6.1.3.2 Viewing Categories

Administrators can view all categories with part counts.

**Outputs:**
- List of all categories
- Number of parts in each category
- Category descriptions
- Creation dates

#### 6.1.4 Request Management

##### 6.1.4.1 Viewing Pending Requests

Administrators can view all pending part requests submitted by assembly engineers.

**Display Information:**
- Request ID
- Drone Number
- UIN Number
- Requested By (Engineer name and email)
- Parts Requested (with quantities)
- Request Date and Time
- Status (Pending)

**Features:**
- Filter by date range
- Search by drone number or UIN
- Sort by request date
- View request details

##### 6.1.4.2 Approving Requests

Administrators can approve part requests, which automatically updates inventory.

**Inputs:**
- Request ID (Selected from pending requests)
- Confirmation (Yes/No)

**Process:**
1. Admin reviews request details
2. Verifies stock availability
3. Clicks "Approve" button
4. System shows confirmation dialog
5. Admin confirms approval
6. System starts database transaction
7. Request status updated to "approved"
8. Inventory quantities decremented for each part
9. Transaction committed
10. Notification sent to requester (future enhancement)

**Outputs:**
- Success message: "Request approved successfully"
- Request status changed to "Approved"
- Inventory quantities updated
- Request moved to approved list
- Timestamp recorded

**Business Rules:**
- Stock must be available for all requested parts
- Inventory update must be atomic (all or nothing)
- Audit trail must be maintained
- Cannot approve already approved/rejected requests

##### 6.1.4.3 Rejecting Requests

Administrators can reject part requests with optional reason.

**Inputs:**
- Request ID (Selected from pending requests)
- Confirmation (Yes/No)
- Reason (Optional, for future enhancement)

**Process:**
1. Admin reviews request details
2. Clicks "Reject" button
3. System shows confirmation dialog
4. Admin confirms rejection
5. Request status updated to "rejected"
6. No inventory changes made
7. Notification sent to requester (future enhancement)

**Outputs:**
- Success message: "Request rejected successfully"
- Request status changed to "Rejected"
- Request moved to rejected list
- Timestamp recorded
- Inventory remains unchanged

#### 6.1.5 Dashboard and Analytics

##### 6.1.5.1 System Statistics

Administrators can view real-time system statistics on the dashboard.

**Displayed Metrics:**
- Total Users (count of all active users)
- Total Inventory (count of all parts)
- Total Requests (count of all requests)
- Pending Requests (count)
- Approved Requests (count)
- Rejected Requests (count)

**Features:**
- Real-time data updates
- Visual cards with color coding
- Quick navigation to detailed views
- Live clock display

##### 6.1.5.2 Recent Requests View

Dashboard displays the most recent part requests with status.

**Display Information:**
- Last 10 requests
- Request date and time
- Requester name
- Status with color coding
- Quick action buttons

---

### 6.2 Assembly Engineer Module

The Assembly Engineer Module provides a streamlined interface for technicians to browse inventory, request parts, and track their requests. This module has restricted access compared to the admin module, focusing on operational tasks.

#### 6.2.1 Authentication

##### 6.2.1.1 Login

Assembly engineers must authenticate before accessing the system.

**Inputs:**
- Email (Required, valid email format)
- Password (Required)

**Process:**
1. Engineer navigates to login page
2. Enters email and password
3. Clicks "Login" button
4. System validates credentials
5. Password is compared with hashed version
6. JWT token is generated if valid
7. Token stored in browser localStorage
8. User redirected to dashboard

**Outputs:**
- Success: Redirect to dashboard with token
- Failure: Error message "Invalid credentials"
- Token expiration: 24 hours

**Security:**
- Password transmitted over HTTPS
- Password never stored in plain text
- Failed login attempts logged
- Token includes user ID and role

#### 6.2.2 Inventory Browsing

##### 6.2.2.1 View Inventory Catalog

Assembly engineers can browse all available inventory parts.

**Display Information:**
- Part SKU
- Part Name
- Category
- Manufacturer
- Available Quantity
- Price
- Status indicator (In Stock / Low Stock / Out of Stock)

**Features:**
- Search by part name or SKU
- Filter by category
- Sort by name, quantity, or price
- Pagination for large inventories
- "Add to Cart" button for each part

**Stock Indicators:**
- Green: Quantity > 5 (In Stock)
- Yellow: Quantity ≤ 5 (Low Stock)
- Red: Quantity = 0 (Out of Stock)

#### 6.2.3 Cart Management

##### 6.2.3.1 Adding Parts to Cart

Assembly engineers can add parts to their cart for requesting.

**Inputs:**
- Part ID (Selected from inventory)
- Quantity (Required, integer, >0)

**Process:**
1. Engineer clicks "Add to Cart" on a part
2. Quantity selector appears
3. Engineer enters desired quantity
4. System validates quantity against available stock
5. Part added to cart with quantity
6. Cart count updated in header

**Outputs:**
- Success message: "Added to cart"
- Cart icon shows item count
- Part appears in cart view

**Validations:**
- Quantity must be positive integer
- Quantity cannot exceed available stock
- Duplicate parts update quantity in cart

##### 6.2.3.2 Viewing Cart

Engineers can view all items in their cart before submitting request.

**Display Information:**
- Part SKU
- Part Name
- Quantity requested
- Available stock
- Price per unit
- Total price
- Remove button for each item

**Features:**
- Update quantity
- Remove items
- Clear entire cart
- View total items count
- Proceed to request submission

#### 6.2.4 Request Submission

##### 6.2.4.1 Submit Part Request

Assembly engineers submit part requests with drone and project details.

**Inputs:**
- Drone Number (Required, alphanumeric)
- UIN Number (Required, alphanumeric)
- Cart Items (At least one item required)

**Process:**
1. Engineer reviews cart items
2. Navigates to cart page
3. Enters drone number
4. Enters UIN number
5. Clicks "Submit Request" button
6. System validates all inputs
7. Request record created with status "pending"
8. Cart items stored as JSON in request
9. Cart is cleared
10. Confirmation message displayed

**Outputs:**
- Success message: "Request sent successfully"
- Request ID generated
- Cart cleared
- Request appears in "My Requests"
- Status set to "Pending"

**Validations:**
- Drone number is required
- UIN number is required
- Cart must have at least one item
- Stock availability checked again
- Requested by field auto-filled from logged-in user

**Request Data Structure:**
```json
{
  "drone_number": "DN-12345",
  "uin_number": "UIN-67890",
  "items": [
    {
      "part_id": "SKU-001",
      "part_name": "Propeller",
      "quantity": 5
    }
  ],
  "requested_by": "John Doe",
  "email": "john@superbee.com",
  "status": "pending",
  "created_at": "2026-05-14T10:30:00Z"
}
```

#### 6.2.5 Request Tracking

##### 6.2.5.1 View My Requests

Assembly engineers can view all their submitted requests with current status.

**Display Information:**
- Request ID
- Drone Number
- UIN Number
- Parts Requested (list with quantities)
- Status (Pending/Approved/Rejected)
- Submission Date and Time
- Last Updated Date and Time

**Features:**
- Filter by status
- Sort by date
- Search by drone number or UIN
- View detailed request information
- Color-coded status badges

**Status Colors:**
- Yellow/Orange: Pending
- Green: Approved
- Red: Rejected

##### 6.2.5.2 Request History

Engineers can view complete history of all their requests.

**Display Information:**
- All requests (current and historical)
- Status timeline
- Approval/Rejection dates
- Parts allocated
- Historical trends

#### 6.2.6 Personal Dashboard

##### 6.2.6.1 Dashboard Statistics

Assembly engineers see personalized statistics on their dashboard.

**Displayed Metrics:**
- My Requests (total count)
- Pending Requests (count)
- Approved Requests (count)
- Rejected Requests (count)

**Features:**
- Quick action buttons
- Recent requests display (last 5)
- Low stock alerts
- Inventory overview
- Live clock

**Quick Actions:**
- Raise Part Request (navigate to inventory)
- Browse Inventory
- View My Requests

---

### 6.3 Inventory Management Module

This module handles all operations related to inventory parts including creation, modification, deletion, and monitoring.

#### 6.3.1 Part Lifecycle Management

##### 6.3.1.1 Create Part

**Inputs:**
- SKU (Required, unique, max 50 characters)
- Name (Required, max 255 characters)
- Category ID (Required, foreign key)
- Manufacturer (Required, max 255 characters)
- Quantity (Required, integer, ≥0)
- Price (Required, decimal(10,2), ≥0)
- Status (Optional, default: "available")

**Validations:**
- SKU uniqueness check
- Category must exist
- Quantity must be non-negative
- Price must be non-negative
- All required fields must be provided

**Database Operation:**
```sql
INSERT INTO inventory_parts 
(sku, name, category_id, manufacturer, quantity, price, status, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
```

##### 6.3.1.2 Update Part

**Inputs:**
- Part ID (Required)
- Fields to update (any combination)

**Validations:**
- Part must exist
- SKU cannot be changed
- New values must meet same validations as create

**Database Operation:**
```sql
UPDATE inventory_parts 
SET name=?, category_id=?, manufacturer=?, quantity=?, price=?, updated_at=NOW()
WHERE id=?
```

##### 6.3.1.3 Delete Part

**Inputs:**
- Part ID (Required)

**Validations:**
- Part must exist
- Check for pending requests (optional business rule)

**Database Operation:**
```sql
DELETE FROM inventory_parts WHERE id=?
```

#### 6.3.2 Stock Monitoring

##### 6.3.2.1 Low Stock Alerts

System automatically identifies parts with low stock levels.

**Alert Criteria:**
- Quantity ≤ 5 units

**Alert Display:**
- Dashboard shows low stock count
- Parts list highlights low stock items
- Yellow/Orange indicator on part cards

**Business Rule:**
- Low stock threshold: 5 units
- Can be configured per category (future enhancement)

##### 6.3.2.2 Stock Level Tracking

System maintains real-time stock levels.

**Updates Triggered By:**
- Manual quantity adjustment by admin
- Automatic decrement on request approval
- Bulk import operations (future enhancement)

**Audit Trail:**
- All quantity changes logged
- Timestamp recorded
- User who made change recorded
- Previous and new values stored

---

### 6.4 Request Workflow Module

This module manages the complete lifecycle of part requests from submission to approval/rejection.

#### 6.4.1 Request Creation

##### 6.4.1.1 Validate Request Data

**Validation Rules:**
- Drone number is required and non-empty
- UIN number is required and non-empty
- At least one item must be in the request
- Each item must have valid part_id
- Each item must have quantity > 0
- Requested quantities must not exceed available stock
- Requester information must be valid

**Validation Process:**
1. Check required fields
2. Validate data types
3. Check stock availability for each part
4. Verify user authentication
5. Ensure no duplicate active requests (optional)

##### 6.4.1.2 Create Request Record

**Database Operation:**
```sql
INSERT INTO ae_requests 
(drone_number, uin_number, items, requested_by, email, status, created_at)
VALUES (?, ?, ?, ?, ?, 'pending', NOW())
```

**Items Storage:**
Items are stored as JSON array:
```json
[
  {"part_id": "SKU-001", "part_name": "Propeller", "quantity": 5},
  {"part_id": "SKU-002", "part_name": "Motor", "quantity": 2}
]
```

#### 6.4.2 Request Processing

##### 6.4.2.1 Admin Review

Administrators review pending requests in the admin panel.

**Review Information Displayed:**
- Complete request details
- Requester information
- Current stock levels for requested parts
- Request submission time
- Priority indicators (if implemented)

**Actions Available:**
- Approve request
- Reject request
- View requester history (future enhancement)
- Add notes (future enhancement)

##### 6.4.2.2 Approval Process

**Process Flow:**
1. Admin clicks "Approve" button
2. System validates stock availability again
3. Database transaction begins
4. Request status updated to "approved"
5. For each item in request:
   - Fetch current part quantity
   - Calculate new quantity (current - requested)
   - Update part quantity
6. Transaction committed
7. Success response sent
8. Notification triggered (future enhancement)

**Database Transaction:**
```sql
BEGIN TRANSACTION;

UPDATE ae_requests 
SET status='approved', updated_at=NOW() 
WHERE id=?;

UPDATE inventory_parts 
SET quantity = quantity - ? 
WHERE sku=?;

COMMIT;
```

**Rollback Conditions:**
- Insufficient stock discovered
- Database error
- Validation failure

##### 6.4.2.3 Rejection Process

**Process Flow:**
1. Admin clicks "Reject" button
2. Confirmation dialog shown
3. Request status updated to "rejected"
4. No inventory changes made
5. Timestamp recorded
6. Notification triggered (future enhancement)

**Database Operation:**
```sql
UPDATE ae_requests 
SET status='rejected', updated_at=NOW() 
WHERE id=?
```

#### 6.4.3 Request Status Tracking

##### 6.4.3.1 Status States

**Possible States:**
1. **Pending** - Request submitted, awaiting admin review
2. **Approved** - Request approved, inventory updated
3. **Rejected** - Request rejected, no inventory changes

**State Transitions:**
- Pending → Approved (by admin approval)
- Pending → Rejected (by admin rejection)
- No transitions from Approved or Rejected states

##### 6.4.3.2 Status History

System maintains complete history of status changes.

**Tracked Information:**
- Status change timestamp
- User who made the change
- Previous status
- New status
- Optional notes/reason

---

### 6.5 Authentication & Authorization Module

This module handles all security aspects including user authentication, token management, and access control.

#### 6.5.1 Authentication

##### 6.5.1.1 User Login

**Inputs:**
- Email (Required)
- Password (Required)

**Process:**
1. User submits login form
2. System validates input format
3. User record fetched by email
4. Password compared with stored hash using bcrypt
5. If valid, JWT token generated
6. Token includes: user_id, email, role, expiration
7. Token returned to client
8. Client stores token in localStorage

**JWT Token Structure:**
```json
{
  "user_id": 1,
  "email": "admin@superbee.com",
  "role": "admin",
  "iat": 1715673600,
  "exp": 1715760000
}
```

**Token Expiration:** 24 hours

**Security Measures:**
- Password never transmitted in plain text (HTTPS)
- Password never stored in plain text (bcrypt hash)
- Failed login attempts logged
- Rate limiting on login attempts (future enhancement)

##### 6.5.1.2 Token Validation

**Process:**
1. Client sends token in Authorization header
2. Server extracts token from header
3. Token signature verified
4. Token expiration checked
5. User information extracted from token
6. Request proceeds if valid

**Authorization Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Validation Failures:**
- Invalid signature: 401 Unauthorized
- Expired token: 401 Unauthorized
- Missing token: 401 Unauthorized
- Malformed token: 401 Unauthorized

##### 6.5.1.3 Logout

**Process:**
1. Client removes token from localStorage
2. Client redirects to login page
3. Server-side session invalidation (if implemented)

**Note:** JWT tokens are stateless, so server-side invalidation requires additional implementation (token blacklist).

#### 6.5.2 Authorization

##### 6.5.2.1 Role-Based Access Control (RBAC)

**Roles Defined:**
1. **Admin/Superadmin**
   - Full system access
   - User management
   - Inventory management
   - Request approval/rejection
   - Analytics and reports

2. **Technician/Assembly Engineer**
   - View inventory
   - Submit requests
   - View own requests
   - Personal dashboard

**Access Control Matrix:**

| Feature | Admin | Technician |
|---------|-------|------------|
| View Inventory | ✓ | ✓ |
| Add/Edit/Delete Inventory | ✓ | ✗ |
| View All Users | ✓ | ✗ |
| Create/Edit/Delete Users | ✓ | ✗ |
| Submit Requests | ✓ | ✓ |
| View All Requests | ✓ | ✗ |
| View Own Requests | ✓ | ✓ |
| Approve/Reject Requests | ✓ | ✗ |
| View Dashboard | ✓ | ✓ |
| Manage Categories | ✓ | ✗ |

##### 6.5.2.2 Route Protection

**Protected Routes:**
- All API endpoints require valid JWT token
- Role-specific endpoints check user role
- Unauthorized access returns 403 Forbidden

**Middleware Implementation:**
```javascript
// Authentication middleware
authenticateToken(req, res, next)

// Authorization middleware
authorizeRole(['admin', 'superadmin'])(req, res, next)
```

#### 6.5.3 Password Security

##### 6.5.3.1 Password Hashing

**Algorithm:** bcrypt  
**Rounds:** 10  
**Salt:** Automatically generated per password

**Process:**
1. User provides password during registration/login
2. Password hashed using bcrypt with 10 rounds
3. Hash stored in database (password_hash column)
4. Original password never stored

**Hash Example:**
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

##### 6.5.3.2 Password Validation

**Requirements:**
- Minimum length: 6 characters
- No maximum length (bcrypt handles long passwords)
- No complexity requirements (can be added)

**Validation Process:**
1. User submits password
2. Length checked (≥6 characters)
3. Password hashed
4. Hash compared with stored hash
5. Match result returned

---

### 6.6 Dashboard & Analytics Module

This module provides real-time insights and statistics for both administrators and assembly engineers.

#### 6.6.1 Admin Dashboard

##### 6.6.1.1 System Statistics

**Metrics Displayed:**
- **Total Users:** Count of all users in system
- **Total Inventory:** Count of all inventory parts
- **Total Requests:** Count of all requests (all statuses)

**Data Source:**
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM inventory_parts;
SELECT COUNT(*) FROM ae_requests;
```

**Update Frequency:** Real-time (on page load/refresh)

##### 6.6.1.2 Request Status Breakdown

**Metrics Displayed:**
- **Pending Requests:** Count of requests with status='pending'
- **Approved Requests:** Count of requests with status='approved'
- **Rejected Requests:** Count of requests with status='rejected'

**Data Source:**
```sql
SELECT 
  COUNT(CASE WHEN status='pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status='approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status='rejected' THEN 1 END) as rejected
FROM ae_requests;
```

**Visual Representation:**
- Color-coded cards
- Pending: Orange/Yellow
- Approved: Green
- Rejected: Red

##### 6.6.1.3 Recent Requests

**Display:**
- Last 10 requests (all statuses)
- Request details summary
- Quick action buttons

**Sorting:** By created_at DESC

##### 6.6.1.4 Product Catalog

**Features:**
- Browse products by category
- Category dropdown selector
- Product cards with details
- Stock status indicators

**Display Information:**
- Product name
- SKU
- Manufacturer
- Price
- Stock quantity
- Stock status badge

#### 6.6.2 Assembly Engineer Dashboard

##### 6.6.2.1 Personal Statistics

**Metrics Displayed:**
- **My Requests:** Total requests by logged-in user
- **Pending:** User's pending requests
- **Approved:** User's approved requests
- **Rejected:** User's rejected requests

**Data Filtering:**
```sql
SELECT * FROM ae_requests 
WHERE email = ? OR requested_by = ?
```

##### 6.6.2.2 Recent Requests

**Display:**
- Last 5 requests by user
- Status with color coding
- Submission date
- Quick view details

##### 6.6.2.3 Quick Actions

**Action Buttons:**
- **Raise Part Request:** Navigate to inventory
- **Browse Inventory:** View all parts
- **Low Stock Alert:** Show parts with low stock

#### 6.6.3 Live Features

##### 6.6.3.1 Live Clock

**Display:**
- Current date (Day, DD Month YYYY)
- Current time (HH:MM:SS AM/PM)
- Updates every second

**Format Example:**
```
Sunday, 14 May 2026
10:30:45 AM
```

##### 6.6.3.2 Real-Time Updates

**Update Triggers:**
- Page load
- Manual refresh
- After any CRUD operation
- Periodic polling (optional)

**Data Refresh:**
- Statistics recalculated
- Counts updated
- Lists refreshed
- No page reload required

---

## 7.0 Operating Environment

### 7.1 Hardware

#### 7.1.1 Server (Production)

**Minimum Requirements:**
- **Processor:** Dual-core CPU, 2.0 GHz or higher
- **RAM:** 2 GB minimum (4 GB recommended)
- **Storage:** 10 GB minimum (SSD recommended)
- **Network:** 100 Mbps network interface
- **Backup Storage:** Additional storage for database backups

**Recommended Configuration:**
- **Processor:** Quad-core CPU, 2.5 GHz or higher
- **RAM:** 8 GB
- **Storage:** 50 GB SSD
- **Network:** 1 Gbps network interface
- **Redundancy:** RAID configuration for data protection

#### 7.1.2 Client Devices

**Minimum Requirements:**
- **Desktop/Laptop:**
  - Processor: Dual-core, 1.5 GHz
  - RAM: 2 GB
  - Display: 1024x768 resolution
  - Network: Stable internet connection (1 Mbps minimum)

- **Mobile/Tablet:**
  - Modern smartphone or tablet
  - RAM: 2 GB
  - Display: 720p resolution
  - Network: WiFi or 4G connection

**Supported Devices:**
- Desktop computers (Windows, macOS, Linux)
- Laptops
- Tablets
- Smartphones (responsive design)

### 7.2 Software

#### 7.2.1 Server Software

**Operating System:**
- Ubuntu 20.04 LTS or higher
- CentOS 7 or higher
- Windows Server 2019 or higher
- Any Linux distribution with systemd support

**Runtime Environment:**
- **Node.js:** Version 18.x or higher (LTS recommended)
- **npm:** Version 9.x or higher

**Database:**
- **MySQL:** Version 8.0 or higher
- Character Set: utf8mb4
- Collation: utf8mb4_unicode_ci

**Web Server:**
- **Nginx:** Version 1.18 or higher (for reverse proxy and static files)
- **Apache:** Version 2.4 or higher (alternative)

**Process Manager:**
- **PM2:** Latest version (for Node.js process management)

**Additional Tools:**
- **Git:** For version control (optional)
- **Certbot:** For SSL certificate management (Let's Encrypt)

#### 7.2.2 Client Software

**Web Browser (Required):**
- Google Chrome 90 or higher
- Mozilla Firefox 88 or higher
- Microsoft Edge 90 or higher
- Safari 14 or higher

**Browser Requirements:**
- JavaScript enabled
- Cookies enabled
- LocalStorage support
- HTML5 support
- CSS3 support
- ES6+ JavaScript support

**Not Supported:**
- Internet Explorer (any version)
- Browsers with JavaScript disabled
- Very old browser versions

#### 7.2.3 Development Tools (For Deployment)

**Required:**
- Node.js v18+
- npm or yarn
- MySQL client tools
- Text editor or IDE

**Optional:**
- MySQL Workbench (for database management)
- Postman (for API testing)
- Git (for version control)

### 7.3 Network

#### 7.3.1 Network Requirements

**Server Network:**
- **Bandwidth:** Minimum 10 Mbps (100 Mbps recommended)
- **Latency:** <100ms to database server
- **Uptime:** 99.9% availability target
- **Firewall:** Configured to allow required ports

**Client Network:**
- **Bandwidth:** Minimum 1 Mbps
- **Connection:** Stable internet connection
- **Protocol:** HTTPS support required

#### 7.3.2 Port Configuration

**Required Ports:**
- **80 (HTTP):** For initial connection and redirect to HTTPS
- **443 (HTTPS):** For secure web traffic
- **5000 (Backend API):** Internal only, accessed via Nginx reverse proxy
- **3306 (MySQL):** Internal only, not exposed to internet

**Firewall Rules:**
- Allow incoming on ports 80, 443
- Block direct access to port 5000 from internet
- Block direct access to port 3306 from internet
- Allow SSH (port 22) for server management (restricted IPs)

#### 7.3.3 Network Security

**Requirements:**
- SSL/TLS encryption for all client-server communication
- HTTPS enforced (HTTP redirects to HTTPS)
- Secure WebSocket connections (if implemented)
- DDoS protection (recommended)
- Rate limiting on API endpoints (recommended)

### 7.4 Communication

#### 7.4.1 Client-Server Communication

**Protocol:** HTTPS (HTTP/1.1 or HTTP/2)  
**Data Format:** JSON  
**Authentication:** JWT tokens in Authorization header  
**Content-Type:** application/json

**Request Format:**
```http
POST /api/auth/login HTTP/1.1
Host: superbee.yourdomain.com
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Format:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
}
```

#### 7.4.2 Backend-Database Communication

**Protocol:** MySQL protocol (TCP/IP)  
**Connection:** Connection pooling  
**Pool Size:** 10 connections  
**Timeout:** 30 seconds  
**Charset:** utf8mb4

**Connection Configuration:**
```javascript
{
  host: 'localhost',
  port: 3306,
  user: 'superbee_user',
  password: '***',
  database: 'superbee_inventory',
  connectionLimit: 10,
  queueLimit: 0
}
```

#### 7.4.3 Error Handling

**HTTP Status Codes Used:**
- **200 OK:** Successful request
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Authentication required or failed
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server-side error

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

## 8.0 Security Requirements

### 8.1 Authentication Security

#### 8.1.1 JWT Token Security

**Token Generation:**
- Algorithm: HS256 (HMAC with SHA-256)
- Secret Key: 64-character random string
- Expiration: 24 hours
- Payload: user_id, email, role, issued_at, expiration

**Token Storage:**
- Client-side: localStorage
- Transmitted: Authorization header only
- Never in URL parameters
- Never in cookies (for this implementation)

**Token Validation:**
- Signature verification on every request
- Expiration check
- Payload integrity check
- Automatic logout on expiration

#### 8.1.2 Password Security

**Hashing:**
- Algorithm: bcrypt
- Cost factor: 10 rounds
- Salt: Automatically generated per password
- No password length limit (bcrypt handles truncation)

**Password Requirements:**
- Minimum length: 6 characters
- No maximum length
- No complexity requirements (can be enhanced)
- Cannot be empty or whitespace only

**Password Transmission:**
- Always over HTTPS
- Never logged
- Never stored in plain text
- Never returned in API responses

#### 8.1.3 Session Management

**Session Characteristics:**
- Stateless (JWT-based)
- No server-side session storage
- Token expiration: 24 hours
- Automatic logout on expiration
- Manual logout clears client-side token

**Security Measures:**
- Token refresh not implemented (can be added)
- Token blacklist not implemented (can be added)
- Single device login (no restriction currently)

### 8.2 Authorization Security

#### 8.2.1 Role-Based Access Control

**Implementation:**
- Middleware checks user role from JWT token
- Protected routes require specific roles
- Unauthorized access returns 403 Forbidden
- Role information never modifiable by client

**Role Hierarchy:**
1. Superadmin (highest privileges)
2. Admin (full operational access)
3. Technician (limited access)

#### 8.2.2 API Endpoint Protection

**Protection Levels:**
- **Public:** No authentication required (login, health check)
- **Authenticated:** Valid JWT required (all user endpoints)
- **Admin Only:** Admin role required (user management, request approval)

**Middleware Stack:**
```
Request → CORS → Authentication → Authorization → Route Handler
```

### 8.3 Data Security

#### 8.3.1 SQL Injection Prevention

**Measures:**
- Parameterized queries (prepared statements)
- No string concatenation for SQL
- Input validation before database operations
- ORM/Query builder usage (mysql2 with promises)

**Example Safe Query:**
```javascript
const [rows] = await pool.execute(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

#### 8.3.2 Input Validation

**Validation Rules:**
- All user inputs validated on server-side
- Type checking (string, number, email, etc.)
- Length restrictions enforced
- Special character handling
- XSS prevention (input sanitization)

**Validation Libraries:**
- express-validator (for API input validation)
- Custom validation functions
- Database constraints (NOT NULL, UNIQUE, etc.)

#### 8.3.3 Data Encryption

**In Transit:**
- HTTPS/TLS 1.2 or higher
- All client-server communication encrypted
- Certificate from trusted CA (Let's Encrypt or organization)

**At Rest:**
- Passwords: bcrypt hashed
- JWT Secret: Environment variable (not in code)
- Database credentials: Environment variable
- Sensitive data: Not stored in plain text

### 8.4 Network Security

#### 8.4.1 CORS Configuration

**Settings:**
- Origin: Specific domain only (no wildcards in production)
- Methods: GET, POST, PUT, PATCH, DELETE
- Headers: Content-Type, Authorization
- Credentials: true (for cookies, if used)

**Configuration:**
```javascript
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
})
```

#### 8.4.2 Security Headers

**Headers Implemented:**
- **X-Frame-Options:** SAMEORIGIN (prevent clickjacking)
- **X-Content-Type-Options:** nosniff (prevent MIME sniffing)
- **X-XSS-Protection:** 1; mode=block (XSS protection)
- **Strict-Transport-Security:** max-age=31536000 (HTTPS enforcement)

**Nginx Configuration:**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

#### 8.4.3 Rate Limiting

**Recommended Implementation:**
- Login endpoint: 5 attempts per 15 minutes per IP
- API endpoints: 100 requests per minute per user
- Public endpoints: 20 requests per minute per IP

**Note:** Rate limiting not currently implemented but recommended for production.

### 8.5 Application Security

#### 8.5.1 Error Handling

**Security Measures:**
- No sensitive information in error messages
- Stack traces not exposed to clients
- Generic error messages for authentication failures
- Detailed errors logged server-side only

**Error Response Example:**
```json
{
  "error": "Authentication failed"
}
```
(Not: "User not found" or "Invalid password")

#### 8.5.2 Logging and Monitoring

**Logged Events:**
- All authentication attempts (success and failure)
- Authorization failures
- Database errors
- API errors
- Critical operations (user creation, request approval)

**Not Logged:**
- Passwords (plain or hashed)
- JWT tokens
- Sensitive personal information

**Log Format:**
```
[2026-05-14 10:30:45] INFO: User login successful - user_id: 1, email: admin@superbee.com
[2026-05-14 10:31:12] ERROR: Database connection failed - Error: ECONNREFUSED
```

#### 8.5.3 Dependency Security

**Measures:**
- Regular dependency updates
- Security audit: `npm audit`
- No known vulnerabilities in dependencies
- Minimal dependency footprint
- Trusted packages only

**Key Dependencies:**
- express: ^4.18.0
- mysql2: ^3.0.0
- bcrypt: ^5.1.0
- jsonwebtoken: ^9.0.0
- cors: ^2.8.5

### 8.6 Compliance and Standards

#### 8.6.1 Security Standards

**Followed Standards:**
- OWASP Top 10 (Web Application Security)
- JWT Best Practices
- bcrypt Best Practices
- HTTPS/TLS Standards

#### 8.6.2 Data Privacy

**Measures:**
- Minimal data collection
- No unnecessary personal information stored
- User data accessible only to authorized users
- No data sharing with third parties
- Audit trail for data access

#### 8.6.3 Audit Trail

**Tracked Operations:**
- User creation, modification, deletion
- Inventory changes
- Request submissions
- Request approvals/rejections
- Login attempts

**Audit Information:**
- Timestamp
- User who performed action
- Action type
- Before and after values (for updates)
- IP address (optional)

---

## 9.0 Database Schema

### 9.1 Database Overview

**Database Name:** superbee_inventory  
**Database Engine:** MySQL 8.0  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci  
**Total Tables:** 14

### 9.2 Core Tables

#### 9.2.1 users

Stores user account information.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email (login) |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| role_id | INT | NOT NULL, FOREIGN KEY | Reference to roles table |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (email)
- INDEX (role_id)

**Relationships:**
- role_id → roles(id)

#### 9.2.2 roles

Defines user roles and permissions.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique role identifier |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Role name |
| description | TEXT | NULL | Role description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Default Data:**
```sql
INSERT INTO roles (id, name, description) VALUES
(1, 'superadmin', 'Super Administrator with full access'),
(2, 'admin', 'Administrator with full operational access'),
(3, 'technician', 'Assembly Engineer with limited access');
```

#### 9.2.3 categories

Organizes inventory parts into categories.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique category identifier |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Category name |
| description | TEXT | NULL | Category description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Default Data:**
```sql
INSERT INTO categories (name, description) VALUES
('Propellers', 'Drone propellers and blades'),
('Motors', 'Brushless motors and motor controllers'),
('Batteries', 'LiPo batteries and power systems'),
('Flight Controllers', 'Flight control systems and sensors'),
('Frames', 'Drone frames and structural components'),
('Cameras', 'Cameras and gimbals'),
('ESCs', 'Electronic Speed Controllers'),
('Receivers', 'Radio receivers and transmitters');
```

#### 9.2.4 inventory_parts

Stores all inventory part information.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique part identifier |
| sku | VARCHAR(50) | NOT NULL, UNIQUE | Stock Keeping Unit |
| name | VARCHAR(255) | NOT NULL | Part name |
| category_id | INT | NOT NULL, FOREIGN KEY | Reference to categories |
| manufacturer | VARCHAR(255) | NOT NULL | Manufacturer name |
| quantity | INT | NOT NULL, DEFAULT 0 | Available quantity |
| price | DECIMAL(10,2) | NOT NULL | Unit price |
| status | VARCHAR(50) | DEFAULT 'available' | Part status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (sku)
- INDEX (category_id)
- INDEX (status)

**Relationships:**
- category_id → categories(id)

**Constraints:**
- quantity >= 0
- price >= 0

#### 9.2.5 ae_requests

Stores assembly engineer part requests.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique request identifier |
| drone_number | VARCHAR(100) | NOT NULL | Drone identification number |
| uin_number | VARCHAR(100) | NOT NULL | Unique identification number |
| items | JSON | NOT NULL | Requested parts (JSON array) |
| requested_by | VARCHAR(255) | NOT NULL | Requester name |
| email | VARCHAR(255) | NOT NULL | Requester email |
| status | ENUM | NOT NULL | 'pending', 'approved', 'rejected' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Request submission time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last status update time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (status)
- INDEX (email)
- INDEX (created_at)

**Items JSON Structure:**
```json
[
  {
    "part_id": "SKU-001",
    "part_name": "Propeller",
    "quantity": 5
  },
  {
    "part_id": "SKU-002",
    "part_name": "Motor",
    "quantity": 2
  }
]
```

**Status Values:**
- pending: Awaiting admin review
- approved: Approved by admin, inventory updated
- rejected: Rejected by admin

### 9.3 Supporting Tables

#### 9.3.1 drone_types

Defines types of drones manufactured.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique type identifier |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Drone type name |
| description | TEXT | NULL | Type description |
| specifications | JSON | NULL | Technical specifications |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

#### 9.3.2 drones

Stores individual drone records.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique drone identifier |
| drone_number | VARCHAR(100) | NOT NULL, UNIQUE | Drone identification |
| uin_number | VARCHAR(100) | NOT NULL, UNIQUE | Unique identification |
| drone_type_id | INT | FOREIGN KEY | Reference to drone_types |
| status | VARCHAR(50) | NOT NULL | Drone status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Relationships:**
- drone_type_id → drone_types(id)

#### 9.3.3 invoices

Stores invoice records for parts.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique invoice identifier |
| invoice_number | VARCHAR(100) | NOT NULL, UNIQUE | Invoice number |
| date | DATE | NOT NULL | Invoice date |
| total_amount | DECIMAL(10,2) | NOT NULL | Total invoice amount |
| status | VARCHAR(50) | NOT NULL | Invoice status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

#### 9.3.4 acceptance_orders

Stores acceptance order records.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order identifier |
| order_number | VARCHAR(100) | NOT NULL, UNIQUE | Order number |
| date | DATE | NOT NULL | Order date |
| status | VARCHAR(50) | NOT NULL | Order status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

#### 9.3.5 refresh_tokens

Stores JWT refresh tokens (for future enhancement).

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique token identifier |
| user_id | INT | NOT NULL, FOREIGN KEY | Reference to users |
| token | VARCHAR(500) | NOT NULL, UNIQUE | Refresh token |
| expires_at | TIMESTAMP | NOT NULL | Token expiration |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Relationships:**
- user_id → users(id)

#### 9.3.6 inventory_audit_log

Tracks all inventory changes for audit purposes.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique log identifier |
| part_id | INT | NOT NULL, FOREIGN KEY | Reference to inventory_parts |
| action | VARCHAR(50) | NOT NULL | Action type |
| old_quantity | INT | NULL | Previous quantity |
| new_quantity | INT | NULL | New quantity |
| changed_by | INT | NOT NULL, FOREIGN KEY | User who made change |
| reason | TEXT | NULL | Reason for change |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Change timestamp |

**Relationships:**
- part_id → inventory_parts(id)
- changed_by → users(id)

**Action Types:**
- CREATE: New part added
- UPDATE: Part details updated
- DELETE: Part removed
- DECREMENT: Quantity decreased (request approval)
- INCREMENT: Quantity increased (stock replenishment)

#### 9.3.7 part_invoices

Links parts to invoices.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique link identifier |
| invoice_id | INT | NOT NULL, FOREIGN KEY | Reference to invoices |
| part_id | INT | NOT NULL, FOREIGN KEY | Reference to inventory_parts |
| quantity | INT | NOT NULL | Quantity in invoice |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit |
| total_price | DECIMAL(10,2) | NOT NULL | Total line price |

**Relationships:**
- invoice_id → invoices(id)
- part_id → inventory_parts(id)

#### 9.3.8 buyers

Stores buyer/customer information.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique buyer identifier |
| name | VARCHAR(255) | NOT NULL | Buyer name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Buyer email |
| phone | VARCHAR(20) | NULL | Contact phone |
| address | TEXT | NULL | Buyer address |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

#### 9.3.9 po_requests

Stores purchase order requests.

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique PO identifier |
| po_number | VARCHAR(100) | NOT NULL, UNIQUE | PO number |
| buyer_id | INT | NOT NULL, FOREIGN KEY | Reference to buyers |
| status | VARCHAR(50) | NOT NULL | PO status |
| total_amount | DECIMAL(10,2) | NOT NULL | Total PO amount |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Relationships:**
- buyer_id → buyers(id)

### 9.4 Database Relationships

**Entity Relationship Diagram (Text Description):**

```
users (1) ----< (M) ae_requests
users (1) ----< (M) inventory_audit_log
roles (1) ----< (M) users
categories (1) ----< (M) inventory_parts
inventory_parts (1) ----< (M) inventory_audit_log
inventory_parts (1) ----< (M) part_invoices
invoices (1) ----< (M) part_invoices
drone_types (1) ----< (M) drones
buyers (1) ----< (M) po_requests
```

### 9.5 Database Indexes

**Performance Indexes:**
- users.email (UNIQUE) - Fast login lookup
- inventory_parts.sku (UNIQUE) - Fast part lookup
- ae_requests.status - Fast status filtering
- ae_requests.email - Fast user request lookup
- inventory_audit_log.part_id - Fast audit trail lookup
- inventory_audit_log.created_at - Fast time-based queries

### 9.6 Database Constraints

**Foreign Key Constraints:**
- ON DELETE CASCADE: Not used (preserve data integrity)
- ON DELETE RESTRICT: Used for all foreign keys
- ON UPDATE CASCADE: Used where appropriate

**Check Constraints:**
- inventory_parts.quantity >= 0
- inventory_parts.price >= 0
- ae_requests.status IN ('pending', 'approved', 'rejected')
