# SuperBee Aeronautics - Azure Cloud Deployment Guide

**For IT Department / Cloud Administrators**

**Date:** May 28, 2026  
**Status:** Production Ready for Azure Cloud  
**Version:** 1.0.0

---

## 📋 Executive Summary

This guide provides complete instructions for deploying the SuperBee Aeronautics Inventory Management System on Microsoft Azure Cloud Platform, including detailed pricing information for different deployment tiers.

### Application Overview
- **Backend:** Node.js + Express API
- **Frontend:** React + TypeScript (Static Web App)
- **Database:** MySQL 8.0
- **Authentication:** JWT-based
- **Deployment Model:** PaaS (Platform as a Service)

---

## 🏗️ Azure Architecture Overview

### Recommended Azure Services

1. **Azure App Service** (Backend API)
   - Fully managed platform for Node.js applications
   - Built-in scaling and load balancing
   - Integrated with Azure Monitor

2. **Azure Static Web Apps** or **Azure App Service** (Frontend)
   - Host React application
   - Global CDN distribution
   - Custom domain and SSL included

3. **Azure Database for MySQL - Flexible Server**
   - Fully managed MySQL database
   - Automated backups and patching
   - High availability options

4. **Azure Key Vault** (Optional but Recommended)
   - Secure storage for secrets and connection strings
   - JWT secret management

5. **Azure Application Insights** (Monitoring)
   - Application performance monitoring
   - Error tracking and diagnostics
   - User analytics

6. **Azure Storage Account** (Optional)
   - Store database backups
   - Store application logs
   - File uploads (if needed in future)

### Architecture Diagram (Conceptual)
```
Internet
    ↓
Azure Front Door / CDN
    ↓
┌─────────────────────────────────────────┐
│  Azure Static Web Apps (Frontend)       │
│  - React Application                    │
│  - Global CDN                           │
└─────────────────────────────────────────┘
    ↓ API Calls
┌─────────────────────────────────────────┐
│  Azure App Service (Backend)            │
│  - Node.js + Express                    │
│  - Auto-scaling enabled                 │
└─────────────────────────────────────────┘
    ↓ Database Connection
┌─────────────────────────────────────────┐
│  Azure Database for MySQL               │
│  - Flexible Server                      │
│  - Automated backups                    │
└─────────────────────────────────────────┘
```

---

## 💰 Pricing Details (India Region - Central India)

### Pricing Tier Comparison

All prices are approximate monthly costs in INR (Indian Rupees) for India Central region.

---

### 🟢 TIER 1: SMALL DEPLOYMENT (Development/Testing)
**Recommended for:** Testing, staging, small teams (5-10 users)

| Service | Specification | Monthly Cost (INR) |
|---------|--------------|-------------------|
| **App Service (Backend)** | B1 Basic (1 Core, 1.75 GB RAM) | ₹1,200 |
| **Static Web Apps (Frontend)** | Free Tier | ₹0 |
| **Azure Database for MySQL** | B1ms (1 vCore, 2 GB RAM, 20 GB storage) | ₹1,800 |
| **Application Insights** | Basic (5 GB data/month) | ₹0 (Free tier) |
| **Bandwidth** | 5 GB outbound | ₹0 (First 100 GB free) |
| **TOTAL** | | **₹3,000/month** |

**Characteristics:**
- ✅ Good for development and testing
- ✅ Handles 5-10 concurrent users
- ✅ Basic monitoring included
- ⚠️ No auto-scaling
- ⚠️ Single instance (no high availability)

---

### 🟡 TIER 2: MEDIUM DEPLOYMENT (Production - Small Organization)
**Recommended for:** Production use, 20-50 users, business hours operation

| Service | Specification | Monthly Cost (INR) |
|---------|--------------|-------------------|
| **App Service (Backend)** | P1v3 Premium (2 Cores, 8 GB RAM, Auto-scale) | ₹12,000 |
| **Static Web Apps (Frontend)** | Standard Tier | ₹750 |
| **Azure Database for MySQL** | D2ds_v4 (2 vCores, 8 GB RAM, 128 GB storage) | ₹8,500 |
| **Application Insights** | Pay-as-you-go (5 GB data/month included free) | ₹500 |
| **Azure Key Vault** | Standard (1000 operations/month) | ₹100 |
| **Bandwidth** | 50 GB outbound | ₹0 (First 100 GB free) |
| **TOTAL** | | **₹21,850/month** |

