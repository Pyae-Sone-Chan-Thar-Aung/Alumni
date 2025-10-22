# 🔄 Complete Database Reset & Reconnection Guide

**Date**: October 5, 2025  
**Purpose**: Drop existing Supabase database and start fresh  
**Time Required**: 20-30 minutes

---

## ⚠️ WARNING

This process will **PERMANENTLY DELETE** all data in your Supabase database:
- All tables and their data
- All storage buckets and files
- All database functions and policies
- All authentication users (optional)

**Make sure you have backups if needed!**

---

## 📋 Prerequisites

- [ ] Access to Supabase Dashboard: https://supabase.com/dashboard
- [ ] Your project URL: `https://cnjdmddqwfryvqnhirkb.supabase.co`
- [ ] Admin access to your Supabase project

---

## 🚀 Step-by-Step Process

### **PHASE 1: DROP EXISTING DATABASE** (5 minutes)

#### Step 1.1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project: `cnjdmddqwfryvqnhirkb`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

#### Step 1.2: Execute DROP Script
1. Open the file: `DROP_ALL_DATABASE.sql` in this directory
2. **Copy the ENTIRE content** of the file
3. Paste into Supabase SQL Editor
4. Click **"Run"** button
5. Wait for completion (should see: "DROP COMPLETE!" message)
6. **Verify Results**: You should see:
   ```
   Remaining tables: 0
   Remaining functions: 0
   Remaining policies: 0
   ✅ Database successfully cleaned!
   ```

---

### **PHASE 2: DELETE STORAGE BUCKETS** (2 minutes)

#### Step 2.1: Delete Storage Buckets
1. In Supabase Dashboard, click **"Storage"** in left sidebar
2. Delete these buckets if they exist:
   - [ ] `alumni-profiles`
   - [ ] `gallery-images`
   - [ ] `news-images`
   - [ ] `documents`
3. Click the 3-dot menu (⋮) next to each bucket
4. Select **"Delete bucket"**
5. Confirm deletion

---

### **PHASE 3: DELETE AUTH USERS** (Optional - 2 minutes)

⚠️ **Optional**: Only do this if you want to completely reset authentication

#### Step 3.1: Clear Authentication Users
1. In Supabase Dashboard, click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. Select all users (if any)
4. Click **"Delete users"**
5. Confirm deletion

---

### **PHASE 4: CREATE NEW DATABASE SCHEMA** (5 minutes)

#### Step 4.1: Run Complete Schema Script
1. In Supabase SQL Editor, create a **new query**
2. Open the file: `UPDATED_COMPLETE_DATABASE_SCHEMA.sql`
3. **Copy the ENTIRE content** (all ~1,600 lines)
4. Paste into Supabase SQL Editor
5. Click **"Run"** button
6. Wait for completion (may take 30-60 seconds)

#### Step 4.2: Verify Schema Creation
Run this verification query in SQL Editor:
```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- ✅ `users`
- ✅ `user_profiles`
- ✅ `pending_registrations`
- ✅ `news`
- ✅ `job_opportunities`
- ✅ `tracer_study_responses`
- ✅ `gallery_albums`
- ✅ `gallery_images`
- ✅ `batchmate_messages` (if included)

---

### **PHASE 5: CREATE STORAGE BUCKETS** (3 minutes)

#### Step 5.1: Create Storage Buckets
1. In Supabase Dashboard, go to **"Storage"**
2. Click **"Create a new bucket"**
3. Create these buckets with **Public** access:

**Bucket 1: alumni-profiles**
- Name: `alumni-profiles`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/gif,image/webp`

**Bucket 2: gallery-images**
- Name: `gallery-images`
- Public: ✅ Yes
- File size limit: 10MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/gif,image/webp`

**Bucket 3: news-images**
- Name: `news-images`
- Public: ✅ Yes
- File size limit: 10MB
- Allowed MIME types: `image/jpeg,image/jpg,image/png,image/gif,image/webp`

**Bucket 4: documents** (optional)
- Name: `documents`
- Public: ❌ No
- File size limit: 20MB
- Allowed MIME types: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

### **PHASE 6: CREATE ADMIN USER** (5 minutes)

#### Step 6.1: Create Admin via Supabase Auth
1. In Supabase Dashboard, go to **"Authentication"** → **"Users"**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `admin@uic.edu.ph`
   - **Password**: `Admin@UIC2024!` (change this later!)
   - **Auto Confirm User**: ✅ Yes
4. Click **"Create user"**
5. **Copy the User UUID** (you'll need this)

#### Step 6.2: Add Admin to Database
In SQL Editor, run this (replace `USER_UUID` with the UUID from step 6.1):
```sql
-- Insert admin user into users table
INSERT INTO public.users (
    auth_id,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    is_verified,
    is_active
) VALUES (
    'USER_UUID_HERE',  -- Replace with actual UUID
    'admin@uic.edu.ph',
    'System',
    'Administrator',
    'admin',
    'approved',
    true,
    true
);

