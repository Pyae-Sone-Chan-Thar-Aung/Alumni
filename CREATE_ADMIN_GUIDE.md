# 👨‍💼 Create Admin User Guide

## 🎯 Goal
Create admin account: `paung_230000001724@uic.edu.ph` with password `UICalumni2025`

## 📋 Method 1: Through Supabase Dashboard (Recommended)

### Step 1: Create User Account
1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `sgalzbhfpydwnvprxrln`

2. **Navigate to Authentication**
   - Click **Authentication** in left sidebar
   - Click **Users** tab
   - Click **Add User** button

3. **Create User**
   - **Email**: `paung_230000001724@uic.edu.ph`
   - **Password**: `UICalumni2025`
   - **Auto Confirm User**: ✅ Check this
   - Click **Create User**

### Step 2: Make User Admin
1. **Go to SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

2. **Run Admin Setup SQL**
   ```sql
   -- Make the user admin (FIXED - includes password_hash)
   INSERT INTO users (
     id,
     email,
     password_hash,
     role,
     status,
     email_verified,
     created_at,
     updated_at
   )
   SELECT 
     id,
     'paung_230000001724@uic.edu.ph',
     'supabase_auth_managed',
     'admin',
     'approved',
     true,
     NOW(),
     NOW()
   FROM auth.users 
   WHERE email = 'paung_230000001724@uic.edu.ph'
   ON CONFLICT (id) DO UPDATE SET
     role = 'admin',
     status = 'approved',
     password_hash = 'supabase_auth_managed';

   -- Create admin profile
   INSERT INTO user_profiles (
     user_id,
     first_name,
     last_name,
     program,
     current_job,
     company,
     country,
     bio,
     created_at,
     updated_at
   )
   SELECT 
     id,
     'Admin',
     'User',
     'System Administrator',
     'System Administrator',
     'UIC CCS Alumni Portal',
     'Philippines',
     'System Administrator for CCS Alumni Portal',
     NOW(),
     NOW()
   FROM auth.users 
   WHERE email = 'paung_230000001724@uic.edu.ph'
   ON CONFLICT (user_id) DO UPDATE SET
     first_name = 'Admin',
     last_name = 'User',
     current_job = 'System Administrator',
     company = 'UIC CCS Alumni Portal',
     updated_at = NOW();
   ```

3. **Click Run** to execute the SQL

### Step 3: Verify Admin User
Run this verification query:
```sql
SELECT 
  u.id,
  u.email,
  u.role,
  u.status,
  up.first_name,
  up.last_name,
  up.current_job
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'paung_230000001724@uic.edu.ph';
```

## 📋 Method 2: Through Registration + SQL (Alternative)

### Step 1: Register Through App
1. **Go to your app**: `http://localhost:3000/register`
2. **Register with**:
   - Email: `paung_230000001724@uic.edu.ph`
   - Password: `UICalumni2025`
   - Fill other required fields
3. **Submit registration** (will go to pending)

### Step 2: Upgrade to Admin
Run this SQL in Supabase:
```sql
-- Remove from pending registrations
DELETE FROM pending_registrations 
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Make user admin
UPDATE users 
SET role = 'admin', status = 'approved' 
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Update profile
UPDATE user_profiles 
SET 
  first_name = 'Admin',
  last_name = 'User',
  current_job = 'System Administrator',
  company = 'UIC CCS Alumni Portal',
  bio = 'System Administrator for CCS Alumni Portal'
WHERE user_id = (
  SELECT id FROM users 
  WHERE email = 'paung_230000001724@uic.edu.ph'
);
```

## ✅ Final Result

After completion, you should have:
- ✅ **Email**: `paung_230000001724@uic.edu.ph`
- ✅ **Password**: `UICalumni2025`
- ✅ **Role**: `admin`
- ✅ **Status**: `approved`
- ✅ **Name**: Admin User
- ✅ **Job**: System Administrator

## 🚀 Test Login

1. **Go to**: `http://localhost:3000/login`
2. **Login with**:
   - Email: `paung_230000001724@uic.edu.ph`
   - Password: `UICalumni2025`
3. **Should redirect to**: Admin Dashboard
4. **Should show**: "Welcome Admin User" in navbar

## 🔧 Troubleshooting

**If login fails:**
1. Check user exists in `auth.users` table
2. Check user has `role = 'admin'` in `users` table
3. Check user has `status = 'approved'` in `users` table
4. Check profile exists in `user_profiles` table

**Verification queries:**
```sql
-- Check auth user
SELECT * FROM auth.users WHERE email = 'paung_230000001724@uic.edu.ph';

-- Check app user
SELECT * FROM users WHERE email = 'paung_230000001724@uic.edu.ph';

-- Check profile
SELECT * FROM user_profiles WHERE user_id = (
  SELECT id FROM users WHERE email = 'paung_230000001724@uic.edu.ph'
);
```
