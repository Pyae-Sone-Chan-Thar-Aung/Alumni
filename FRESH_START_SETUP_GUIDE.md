# 🚀 Fresh Start Setup Guide

**Project**: CCS Alumni Portal - Fresh Supabase Project  
**Super Admin**: paung_230000001724@uic.edu.ph  
**Project URL**: https://gpsbydtilgoutlltyfvl.supabase.co  
**Date**: October 6, 2025

---

## ✅ What's Already Done

- ✅ **Frontend .env updated** with new project URL and anon key
- ✅ **Backend server/.env created** (needs service_role key)
- ✅ **Database schema SQL created** (`FRESH_START_DATABASE_SCHEMA.sql`)

---

## 📋 Setup Checklist

### **STEP 1: Run Database Schema** (5 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `gpsbydtilgoutlltyfvl`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Schema Script**
   - Open file: `FRESH_START_DATABASE_SCHEMA.sql`
   - Copy **ENTIRE** content (750 lines)
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait 30-60 seconds

4. **Verify Results**
   You should see:
   ```
   ✅ DATABASE SCHEMA CREATED SUCCESSFULLY!
   Tables created: 9
   Expected: 9 tables
   ✅ All tables created successfully!
   ```

5. **Check Tables Created**
   - batchmate_messages
   - gallery_albums
   - gallery_images
   - job_opportunities
   - news
   - pending_registrations
   - tracer_study_responses
   - user_profiles
   - users

---

### **STEP 2: Create Storage Buckets** (3 minutes)

1. **Navigate to Storage**
   - In Supabase Dashboard, click "Storage" → "Buckets"

2. **Create Bucket 1: alumni-profiles**
   - Click "Create a new bucket"
   - Name: `alumni-profiles`
   - Public bucket: **✅ YES**
   - Click "Create bucket"
   - Go to bucket → Policies → Add policy:
     ```
     Policy name: Public read access
     Target roles: anon, authenticated
     Policy command: SELECT
     Policy definition: true
     ```
   - Add INSERT/UPDATE/DELETE policies for authenticated users

3. **Create Bucket 2: gallery-images**
   - Click "Create a new bucket"
   - Name: `gallery-images`
   - Public bucket: **✅ YES**
   - Same policies as above

4. **Create Bucket 3: news-images**
   - Click "Create a new bucket"
   - Name: `news-images`
   - Public bucket: **✅ YES**
   - Same policies as above

---

### **STEP 3: Create Super Admin User** (5 minutes)

#### 3.1: Create in Authentication

1. **Go to Authentication**
   - Click "Authentication" → "Users" in dashboard
   - Click "Add user" → "Create new user"

2. **Enter Credentials**
   - **Email**: `paung_230000001724@uic.edu.ph`
   - **Password**: `UICalumni2025`
   - **Auto Confirm User**: ✅ **YES** (important!)
   - Click "Create user"

3. **Copy the UUID**
   - After creation, you'll see the user in the list
   - Click on the user
   - **COPY THE USER ID** (UUID) - looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### 3.2: Add to Database

1. **Go back to SQL Editor**

2. **Run this SQL** (replace `YOUR_UUID_HERE` with the UUID you copied):

```sql
-- Insert super admin into users table
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
    'YOUR_UUID_HERE'::UUID,  -- ⚠️ REPLACE WITH ACTUAL UUID
    'paung_230000001724@uic.edu.ph',
    'Super',
    'Admin',
    'super_admin',
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
    (SELECT id FROM public.users WHERE email = 'paung_230000001724@uic.edu.ph'),
    'Super',
    'Admin',
    'Computer Science',
    2025
);
```

3. **Verify Admin Created**
```sql
-- Check admin user
SELECT id, email, role, approval_status, is_verified 
FROM public.users 
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Should show: role = 'super_admin', approval_status = 'approved', is_verified = true
```

---

### **STEP 4: Update Backend Environment** (2 minutes)

1. **Get Service Role Key**
   - In Supabase Dashboard: Settings → API
   - Scroll to "Project API keys"
   - Find "service_role" key
   - Click "Reveal" and **COPY** the key

2. **Update server/.env**
   - Open: `server/.env`
   - Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the actual key
   - File should look like:
     ```env
     SUPABASE_URL=https://gpsbydtilgoutlltyfvl.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...actual_key_here...
     PORT=8000
     ```
   - **SAVE THE FILE**

---

### **STEP 5: Test the System** (5 minutes)

#### 5.1: Start Backend

1. **Open PowerShell Terminal #1**
   ```powershell
   cd "C:\Users\Admin\OneDrive - uic.edu.ph\Desktop\CCSAlumni"
   npm run server
   ```

2. **Expected Output**:
   ```
   ✅ Server running on port 8000
   ```