**Characteristics:**
- ✅ Production-ready
- ✅ Auto-scaling enabled
- ✅ Handles 20-50 concurrent users
- ✅ 99.9% SLA
- ✅ Automated backups (7 days retention)
- ✅ SSL included
- ✅ Monitoring and alerts
- ✅ Better performance with Premium tier

---

### 🔴 TIER 3: LARGE DEPLOYMENT (Production - Enterprise)
**Recommended for:** Large organizations, 100+ users, 24/7 operation, high availability

| Service | Specification | Monthly Cost (INR) |
|---------|--------------|-------------------|
| **App Service (Backend)** | P2v3 Premium (4 Cores, 16 GB RAM, 2 instances) | ₹32,000 |
| **Static Web Apps (Frontend)** | Standard Tier + CDN | ₹1,500 |
| **Azure Database for MySQL** | D4ds_v4 (4 vCores, 16 GB RAM, 256 GB storage, HA) | ₹28,000 |
| **Application Insights** | Pay-as-you-go (20 GB data/month) | ₹2,500 |
| **Azure Key Vault** | Standard (5000 operations/month) | ₹200 |
| **Azure Backup** | Database backups (30 days retention) | ₹1,500 |
| **Bandwidth** | 200 GB outbound | ₹2,500 |
| **TOTAL** | | **₹68,200/month** |

**Characteristics:**
- ✅ Enterprise-grade
- ✅ High availability (99.99% SLA)
- ✅ Handles 100+ concurrent users
- ✅ Multi-region deployment ready
- ✅ Advanced monitoring and diagnostics
- ✅ 30-day backup retention
- ✅ Auto-scaling with multiple instances
- ✅ DDoS protection
- ✅ 24/7 support available

---

### 📊 Annual Cost Summary

| Tier | Monthly Cost | Annual Cost | Annual Cost (with 10% discount*) |
|------|-------------|-------------|----------------------------------|
| **Small** | ₹3,000 | ₹36,000 | ₹32,400 |
| **Medium** | ₹21,850 | ₹2,62,200 | ₹2,35,980 |
| **Large** | ₹68,200 | ₹8,18,400 | ₹7,36,560 |

*Azure offers discounts for 1-year or 3-year reserved instances

---

### 💡 Cost Optimization Tips

1. **Use Reserved Instances**
   - Save 30-40% with 1-year commitment
   - Save 50-60% with 3-year commitment

2. **Auto-Scaling Configuration**
   - Scale down during non-business hours
   - Potential savings: 30-40%

3. **Database Optimization**
   - Use Burstable tier for development
   - Stop database during non-working hours (dev/test)
   - Potential savings: 50% for dev environments

4. **Azure Hybrid Benefit**
   - If you have existing Windows Server licenses
   - Potential savings: Up to 40%

5. **Monitoring and Alerts**
   - Set up cost alerts
   - Monitor unused resources
   - Review monthly spending

---

## 🚀 Deployment Steps

### Prerequisites

1. **Azure Account**
   - Active Azure subscription
   - Appropriate permissions (Contributor or Owner role)

2. **Tools Required**
   - Azure CLI installed ([Download](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))
   - Node.js v18+ installed locally
   - Git installed

3. **Application Files**
   - Complete project folder
   - Database schema file: `backend-setup/database-schema.sql`

---

### STEP 1: Setup Azure CLI and Login

```bash
# Install Azure CLI (if not installed)
# Windows: Download from https://aka.ms/installazurecliwindows

# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Set default location
az configure --defaults location=centralindia
```

---

### STEP 2: Create Resource Group

```bash
# Create resource group
az group create \
  --name superbee-rg \
  --location centralindia

# Verify creation
az group show --name superbee-rg
```

---

### STEP 3: Create Azure Database for MySQL

