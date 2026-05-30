# SuperBee Aeronautics - AWS Cloud Deployment Guide

**For IT Department / Cloud Administrators**

**Date:** May 30, 2026  
**Status:** Production Ready for AWS Cloud  
**Version:** 1.0.0

---

## 📋 Executive Summary

This guide provides complete instructions for deploying the SuperBee Aeronautics Inventory Management System on Amazon Web Services (AWS), including detailed pricing information for different deployment tiers.

### Why AWS?
- ✅ **Cost-Effective:** Generally 20-30% cheaper than Azure for similar workloads
- ✅ **Mature Platform:** Most widely used cloud platform globally
- ✅ **Excellent Documentation:** Extensive resources and community support
- ✅ **India Presence:** Mumbai (ap-south-1) region with low latency
- ✅ **Free Tier:** 12 months free tier for new accounts

### Application Overview
- **Backend:** Node.js + Express API
- **Frontend:** React + TypeScript (Static Website)
- **Database:** MySQL 8.0
- **Authentication:** JWT-based
- **Deployment Model:** Elastic Beanstalk (PaaS) or EC2 (IaaS)

---

## 🏗️ AWS Architecture Overview

### Recommended AWS Services

1. **AWS Elastic Beanstalk** (Backend API) - **RECOMMENDED**
   - Fully managed platform for Node.js applications
   - Auto-scaling and load balancing included
   - Easy deployment and monitoring
   - **Alternative:** EC2 instances with manual setup

2. **Amazon S3 + CloudFront** (Frontend)
   - Host static React application on S3
   - CloudFront CDN for global distribution
   - SSL certificate included (via ACM)
   - **Most cost-effective option**

3. **Amazon RDS for MySQL**
   - Fully managed MySQL database
   - Automated backups and patching
   - Multi-AZ deployment for high availability

4. **AWS Secrets Manager** (Optional but Recommended)
   - Secure storage for database credentials
   - JWT secret management
   - Automatic rotation support

5. **Amazon CloudWatch** (Monitoring)
   - Application and infrastructure monitoring
   - Log aggregation and analysis
   - Alerts and notifications

6. **Application Load Balancer (ALB)**
   - Distribute traffic across multiple instances
   - SSL termination
   - Health checks

### Architecture Diagram (Conceptual)
```
Internet
    ↓
Route 53 (DNS) + CloudFront (CDN)
    ↓
┌─────────────────────────────────────────┐
│  Amazon S3 (Frontend)                   │
│  - React Static Files                   │
│  - CloudFront Distribution              │
└─────────────────────────────────────────┘
    ↓ API Calls
┌─────────────────────────────────────────┐
│  Application Load Balancer              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Elastic Beanstalk / EC2 (Backend)      │
│  - Node.js + Express                    │
│  - Auto-scaling enabled                 │
└─────────────────────────────────────────┘
    ↓ Database Connection
┌─────────────────────────────────────────┐
│  Amazon RDS for MySQL                   │
│  - Multi-AZ (Production)                │
│  - Automated backups                    │
└─────────────────────────────────────────┘
```

---

## 💰 Pricing Details (Mumbai Region - ap-south-1)

### Pricing Tier Comparison

All prices are approximate monthly costs in INR (Indian Rupees) for Mumbai (ap-south-1) region.

**Note:** AWS prices are typically 20-30% lower than Azure for equivalent services.

---

### 🟢 TIER 1: SMALL DEPLOYMENT (Development/Testing)
**Recommended for:** Testing, staging, small teams (5-10 users)

| Service | Specification | Monthly Cost (INR) |
|---------|--------------|-------------------|
| **EC2 (Backend)** | t3.small (2 vCPU, 2 GB RAM) | ₹1,100 |
| **RDS MySQL** | db.t3.micro (2 vCPU, 1 GB RAM, 20 GB storage) | ₹1,200 |
| **S3 (Frontend)** | 5 GB storage + 10 GB transfer | ₹50 |
| **CloudFront** | 10 GB data transfer | ₹100 |
| **Route 53** | Hosted zone + queries | ₹50 |
| **CloudWatch** | Basic monitoring (5 GB logs) | ₹0 (Free tier) |
| **Data Transfer** | 5 GB outbound | ₹0 (First 100 GB free) |
| **TOTAL** | | **₹2,500/month** |

