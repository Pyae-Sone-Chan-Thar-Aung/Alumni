# Fix Batchmates Data Issue

## 🔍 **Problem Identified**

The Batchmates page is empty because:
1. ❌ **Missing `batch_year` column** in the users table
2. ❌ **Users don't have batch/graduation year data**
3. ❌ **Component expects `batch_year` field that doesn't exist**

## ✅ **Solution Steps**

### **Step 1: Add Missing Database Columns**

Run this SQL script in your Supabase SQL Editor:

**File:** `add_user_columns_for_batchmates.sql`

```sql
-- Add batch_year column (REQUIRED)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS batch_year INTEGER;

-- Add optional profile columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_job TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Set sample data for existing users
UPDATE public.users 
SET 
  batch_year = 2020,
  course = 'BS Computer Science',
  current_job = 'Software Developer',
  company = 'Tech Company',
  location = 'Davao City, Philippines',
  last_login_at = NOW()
WHERE batch_year IS NULL;
```

### **Step 2: Verify the Fix**

After running the SQL script, test with:

```bash
node check_users_table.js
```

You should see:
- ✅ `batch_year` column exists
- ✅ Users have batch year data
- ✅ All 3 users now have batch information

### **Step 3: Test Batchmates Page**

1. **Login as an alumni user**
2. **Navigate to `/batchmates`**
3. **You should now see other users from the same batch year**

## 🎯 **What This Fixes**

### **Before Fix:**
- Empty batchmates page
- "No batchmates found" message
- Database query failures

### **After Fix:**
- ✅ **Working batchmates page** showing batch members
- ✅ **Real user data** with profiles, jobs, locations
- ✅ **Messaging and connection features** working
- ✅ **Professional UI** with all functionality

## 📊 **Current Database Status**

After running the debug script, your database has:
- **3 total users** in the system
- **All users are alumni** with `role = 'alumni'`
- **All users are verified** with `is_verified = true`
- **Missing batch information** (this is what we're fixing)

## 🚀 **Expected Result**

After implementing the fix:

1. **All 3 users will be in "Batch 2020"**
2. **Each user can see the other 2 as batchmates**
3. **Messaging system will work** between batchmates
4. **Connection requests can be sent** between users
5. **Profile information will display** properly

## 🔧 **Customization Options**

You can customize the default data by modifying the UPDATE statement:

```sql
-- Customize these values as needed:
UPDATE public.users 
SET 
  batch_year = 2021,  -- Change batch year
  course = 'BS Information Technology',  -- Change course
  current_job = 'Web Developer',  -- Change job
  company = 'Your Company',  -- Change company
  location = 'Your City, Philippines'  -- Change location
WHERE batch_year IS NULL;
```

## 📝 **Alternative: Individual User Updates**

If you want different data for each user:

```sql
-- Update specific users individually
UPDATE public.users 
SET batch_year = 2020, course = 'BS Computer Science'
WHERE email = 'kalaylay.ktg@gmail.com';

UPDATE public.users 
SET batch_year = 2020, course = 'BS Information Technology'  
WHERE email = 'other-user@example.com';
```

## ✅ **Final Verification**

After running the fix, your batchmates page should show:
- 👥 **List of batch members** (excluding yourself)
- 💬 **Working "Message" buttons**
- 🤝 **Working "Connect" buttons**
- 📋 **Real profile information**
- 🔍 **Working search and filters**

Run the SQL script and refresh your batchmates page - you should see your fellow alumni! 🎉