```bash
# Create MySQL Flexible Server
az mysql flexible-server create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --location centralindia \
  --admin-user superbeeadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 20 \
  --version 8.0 \
  --public-access 0.0.0.0

# Note: For production, use Standard_D2ds_v4 or higher
# For production: --tier GeneralPurpose --sku-name Standard_D2ds_v4

# Create database
az mysql flexible-server db create \
  --resource-group superbee-rg \
  --server-name superbee-mysql-server \
  --database-name superbee_inventory

# Configure firewall to allow Azure services
az mysql flexible-server firewall-rule create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Important:** Save the connection string:
```
Server: superbee-mysql-server.mysql.database.azure.com
Database: superbee_inventory
User: superbeeadmin
Password: YourSecurePassword123!
Port: 3306
```

---

### STEP 4: Load Database Schema

```bash
# Install MySQL client (if not installed)
# Windows: Download from https://dev.mysql.com/downloads/mysql/

# Connect and load schema
mysql -h superbee-mysql-server.mysql.database.azure.com \
  -u superbeeadmin \
  -p \
  superbee_inventory < backend-setup/database-schema.sql

# Verify tables
mysql -h superbee-mysql-server.mysql.database.azure.com \
  -u superbeeadmin \
  -p \
  -e "USE superbee_inventory; SHOW TABLES;"
```

---

### STEP 5: Initialize Database Users

```bash
# Navigate to backend folder
cd backend

# Update database connection in .env temporarily for initialization
# Create a temporary .env file for initialization
cat > .env.azure << EOF
DB_HOST=superbee-mysql-server.mysql.database.azure.com
DB_PORT=3306
DB_USER=superbeeadmin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=superbee_inventory
EOF

# Run initialization script
node scripts/init-users.js

# Verify users created
mysql -h superbee-mysql-server.mysql.database.azure.com \
  -u superbeeadmin \
  -p \
  -e "USE superbee_inventory; SELECT id, email, role FROM users;"
```

---

### STEP 6: Create Azure App Service (Backend)

```bash
# Create App Service Plan
az appservice plan create \
  --name superbee-backend-plan \
  --resource-group superbee-rg \
  --sku B1 \
  --is-linux

# Note: For production, use Premium v3 tier
# For Medium production: --sku P1v3
# For Large production: --sku P2v3

# Create Web App for Backend
az webapp create \
  --resource-group superbee-rg \
  --plan superbee-backend-plan \
  --name superbee-backend-api \
  --runtime "NODE:18-lts"

# Configure environment variables
az webapp config appsettings set \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_HOST=superbee-mysql-server.mysql.database.azure.com \
    DB_PORT=3306 \
    DB_USER=superbeeadmin \
    DB_PASSWORD=YourSecurePassword123! \
    DB_NAME=superbee_inventory \
    JWT_SECRET=zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly \
    JWT_EXPIRES_IN=24h \
    CORS_ORIGIN=https://superbee-frontend.azurestaticapps.net

# Enable logging
az webapp log config \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --application-logging filesystem \
  --level information
```

---

### STEP 7: Deploy Backend Code

```bash
# Navigate to backend folder
cd backend

# Create deployment package (zip file)
# First, ensure you have production dependencies only
npm install --production

# Create .deployment file for Azure
cat > .deployment << EOF
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
EOF

# Create a startup script for Azure
cat > startup.sh << EOF
#!/bin/bash
cd /home/site/wwwroot
npm install --production
node server.js
EOF

# Deploy using Azure CLI
az webapp up \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --runtime "NODE:18-lts"

# Alternative: Deploy using Git
# Initialize git repository
git init
git add .
git commit -m "Initial deployment"

# Get deployment credentials
az webapp deployment source config-local-git \
  --resource-group superbee-rg \
  --name superbee-backend-api

# Push to Azure
git remote add azure <GIT_URL_FROM_PREVIOUS_COMMAND>
git push azure master
```

---

### STEP 8: Create Azure Static Web App (Frontend)

```bash
# Navigate back to project root
cd ..

# Install Static Web Apps CLI (optional, for local testing)
npm install -g @azure/static-web-apps-cli

# Build frontend
npm install
npm run build

# Create Static Web App
az staticwebapp create \
  --name superbee-frontend \
  --resource-group superbee-rg \
  --location centralindia \
  --sku Standard \
  --source https://github.com/YOUR_ORG/YOUR_REPO \
  --branch main \
  --app-location "/" \
  --output-location "dist"