**Characteristics:**
- ✅ Perfect for development and testing
- ✅ Handles 5-10 concurrent users
- ✅ Basic monitoring included
- ✅ **Cheapest option** - 17% less than Azure
- ⚠️ No auto-scaling
- ⚠️ Single instance (no high availability)
- 💡 **Free Tier:** First 12 months free for new AWS accounts!

---

### 🟡 TIER 2: MEDIUM DEPLOYMENT (Production - Small Organization)
**Recommended for:** Production use, 20-50 users, business hours operation

| Service | Specification | Monthly Cost (INR) |
|---------|--------------|-------------------|
| **Elastic Beanstalk** | t3.medium (2 vCPU, 4 GB RAM, 2 instances) | ₹3,600 |
| **Application Load Balancer** | ALB with health checks | ₹1,500 |
| **RDS MySQL** | db.t3.small (2 vCPU, 2 GB RAM, 100 GB storage) | ₹3,200 |
| **S3 (Frontend)** | 10 GB storage + 50 GB transfer | ₹150 |
| **CloudFront** | 100 GB data transfer | ₹800 |
| **Route 53** | Hosted zone + queries | ₹50 |
| **CloudWatch** | Standard monitoring (20 GB logs) | ₹800 |
| **Secrets Manager** | 2 secrets | ₹100 |
| **Data Transfer** | 50 GB outbound | ₹0 (First 100 GB free) |
| **Backup** | RDS automated backups (7 days) | ₹200 |
| **TOTAL** | | **₹10,400/month** |

**Characteristics:**
- ✅ Production-ready
- ✅ Auto-scaling enabled (2-4 instances)
- ✅ Handles 20-50 concurrent users
- ✅ 99.95% SLA
- ✅ Automated backups (7 days retention)
- ✅ SSL included (AWS Certificate Manager - Free)
- ✅ Load balancing included
- ✅ **34% cheaper than Azure equivalent**
- ✅ Monitoring and alerts

---

### 🔴 TIER 3: LARGE DEPLOYMENT (Production - Enterprise)
**Recommended for:** Large organizations, 100+ users, 24/7 operation, high availability

| Service | Specification | Monthly Cost (INR) |
|---------|--------------|-------------------|
| **Elastic Beanstalk** | t3.large (2 vCPU, 8 GB RAM, 4 instances) | ₹14,400 |
| **Application Load Balancer** | ALB with SSL + health checks | ₹1,800 |
| **RDS MySQL** | db.r5.large (2 vCPU, 16 GB RAM, 500 GB, Multi-AZ) | ₹18,500 |
| **S3 (Frontend)** | 20 GB storage + 200 GB transfer | ₹400 |
| **CloudFront** | 500 GB data transfer + custom SSL | ₹3,500 |
| **Route 53** | Hosted zone + health checks | ₹200 |
| **CloudWatch** | Advanced monitoring (100 GB logs) | ₹3,500 |
| **Secrets Manager** | 5 secrets with rotation | ₹250 |
| **Data Transfer** | 200 GB outbound | ₹2,000 |
| **Backup** | RDS automated backups (30 days) | ₹1,500 |
| **WAF (Web Application Firewall)** | DDoS protection | ₹2,000 |
| **TOTAL** | | **₹48,050/month** |

**Characteristics:**
- ✅ Enterprise-grade
- ✅ High availability (99.99% SLA)
- ✅ Multi-AZ database deployment
- ✅ Handles 100+ concurrent users
- ✅ Auto-scaling (4-10 instances)
- ✅ Advanced monitoring and diagnostics
- ✅ 30-day backup retention
- ✅ DDoS protection (AWS Shield + WAF)
- ✅ **25% cheaper than Azure equivalent**
- ✅ 24/7 AWS support available (additional cost)

---

### 📊 Annual Cost Summary

