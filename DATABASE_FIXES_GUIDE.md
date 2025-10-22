# 🔧 Database Schema Fixes Guide

## 🚨 **Issues Identified:**

Your application is experiencing multiple database schema mismatches:

1. **Gallery Page**: Missing `display_order` column in `gallery_images` table
2. **Manage Users**: Database connection or table access issues
3. **News**: App expects `news` table but database has `news_announcements`
4. **Job Opportunities**: Missing or inaccessible `job_opportunities` table
5. **Tracer Study**: Missing `first_name` column in user relationship
6. **Gallery Albums**: Missing `display_order` column

## 🛠️ **Quick Fix Solution:**

### Step 1: Run the Database Fix Script

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `sgalzbhfpydwnvprxrln`

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Run the Fix Script**
   - Copy the entire contents of `fix-database-schema-issues.sql`
   - Paste into SQL Editor
   - Click **Run**

### Step 2: Verify Fixes

After running the script, you should see:
```
✅ Schema fixes completed successfully!
✅ Tables check: All tables present
✅ Columns check: Missing columns added
✅ Sample data: Test data inserted
```

## 📋 **What the Fix Script Does:**

### 🔄 **Table Mapping:**
- Creates `news` view that maps to `news_announcements` table
- Ensures all required tables exist with proper structure

### 📊 **Missing Columns Added:**
- `display_order` column to `gallery_images` table
- `first_name`, `last_name` columns to `tracer_study_responses` table
- All other missing columns for proper functionality

### 🗃️ **Sample Data Inserted:**
- Sample news articles (2 entries)
- Sample gallery album with image
- Sample job opportunity
- Sample tracer study response

### 🔐 **Security Policies:**
- Proper RLS policies for gallery tables
- Public access for published content
- Admin access for management

## 🎯 **Expected Results After Fix:**

### ✅ **Gallery Page:**
- Should load without errors
- Display sample album and images
- Allow admin to manage galleries

### ✅ **Manage Users:**
- Should display user list properly
- Allow admin to view/edit user details

### ✅ **News Management:**
- Should load existing news articles
- Allow creating/editing news posts

### ✅ **Job Opportunities:**
- Should display job listings
- Allow posting new opportunities

### ✅ **Tracer Study:**
- Should show response data
- Display proper user information

## 🔍 **Manual Verification:**

After running the fix script, test each feature:

1. **Gallery**: Visit `/gallery` - should show sample album
2. **Admin Users**: Click "Manage Users" - should show user list
3. **News**: Visit `/news` - should show sample articles
4. **Jobs**: Visit `/job-opportunities` - should show sample job
5. **Tracer Study**: Admin dashboard should show tracer data

## 🚨 **If Issues Persist:**

### Check Database Connection:
```sql
-- Test basic connectivity
SELECT 'Database connected!' as status;

-- Check table existence
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check RLS Policies:
```sql
-- Temporarily disable RLS for testing (re-enable after)
ALTER TABLE gallery_albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_opportunities DISABLE ROW LEVEL SECURITY;
```

### Check User Permissions:
```sql
-- Verify admin user exists
SELECT id, email, role, status FROM users WHERE role = 'admin';
```

## 📞 **Support:**

If you continue experiencing issues after running the fix script:

1. **Check Supabase logs** in the dashboard
2. **Verify environment variables** in `.env` file
3. **Test database connection** with `node test-complete-system.js`
4. **Check browser console** for additional error details

The fix script should resolve all the reported database schema issues! 🚀