# Note: If not using GitHub, you can deploy manually
# Get deployment token
az staticwebapp secrets list \
  --name superbee-frontend \
  --resource-group superbee-rg

# Deploy using SWA CLI
swa deploy ./dist \
  --deployment-token <TOKEN_FROM_PREVIOUS_COMMAND>
```

**Alternative: Manual Deployment**
```bash
# If you prefer manual deployment without GitHub
# 1. Build the frontend
npm run build

# 2. Upload dist folder to Azure Storage
# 3. Configure Static Web App to use Azure Storage
```

---

### STEP 9: Configure Application Insights (Monitoring)

```bash
# Create Application Insights resource
az monitor app-insights component create \
  --app superbee-insights \
  --location centralindia \
  --resource-group superbee-rg \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app superbee-insights \
  --resource-group superbee-rg \
  --query instrumentationKey

# Add to backend environment variables
az webapp config appsettings set \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY=<INSTRUMENTATION_KEY>

# Restart backend to apply changes
az webapp restart \
  --resource-group superbee-rg \
  --name superbee-backend-api
```

**Note:** Application Insights pricing is pay-as-you-go:
- First 5 GB/month: Free
- Additional data: ~₹150/GB
- For small applications, monitoring costs are typically ₹0-500/month

---

### STEP 10: Configure Custom Domain and SSL (Optional)

```bash
# Add custom domain
az webapp config hostname add \
  --resource-group superbee-rg \
  --webapp-name superbee-backend-api \
  --hostname api.yourdomain.com

# Bind SSL certificate (Azure provides free managed certificate)
az webapp config ssl bind \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --certificate-thumbprint auto \
  --ssl-type SNI

# Configure custom domain for Static Web App
az staticwebapp hostname set \
  --name superbee-frontend \
  --resource-group superbee-rg \
  --hostname www.yourdomain.com
```

---

### STEP 11: Configure Auto-Scaling (Production Only)

```bash
# Enable auto-scaling for backend
az monitor autoscale create \
  --resource-group superbee-rg \
  --resource superbee-backend-api \
  --resource-type Microsoft.Web/serverfarms \
  --name superbee-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1

# Add scale-out rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group superbee-rg \
  --autoscale-name superbee-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1

# Add scale-in rule (CPU < 30%)
az monitor autoscale rule create \
  --resource-group superbee-rg \
  --autoscale-name superbee-autoscale \
  --condition "Percentage CPU < 30 avg 5m" \
  --scale in 1
```

---

### STEP 12: Setup Automated Backups

```bash
# Enable automated backups for MySQL
az mysql flexible-server backup create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --backup-name initial-backup

# Configure backup retention (default is 7 days, max 35 days)
az mysql flexible-server parameter set \
  --resource-group superbee-rg \
  --server-name superbee-mysql-server \
  --name backup_retention_days \
  --value 30

# For production, consider geo-redundant backups
az mysql flexible-server update \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --backup-retention 30 \
  --geo-redundant-backup Enabled
```

---

## ✅ Post-Deployment Verification

### 1. Verify Backend API

```bash
# Get backend URL
az webapp show \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --query defaultHostName --output tsv

# Test health endpoint
curl https://superbee-backend-api.azurewebsites.net/health

# Expected response:
# {"status":"OK","timestamp":"2026-05-28T..."}

# Test login endpoint
curl -X POST https://superbee-backend-api.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ram@superbee.com","password":"123456"}'

# Should return JWT token
```

### 2. Verify Frontend

```bash
# Get frontend URL
az staticwebapp show \
  --name superbee-frontend \
  --resource-group superbee-rg \
  --query defaultHostname --output tsv

# Open in browser
# https://superbee-frontend.azurestaticapps.net
```

### 3. Verify Database Connection

```bash
# Check database connectivity from backend
az webapp log tail \
  --resource-group superbee-rg \
  --name superbee-backend-api

# Look for successful database connection messages
```

### 4. Test Complete Workflow

1. Open frontend URL in browser
2. Login with: ram@superbee.com / 123456
3. Navigate to Inventory page
4. Add a new part
5. Verify part appears in list
6. Test Assembly Engineer workflow:
   - Login as: ae@superbee.com / 123456
   - Add items to cart
   - Submit request
   - Verify request appears in dashboard

---

## 🔧 Maintenance and Monitoring

### View Application Logs

```bash
# Stream backend logs
az webapp log tail \
  --resource-group superbee-rg \
  --name superbee-backend-api