#### 5.2: Start Frontend

1. **Open PowerShell Terminal #2**
   ```powershell
   cd "C:\Users\Admin\OneDrive - uic.edu.ph\Desktop\CCSAlumni"
   npm start
   ```

2. **Expected Output**:
   - Browser opens at `http://localhost:3000`
   - You see the homepage

#### 5.3: Test Login

1. **Navigate to Login**
   - Click "Login" or go to: `http://localhost:3000/login`

2. **Enter Credentials**
   - Email: `paung_230000001724@uic.edu.ph`
   - Password: `UICalumni2025`
   - Click "Login"

3. **Expected Result**:
   - ✅ Redirected to Admin Dashboard
   - ✅ Can see admin navigation menu
   - ✅ Can access all admin pages

---

## ✅ Final Verification

Run through this checklist:

### Database
- [ ] All 9 tables exist in Supabase
- [ ] RLS policies are active (check in SQL Editor: `SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';`)
- [ ] Helper functions created (`is_admin`, `update_updated_at_column`)

### Storage
- [ ] 3 storage buckets exist (alumni-profiles, gallery-images, news-images)
- [ ] All buckets are public
- [ ] Can upload test image (optional)

### Authentication
- [ ] Super admin user in Authentication
- [ ] Super admin user in `users` table with role='super_admin'
- [ ] Super admin profile in `user_profiles` table
- [ ] Can login successfully

### Application
- [ ] Backend runs without errors (port 8000)
- [ ] Frontend runs without errors (port 3000)
- [ ] Login works
- [ ] Admin dashboard loads
- [ ] Can navigate to: Users, News, Gallery, Jobs, etc.
- [ ] No console errors

---

## 🔗 Database Relationships

Your database now has proper foreign key relationships:

```
users (parent)
  ├─→ user_profiles (CASCADE delete)
  ├─→ pending_registrations.reviewed_by (SET NULL)
  ├─→ news.author_id (SET NULL)
  ├─→ gallery_albums.created_by (SET NULL)
  ├─→ gallery_images.uploaded_by (SET NULL)
  ├─→ job_opportunities.posted_by (SET NULL)
  ├─→ tracer_study_responses.user_id (CASCADE delete)
  ├─→ batchmate_messages.sender_id (CASCADE delete)
  └─→ batchmate_messages.recipient_id (CASCADE delete)

gallery_albums (parent)
  └─→ gallery_images.album_id (CASCADE delete)
```

**This means**:
- When a user is deleted, their profile is automatically deleted
- When a user is deleted, their tracer study responses are deleted
- When an album is deleted, all its images are deleted
- When a user is deleted, their created content has reference SET to NULL

---

## 🔒 Security Features Active

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **Users can only see approved, active users**  
✅ **Users can only edit their own profiles**  
✅ **Only admins can manage content (news, gallery, jobs)**  
✅ **Anyone can register (anonymous INSERT to pending_registrations)**  
✅ **Only admins can approve/reject registrations**  

---

## 🎯 What You Can Do Now

As super admin, you can:
- ✅ Create/manage admin accounts
- ✅ Approve/reject alumni registrations
- ✅ Post and manage news articles
- ✅ Create gallery albums and upload photos
- ✅ Post job opportunities
- ✅ View tracer study analytics
- ✅ Manage all users
- ✅ Access all system features

---

## 🐛 Troubleshooting

### Issue: "relation does not exist"
**Solution**: Database schema not created. Re-run FRESH_START_DATABASE_SCHEMA.sql

### Issue: Can't login
**Solution**: 
1. Check super admin exists in Authentication
2. Verify super admin in users table with role='super_admin'
3. Check approval_status='approved' and is_active=true

### Issue: "Failed to fetch"
**Solution**:
1. Verify .env has correct URL and anon key
2. Check server/.env has correct service_role key
3. Ensure Supabase project is not paused

### Issue: Can't upload images
**Solution**:
1. Verify storage buckets exist
2. Check buckets are set to PUBLIC
3. Verify storage policies allow authenticated uploads

---

## 📝 Next Steps

1. **Test Registration Flow**
   - Try registering a test alumni account
   - Approve it as admin
   - Login as that alumni

2. **Add Sample Content**
   - Create a test news article
   - Upload test photos to gallery
   - Post a test job opportunity

3. **Invite Real Alumni**
   - Share the registration link
   - Review and approve registrations
   - Monitor system usage

---

## 🎉 SUCCESS!

Your CCS Alumni Portal is now:
- ✅ **Properly connected** to new Supabase project
- ✅ **Database configured** with relationships and security
- ✅ **Storage ready** for file uploads
- ✅ **Super admin created** and functional
- ✅ **Ready for production use**

**Congratulations! 🚀**
