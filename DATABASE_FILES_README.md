# 📂 Database Setup Files Overview

This directory contains all the files needed for setting up and resetting the CCS Alumni Portal database.

## 🗂️ File Guide

### 🔴 **DROP_ALL_DATABASE.sql**
**Purpose**: Completely drops all database objects (tables, functions, policies, triggers, indexes)

**When to use**:
- When you want to start completely fresh
- When database is corrupted or has connection issues
- When you want to reset everything to factory defaults

**What it does**:
- Drops all RLS policies
- Drops all triggers
- Drops all tables with CASCADE
- Drops all functions
- Drops all indexes
- Verifies everything is cleaned

**⚠️ WARNING**: This permanently deletes ALL data!

---

### 🟢 **FRESH_DATABASE_COMPLETE.sql**
**Purpose**: Creates complete database schema from scratch

**When to use**:
- After running DROP_ALL_DATABASE.sql
- On a brand new Supabase project
- After deleting all tables manually

**What it creates**:
- **8 Core Tables**:
  - `users` - User authentication and roles
  - `user_profiles` - Detailed alumni profiles
  - `pending_registrations` - Registration approval queue
  - `news` - News and announcements
  - `gallery_albums` - Photo album containers
  - `gallery_images` - Individual gallery photos
  - `job_opportunities` - Job postings
  - `tracer_study_responses` - Graduate tracer study data

- **3 Helper Functions**:
  - `is_admin()` - Check if user is admin
  - `update_updated_at_column()` - Auto-update timestamps
  - `sync_user_approval()` - Sync approval status

- **8 Triggers**: Auto-update timestamps on all tables

- **Complete RLS Policies**: Row-level security for all tables

- **Performance Indexes**: Speed up queries

- **2 Admin Accounts**: Pre-configured admin users

**Features**:
- ✅ Complete approval workflow
- ✅ Profile image management
- ✅ Admin dashboard support
- ✅ Public gallery access
- ✅ Job opportunity system
- ✅ Tracer study analytics

---

### 📘 **storage_setup_instructions.md**
**Purpose**: Detailed instructions for setting up Supabase storage buckets

**What's included**:
- Step-by-step bucket creation guide
- Policy configuration for each bucket
- Security settings
- Troubleshooting tips
- Verification checklist

**Required Buckets**:
- `alumni-profiles` - Profile pictures
- `gallery-images` - Gallery photos
- `news-images` - News article images

**⚠️ IMPORTANT**: Must be done AFTER running FRESH_DATABASE_COMPLETE.sql because storage policies need the `is_admin()` function

---

### 📗 **DATABASE_RESET_GUIDE.md**
**Purpose**: Complete step-by-step guide for performing a full database reset

**What's included**:
- Complete reset checklist
- Order of operations
- Verification steps
- Troubleshooting section
- Quick command reference
- Expected results

**Perfect for**:
- First-time setup
- Complete system reset
- Moving to new Supabase project
- Fixing database corruption

---

## 🚀 Quick Start (Complete Reset)

### Option 1: Full Reset (Recommended for Clean Start)

```bash
# Follow this order:

1. Open Supabase Dashboard → Authentication → Users
   Delete all users (optional)

2. Open Supabase Dashboard → Storage
   Delete all buckets: alumni-profiles, gallery-images, news-images

3. Open Supabase Dashboard → SQL Editor
   Run: DROP_ALL_DATABASE.sql
   Wait for: "✅ Database successfully cleaned!"

4. Still in SQL Editor
   Run: FRESH_DATABASE_COMPLETE.sql
   Wait for: "✅ SUCCESS! All 8 tables created!"

5. Follow storage_setup_instructions.md
   Create and configure all 3 storage buckets

6. Register first admin user
   Use: paung_230000001724@uic.edu.ph or admin@uic.edu.ph

7. Test everything works!
```

### Option 2: Fresh Installation (New Project)

```bash
# If you're starting on a brand new Supabase project:

1. Open Supabase Dashboard → SQL Editor
   Run: FRESH_DATABASE_COMPLETE.sql
   Wait for: "✅ SUCCESS! All 8 tables created!"

2. Follow storage_setup_instructions.md
   Create and configure all 3 storage buckets

3. Register first admin user
   Use: paung_230000001724@uic.edu.ph or admin@uic.edu.ph

4. Done!
```

---

## 🔍 Verification Commands

Run these in Supabase SQL Editor to verify setup:

### Check all tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check admin users:
```sql
SELECT id, email, role, approval_status, is_verified
FROM public.users
WHERE role = 'admin';
```

### Test is_admin() function:
```sql
SELECT public.is_admin(auth.uid()) as am_i_admin;
```

### Check RLS policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 📊 Database Schema Overview

```
users (authentication & roles)
├── user_profiles (detailed alumni info)
├── pending_registrations (approval queue)
└── tracer_study_responses (graduate tracking)

news (announcements & updates)

gallery_albums (photo collections)
└── gallery_images (individual photos)

job_opportunities (career postings)
```

---

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Enabled on all tables except `users` (intentionally disabled for registration)
- ✅ Users can only see/edit their own data
- ✅ Admins can manage all data
- ✅ Public can view published content only

### Storage Security
- ✅ Authenticated users can upload profile pictures
- ✅ Only admins can upload gallery/news images
- ✅ All images publicly viewable (for portal use)
- ✅ 5MB file size limit
- ✅ Only image MIME types allowed

### Admin Protection
- ✅ Admin role required for sensitive operations
- ✅ `is_admin()` function for secure role checks
- ✅ Pre-configured admin accounts
- ✅ Approval workflow for new alumni

---

## 🐛 Common Issues & Solutions

### Issue: "relation does not exist"
**Solution**: Run FRESH_DATABASE_COMPLETE.sql

### Issue: "function is_admin() does not exist"  
**Solution**: Run FRESH_DATABASE_COMPLETE.sql before creating storage buckets

### Issue: "permission denied"
**Solution**: Check RLS policies and verify user role

### Issue: Images not uploading
**Solution**: 
1. Verify storage buckets exist
2. Check bucket policies are configured
3. Verify bucket is set to Public

### Issue: Registration not working
**Solution**: 
1. Verify REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env
2. Restart React app after .env changes
3. Check browser console for errors

---

## 📞 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide**: https://supabase.com/docs/guides/storage

---

## ✅ Setup Completion Checklist

Use this to verify your setup is complete:

- [ ] Ran DROP_ALL_DATABASE.sql (if resetting)
- [ ] Ran FRESH_DATABASE_COMPLETE.sql successfully
- [ ] Created all 3 storage buckets
- [ ] Configured policies for each bucket
- [ ] Registered at least one admin user
- [ ] Verified admin dashboard access
- [ ] Tested profile image upload
- [ ] Tested gallery image upload (admin)
- [ ] Verified RLS policies work
- [ ] All features functional

---

## 🎉 You're All Set!

Once you've completed all steps and checked off the checklist above, your CCS Alumni Portal database is ready for use!

**Enjoy building your alumni community! 🎓**