# Download logs
az webapp log download \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --log-file backend-logs.zip

# View Application Insights
# Go to Azure Portal > Application Insights > superbee-insights
# View: Performance, Failures, Users, Events
```

### Database Maintenance

```bash
# Create manual backup
az mysql flexible-server backup create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --backup-name manual-backup-$(date +%Y%m%d)

# List backups
az mysql flexible-server backup list \
  --resource-group superbee-rg \
  --name superbee-mysql-server

# Restore from backup (if needed)
az mysql flexible-server restore \
  --resource-group superbee-rg \
  --name superbee-mysql-server-restored \
  --source-server superbee-mysql-server \
  --restore-time "2026-05-28T10:00:00Z"
```

### Update Application

```bash
# Update backend
cd backend
git pull origin main
az webapp up \
  --resource-group superbee-rg \
  --name superbee-backend-api

# Update frontend
cd ..
npm run build
swa deploy ./dist --deployment-token <TOKEN>

# Restart services
az webapp restart \
  --resource-group superbee-rg \
  --name superbee-backend-api
```

---

## 🆘 Troubleshooting

### Backend Not Starting

**Problem:** Backend shows "Application Error"

**Solutions:**
```bash
# Check logs
az webapp log tail --resource-group superbee-rg --name superbee-backend-api

# Common issues:
# 1. Database connection failed
#    - Verify DB_HOST, DB_USER, DB_PASSWORD in app settings
#    - Check firewall rules allow Azure services

# 2. Missing environment variables
#    - Verify all required variables are set
az webapp config appsettings list \
  --resource-group superbee-rg \
  --name superbee-backend-api

# 3. Port configuration
#    - Azure expects app to listen on PORT environment variable
#    - Verify server.js uses process.env.PORT
```

### Database Connection Errors

**Problem:** "ER_ACCESS_DENIED_ERROR" or "ETIMEDOUT"

**Solutions:**
```bash
# Check firewall rules
az mysql flexible-server firewall-rule list \
  --resource-group superbee-rg \
  --name superbee-mysql-server

# Add Azure services if missing
az mysql flexible-server firewall-rule create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Test connection from local machine
mysql -h superbee-mysql-server.mysql.database.azure.com \
  -u superbeeadmin \
  -p \
  superbee_inventory
```

### CORS Errors

**Problem:** Frontend cannot connect to backend

**Solutions:**
```bash
# Update CORS_ORIGIN in backend settings
az webapp config appsettings set \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --settings CORS_ORIGIN=https://superbee-frontend.azurestaticapps.net

# Restart backend
az webapp restart \
  --resource-group superbee-rg \
  --name superbee-backend-api
```

### High Costs

**Problem:** Azure bill higher than expected

**Solutions:**
```bash
# Check current costs
az consumption usage list \
  --start-date 2026-05-01 \
  --end-date 2026-05-31

# Set up cost alerts
az consumption budget create \
  --resource-group superbee-rg \
  --budget-name monthly-budget \
  --amount 25000 \
  --time-grain Monthly \
  --start-date 2026-05-01

# Optimize:
# 1. Scale down during non-business hours
# 2. Use reserved instances for 30-40% savings
# 3. Review Application Insights data ingestion
# 4. Stop dev/test resources when not in use
```

---

## 📊 Monitoring and Alerts

### Setup Cost Alerts

```bash
# Create budget alert
az consumption budget create \
  --resource-group superbee-rg \
  --budget-name superbee-monthly-budget \
  --amount 25000 \
  --time-grain Monthly \
  --start-date 2026-06-01 \
  --end-date 2027-05-31 \
  --notifications \
    threshold=80 \
    operator=GreaterThan \
    contact-emails="admin@superbee.com"
```

### Setup Performance Alerts

```bash
# Alert when CPU > 80%
az monitor metrics alert create \
  --name high-cpu-alert \
  --resource-group superbee-rg \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/superbee-rg/providers/Microsoft.Web/sites/superbee-backend-api \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@superbee.com

