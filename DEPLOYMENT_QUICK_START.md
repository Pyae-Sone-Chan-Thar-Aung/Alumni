# Deployment Quick Start Guide
## CCS Alumni Portal - Fast Track Installation

This guide provides a streamlined version of the deployment process for quick setup. For detailed documentation, refer to `PART_IV_DEPLOYMENT_STRATEGY.md`.

---

## Pre-Deployment Checklist

- [ ] Server ready with sudo access
- [ ] Domain registered and DNS configured
- [ ] Supabase account created
- [ ] Application build ready
- [ ] Database schema prepared

---

## Quick Installation (30 minutes)

### Step 1: Server Setup (5 minutes)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2 serve

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Deploy Application (5 minutes)

```bash
# Navigate to web directory
cd /var/www/

# Clone or copy application files
# (Upload your build folder here)

cd ccs-alumni-portal
npm install
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/ccs-alumni-portal
sudo chmod -R 755 /var/www/ccs-alumni-portal
```

### Step 3: Configure Environment (5 minutes)

```bash
# Create environment file
nano .env.production
```

Add:
```env
NODE_ENV=production
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Setup Nginx (5 minutes)

```bash
sudo nano /etc/nginx/sites-available/ccs-alumni-portal
```

Add:
```nginx
server {
    listen 80;
    server_name alumni.uic.edu.ph;
    
    root /var/www/ccs-alumni-portal/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ccs-alumni-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Start Application (2 minutes)

```bash
cd /var/www/ccs-alumni-portal
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 6: Setup SSL (5 minutes)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d alumni.uic.edu.ph
```

### Step 7: Database Setup (3 minutes)

In Supabase Dashboard:
1. Execute `COMPLETE_DATABASE_SCHEMA.sql`
2. Create storage buckets
3. Create admin user

---

## Verification

```bash
# Check application is running
curl https://alumni.uic.edu.ph

# Check PM2 status
pm2 status

# View logs
pm2 logs ccs-alumni-portal
```

---

## Post-Installation

1. Access: `https://alumni.uic.edu.ph`
2. Login as admin
3. Test registration
4. Configure monitoring

---

## Troubleshooting

**Application not loading:**
```bash
pm2 logs ccs-alumni-portal
sudo tail -f /var/log/nginx/error.log
```

**Database issues:**
- Check Supabase dashboard
- Verify environment variables

**SSL issues:**
```bash
sudo certbot renew --dry-run
sudo nginx -t
```

---

## Support

For detailed documentation: `PART_IV_DEPLOYMENT_STRATEGY.md`  
For issues: it-support@uic.edu.ph

