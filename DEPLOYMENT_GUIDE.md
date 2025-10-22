# 🚀 UIC Alumni Portal - Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Security & Configuration
- [ ] Remove all console.log statements from production code
- [ ] Ensure environment variables are properly configured
- [ ] Update .env file with production Supabase credentials
- [ ] Review and update CORS settings in Supabase
- [ ] Enable RLS (Row Level Security) policies
- [ ] Configure proper authentication rules

### ✅ Performance Optimization
- [ ] Run `npm run build` and verify build success
- [ ] Check bundle size with `npm run analyze` (if available)
- [ ] Optimize images and assets
- [ ] Enable service worker for caching
- [ ] Configure CDN for static assets

### ✅ Database Setup
- [ ] Verify all database tables are created
- [ ] Test RLS policies with different user roles
- [ ] Ensure admin user exists and can access admin features
- [ ] Test all CRUD operations through the application
- [ ] Run database backup before deployment

## Environment Configuration

### Production Environment Variables
Create a `.env.production` file with:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your-production-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key

# Application Configuration
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
REACT_APP_APP_NAME=UIC Alumni Portal

# Features (set to false for production)
REACT_APP_DEBUG_MODE=false
REACT_APP_MOCK_DATA=false

# Analytics (optional)
REACT_APP_GA_TRACKING_ID=your-ga-tracking-id
```

### Build Configuration
Update `package.json` scripts for production:

```json
{
  "scripts": {
    "build:prod": "REACT_APP_ENV=production npm run build",
    "serve": "serve -s build -l 3000",
    "analyze": "npm run build && npx bundle-analyzer build/static/js/*.js"
  }
}
```

## Deployment Options

### Option 1: Netlify Deployment (Recommended for Frontend)

1. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: 18.x

2. **Environment Variables:**
   Add all environment variables in Netlify dashboard

3. **Redirects Configuration:**
   Create `public/_redirects` file:
   ```
   /*    /index.html   200
   ```

4. **Headers Configuration:**
   Create `public/_headers` file:
   ```
   /*
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     X-XSS-Protection: 1; mode=block
     Referrer-Policy: strict-origin-when-cross-origin
   ```

### Option 2: Vercel Deployment

1. **Configuration:**
   Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

### Option 3: Traditional Web Server (Apache/Nginx)

1. **Build the application:**
   ```bash
   npm run build:prod
   ```

2. **Apache Configuration (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   
   # Security Headers
   <IfModule mod_headers.c>
     Header always set X-Frame-Options DENY
     Header always set X-Content-Type-Options nosniff
     Header always set X-XSS-Protection "1; mode=block"
   </IfModule>
   ```

3. **Nginx Configuration:**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     root /var/www/alumni-portal/build;
     index index.html;
     
     # Handle React Router
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     # Security headers
     add_header X-Frame-Options DENY;
     add_header X-Content-Type-Options nosniff;
     add_header X-XSS-Protection "1; mode=block";
     
     # Static asset caching
     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

## Database Configuration

### Supabase Production Setup

1. **RLS Policies:**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE news ENABLE ROW LEVEL SECURITY;
   ALTER TABLE job_opportunities ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tracer_study_responses ENABLE ROW LEVEL SECURITY;
   
   -- Users can view their own data
   CREATE POLICY "Users can view own data" ON users
     FOR SELECT USING (auth.uid() = id);
   
   -- Admins can view all data
   CREATE POLICY "Admins can view all users" ON users
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM users u 
         WHERE u.id = auth.uid() AND u.role = 'admin'
       )
     );
   
   -- Similar policies for other tables...
   ```

2. **Admin User Setup:**
   ```sql
   -- Ensure admin user exists
   INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     'paung_230000001724@uic.edu.ph',
     NOW(),
     NOW(),
     NOW()
   ) ON CONFLICT (email) DO NOTHING;
   
   -- Create corresponding user record
   INSERT INTO public.users (id, email, first_name, last_name, role, is_verified)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'paung_230000001724@uic.edu.ph'),
     'paung_230000001724@uic.edu.ph',
     'Paung',
     'Admin',
     'admin',
     true
   ) ON CONFLICT (email) DO UPDATE SET
     role = 'admin',
     is_verified = true;
   ```

## Performance Optimization

### Code Splitting
Implement lazy loading for better performance:

```javascript
// App.js
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TracerStudy = lazy(() => import('./pages/TracerStudy'));

// Wrap routes in Suspense
<Suspense fallback={<LoadingSpinner size="large" fullscreen />}>
  <Route path="/admin-dashboard" element={<AdminDashboard />} />
</Suspense>
```

### Bundle Optimization
Add to `package.json`:

```json
{
  "homepage": ".",
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ]
  }
}
```

## Monitoring & Analytics

### Error Tracking
Add Sentry for error tracking:

```javascript
// index.js
import * as Sentry from "@sentry/react";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}
```

### Google Analytics
Add GA4 tracking:

```javascript
// utils/analytics.js
export const initGA = (trackingId) => {
  if (typeof window !== 'undefined' && trackingId) {
    window.gtag('config', trackingId, {
      page_title: 'UIC Alumni Portal',
      page_location: window.location.href,
    });
  }
};

export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
```

## Security Hardening

### Content Security Policy
Add CSP headers:

```html
<!-- In public/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co wss://*.supabase.co;">
```

### Environment Security
- Never commit `.env` files to version control
- Use different Supabase projects for development and production
- Regularly rotate API keys
- Monitor Supabase usage and set up alerts

## Testing Before Production

### Automated Testing
```bash
# Run all tests
npm test -- --coverage --watchAll=false

# Build and test production bundle
npm run build
npm run serve

# Test in different browsers
# Test responsive design
# Test with slow network connection
```

### Manual Testing Checklist
- [ ] User registration flow
- [ ] Admin approval process
- [ ] Alumni dashboard functionality
- [ ] Tracer study submission
- [ ] News management
- [ ] Job opportunities
- [ ] Profile management
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## Post-Deployment

### Monitoring
- Set up uptime monitoring
- Monitor Supabase usage and quotas
- Check error logs regularly
- Monitor performance metrics

### Maintenance
- Regular backups of Supabase data
- Keep dependencies updated
- Monitor security advisories
- Regular performance audits

### Support
- Document common issues and solutions
- Set up user feedback system
- Monitor user analytics
- Plan regular updates and improvements

## Troubleshooting Common Issues

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues
- Check environment variables are set correctly
- Verify build folder contains all necessary files
- Check network connectivity to Supabase
- Verify domain DNS settings

### Database Connection Issues
- Check Supabase project status
- Verify API keys are correct
- Check RLS policies aren't blocking requests
- Monitor Supabase logs

## Success Metrics

After deployment, monitor:
- User registration rate
- Admin approval efficiency
- Tracer study completion rate
- Page load times
- Error rates
- User engagement metrics

---

**Remember:** Always test thoroughly in a staging environment before deploying to production!