# Alert when response time > 2 seconds
az monitor metrics alert create \
  --name slow-response-alert \
  --resource-group superbee-rg \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/superbee-rg/providers/Microsoft.Web/sites/superbee-backend-api \
  --condition "avg ResponseTime > 2000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action email admin@superbee.com
```

### View Metrics

```bash
# View CPU usage
az monitor metrics list \
  --resource /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/superbee-rg/providers/Microsoft.Web/sites/superbee-backend-api \
  --metric "CpuPercentage" \
  --start-time 2026-05-28T00:00:00Z \
  --end-time 2026-05-28T23:59:59Z

# View memory usage
az monitor metrics list \
  --resource /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/superbee-rg/providers/Microsoft.Web/sites/superbee-backend-api \
  --metric "MemoryPercentage" \
  --start-time 2026-05-28T00:00:00Z \
  --end-time 2026-05-28T23:59:59Z
```

---

## 🔐 Security Best Practices

### 1. Use Azure Key Vault for Secrets

```bash
# Create Key Vault
az keyvault create \
  --name superbee-keyvault \
  --resource-group superbee-rg \
  --location centralindia

# Store database password
az keyvault secret set \
  --vault-name superbee-keyvault \
  --name db-password \
  --value "YourSecurePassword123!"

# Store JWT secret
az keyvault secret set \
  --vault-name superbee-keyvault \
  --name jwt-secret \
  --value "zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly"

# Enable managed identity for App Service
az webapp identity assign \
  --resource-group superbee-rg \
  --name superbee-backend-api

# Grant App Service access to Key Vault
az keyvault set-policy \
  --name superbee-keyvault \
  --object-id <MANAGED_IDENTITY_PRINCIPAL_ID> \
  --secret-permissions get list

# Reference secrets in app settings
az webapp config appsettings set \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --settings \
    DB_PASSWORD="@Microsoft.KeyVault(SecretUri=https://superbee-keyvault.vault.azure.net/secrets/db-password/)" \
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://superbee-keyvault.vault.azure.net/secrets/jwt-secret/)"
```

### 2. Enable HTTPS Only

```bash
# Force HTTPS
az webapp update \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --https-only true
```

### 3. Configure Network Security

```bash
# Restrict database access to specific IPs
az mysql flexible-server firewall-rule create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --rule-name AllowOfficeIP \
  --start-ip-address YOUR_OFFICE_IP \
  --end-ip-address YOUR_OFFICE_IP

# Enable private endpoint for database (Enterprise only)
az network private-endpoint create \
  --resource-group superbee-rg \
  --name superbee-mysql-pe \
  --vnet-name superbee-vnet \
  --subnet superbee-subnet \
  --private-connection-resource-id <MYSQL_RESOURCE_ID> \
  --group-id mysqlServer \
  --connection-name superbee-mysql-connection
```

### 4. Change Default Passwords

**IMPORTANT:** After deployment, immediately change default user passwords:

```sql
-- Connect to database
mysql -h superbee-mysql-server.mysql.database.azure.com \
  -u superbeeadmin \
  -p \
  superbee_inventory

-- Change admin password
UPDATE users 
SET password = '$2b$10$NEW_HASHED_PASSWORD' 
WHERE email = 'ram@superbee.com';

-- Change technician password
UPDATE users 
SET password = '$2b$10$NEW_HASHED_PASSWORD' 
WHERE email = 'ae@superbee.com';
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Azure subscription active
- [ ] Azure CLI installed and configured
- [ ] Project files ready
- [ ] Database schema file available
- [ ] Domain name ready (if using custom domain)

### Azure Resources
- [ ] Resource group created
- [ ] MySQL Flexible Server created
- [ ] Database created and schema loaded
- [ ] Default users initialized
- [ ] App Service Plan created
- [ ] App Service (Backend) created
- [ ] Static Web App (Frontend) created
- [ ] Application Insights configured
- [ ] Key Vault created (optional)

### Configuration
- [ ] Backend environment variables set
- [ ] Frontend API URL configured
- [ ] CORS configured correctly
- [ ] Database firewall rules set
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (if applicable)

### Deployment
- [ ] Backend code deployed
- [ ] Frontend built and deployed
- [ ] Health check passes
- [ ] Login functionality works
- [ ] API endpoints responding
- [ ] Database queries working

