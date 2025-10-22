# 🚀 Quick Reset Commands Reference

**Quick copy-paste commands for database reset**

---

## 📝 Phase 1: Drop Database

**File to use**: `DROP_ALL_DATABASE.sql`  
**Location**: Already in your project root  
**Action**: Copy entire file content → Paste in Supabase SQL Editor → Run

---

## 📝 Phase 4: Create Schema

**File to use**: `UPDATED_COMPLETE_DATABASE_SCHEMA.sql`  
**Location**: Already in your project root  
**Action**: Copy entire file content → Paste in Supabase SQL Editor → Run

---

## 📝 Phase 4.2: Verify Tables

```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
- batchmate_messages (optional)
- gallery_albums
- gallery_images
- job_opportunities
- news
- pending_registrations
- tracer_study_responses
- user_profiles
- users

---

## 📝 Phase 6.2: Create Admin User

**Step 1**: Create user in Authentication → Copy the UUID

**Step 2**: Run this SQL (replace `USER_UUID_HERE` with actual UUID):

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
    'USER_UUID_HERE',  -- ⚠️ REPLACE THIS
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

## 📝 Verify Admin User

```sql
-- Check if admin exists in users table
SELECT id, email, role, approval_status, is_verified 
FROM public.users 
WHERE email = 'admin@uic.edu.ph';

-- Check if admin profile exists
SELECT up.id, up.first_name, up.last_name, u.email
FROM public.user_profiles up
JOIN public.users u ON up.user_id = u.id
WHERE u.email = 'admin@uic.edu.ph';
```

---

## 📝 Check RLS Policies

```sql
-- Verify Row Level Security policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 📝 Test Database Connection

```sql
-- Simple test query
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM user_profiles) as total_profiles,
    (SELECT COUNT(*) FROM pending_registrations) as pending_regs,
    (SELECT COUNT(*) FROM news) as news_count,
    (SELECT COUNT(*) FROM job_opportunities) as jobs_count;
```

---

## 📝 Emergency: Drop Everything Again

If something goes wrong and you need to drop everything again:

```sql
-- Quick drop all tables (use with caution!)
DROP TABLE IF EXISTS public.tracer_study_responses CASCADE;
DROP TABLE IF EXISTS public.job_opportunities CASCADE;
DROP TABLE IF EXISTS public.gallery_images CASCADE;
DROP TABLE IF EXISTS public.gallery_albums CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.pending_registrations CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.batchmate_messages CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_approval() CASCADE;
```

---

## 🔑 Environment Variables Reference

### Frontend `.env` (root directory)
```env
REACT_APP_SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<get from Supabase Settings → API>
```

### Backend `server/.env` (create this file)
```env
SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase Settings → API>
PORT=8000
```

**Where to get keys**: Supabase Dashboard → Settings → API

---

## 🏃 Start Commands

### Start Backend
```powershell
npm run server
```

### Start Frontend
```powershell
npm start
```

---

## 📦 Storage Buckets to Create

| Bucket Name | Public | Size Limit | MIME Types |
|------------|--------|------------|------------|
| alumni-profiles | ✅ Yes | 5MB | image/* |
| gallery-images | ✅ Yes | 10MB | image/* |
| news-images | ✅ Yes | 10MB | image/* |
| documents | ❌ No | 20MB | pdf, doc, docx |

---

## ✅ Final Checklist

Before considering reset complete:

- [ ] All 8-9 tables exist in database
- [ ] RLS policies are active (30+ policies)
- [ ] Admin user in Authentication
- [ ] Admin user in users table (role = 'admin')
- [ ] Admin profile in user_profiles table
- [ ] 3-4 storage buckets created
- [ ] Frontend .env configured
- [ ] Backend server/.env created
- [ ] Backend server starts (port 8000)
- [ ] Frontend starts (port 3000)
- [ ] Can login as admin
- [ ] Admin dashboard loads

---

**All commands ready! Follow the main guide: `COMPLETE_DATABASE_RESET_GUIDE.md`**