| Tier | Monthly Cost | Annual Cost | Annual Cost (with Reserved Instances*) |
|------|-------------|-------------|---------------------------------------|
| **Small** | ₹2,500 | ₹30,000 | ₹21,000 (30% savings) |
| **Medium** | ₹10,400 | ₹1,24,800 | ₹87,360 (30% savings) |
| **Large** | ₹48,050 | ₹5,76,600 | ₹3,45,960 (40% savings) |

*Reserved Instances: 1-year commitment with upfront payment

---

### 💰 Cost Comparison: AWS vs Azure

| Tier | AWS Monthly | Azure Monthly | Savings with AWS |
|------|-------------|---------------|------------------|
| **Small** | ₹2,500 | ₹3,000 | **₹500 (17%)** |
| **Medium** | ₹10,400 | ₹15,850 | **₹5,450 (34%)** |
| **Large** | ₹48,050 | ₹63,700 | **₹15,650 (25%)** |

**Winner: AWS is significantly cheaper across all tiers!**

---

### 💡 Cost Optimization Tips

1. **Use Reserved Instances (RI)**
   - Save 30-40% with 1-year commitment
   - Save 50-60% with 3-year commitment
   - Apply to both EC2 and RDS

2. **Use Savings Plans**
   - Flexible alternative to Reserved Instances
   - Save up to 72% on compute
   - Applies across EC2, Lambda, Fargate

3. **Auto-Scaling Configuration**
   - Scale down during non-business hours
   - Use scheduled scaling (e.g., 9 AM - 6 PM)
   - Potential savings: 40-50%

4. **RDS Optimization**
   - Stop database during non-working hours (dev/test)
   - Use Aurora Serverless for variable workloads
   - Potential savings: 50% for dev environments

5. **S3 Intelligent-Tiering**
   - Automatically moves data to cheaper storage classes
   - No retrieval fees
   - Potential savings: 30-40% on storage

6. **CloudFront Optimization**
   - Enable compression
   - Set appropriate cache TTL
   - Potential savings: 20-30% on bandwidth

7. **AWS Free Tier**
   - First 12 months free for new accounts
   - Includes: 750 hours EC2 t2.micro, 750 hours RDS db.t2.micro
   - 5 GB S3 storage, 50 GB data transfer
   - **Total savings: ₹2,500/month for first year**

8. **Use Spot Instances (Advanced)**
   - For non-critical workloads
   - Save up to 90% on EC2 costs
   - Not recommended for production database

---

## 🎯 Recommended Deployment Plan

### For Your Organization: **TIER 2 (MEDIUM)**

**Why Tier 2 is Best:**
- ✅ Production-ready with high availability
- ✅ Handles 20-50 users comfortably
- ✅ Auto-scaling for peak loads
- ✅ Affordable at ₹10,400/month (₹1,24,800/year)
- ✅ Can scale to Tier 3 when needed
- ✅ 34% cheaper than Azure equivalent

**With Reserved Instances (1-year):**
- Monthly: ₹7,280
- Annual: ₹87,360
- **Total Savings: ₹37,440/year**

---

## 🚀 Deployment Steps

### Prerequisites