### Security
- [ ] Default passwords changed
- [ ] Secrets moved to Key Vault
- [ ] HTTPS-only enabled
- [ ] Firewall rules configured
- [ ] Backup retention set
- [ ] Monitoring enabled

### Post-Deployment
- [ ] Cost alerts configured
- [ ] Performance alerts configured
- [ ] Auto-scaling configured (production)
- [ ] Backup schedule verified
- [ ] Documentation updated
- [ ] Team trained on Azure Portal

---

## 💡 Recommendations for Your Organization

### Start Small, Scale Later

**Phase 1: Development/Testing (Month 1-2)**
- Deploy using **TIER 1 (Small)** - ₹3,000/month
- Test all features thoroughly
- Train your team
- Identify any issues

**Phase 2: Production Pilot (Month 3-6)**
- Upgrade to **TIER 2 (Medium)** - ₹21,850/month
- Roll out to 20-30 users
- Monitor performance and costs
- Gather user feedback

**Phase 3: Full Production (Month 6+)**
- Scale to **TIER 3 (Large)** if needed - ₹68,200/month
- Enable high availability
- Implement disaster recovery
- Full monitoring and alerts

### Cost Optimization Strategy

1. **Use Reserved Instances**
   - Commit to 1-year: Save 30-40%
   - Commit to 3-year: Save 50-60%
   - Estimated savings: ₹6,000-12,000/month

2. **Schedule Auto-Scaling**
   - Scale down after business hours (6 PM - 8 AM)
   - Scale down on weekends
   - Potential savings: 30-40%

3. **Development Environment**
   - Use separate dev environment with B1 tier
   - Stop dev resources when not in use
   - Use Azure Dev/Test pricing (if eligible)

4. **Database Optimization**
   - Start with Burstable tier for dev
   - Monitor actual usage before upgrading
   - Use read replicas only if needed

### Estimated Total Cost of Ownership (3 Years)

| Scenario | Year 1 | Year 2 | Year 3 | Total (3 Years) |
|----------|--------|--------|--------|-----------------|
| **Small (Dev/Test)** | ₹36,000 | ₹36,000 | ₹36,000 | ₹1,08,000 |
| **Medium (Production)** | ₹2,62,200 | ₹1,83,540* | ₹1,83,540* | ₹6,29,280 |
| **Large (Enterprise)** | ₹8,18,400 | ₹5,72,880* | ₹5,72,880* | ₹19,64,160 |

*With 30% reserved instance discount from Year 2

---

## 🎯 Quick Start Commands (Complete Deployment)

```bash
# ============================================
# COMPLETE AZURE DEPLOYMENT SCRIPT
# ============================================

# 1. Login and setup
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
az configure --defaults location=centralindia

# 2. Create resource group
az group create --name superbee-rg --location centralindia

# 3. Create MySQL database
az mysql flexible-server create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --location centralindia \
  --admin-user superbeeadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 20 \
  --version 8.0 \
  --public-access 0.0.0.0

az mysql flexible-server db create \
  --resource-group superbee-rg \
  --server-name superbee-mysql-server \
  --database-name superbee_inventory

az mysql flexible-server firewall-rule create \
  --resource-group superbee-rg \
  --name superbee-mysql-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 4. Load database schema
mysql -h superbee-mysql-server.mysql.database.azure.com \
  -u superbeeadmin \
  -p \
  superbee_inventory < backend-setup/database-schema.sql

# 5. Initialize users
cd backend
node scripts/init-users.js

# 6. Create App Service for backend
az appservice plan create \
  --name superbee-backend-plan \
  --resource-group superbee-rg \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group superbee-rg \
  --plan superbee-backend-plan \
  --name superbee-backend-api \
  --runtime "NODE:18-lts"

# 7. Configure backend environment
az webapp config appsettings set \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_HOST=superbee-mysql-server.mysql.database.azure.com \
    DB_PORT=3306 \
    DB_USER=superbeeadmin \
    DB_PASSWORD=YourSecurePassword123! \
    DB_NAME=superbee_inventory \
    JWT_SECRET=zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly \
    JWT_EXPIRES_IN=24h \
    CORS_ORIGIN=https://superbee-frontend.azurestaticapps.net

# 8. Deploy backend
az webapp up \
  --resource-group superbee-rg \
  --name superbee-backend-api \
  --runtime "NODE:18-lts"

# 9. Build and deploy frontend
cd ..
npm install
npm run build

az staticwebapp create \
  --name superbee-frontend \
  --resource-group superbee-rg \
  --location centralindia \
  --sku Free

# 10. Create Application Insights
az monitor app-insights component create \
  --app superbee-insights \
  --location centralindia \
  --resource-group superbee-rg \
  --application-type web

# 11. Verify deployment
echo "Backend URL: https://superbee-backend-api.azurewebsites.net"
echo "Frontend URL: https://superbee-frontend.azurestaticapps.net"
echo "Testing health endpoint..."
curl https://superbee-backend-api.azurewebsites.net/health

echo "Deployment complete!"
```

