# Part IV: Deployment Strategy & Procedures
## CCS Alumni Portal - University of the Immaculate Conception

**Version:** 1.0.0  
**Date:** September 2025  
**System:** UIC Alumni Portal  
**Prepared For:** University of the Immaculate Conception, College of Computer Studies

---

## Table of Contents

1. [Introduction to Deployment](#introduction-to-deployment)
2. [10.1. Deployment Strategy](#101-deployment-strategy)
3. [10.2. Installation Procedures](#102-installation-procedures)
4. [10.3. System Configuration and Setup](#103-system-configuration-and-setup)
5. [10.4. Rollback Plan](#104-rollback-plan)

---

## Introduction to Deployment

Deployment is the critical phase where a software application transitions from development to production, making it accessible to end users. For the CCS Alumni Portal, this involves transferring the system from a controlled development environment to a live production environment that serves the entire UIC alumni community.

### Deployment Objectives

- **Reliability:** Ensure the system operates continuously with minimal downtime
- **Scalability:** Support current and future user growth (2000+ alumni)
- **Security:** Protect sensitive alumni data and maintain institutional reputation
- **Performance:** Deliver fast response times and smooth user experience
- **Maintainability:** Facilitate future updates and enhancements

### Key Deployment Considerations

1. **Zero Downtime Deployment:** Minimize service interruption during updates
2. **Data Integrity:** Ensure all data is migrated accurately and completely
3. **User Training:** Prepare administrators and support staff for the new system
4. **Performance Monitoring:** Establish baselines and monitoring for production environment
5. **Security Hardening:** Implement production-grade security measures

---

## 10.1. Deployment Strategy

### 10.1.1. Deployment Approach

**Selected Strategy: Phased Deployment with Parallel Testing**

The CCS Alumni Portal will be deployed using a **phased approach** combined with **parallel testing** for critical components. This hybrid strategy balances risk mitigation with efficient rollout.

### 10.1.2. Strategy Selection Matrix

| Strategy | Risk Level | Downtime | User Impact | Resource Cost | Chosen? |
|----------|-----------|----------|-------------|---------------|---------|
| **Big Bang** | High | High | Complete system change at once | Low | ❌ |
| **Phased** | Medium | Low | Gradual rollout | Medium | ✅ **Primary** |
| **Parallel** | Low | None | Dual system operation | High | ✅ **Critical Features** |
| **A/B Testing** | Low | None | Subset of users | Medium | ✅ **Optional** |

### 10.1.3. Justification for Phased Deployment

**1. Risk Mitigation**
- Issues can be detected and resolved before full rollout
- Impact is limited to small user groups initially
- Enables gradual learning curve for support staff

**2. User Experience**
- Gradual introduction reduces user confusion
- Opportunity for user feedback and iterative improvements
- Better support coverage during transition period

**3. Technical Benefits**
- Database migration can be verified incrementally
- Performance bottlenecks identified early
- Security testing on production-like data

**4. Resource Management**
- Manageable workload for IT support team
- Training can be conducted incrementally
- Budget allocation aligned with phases

**5. Rollback Capability**
- Easy to revert specific phases if critical issues arise
- Each phase is independent and can be paused
- Minimal data impact from rollback operations

### 10.1.4. Detailed Deployment Phases

#### Phase 1: Infrastructure Setup & Core Services
**Duration:** Week 1 (7 days)  
**Users:** Development team only  
**Risk Level:** Low (internal only)

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Infrastructure & Core Services                     │
├─────────────────────────────────────────────────────────────┤
│ Scope:                                                    │
│ • Supabase production environment setup                    │
│ • Database schema deployment                               │
│ • Authentication system configuration                      │
│ • Basic API endpoints                                      │
│ • Monitoring and logging infrastructure                    │
│                                                             │
│ Activities:                                                 │
│ • Create production Supabase project                       │
│ • Execute database schema (COMPLETE_DATABASE_SCHEMA.sql)  │
│ • Configure authentication policies                        │
│ • Set up RLS policies                                      │
│ • Configure storage buckets                                │
│ • Deploy edge functions (if any)                           │
│ • Set up monitoring (PM2, logs)                            │
│                                                             │
│ Success Criteria:                                           │
│ ✓ Supabase production environment operational              │
│ ✓ All database tables created successfully                 │
│ ✓ Authentication system functional                         │
│ ✓ Basic API endpoints responding                           │
│ ✓ Monitoring active and collecting data                    │
│ ✓ RLS policies preventing unauthorized access             │
│                                                             │
│ Rollback Triggers:                                          │
│ • Database migration failures                              │
│ • Authentication system not working                        │
│ • Critical security vulnerabilities                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Deliverables:**
- Production Supabase project configured
- Complete database schema deployed
- Admin user created and verified
- Storage buckets configured
- Monitoring dashboard operational

---

#### Phase 2: Admin Portal Deployment
**Duration:** Week 2 (7 days)  
**Users:** System administrators and UIC IT staff (5-10 users)  
**Risk Level:** Medium (limited admin users)

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Admin Portal Deployment                           │
├─────────────────────────────────────────────────────────────┤
│ Scope:                                                    │
│ • Administrative interfaces deployment                     │
│ • User management system                                   │
│ • Content management system                                │
│ • Analytics dashboard                                      │
│ • Admin user training                                      │
│                                                             │
│ Activities:                                                 │
│ • Deploy frontend to staging environment                   │
│ • Configure admin-specific routes                          │
│ • Test user approval workflow                              │
│ • Test content CRUD operations                             │
│ • Verify analytics and reporting                           │
│ • Conduct admin training sessions                          │
│ • Collect admin feedback                                   │
│                                                             │
│ Success Criteria:                                           │
│ ✓ Admin dashboard accessible and functional                │
│ ✓ User approval workflow operational                       │
│ ✓ News management system working                           │
│ ✓ Gallery management working                               │
│ ✓ Analytics displaying correct data                        │
│ ✓ Admin training completed                                 │
│ ✓ All admins can perform tasks independently              │
│                                                             │
│ User Acceptance:                                            │
│ • 100% of admin users can complete approval process        │
│ • 100% of admin users can create news articles             │
│ • Admin satisfaction score > 4/5                           │
└─────────────────────────────────────────────────────────────┘
```

**Key Deliverables:**
- Admin portal deployed to production
- Admin training materials and documentation
- User management workflow documented
- Admin user feedback report

---

#### Phase 3: Alumni Registration & Profile Management
**Duration:** Week 3-4 (14 days)  
**Users:** Pilot group of 50 alumni volunteers  
**Risk Level:** Medium (controlled user group)

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Alumni Registration & Profile Management          │
├─────────────────────────────────────────────────────────────┤
│ Scope:                                                    │
│ • Public registration system                               │
│ • Alumni profile management                                │
│ • Profile image upload                                     │
│ • Admin approval workflow                                  │
│ • Email notification system                                │
│                                                             │
│ Activities:                                                 │
│ • Open registration to pilot group                         │
│ • Monitor registration process                             │
│ • Test profile management features                         │
│ • Verify image upload system                               │
│ • Test email notifications                                 │
│ • Collect user feedback                                    │
│ • Address issues and bugs                                  │
│                                                             │
│ Success Criteria:                                           │
│ ✓ Registration process smooth and error-free               │
│ ✓ Profile management fully functional                      │
│ ✓ Image upload working (5MB limit)                         │
│ ✓ Email notifications delivered                            │
│ ✓ Admin can approve/reject registrations                   │
│ ✓ User satisfaction score > 4/5                            │
│ ✓ Zero critical bugs                                       │
│                                                             │
│ User Metrics:                                               │
│ • 90% registration completion rate                         │
│ • <5 second average page load time                         │
│ • <30 second average registration time                     │
│ • 100% email delivery rate                                 │
└─────────────────────────────────────────────────────────────┘
```

**Key Deliverables:**
- 50 alumni registered and approved
- Registration documentation
- User feedback report
- Performance metrics report
- Bug fix log

---

#### Phase 4: Core Alumni Features
**Duration:** Week 5-6 (14 days)  
**Users:** Extended pilot group of 200 alumni  
**Risk Level:** Medium-High (larger user base)

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Core Alumni Features                              │
├─────────────────────────────────────────────────────────────┤
│ Scope:                                                    │
│ • Tracer study system                                      │
│ • Job opportunities                                        │
│ • News and announcements                                   │
│ • Gallery viewing                                          │
│ • Batchmates directory                                     │
│                                                             │
│ Activities:                                                 │
│ • Invite extended pilot group                              │
│ • Test tracer study submission                             │
│ • Test job posting and viewing                             │
│ • Verify news system                                       │
│ • Test gallery functionality                               │
│ • Monitor system performance                               │
│ • Load testing with 200 concurrent users                   │
│                                                             │
│ Success Criteria:                                           │
│ ✓ Tracer study form submission working                     │
│ ✓ Job opportunities posting and viewing functional         │
│ ✓ News and announcements system operational                │
│ ✓ Gallery photo upload and viewing working                 │
│ ✓ Batchmates directory functional                          │
│ ✓ Performance metrics within acceptable ranges             │
│ ✓ System stable under 200 concurrent users                 │
│                                                             │
│ Performance Metrics:                                        │
│ • Page load time <3 seconds (95th percentile)              │
│ • API response time <500ms                                 │
│ • Database query time <100ms                               │
│ • Error rate <1%                                           │
│ • Uptime >99.5%                                            │
└─────────────────────────────────────────────────────────────┘
```

**Key Deliverables:**
- 200 alumni registered and active
- Load testing report
- Performance optimization log
- Feature usage analytics

---

#### Phase 5: Advanced Features & AI Integration
**Duration:** Week 7-8 (14 days)  
**Users:** All registered alumni (gradual invitation)  
**Risk Level:** Medium (production features)

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Advanced Features & AI Integration                │
├─────────────────────────────────────────────────────────────┤
│ Scope:                                                    │
│ • AI chatbot system                                        │
│ • Batchmate messaging                                      │
│ • Advanced analytics                                       │
│ • PDF report generation                                    │
│ • Mobile responsive features                               │
│                                                             │ Practices:                                                 │
│ • Deploy Ollama AI service                                 │
│ • Test chatbot interactions                                │
│ • Test messaging system                                    │
│ • Verify analytics dashboard                               │
│ • Test PDF generation                                      │
│ • Monitor AI response quality                              │
│ • Gradual user invitation                                  │
│                                                             │
│ Success Criteria:                                           │
│ ✓ AI chatbot providing accurate responses                  │
│ ✓ Messaging system functional                              │
│ ✓ Analytics displaying real-time data                      │
│ ✓ PDF reports generated correctly                          │
│ ✓ System performance stable under load                     │
│ ✓ AI response accuracy >80%                                │
│ ✓ User satisfaction score >4/5                             │
│                                                             │
│ Quality Metrics:                                            │
│ • AI response time <5 seconds                              │
│ • Message delivery success rate >99%                       │
│ • PDF generation time <10 seconds                          │
│ • Analytics data accuracy 100%                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Deliverables:**
- Ollama AI service operational
- AI chatbot response quality report
- Messaging system performance report
- All advanced features documented

---

#### Phase 6: Full Production Launch
**Duration:** Week 9 (7 days)  
**Users:** All UIC CCS alumni (2000+ users)  
**Risk Level:** High (full production)

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 6: Full Production Launch                            │
├─────────────────────────────────────────────────────────────┤
│ Scope:                                                    │
│ • Complete system availability                             │
│ • Public announcement                                      │
│ • Support procedures in place                              │
│ • Monitoring at full scale                                 │
│ • Ongoing optimization                                     │
│                                                             │
│ Activities:                                                 │
│ • Public announcement to all alumni                        │
│ • Email invitation campaign                                │
│ • Social media promotion                                   │
│ • Monitor system load                                      │
│ • Support ticket handling                                  │
│ • Collect broad user feedback                              │
│ • Continuous performance monitoring                        │
│                                                             │
│ Success Criteria:                                           │
│ ✓ System handles full user load                           │
│ ✓ All features operational                                 │
│ ✓ Support procedures working                               │
│ ✓ Documentation complete                                   │
│ ✓ Success metrics achieved                                 │
│ ✓ User registration rate >50% of invitees                  │
│                                                             │
│ Success Metrics:                                            │
│ • Daily active users >500                                  │
│ • Registration rate >50%                                   │
│ • System uptime >99.9%                                     │
│ • Average response time <2 seconds                         │
│ • User satisfaction >4/5                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Deliverables:**
- Full production deployment
- User registration statistics
- Support ticketing system operational
- Comprehensive documentation
- Launch success report

---

### 10.1.5. Deployment Timeline Summary

```
Week 1:  Infrastructure Setup
Week 2:  Admin Portal
Week 3-4: Alumni Registration (Pilot 50 users)
Week 5-6: Core Features (Extended Pilot 200 users)
Week 7-8: Advanced Features & AI (Gradual Rollout)
Week 9:   Full Production Launch (All Alumni)
```

**Total Timeline:** 9 weeks from initiation to full production

---

### 10.1.6. Risk Management by Phase

#### Risk Assessment Matrix

| Phase | Risk | Likelihood | Impact | Mitigation |
|-------|------|-----------|--------|------------|
| Phase 1 | Database migration failure | Low | High | Automated backups before migration |
| Phase 1 | Authentication issues | Medium | High | Test authentication thoroughly |
| Phase 2 | Admin workflow confusion | Medium | Medium | Comprehensive training |
| Phase 3 | Registration form issues | Low | Medium | Extensive testing with volunteers |
| Phase 4 | Performance degradation | Medium | High | Load testing before launch |
| Phase 5 | AI service failures | Medium | Low | Fallback to static responses |
| Phase 6 | High user load issues | Medium | High | Scale infrastructure proactively |

#### Escalation Procedures

**Level 1 Issues:** Minor bugs, cosmetic issues  
- Resolution Time: 72 hours
- Escalate to: Development Team Lead

**Level 2 Issues:** Feature not working, data loss risk  
- Resolution Time: 24 hours
- Escalate to: IT Director

**Level 3 Issues:** System down, security breach  
- Resolution Time: 2 hours
- Escalate to: IT Director + University Administrator

---

## 10.2. Installation Procedures

This section provides step-by-step instructions for installing the CCS Alumni Portal in a production environment. These instructions are designed to be followed by a system administrator with basic knowledge of web servers and database management.

### 10.2.1. Prerequisites and System Requirements

#### Hardware Requirements

**Minimum Configuration:**
```
CPU: 4 cores, 2.4GHz
RAM: 16GB
Storage: 500GB SSD
Network: 1Gbps connection
```

**Recommended Configuration:**
```
CPU: 8 cores, 3.0GHz
RAM: 32GB
Storage: 1TB SSD NVMe
Network: 10Gbps connection
```

#### Software Requirements

**Operating Systems Supported:**
- Ubuntu 22.04 LTS (Recommended)
- Windows Server 2022
- Debian 11+

**Required Software:**
```
Node.js: 18.17.0 LTS or higher
npm: 9.6.7 or higher
Nginx: 1.22.0 or higher
PM2: Latest version (process manager)
Git: 2.40 or higher
```

#### Prerequisites Checklist

Before beginning installation, verify:
- [ ] Server access with sudo/administrator privileges
- [ ] Domain name registered and DNS configured
- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] Supabase account created
- [ ] Email service configured (SMTP)
- [ ] Backup storage location determined

---

### 10.2.2. Step-by-Step Installation Guide

#### Step 1: Server Initial Setup

**1.1 Update System Packages**

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

**1.2 Install Node.js**

```bash
# Install Node.js 18.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
node --version  # Should show v18.17.0 or higher
npm --version   # Should show 9.6.7 or higher
```

**1.3 Install PM2 Process Manager**

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on system boot
pm2 startup systemd
# Follow the instructions displayed by the command above

# Verify PM2 installation
pm2 --version
```

**1.4 Install Nginx Web Server**

```bash
# Install Nginx
sudo apt install nginx -y

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Verify Nginx is running
sudo systemctl status nginx
```

---

#### Step 2: Application Deployment

**2.1 Clone Repository**

```bash
# Navigate to web directory
cd /var/www/

# Clone the repository (replace with actual URL)
git clone https://github.com/your-org/ccs-alumni-portal.git
cd ccs-alumni-portal

# Or copy build files directly
# Unzip the build package if provided as compressed file
```

**2.2 Install Dependencies**

```bash
# Navigate to project directory
cd /var/www/ccs-alumni-portal

# Install all dependencies
npm install

# This will install all packages listed in package.json
# Expected time: 5-10 minutes depending on connection speed
```

**2.3 Create Production Build**

```bash
# Build the application for production
npm run build

# This creates an optimized production build in the 'build' folder
# Expected time: 3-5 minutes
# Check build folder exists
ls -la build/
```

**2.4 Set Permissions**

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/ccs-alumni-portal

# Set proper permissions
sudo chmod -R 755 /var/www/ccs-alumni-portal
```

---

#### Step 3: Supabase Configuration

**3.1 Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in project details:
   - Name: `uic-alumni-portal-production`
   - Database Password: (generate strong password)
   - Region: Asia Pacific (Singapore)
   - Pricing Plan: Choose appropriate plan

**3.2 Get Supabase Credentials**

1. In Supabase dashboard, go to Settings > API
2. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secure!)

**3.3 Execute Database Schema**

```bash
# In Supabase dashboard, go to SQL Editor
# Execute the complete database schema

# Option 1: Use SQL Editor in Supabase dashboard
# Copy and paste COMPLETE_DATABASE_SCHEMA.sql

# Option 2: Use Supabase CLI (if installed)
supabase db push

# Or use the execute-sql.js script
node execute-sql.js
```

**3.4 Create Storage Buckets**

In Supabase dashboard:
1. Go to Storage
2. Create the following buckets:

```
Bucket Name: alumni-profiles
Public: Yes
File Size Limit: 5242880 (5MB)
Allowed MIME Types: image/jpeg, image/png, image/gif
```

```
Bucket Name: gallery-images
Public: Yes
File Size Limit: 10485760 (10MB)
Allowed MIME Types: image/jpeg, image/png, image/gif
```

```
Bucket Name: documents
Public: No
File Size Limit: 10485760 (10MB)
Allowed MIME Types: application/pdf
```

**3.5 Create Admin User**

```sql
-- Execute this in Supabase SQL Editor

INSERT INTO users (id, email, role, approval_status, is_verified)
VALUES (
  gen_random_uuid(),
  'admin@uic.edu.ph',
  'admin',
  'approved',
  true
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

---

#### Step 4: Environment Configuration

**4.1 Create Environment File**

```bash
# Create production environment file
cd /var/www/ccs-alumni-portal
cp .env.example .env.production

# Edit the file
nano .env.production
```

**4.2 Configure Environment Variables**

Add the following configuration to `.env.production`:

```env
# Application Configuration
NODE_ENV=production
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
REACT_APP_APP_NAME=UIC Alumni Portal

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Service Configuration (if using Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2:1b

# Email Configuration (if using external SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@uic.edu.ph
SMTP_PASS=your-app-password-here

# Security Configuration
CORS_ORIGIN=https://alumni.uic.edu.ph

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

**Levage:**
```bash
# Save and exit (Ctrl+O, Enter, Ctrl+X)

# Verify environment file
cat .env.production
```

---

#### Step 5: Web Server Configuration (Nginx)

**5.1 Create Nginx Configuration**

```bash
# Create Nginx configuration file
sudo nano /etc/nginx/sites-available/ccs-alumni-portal
```

**5.2 Add Nginx Configuration**

Paste the following configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name alumni.uic.edu.ph www.alumni.uic.edu.ph;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server Configuration
server {
    listen 443 ssl http2;
    server_name alumni.uic.edu.ph www.alumni.uic.edu.ph;
    
    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/alumni.uic.edu.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alumni.uic.edu.ph/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Document Root
    root /var/www/ccs-alumni-portal/build;
    index index.html;
    
    # Logging
    access_log /var/log/nginx/ccs-alumni-access.log;
    error_log /var/log/nginx/ccs-alumni-error.log;
    
    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;" always;
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

**5.3 Enable Site and Test Configuration**

Verified:
```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/ccs-alumni-portal /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test is successful, reload Nginx
sudo systemctl reload nginx
```

---

#### Step 6: SSL Certificate Setup

**6.1 Install Certbot**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

**6.2 Obtain SSL Certificate**

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d alumni.uic.edu.ph -d www.alumni.uic.edu.ph

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (yes recommended)
```

**6.3 Set Up Auto-Renewal**

```bash
# Certbot creates a cron job automatically
# Test renewal
sudo certbot renew --dry-run

# Check renewal is scheduled
sudo systemctl status certbot.timer
```

---

#### Step 7: Process Management with PM2

**7.1 Create PM2 Ecosystem File**

```bash
# Create ecosystem configuration
nano /var/www/ccs-alumni-portal/ecosystem.config.js
```

**7.2 Add PM2 Configuration**

```javascript
module.exports = {
  apps: [{
    name: 'ccs-alumni-portal',
    script: 'serve',
    args: '-s build -l 3000',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
};
```

**7.3 Install Serve and Start Application**

```bash
# Install serve globally
sudo npm install -g serve

# Create logs directory
mkdir -p /var/www/ccs-alumni-portal/logs

# Start application with PM2
cd /var/www/ccs-alumni-portal
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs ccs-alumni-portal
```

---

#### Step 8: Configure Firewall

**8.1 Set Up UFW Firewall**

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

#### Step 9: Verify Installation

**9.1 Run Health Checks**

```bash
# Test application is running
curl http://localhost:3000

# Test Nginx is serving the site
curl https://alumni.uic.edu.ph

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View application logs
pm2 logs ccs-alumni-portal --lines 50
```

**9.2 Functional Testing**

1. **Access Application:**
   - Open browser: `https://alumni.uic.edu.ph`
   - Verify page loads without errors

2. **Test Registration:**
   - Click "Register"
   - Fill out registration form
   - Submit and verify pending registration

3. **Test Admin Login:**
   - Login as admin
   - Verify admin dashboard loads
   - Test approval workflow

4. **Test File Upload:**
   - Upload profile image
   - Verify image appears
   - Check file size limit (5MB)

5. **Test Database Connection:**
   - Verify data loads correctly
   - Test create, read, update operations

---

#### Step 10: Set Up Backup Procedures

**10.1 Create Backup Script**

```bash
# Create backup directory
sudo mkdir -p /var/backups/ccs-alumni-portal

# Create backup script
sudo nano /usr/local/bin/backup-alumni-portal.sh
```

**10.2 Add Backup Script Content**

```bash
#!/bin/bash
# Backup script for CCS Alumni Portal

BACKUP_DIR="/var/backups/ccs-alumni-portal"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Backup database (via Supabase dashboard export or CLI)
# Export from Supabase: Settings > Database > Backups

# Backup application files
tar -czf $BACKUP_DIR/$DATE/build.tar.gz /var/www/ccs-alumni-portal/build

# Backup environment files
cp /var/www/ccs-alumni-portal/.env.production $BACKUP_DIR/$DATE/

# Backup Nginx configuration
tar -czf $BACKUP_DIR/$DATE/nginx-config.tar.gz /etc/nginx/sites-available/ccs-alumni-portal

# Keep only last 30 days of backups
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

**10.3 Set Up Automated Backups**

```bash
# Make script executable
sudo chmod +x /usr/local/bin/backup-alumni-portal.sh

# Add to crontab for daily backups at 2 AM
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-alumni-portal.sh
```

---

### 10.2.3. Installation Verification Checklist

After completing all installation steps, verify the following:

- [ ] Node.js and npm installed correctly
- [ ] Application builds without errors
- [ ] Environment variables configured
- [ ] Supabase database schema deployed
- [ ] Storage buckets created and accessible
- [ ] Admin user created
- [ ] Nginx configured and serving application
- [ ] SSL certificate installed and valid
- [ ] PM2 running and managing application
- [ ] Firewall configured correctly
- [ ] Application accessible at production URL
- [ ] Database connection working
- [ ] File upload functional
- [ ] Admin login working
- [ ] Backup procedures in place
- [ ] Logging configured
- [ ] Monitoring active

---

## 10.3. System Configuration and Setup

This section details the post-installation configuration required to make the system operational, secure, and aligned with UIC's requirements.

### 10.3.1. Environment Variables Configuration

#### Production Environment Variables

Create `.env.production` in the project root with the following configuration:

```env
# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=production
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
REACT_APP_APP_NAME=UIC Alumni Portal

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
# Get these from Supabase Dashboard > Settings > API
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (server-side only - never expose in frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# AI SERVICE CONFIGURATION
# ===========================================
# Ollama configuration (if using AI features)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2:1b
REFERENCE_MODELS=llama3.2:1b,llama3.2:3b,llama3.1:8b,gpt-oss:20b

# Enable AI features (true/false)
ENABLE_AI_CHATBOT=true

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
# SMTP settings for email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply.To:uic.edu.ph
SMTP_PASS=your-app-specific-password

# Email sender information
EMAIL_FROM=noreply@uic.edu.ph
EMAIL_FROM_NAME=UIC Alumni Portal

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
# CORS settings
CORS_ORIGIN=https://alumni.uic.edu.ph

# Session configuration
SESSION_SECRET=generate-a-strong-random-secret-key-here
SESSION_MAX_AGE=86400000

# API rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# ===========================================
# FILE UPLOAD CONFIGURATION
# ===========================================
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# ===========================================
# MONITORING & LOGGING
# ===========================================
# Sentry for error tracking (optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Log level
LOG_LEVEL=info

# Analytics
ENABLE_ANALYTICS=true
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# ===========================================
# FEATURE FLAGS
# ===========================================
ENABLE_REGISTRATION=true
ENABLE_AI_FEATURES=true
ENABLE_BATCHMATE_MESSAGING=true
ENABLE_ADVANCED_ANALYTICS=true

# ===========================================
# PERFORMANCE
# ===========================================
NODE_OPTIONS=--max-old-space-size=4096
```

---

### 10.3.2. Database Configuration

#### Initial Data Setup

Execute the following SQL in Supabase SQL Editor:

**1. Create Admin User**

```sql
-- Insert admin user
INSERT INTO users (id, email, role, approval_status, is_verified, first_name, last_name, created_at)
VALUES (
  gen_random_uuid(),
  'admin@uic.edu.ph',
  'admin',
  'approved',
  true,
  'Admin',
  'User',
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'admin',
  approval_status = 'approved',
  is_verified = true;

-- Get the admin user ID
SELECT id, email, role FROM users WHERE email = 'admin@uic.edu.ph';
```

**2. Create Default Programs**

```sql
-- Insert default academic programs
INSERT INTO programs (name, department, active, created_at)
VALUES
  ('Bachelor of Science in Computer Science', 'College of Computer Studies', true, NOW()),
  ('Bachelor of Science in Information Technology', 'College of Computer Studies', true, NOW()),
  ('Bachelor of Science in Information Systems', 'College of Computer Studies', true, NOW()),
  ('Associate in Computer Technology', 'College of Computer Studies', true, NOW())
ON CONFLICT DO NOTHING;
```

**3. Set Up Storage Buckets**

```sql
-- Storage buckets are created via Supabase Storage UI
-- Verify buckets exist and have correct policies

-- Bucket policies are managed through Supabase Storage interface
-- Path: Storage > Select Bucket > Policies
```

**4. Enable Row Level Security (RLS)**

```sql
-- RLS should be enabled during schema deployment
-- Verify RLS is enabled on all tables

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- If RLS is not enabled, run:
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**5. Create Required Indexes**

```sql
-- Create indexes for performance

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tracer_study_user_id ON tracer_study_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_tracer_study_survey_year ON tracer_study_responses(survey_year);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_posted_by ON job_opportunities(posted_by);
```

---

### 10.3.3. User Roles and Permissions Setup

#### Role Configuration

The system uses role-based access control (RBAC) with the following roles:

**Role Hierarchy:**

```
SUPER_ADMIN (Level 4)
  └── Full system access
  └── Manage other admins
  └── System configuration

ADMIN (Level 3)
  ├── User management
  ├── Content management
  ├── Analytics and reports
  └── Approval workflows

COORDINATOR (Level 2)
  ├── User approval
  ├── Content creation
  └── Analytics viewing

ALUMNI (Level 1)
  ├── Profile management
  ├── Tracer study submission
  ├── Content viewing
  └── Messaging
```

**Permission Matrix:**

| Permission | Admin | Coordinator | Alumni |
|------------|-------|-------------|--------|
| View all users | ✅ | ✅ | ❌ |
| Approve registrations | ✅ | ✅ | ❌ |
| Manage news | ✅ | ❌ | ❌ |
| Manage gallery | ✅ | ❌ | ❌ |
| Post job opportunities | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ |
| Submit tracer study | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ |
| Upload images | ✅ | ❌ | ✅ |

#### Security Policies

**Database Policies:**

```sql
-- Users can view their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Public can view published news
CREATE POLICY "Public can view published news" ON news
  FOR SELECT USING (published = true);
```

---

### 10.3.4. File Upload Configuration

#### Storage Bucket Setup

Configure each storage bucket through Supabase Storage UI:

**1. Alumni Profiles Bucket**

```
Bucket ID: alumni-profiles
Public: Yes
File Size Limit: 5242880 (5MB)
Allowed MIME Types: 
  - image/jpeg
  - image/png
  - image/gif

Policies:
  - Authenticated users can upload
  - Public can read
  - Users can only delete their own uploads
```

**2. Gallery Images Bucket**

```
Bucket ID: gallery-images
Public: Yes
File Size Limit: 10485760 (10MB)
Allowed MIME Types: 
  - image/jpeg
  - image/png
  - image/gif

Policies:
  - Admins can upload
  - Public can read
  - Admins can delete
```

**3. Documents Bucket**

```
Bucket ID: documents
Public: No
File Size Limit: 10485760 (10MB)
Allowed MIME Types: 
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document

Policies:
  - Authenticated users can upload
  - Users can read their own documents
  - Admins can read all documents
```

---

### 10.3.5. Email Configuration

#### SMTP Setup for Notifications

**Configure Email Service:**

1. **Gmail Setup (Recommended):**
   - Create Gmail app-specific password
   - Configure in environment variables

2. **Alternative Email Services:**
   - SendGrid
   - Mailgun
   - Amazon SES

**Email Templates Setup:**

The system sends the following emails:

1. **Registration Confirmation:**
   - Sent when user registers
   - Status: "Pending Approval"

2. **Approval Notification:**
   - Sent when admin approves registration
   - Includes login credentials

3. **Rejection Notification:**
   - Sent when registration is rejected
   - Includes reason (if provided)

4. **Password Reset:**
   - Sent when user requests password reset
   - Contains reset link

**Test Email Configuration:**

```bash
# Test email sending
node scripts/test-email.js

# Or use the test script
npm run test:email
```

---

### 10.3.6. Monitoring and Logging Configuration

#### Application Monitoring

**1. PM2 Monitoring:**

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Set monitoring credentials
pm2 set pm2-server-monit:passwd your-secure-password

# Access monitoring dashboard
# http://your-server-ip:9615
```

**2. Log Rotation:**

```bash
# Install log rotation module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

**3. Health Check Endpoint:**

Create a health check endpoint:

```javascript
// server/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    memory: process.memoryUsage()
  };
  
  res.json(health);
});

module.exports = router;
```

**4. Set Up Uptime Monitoring:**

Configure external monitoring service:
- Pingdom
- UptimeRobot
- StatusCake

Monitor these endpoints:
- `https://alumni.uic.edu.ph`
- `https://alumni.uic.edu.ph/api/health`
- `https://alumni.uic.edu.ph/api/status`

---

### 10.3.7. Performance Optimization

#### Frontend Optimization

**1. Enable Gzip Compression:**

Already configured in Nginx (see Step 5)

**2. Browser Caching:**

Already configured in Nginx:
- Static assets cached for 1 year
- HTML files not cached

**3. CDN Configuration (Optional):**

If using CloudFlare:
1. Add site to CloudFlare
2. Update nameservers
3. Enable caching
4. Enable minification

#### Database Optimization

**1. Connection Pooling:**

Supabase handles connection pooling automatically

**2. Query Optimization:**

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE role = 'admin';

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_column_name ON table_name(column_name);
```

**3. Regular Maintenance:**

```sql
-- Vacuum database
VACUUM ANALYZE;

-- Update statistics
ANALYZE;
```

---

### 10.3.8. Security Configuration

#### Additional Security Headers

Already configured in Nginx (see Step 5)

**Content Security Policy (CSP):**

```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'none';
" always;
```

#### API Security

**Rate Limiting:**

Configure in application:

```javascript
// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

---

### 10.3.9. Testing Configuration

#### Automated Testing

**Run Tests:**

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- UserManagement.test.js
```

#### Manual Testing Checklist

- [ ] User registration flow
- [ ] Admin approval workflow
- [ ] Profile management
- [ ] File upload (images, documents)
- [ ] Tracer study submission
- [ ] News management
- [ ] Gallery management
- [ ] Job posting
- [ ] Batchmate messaging
- [ ] AI chatbot (if enabled)
- [ ] Email notifications
- [ ] Password reset
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

---

## 10.4. Rollback Plan

### 10.4.1. Rollback Strategy Overview

A robust rollback plan is essential to quickly restore the system to a previous stable state when critical issues occur during or after deployment. This section outlines three levels of rollback procedures with increasing complexity and restoration time.

---

### 10.4.2. Rollback Triggers

#### Automatic Rollback Triggers

The following conditions will trigger immediate rollback consideration:

| Condition | Threshold | Rollback Level |
|-----------|-----------|----------------|
| Application Error Rate | > 5% | Level 1 or 2 |
| Response Time | > 10 seconds | Level 1 |
| Database Connection Failures | > 3 consecutive | Level 2 |
| Security Breach | Any unauthorized access | Level 3 |
| Data Corruption | Any | Level 2 or 3 |
| System Unavailability | > 5 minutes | Level 2 or 3 |

#### Decision Matrix

```
Issue Severity: Critical
├── System Down → Level 3 Rollback
├── Data Loss → Level 2 or 3 Rollback
├── Security Breach → Level 3 Rollback
└── Performance Degradation → Level 1 Rollback

Issue Severity: High
├── Major Feature Broken → Level 2 Rollback
├── Multiple Users Affected → Level 1 or 2
└── Payment Issues → Level 2

Issue Severity: Medium
├── Minor Feature Broken → Investigate First
├── Single User Affected → Fix Forward
└── Cosmetic Issues → Fix Forward
```

---

### 10.4.3. Rollback Levels

#### Level 1: Application Rollback (5-10 minutes)

**When to Use:**
- Frontend issues only
- JavaScript errors in production
- UI/UX problems
- Recent deployment caused errors

**Prerequisites:**
- Previous build available in `build` directory
- No database schema changes
- Backup build stored

**Procedure:**

```bash
#!/bin/bash
# Level 1 Rollback Script

echo "Starting Level 1 Rollback: Application Rollback"

# 1. Stop current application
echo "[1/5] Stopping current application..."
pm2 stop ccs-alumni-portal

# 2. Identify previous stable version
PREVIOUS_VERSION="v1.0.0-stable"  # Replace with actual previous version
cd /var/www/ccs-alumni-portal

# 3. Restore previous build
echo "[2/5] Restoring previous build..."
if [ -d "backups/build-$PREVIOUS_VERSION" ]; then
    rm -rf build/
    cp -r backups/build-$PREVIOUS_VERSION build/
    echo "Previous build restored successfully"
else
    echo "ERROR: Previous build not found"
    exit 1
fi

# 4. Restart application
echo "[3/5] Restarting application..."
pm2 restart ccs-alumni-portal

# 5. Wait for application to start
echo "[4/5] Waiting for application to initialize..."
sleep 10

# 6. Verify rollback
echo "[5/5] Verifying rollback..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Rollback successful! Application is running."
    pm2 logs ccs-alumni-portal --lines 20
else
    echo "ERROR: Rollback failed! HTTP Status: $HTTP_STATUS"
    echo "Proceeding to Level 2 Rollback..."
    # Trigger Level 2 Rollback
fi

echo "Level 1 Rollback completed"
```

**Verification Steps:**
1. Access application URL
2. Verify homepage loads
3. Test user login
4. Check critical features
5. Review error logs
6. Monitor for 15 minutes

**Estimated Downtime:** 5-10 minutes  
**Data Impact:** None

---

#### Level 2: Database + Application Rollback (10-30 minutes)

**When to Use:**
- Database migration issues
- Data integrity problems
- Schema changes caused errors
- Level 1 rollback failed

**Prerequisites:**
- Database backup available
- Previous database schema exported
- Application backup available

**Procedure:**

```bash
#!/bin/bash
# Level 2 Rollback Script

echo "Starting Level 2 Rollback: Database + Application Rollback"

# 1. Stop application
echo "[1/7] Stopping application..."
pm2 stop ccs-alumni-portal

# 2. Create current state backup
echo "[2/7] Creating backup of current state..."
BACKUP_DIR="/var/backups/ccs-alumni-portal/rollback-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Export current database state
echo "[3/7] Exporting current database..."
# Using Supabase CLI or pg_dump
supabase db dump --file $BACKUP_DIR/current-db-backup.sql

# 3. Restore previous database
echo "[4/7] Restoring previous database..."
PREVIOUS_DB_BACKUP="/var/backups/ccs-alumni-portal/stable/v1.0.0-db-backup.sql"

if [ -f "$PREVIOUS_DB_BACKUP" ]; then
    supabase db reset
    supabase db push --file $PREVIOUS_DB_BACKUP
    echo "Database restored successfully"
else
    echo "ERROR: Previous database backup not found"
    exit 1
fi

# 4. Restore previous application
echo "[5/7] Restoring previous application..."
cd /var/www/ccs-alumni-portal
PREVIOUS_VERSION="v1.0.0-stable"
if [ -d "backups/build-$PREVIOUS_VERSION" ]; then
    rm -rf build/
    cp -r backups/build-$PREVIOUS_VERSION build/
fi

# 5. Restart application
echo "[6/7] Restarting application..."
pm2 restart ccs-alumni-portal
sleep 15

# 6. Verify rollback
echo "[7/7] Verifying rollback..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Level 2 Rollback successful!"
    
    # Run database integrity checks
    echo "Running database integrity checks..."
    # Add database verification queries here
    
else
    echo "ERROR: Rollback failed! Proceeding to Level 3..."
    # Trigger Level 3 Rollback
fi

echo "Level 2 Rollback completed"
```

**Verification Steps:**
1. Verify database integrity
2. Check all tables exist
3. Test database queries
4. Verify application loads
5. Test user authentication
6. Test data retrieval
7. Monitor for 30 minutes

**Estimated Downtime:** 10-30 minutes  
**Data Impact:** May lose recent data (up to last backup)

---

#### Level 3: Complete System Rollback (30-60 minutes)

**When to Use:**
- Complete system failure
- Security breach detected
- Level 2 rollback failed
- Critical data corruption
- System compromise suspected

**Prerequisites:**
- Full system backup available
- Complete infrastructure backup
- Disaster recovery documentation

**Procedure:**

```bash
#!/bin/bash
# Level 3 Rollback Script

echo "Starting Level 3 Rollback: Complete System Rollback"

# 1. Activate maintenance mode
echo "[1/9] Activating maintenance mode..."
echo "<!DOCTYPE html><html><head><title>Maintenance</title></head><body><h1>System Under Maintenance</h1><p>We're currently performing maintenance. Please check back soon.</p></body></html>" > /var/www/maintenance.html
nginx -s reload

# 2. Stop all services
echo "[2/9] Stopping all services..."
pm2 stop all
sudo systemctl stop ollama  # If Ollama is running
sudo systemctl stop nginx

# 3. Backup current state
echo "[3/9] Backing up current system state..."
BACKUP_DIR="/var/backups/ccs-alumni-portal/emergency-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/application.tar.gz /var/www/ccs-alumni-portal
# Backup database
supabase db dump --file $BACKUP_DIR/database.sql
# Backup configuration
tar -czf $BACKUP_DIR/config.tar.gz /etc/nginx/sites-available/ccs-alumni-portal

# 4. Restore complete system backup
echo "[4/9] Restoring complete system backup..."
PREVIOUS_BACKUP="/var/backups/ccs-alumni-portal/full-system-backup-v1.0.0.tar.gz"

if [ -f "$PREVIOUS_BACKUP" ]; then
    cd /var/www/
    rm -rf ccs-alumni-portal/
    tar -xzf $PREVIOUS_BACKUP
    echo "Full system backup restored"
else
    echo "ERROR: Full system backup not found"
    exit 1
fi

# 5. Restore database
echo "[5/9] Restoring database..."
PREVIOUS_DB_BACKUP="/var/backups/ccs-alumni-portal/stable/v1.0.0-complete-db-backup.sql"
supabase db reset
supabase db push --file $PREVIOUS_DB_BACKUP

# 6. Restore configuration
echo "[6/9] Restoring configuration..."
cd /var/www/ccs-alumni-portal
cp .env.production.backup .env.production
cp /var/backups/ccs-alumni-portal/config.tar.gz /tmp/
cd /tmp
tar -xzf config.tar.gz
cp sites-available/* /etc/nginx/sites-available/

# 7. Restart all services
echo "[7/9] Restarting all services..."
sudo systemctl start nginx
sudo systemctl start ollama  # If using Ollama
pm2 start ecosystem.config.js

# 8. Wait for services to stabilize
echo "[8/9] Waiting for services to stabilize..."
sleep 30

# 9. Disable maintenance mode and verify
echo "[9/9] Disabling maintenance mode and verifying..."
rm /var/www/maintenance.html
nginx -s reload

# Verify everything is working
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://alumni.uic.edu.ph)
DB_STATUS=$(supabase db health-check)

if [ "$HTTP_STATUS" -eq 200 ] && [ "$DB_STATUS" -eq 0 ]; then
    echo "Level 3 Rollback successful!"
    echo "System is now running on previous stable version"
else
    echo "CRITICAL: Rollback failed! Manual intervention required."
    echo "Contact system administrator immediately."
fi

echo "Level 3 Rollback completed"
```

**Verification Steps:**
1. Check all services running
2. Verify database connectivity
3. Test application functionality
4. Verify user authentication
5. Check data integrity
6. Test all critical features
7. Monitor system for 1 hour
8. Notify stakeholders

**Estimated Downtime:** 30-60 minutes  
**Data Impact:** Rollback to last full backup point

---

### 10.4.4. Rollback Communication Plan

#### Notification Protocol

**Who to Notify:**
- IT Director
- Development Team Lead
- Support Team
- University Administrator
- Affected Users (if required)

**Notification Channels:**
1. Internal: Email, Slack, SMS
2. External: Email to affected users
3. Website: Maintenance banner

**Notification Timeline:**
```
t=0:  Issue detected
t+5:  Decision to rollback made
t+10: Notifications sent
t+15: Rollback procedure started
t+45: Rollback verification
t+60: Post-rollback communication
```

#### Rollback Announcement Template

```
Subject: System Maintenance Notice - Alumni Portal

Dear Alumni Portal Users,

We are currently performing essential system maintenance to resolve 
a technical issue. During this time, the Alumni Portal may be 
temporarily unavailable or operating on a previous version.

Expected Duration: [30-60] minutes
Affected Services: [List affected features]

We apologize for any inconvenience and will notify you once the 
system is fully operational.

Thank you for your patience.

UIC IT Department
```

---

### 10.4.5. Post-Rollback Procedures

#### Immediate Actions (Within 1 Hour)

1. **Verify Rollback Success:**
   - Test all critical functionality
   - Verify data integrity
   - Check error logs

2. **Investigate Root Cause:**
   - Review deployment logs
   - Analyze error messages
   - Identify failure point

3. **Document Incident:**
   - Create incident report
   - Record timeline
   - Note affected users

#### Short-term Actions (Within 24 Hours)

1. **Post-Mortem Meeting:**
   - Discuss what went wrong
   - Identify contributing factors
   - Document lessons learned

2. **Fix Issues:**
   - Address root cause
   - Implement fixes in development
   - Test thoroughly

3. **Plan Re-deployment:**
   - Schedule re-deployment
   - Prepare deployment plan
   - Get approval

#### Long-term Actions (Within 1 Week)

1. **Update Documentation:**
   - Revise deployment procedures
   - Update rollback plan
   - Document new processes

2. **Improve Testing:**
   - Enhance test coverage
   - Add integration tests
   - Improve QA process

3. **Preventive Measures:**
   - Implement additional safeguards
   - Add monitoring alerts
   - Schedule training

---

### 10.4.6. Rollback Testing

#### Regular Rollback Drills

**Frequency:** Quarterly

**Test Scenarios:**
1. Level 1 Rollback
2. Level 2 Rollback
3. Level 3 Rollback
4. Partial rollback (single feature)

**Success Criteria:**
- Rollback completes within estimated time
- No data loss
- All services operational after rollback
- Users can access system
- Performance within acceptable ranges

**Documentation:**
- Test results
- Time measurements
- Issues encountered
- Improvements needed

---

## Appendix A: Quick Reference Commands

```bash
# Application Management
pm2 start ccs-alumni-portal
pm2 stop ccs-alumni-portal
pm2 restart ccs-alumni-portal
pm2 logs ccs-alumni-portal
pm2 status

# Web Server
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx

# Database (Supabase CLI)
supabase db dump
supabase db reset
supabase db push

# Backups
sudo /usr/local/bin/backup-alumni-portal.sh

# Monitoring
pm2 monit
tail -f /var/log/nginx/ccs-alumni-error.log
```

---

## Appendix B: Support Contacts

**IT Support:**
- Email: it-support@uic.edu.ph
- Phone: +63 82 XXX-XXXX

**Development Team:**
- Email: dev-team@uic.edu.ph
- GitHub: [Repository URL]

**Emergency Contact:**
- Phone: [Emergency Number]

---

## Appendix C: Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | September 2025 | Development Team | Initial release |

---

**Document End**

*This document is part of the CCS Alumni Portal documentation suite and should be reviewed quarterly or after significant changes.*