1. **AWS Account**
   - Active AWS account ([Sign up](https://aws.amazon.com/))
   - Credit card for verification (Free tier available)
   - IAM user with appropriate permissions

2. **Tools Required**
   - AWS CLI installed ([Download](https://aws.amazon.com/cli/))
   - Node.js v18+ installed locally
   - Git installed
   - EB CLI (Elastic Beanstalk CLI) - optional but recommended

3. **Application Files**
   - Complete project folder
   - Database schema file: `backend-setup/database-schema.sql`

---

### STEP 1: Setup AWS CLI and Configure

```bash
# Install AWS CLI (Windows)
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

# Configure AWS CLI
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: ap-south-1 (Mumbai)
# - Default output format: json

# Verify configuration
aws sts get-caller-identity

# Set default region
export AWS_DEFAULT_REGION=ap-south-1
```

---

### STEP 2: Create RDS MySQL Database

```bash
# Create DB subnet group (for VPC)
aws rds create-db-subnet-group \
  --db-subnet-group-name superbee-db-subnet \
  --db-subnet-group-description "SuperBee DB Subnet Group" \
  --subnet-ids subnet-xxxxx subnet-yyyyy \
  --region ap-south-1

# Create security group for RDS
aws ec2 create-security-group \
  --group-name superbee-rds-sg \
  --description "Security group for SuperBee RDS" \
  --vpc-id vpc-xxxxx \
  --region ap-south-1

# Allow MySQL access from backend security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 3306 \
  --source-group sg-yyyyy \
  --region ap-south-1

# Create RDS MySQL instance
aws rds create-db-instance \
  --db-instance-identifier superbee-mysql-db \
  --db-instance-class db.t3.small \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username superbeeadmin \
  --master-user-password "YourSecurePassword123!" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name superbee-db-subnet \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --db-name superbee_inventory \
  --publicly-accessible \
  --region ap-south-1

# Wait for database to be available (takes 5-10 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier superbee-mysql-db \
  --region ap-south-1

# Get database endpoint
aws rds describe-db-instances \
  --db-instance-identifier superbee-mysql-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-south-1
```

**Save the database endpoint:** `superbee-mysql-db.xxxxxxxxx.ap-south-1.rds.amazonaws.com`

---

### STEP 3: Load Database Schema

```bash
# Install MySQL client (if not installed)
# Windows: Download from https://dev.mysql.com/downloads/mysql/

# Get RDS endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier superbee-mysql-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-south-1)

# Connect and load schema
mysql -h $DB_ENDPOINT \
  -u superbeeadmin \
  -p \
  superbee_inventory < backend-setup/database-schema.sql

# Verify tables
mysql -h $DB_ENDPOINT \
  -u superbeeadmin \
  -p \
  -e "USE superbee_inventory; SHOW TABLES;"

# Initialize default users
cd backend
# Update .env temporarily
cat > .env.temp << EOF
DB_HOST=$DB_ENDPOINT
DB_PORT=3306
DB_USER=superbeeadmin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=superbee_inventory
EOF

# Run initialization script
node scripts/init-users.js

# Verify users
mysql -h $DB_ENDPOINT \
  -u superbeeadmin \
  -p \
  -e "USE superbee_inventory; SELECT id, email, role FROM users;"
```

---

### STEP 4: Deploy Backend with Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Navigate to backend folder
cd backend

# Initialize Elastic Beanstalk application
eb init -p node.js-18 superbee-backend --region ap-south-1

# Create environment
eb create superbee-backend-prod \
  --instance-type t3.medium \
  --scale 2 \
  --envvars \
    NODE_ENV=production,\
    PORT=8080,\
    DB_HOST=$DB_ENDPOINT,\
    DB_PORT=3306,\
    DB_USER=superbeeadmin,\
    DB_PASSWORD=YourSecurePassword123!,\
    DB_NAME=superbee_inventory,\
    JWT_SECRET=zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly,\
    JWT_EXPIRES_IN=24h,\
    CORS_ORIGIN=https://your-domain.com

# Wait for environment to be ready (takes 5-10 minutes)
eb status

# Get backend URL
eb status | grep "CNAME"
```

**Alternative: Manual EC2 Deployment (if not using Elastic Beanstalk)**

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --user-data file://backend-setup.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=superbee-backend}]' \
  --region ap-south-1

# SSH into instance and setup manually
ssh -i your-key.pem ec2-user@your-instance-ip
```

---

### STEP 5: Deploy Frontend to S3 + CloudFront

```bash
# Navigate to project root
cd ..

# Update frontend environment variable
cat > .env << EOF
VITE_API_URL=http://superbee-backend-prod.ap-south-1.elasticbeanstalk.com/api
EOF

# Build frontend
npm install
npm run build

# Create S3 bucket for frontend
aws s3 mb s3://superbee-frontend-prod --region ap-south-1

# Enable static website hosting
aws s3 website s3://superbee-frontend-prod \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read access
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::superbee-frontend-prod/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket superbee-frontend-prod \
  --policy file://bucket-policy.json

# Upload built files to S3
aws s3 sync dist/ s3://superbee-frontend-prod/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html separately (no cache)
aws s3 cp dist/index.html s3://superbee-frontend-prod/ \
  --cache-control "no-cache"

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name superbee-frontend-prod.s3-website.ap-south-1.amazonaws.com \
  --default-root-object index.html \
  --region ap-south-1

# Get CloudFront URL
aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].DomainName' \
  --output text
```

**CloudFront URL:** `https://d1234567890abc.cloudfront.net`

---

### STEP 6: Configure Custom Domain (Optional)

```bash
# Create hosted zone in Route 53
aws route53 create-hosted-zone \
  --name superbee.yourdomain.com \
  --caller-reference $(date +%s)

# Request SSL certificate from ACM
aws acm request-certificate \
  --domain-name superbee.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Note: Certificates for CloudFront must be in us-east-1 region

# Get certificate ARN
aws acm list-certificates --region us-east-1

# Update CloudFront distribution with custom domain and SSL
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --aliases superbee.yourdomain.com \
  --viewer-certificate ACMCertificateArn=YOUR_CERT_ARN,SSLSupportMethod=sni-only

# Create Route 53 record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://route53-record.json
```

---

### STEP 7: Configure Auto-Scaling (Production)

```bash
# Configure Elastic Beanstalk auto-scaling
eb config

# Add these settings in the configuration file:
# aws:autoscaling:asg:
#   MinSize: 2
#   MaxSize: 6
# aws:autoscaling:trigger:
#   MeasureName: CPUUtilization
#   Statistic: Average
#   Unit: Percent
#   UpperThreshold: 70
#   LowerThreshold: 30

# Save and apply configuration
eb deploy
```

---

### STEP 8: Setup Monitoring and Alerts

```bash
# Create SNS topic for alerts
aws sns create-topic \
  --name superbee-alerts \
  --region ap-south-1

# Subscribe email to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:ACCOUNT_ID:superbee-alerts \
  --protocol email \
  --notification-endpoint your-email@company.com \
  --region ap-south-1

# Create CloudWatch alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name superbee-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:ap-south-1:ACCOUNT_ID:superbee-alerts \
  --region ap-south-1

# Create alarm for RDS storage
aws cloudwatch put-metric-alarm \
  --alarm-name superbee-low-storage \
  --alarm-description "Alert when RDS storage is low" \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 5000000000 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:ap-south-1:ACCOUNT_ID:superbee-alerts \
  --dimensions Name=DBInstanceIdentifier,Value=superbee-mysql-db \
  --region ap-south-1
```

---

## ✅ Post-Deployment Verification

### 1. Backend Health Check
```bash
# Test backend API
curl https://your-backend-url.elasticbeanstalk.com/health

# Expected response:
# {"status":"OK","timestamp":"2026-05-30T..."}
```

### 2. Frontend Access
```bash
# Open browser
https://your-cloudfront-url.cloudfront.net

# Or custom domain
https://superbee.yourdomain.com
```

### 3. Login Test
- Email: `ram@superbee.com`
- Password: `123456`
- Should redirect to dashboard

### 4. Database Connection Test
```bash
# From backend EC2/EB instance
mysql -h $DB_ENDPOINT -u superbeeadmin -p -e "SELECT COUNT(*) FROM superbee_inventory.users;"
```

### 5. API Endpoint Test
```bash
# Test login API
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ram@superbee.com","password":"123456"}'

# Should return JWT token
```

---

## 🔧 Maintenance and Operations

### Daily Operations

**View Logs:**
```bash
# Backend logs (Elastic Beanstalk)
eb logs

# Or via CloudWatch
aws logs tail /aws/elasticbeanstalk/superbee-backend-prod/var/log/nodejs/nodejs.log --follow

# RDS logs
aws rds describe-db-log-files \
  --db-instance-identifier superbee-mysql-db \
  --region ap-south-1
```

**Monitor Performance:**
```bash
# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time 2026-05-30T00:00:00Z \
  --end-time 2026-05-30T23:59:59Z \
  --period 3600 \
  --statistics Average \
  --region ap-south-1
```

### Database Backups

**Manual Backup:**
```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier superbee-mysql-db \
  --db-snapshot-identifier superbee-backup-$(date +%Y%m%d) \
  --region ap-south-1

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier superbee-mysql-db \
  --region ap-south-1
```

**Restore from Backup:**
```bash
# Restore RDS from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier superbee-mysql-db-restored \
  --db-snapshot-identifier superbee-backup-20260530 \
  --region ap-south-1
```

### Update Application

**Update Backend:**
```bash
cd backend
# Make your changes
git commit -am "Update backend"

# Deploy to Elastic Beanstalk
eb deploy
```

**Update Frontend:**
```bash
# Make your changes
npm run build

# Upload to S3
aws s3 sync dist/ s3://superbee-frontend-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Scale Resources

**Scale Backend:**
```bash
# Update instance type
eb scale 4

# Or update configuration
eb config
# Change MinSize and MaxSize
```

**Scale Database:**
```bash
# Modify RDS instance class
aws rds modify-db-instance \
  --db-instance-identifier superbee-mysql-db \
  --db-instance-class db.r5.large \
  --apply-immediately \
  --region ap-south-1
```

---

## 🆘 Troubleshooting

### Backend Issues

**Backend Not Responding:**
```bash
# Check Elastic Beanstalk health
eb health

# View recent logs
eb logs --stream

# Check security group rules
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --region ap-south-1
```

**Database Connection Failed:**
```bash
# Test connection from backend instance
eb ssh
mysql -h $DB_HOST -u $DB_USER -p

# Check RDS security group
aws rds describe-db-instances \
  --db-instance-identifier superbee-mysql-db \
  --query 'DBInstances[0].VpcSecurityGroups' \
  --region ap-south-1
```

### Frontend Issues

**Frontend Not Loading:**
```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket superbee-frontend-prod

# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Test S3 direct access
curl http://superbee-frontend-prod.s3-website.ap-south-1.amazonaws.com
```

**CORS Errors:**
- Verify `CORS_ORIGIN` in backend environment variables
- Update Elastic Beanstalk configuration:
```bash
eb setenv CORS_ORIGIN=https://your-cloudfront-url.cloudfront.net
```

### Performance Issues

**High CPU Usage:**
```bash
# Check current metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region ap-south-1

# Scale up if needed
eb scale 4
```

**Database Slow Queries:**
```bash
# Enable slow query log
aws rds modify-db-parameter-group \
  --db-parameter-group-name default.mysql8.0 \
  --parameters "ParameterName=slow_query_log,ParameterValue=1,ApplyMethod=immediate" \
  --region ap-south-1

# View slow queries
aws rds download-db-log-file-portion \
  --db-instance-identifier superbee-mysql-db \
  --log-file-name slowquery/mysql-slowquery.log \
  --region ap-south-1
```

---

## 🔐 Security Best Practices

### 1. Use AWS Secrets Manager
```bash
# Store database password
aws secretsmanager create-secret \
  --name superbee/db/password \
  --secret-string "YourSecurePassword123!" \
  --region ap-south-1

# Store JWT secret
aws secretsmanager create-secret \
  --name superbee/jwt/secret \
  --secret-string "zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly" \
  --region ap-south-1

# Update backend to use Secrets Manager
# Add to backend code:
# const AWS = require('aws-sdk');
# const secretsManager = new AWS.SecretsManager({region: 'ap-south-1'});
```

### 2. Enable RDS Encryption
```bash
# Create encrypted RDS instance
aws rds create-db-instance \
  --db-instance-identifier superbee-mysql-db \
  --storage-encrypted \
  --kms-key-id arn:aws:kms:ap-south-1:ACCOUNT_ID:key/xxxxx \
  # ... other parameters
```

### 3. Enable CloudTrail (Audit Logging)
```bash
# Create CloudTrail trail
aws cloudtrail create-trail \
  --name superbee-audit-trail \
  --s3-bucket-name superbee-audit-logs \
  --region ap-south-1

# Start logging
aws cloudtrail start-logging \
  --name superbee-audit-trail \
  --region ap-south-1
```

### 4. Enable WAF (Web Application Firewall)
```bash
# Create WAF web ACL
aws wafv2 create-web-acl \
  --name superbee-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --region us-east-1

# Associate with CloudFront
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --web-acl-id arn:aws:wafv2:us-east-1:ACCOUNT_ID:global/webacl/superbee-waf/xxxxx
```

### 5. Regular Security Updates
```bash
# Update Elastic Beanstalk platform
eb upgrade

# Update RDS engine version
aws rds modify-db-instance \
  --db-instance-identifier superbee-mysql-db \
  --engine-version 8.0.36 \
  --allow-major-version-upgrade \
  --region ap-south-1
```

---

## 📊 Monitoring Dashboard Setup

### Create CloudWatch Dashboard
```bash
# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name SuperBee-Monitoring \
  --dashboard-body file://dashboard-config.json \
  --region ap-south-1
```

**dashboard-config.json:**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/EC2", "CPUUtilization", {"stat": "Average"}],
          ["AWS/RDS", "CPUUtilization", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "ap-south-1",
        "title": "CPU Utilization"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "DatabaseConnections", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "ap-south-1",
        "title": "Database Connections"
      }
    }
  ]
}
```

---

## 💳 Billing and Cost Management

### Setup Cost Alerts
```bash
# Create billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name superbee-billing-alert \
  --alarm-description "Alert when monthly cost exceeds ₹15,000" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --threshold 15000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:billing-alerts \
  --region us-east-1
```

### View Current Costs
```bash
# Get current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --region us-east-1
```

### Cost Optimization Report
```bash
# Get cost optimization recommendations
aws ce get-rightsizing-recommendation \
  --service AmazonEC2 \
  --region us-east-1
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] AWS account created and configured
- [ ] IAM user with appropriate permissions
- [ ] AWS CLI installed and configured
- [ ] Domain name registered (optional)
- [ ] SSL certificate requested (optional)

### Database Setup
- [ ] RDS MySQL instance created
- [ ] Security groups configured
- [ ] Database schema loaded
- [ ] Default users initialized
- [ ] Backup retention configured

### Backend Deployment
- [ ] Elastic Beanstalk application created
- [ ] Environment variables configured
- [ ] Auto-scaling configured
- [ ] Health checks passing
- [ ] Logs accessible

### Frontend Deployment
- [ ] S3 bucket created
- [ ] Static website hosting enabled
- [ ] Files uploaded to S3
- [ ] CloudFront distribution created
- [ ] Custom domain configured (optional)
- [ ] SSL certificate attached (optional)

### Security
- [ ] Security groups properly configured
- [ ] RDS not publicly accessible (use VPC)
- [ ] Secrets stored in Secrets Manager
- [ ] WAF enabled (production)
- [ ] CloudTrail enabled
- [ ] Default passwords changed

### Monitoring
- [ ] CloudWatch alarms configured
- [ ] SNS notifications setup
- [ ] Billing alerts enabled
- [ ] Dashboard created
- [ ] Log retention configured

### Testing
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Login functionality works
- [ ] API endpoints responding
- [ ] Database queries working
- [ ] All features tested

---

## 🎯 Quick Start Guide (TL;DR)

For experienced AWS users, here's the fastest deployment path:

```bash
# 1. Create RDS MySQL
aws rds create-db-instance --db-instance-identifier superbee-mysql-db \
  --db-instance-class db.t3.small --engine mysql --engine-version 8.0.35 \
  --master-username superbeeadmin --master-user-password "YourPassword123!" \
  --allocated-storage 100 --db-name superbee_inventory --region ap-south-1

# 2. Load schema
mysql -h YOUR_RDS_ENDPOINT -u superbeeadmin -p superbee_inventory < backend-setup/database-schema.sql

# 3. Initialize users
cd backend && node scripts/init-users.js

# 4. Deploy backend with EB
eb init -p node.js-18 superbee-backend --region ap-south-1
eb create superbee-backend-prod --instance-type t3.medium --scale 2

# 5. Build and deploy frontend
npm run build
aws s3 mb s3://superbee-frontend-prod --region ap-south-1
aws s3 sync dist/ s3://superbee-frontend-prod/
aws cloudfront create-distribution --origin-domain-name superbee-frontend-prod.s3-website.ap-south-1.amazonaws.com

# Done! 🎉
```

**Total Time:** 30-45 minutes

---

## 📞 Support and Resources

### AWS Documentation
- [Elastic Beanstalk Guide](https://docs.aws.amazon.com/elasticbeanstalk/)
- [RDS MySQL Guide](https://docs.aws.amazon.com/rds/mysql/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/s3/static-website/)
- [CloudFront Guide](https://docs.aws.amazon.com/cloudfront/)

### AWS Support Plans
- **Basic:** Free (Community forums only)
- **Developer:** $29/month (Business hours email support)
- **Business:** $100/month (24/7 phone + email support)
- **Enterprise:** $15,000/month (Dedicated TAM + 15-min response)

### Cost Calculator
- [AWS Pricing Calculator](https://calculator.aws/)
- Use this to get exact pricing for your configuration

### Training Resources
- [AWS Free Training](https://aws.amazon.com/training/)
- [AWS Certification](https://aws.amazon.com/certification/)

---

## 🎓 Best Practices Summary

### ✅ DO
- Use Elastic Beanstalk for easy deployment
- Enable auto-scaling for production
- Use RDS for managed database
- Store secrets in Secrets Manager
- Enable CloudWatch monitoring
- Setup billing alerts
- Use Reserved Instances for cost savings
- Enable automated backups
- Use CloudFront for frontend
- Implement proper security groups

### ❌ DON'T
- Don't hardcode credentials
- Don't make RDS publicly accessible
- Don't skip backups
- Don't ignore security updates
- Don't use root AWS account
- Don't forget to set up monitoring
- Don't skip cost optimization
- Don't deploy without testing

---

## 📝 Important Notes

### Default Credentials (CHANGE AFTER DEPLOYMENT)
- **Admin:** ram@superbee.com / 123456
- **Technician:** ae@superbee.com / 123456

### JWT Secret (Already Configured)
```
zk4FNDs8fBAZEgx90pvdr5wl6G2PhJUmcoQubOTMYt7iSe1VjHnqIWXCaRK3Ly
```

### Database Details
- **Name:** superbee_inventory
- **Tables:** 14 tables
- **Default Port:** 3306

### API Endpoints
- **Total:** 28 endpoints
- **Health Check:** GET /health
- **Login:** POST /api/auth/login
- **Full documentation:** See README.md

---

## 🏆 Why Choose AWS?

### Advantages Over Azure
1. **Cost:** 20-30% cheaper for equivalent services
2. **Maturity:** More mature platform with better documentation
3. **Free Tier:** 12 months free tier for new accounts
4. **Market Leader:** Largest cloud provider globally
5. **India Presence:** Mumbai region with excellent connectivity
6. **Community:** Larger community and more resources

### Advantages Over On-Premise
1. **No Hardware Costs:** No upfront server purchase
2. **Scalability:** Scale up/down as needed
3. **Reliability:** 99.99% SLA with Multi-AZ
4. **Maintenance:** AWS handles infrastructure maintenance
5. **Security:** Enterprise-grade security included
6. **Backups:** Automated backups included
7. **Disaster Recovery:** Built-in DR capabilities

---

## ✅ Deployment Summary

### What You Get
- ✅ Fully managed backend API (Elastic Beanstalk)
- ✅ Globally distributed frontend (S3 + CloudFront)
- ✅ Managed MySQL database (RDS)
- ✅ Auto-scaling enabled
- ✅ SSL certificate included
- ✅ Monitoring and alerts
- ✅ Automated backups
- ✅ 99.95% uptime SLA

### Estimated Costs
- **Small (Dev/Test):** ₹2,500/month
- **Medium (Production):** ₹10,400/month ⭐ **RECOMMENDED**
- **Large (Enterprise):** ₹48,050/month

### Deployment Time
- **Experienced:** 30-45 minutes
- **First Time:** 2-3 hours

---

**Document Version:** 1.0  
**Last Updated:** May 30, 2026  
**Prepared For:** SuperBee Aeronautics IT Department

---

**🚀 Ready to deploy? Start with STEP 1!**

**Questions? Contact AWS Support or refer to the documentation links above.**

---

**Good luck with your AWS deployment!** 🎉