---

## 📞 Support and Resources

### Azure Documentation
- [Azure App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Azure Database for MySQL Documentation](https://learn.microsoft.com/en-us/azure/mysql/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-in/pricing/calculator/)

### Azure Support Plans
- **Basic:** Free (billing and subscription support only)
- **Developer:** ₹2,400/month (business hours, email support)
- **Standard:** ₹8,000/month (24/7, phone + email support)
- **Professional Direct:** ₹80,000/month (24/7, priority support)

### Useful Azure CLI Commands

```bash
# View all resources in resource group
az resource list --resource-group superbee-rg --output table

# View costs for current month
az consumption usage list \
  --start-date $(date -d "$(date +%Y-%m-01)" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)

# Delete all resources (cleanup)
az group delete --name superbee-rg --yes --no-wait

# Export resource group as template
az group export \
  --name superbee-rg \
  --output json > superbee-template.json
```

### Contact Information

**For Azure Technical Support:**
- Azure Portal: Support + Troubleshooting
- Phone: 1800-425-8700 (India toll-free)
- Email: Through Azure Portal

**For Application Support:**
- Refer to application documentation
- Contact: Your IT department

---

## 📝 Important Notes

### Default Credentials (CHANGE IMMEDIATELY)
- **Admin:** ram@superbee.com / 123456
- **Technician:** ae@superbee.com / 123456

### JWT Secret (Already Configured)
```
zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly
```

### Database Connection String
```
Server: superbee-mysql-server.mysql.database.azure.com
Database: superbee_inventory
User: superbeeadmin
Password: [Your secure password]
Port: 3306
SSL: Required
```

### API Endpoints
- Health: `GET /health`
- Login: `POST /api/auth/login`
- Inventory: `GET /api/inventory`
- **Total:** 28 API endpoints

---

## ✅ Summary

### What You Get with Azure Deployment

✅ **Fully Managed Infrastructure**
- No server maintenance required
- Automatic OS and security updates
- Built-in load balancing

✅ **High Availability**
- 99.9% SLA (Standard tier)
- 99.99% SLA (Premium tier with HA)
- Automatic failover

✅ **Security**
- Built-in DDoS protection
- Free SSL certificates
- Azure Active Directory integration ready
- Compliance certifications (ISO, SOC, HIPAA)

✅ **Scalability**
- Auto-scaling based on demand
- Scale up/down with single command
- Global distribution ready

✅ **Monitoring**
- Application Insights included
- Real-time metrics and alerts
- Performance diagnostics

✅ **Backup and Recovery**
- Automated daily backups
- Point-in-time restore
- Geo-redundant storage option

### Estimated Deployment Time
- **Initial Setup:** 2-3 hours
- **Testing and Verification:** 1-2 hours
- **Total:** 3-5 hours

### Recommended Tier for Your Organization
Based on typical small-to-medium organization needs:
- **Start with:** TIER 1 (Small) - ₹3,000/month for testing
- **Production:** TIER 2 (Medium) - ₹21,850/month for 20-50 users
- **Scale to:** TIER 3 (Large) - ₹68,200/month when you exceed 50 users

---

**Document Version:** 1.0  
**Last Updated:** May 28, 2026  
**Prepared For:** SuperBee Aeronautics IT Department  
**Application:** SuperBee Inventory Management System  
**Status:** ✅ Ready for Azure Deployment

---

**For on-premises deployment, refer to:** `DEPLOYMENT_INSTRUCTIONS.md`  
**For general information, refer to:** `README.md`