-- Create admin profile
INSERT INTO public.user_profiles (
    user_id,
    first_name,
    last_name,
    program,
    graduation_year
) VALUES (
    (SELECT id FROM public.users WHERE email = 'admin@uic.edu.ph'),
    'System',
    'Administrator',
    'Computer Science',
    2024
);
```

---

### **PHASE 7: UPDATE ENVIRONMENT FILES** (3 minutes)

#### Step 7.1: Get New Credentials
1. In Supabase Dashboard, go to **"Settings"** → **"API"**
2. Copy these values:
   - **Project URL**: Already have it (https://cnjdmddqwfryvqnhirkb.supabase.co)
   - **anon/public key**: Copy the `anon` key
   - **service_role key**: Copy the `service_role` key ⚠️ (keep secret!)

#### Step 7.2: Update Frontend .env
Your current `.env` file already has the URL. Verify it's correct:
```env
REACT_APP_SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Step 7.3: Create Backend .env
Create `server/.env` file with:
```env
SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=8000
```

---

### **PHASE 8: TEST THE CONNECTION** (5 minutes)

#### Step 8.1: Start Backend Server
Open PowerShell terminal #1:
```powershell
cd "C:\Users\Admin\OneDrive - uic.edu.ph\Desktop\CCSAlumni"
npm run server
```

You should see: `✅ Server running on port 8000`

#### Step 8.2: Start Frontend
Open PowerShell terminal #2:
```powershell
cd "C:\Users\Admin\OneDrive - uic.edu.ph\Desktop\CCSAlumni"
npm start
```

Browser should open at: `http://localhost:3000`

#### Step 8.3: Test Login
1. Go to: `http://localhost:3000/login`
2. Login with:
   - Email: `admin@uic.edu.ph`
   - Password: `Admin@UIC2024!` (or what you set)
3. You should be redirected to Admin Dashboard ✅

---

## ✅ Verification Checklist

Run through this checklist to verify everything works:

### Database
- [ ] All 8-9 tables exist in Supabase
- [ ] Row Level Security policies are active
- [ ] Helper functions are created

### Storage
- [ ] 3-4 storage buckets exist
- [ ] Buckets have correct public/private settings
- [ ] Can upload test image to `alumni-profiles`

### Authentication
- [ ] Admin user exists in Auth
- [ ] Admin user exists in `users` table
- [ ] Can login successfully

### Application
- [ ] Backend server starts without errors
- [ ] Frontend starts without errors
- [ ] Can login as admin
- [ ] Admin dashboard loads with navigation
- [ ] Can access admin pages (Users, News, etc.)

---

## 🐛 Troubleshooting

### Issue: "relation does not exist"
**Solution**: Database schema not fully created. Re-run `UPDATED_COMPLETE_DATABASE_SCHEMA.sql`

### Issue: "Failed to fetch" errors
**Solution**: 
1. Check `.env` file has correct Supabase URL and key
2. Verify Supabase project is active (not paused)
3. Check browser console for CORS errors

### Issue: "Row Level Security" errors
**Solution**: Make sure RLS policies were created. Check in SQL Editor:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Issue: Can't upload images
**Solution**: 
1. Verify storage buckets exist
2. Check bucket is set to PUBLIC
3. Verify RLS policies on storage

### Issue: Admin can't login
**Solution**: 
1. Verify admin user exists in Authentication
2. Check admin user has `role = 'admin'` in users table
3. Check `approval_status = 'approved'`

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase Dashboard logs: **"Logs"** → **"Postgres Logs"**
2. Check browser console for JavaScript errors
3. Check backend terminal for server errors
4. Review the error message carefully

---

## 🎉 Success!

Once everything is verified:
1. ✅ Database is fresh and connected
2. ✅ Storage buckets are ready
3. ✅ Admin account is working
4. ✅ Application is running

**Next Steps**:
- Change the admin password to something secure
- Create test alumni accounts
- Upload test content (news, gallery, jobs)
- Invite real alumni to register

---

**Good luck! 🚀**
