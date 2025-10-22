# Database Migration and Testing Checklist

## 🎯 Overview
This checklist ensures your CCS Alumni Portal database is properly configured and all features are connected correctly.

---

## 📋 Pre-Migration Checklist

### 1. Backup Current Database
- [ ] Export current database schema using Supabase Dashboard
- [ ] Backup any existing user data
- [ ] Document current table structures
- [ ] Note any custom modifications

### 2. Review Current Issues
- [ ] List all current database errors
- [ ] Document missing tables/columns
- [ ] Note RLS policy issues
- [ ] Check storage bucket problems

---

## 🔧 Migration Steps

### Step 1: Run Database Schema Script
- [ ] Open Supabase SQL Editor
- [ ] Copy entire `COMPLETE_DATABASE_SCHEMA.sql` file
- [ ] Execute the script
- [ ] Verify no errors in execution
- [ ] Check success message appears

### Step 2: Verify Table Creation
Run this query to check all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 
    'user_profiles', 
    'pending_registrations',
    'news',
    'gallery_albums',
    'gallery_images',
    'job_opportunities',
    'tracer_study_responses'
  )
ORDER BY table_name;
```

Expected: 8 tables listed

- [ ] All 8 tables exist
- [ ] No missing tables

### Step 3: Verify Column Structure
Check each table has required columns:

**Users table:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

Required columns:
- [ ] id (uuid)
- [ ] email (text)
- [ ] first_name (text)
- [ ] last_name (text)
- [ ] role (text)
- [ ] approval_status (text)
- [ ] is_verified (boolean)
- [ ] approved_at (timestamp)
- [ ] registration_date (timestamp)
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)

**User_profiles table:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND table_schema = 'public';
```

Required columns:
- [ ] user_id (uuid)
- [ ] phone (text)
- [ ] course (text)
- [ ] batch_year (integer)
- [ ] graduation_year (integer)
- [ ] current_job (text)
- [ ] company (text)
- [ ] address (text)
- [ ] city (text)
- [ ] country (text)
- [ ] profile_image_url (text)

**Tracer_study_responses table:**
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'tracer_study_responses' AND table_schema = 'public';
```

Critical columns:
- [ ] user_id (uuid)
- [ ] employment_status (text)
- [ ] sex (text)
- [ ] gender (text) - for analytics
- [ ] graduation_year (integer)

**Gallery_albums table:**
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'gallery_albums' AND table_schema = 'public';
```

Required columns:
- [ ] id (uuid)
- [ ] title (text)
- [ ] description (text)
- [ ] cover_image_url (text)
- [ ] event_date (date)
- [ ] is_published (boolean)

**Gallery_images table:**
- [ ] album_id (uuid)
- [ ] image_url (text)
- [ ] caption (text)
- [ ] display_order (integer)

### Step 4: Verify Functions and Triggers
```sql
-- Check functions exist
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('is_admin', 'update_updated_at_column', 'sync_user_approval')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

- [ ] is_admin() function exists
- [ ] update_updated_at_column() function exists
- [ ] sync_user_approval() function exists

```sql
-- Check triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

Expected triggers:
- [ ] update_users_updated_at
- [ ] update_user_profiles_updated_at
- [ ] update_news_updated_at
- [ ] update_gallery_albums_updated_at
- [ ] update_job_opportunities_updated_at
- [ ] update_tracer_study_updated_at
- [ ] trigger_sync_user_approval

### Step 5: Verify RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Check policies exist for:
- [ ] user_profiles (4 policies)
- [ ] pending_registrations (2 policies)
- [ ] news (2 policies)
- [ ] gallery_albums (2 policies)
- [ ] gallery_images (2 policies)
- [ ] job_opportunities (2 policies)
- [ ] tracer_study_responses (4 policies)

### Step 6: Verify Indexes
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename;
```

Expected indexes:
- [ ] idx_users_email
- [ ] idx_users_approval_status
- [ ] idx_users_role
- [ ] idx_user_profiles_user_id
- [ ] idx_pending_registrations_user_id
- [ ] idx_news_published
- [ ] idx_gallery_albums_published
- [ ] idx_job_opportunities_active

### Step 7: Setup Storage Buckets
Follow `STORAGE_BUCKET_SETUP_GUIDE.md`:

- [ ] Create `alumni-profiles` bucket (Public, 5MB limit)
- [ ] Create `gallery-images` bucket (Public, 10MB limit)
- [ ] Create `news-images` bucket (Public, 5MB limit)
- [ ] Configure all storage policies via Dashboard
- [ ] Test file upload to each bucket

### Step 8: Create Admin User
```sql
-- Verify admin user exists
SELECT email, role, approval_status, is_verified
FROM public.users
WHERE role = 'admin';
```

If no admin exists:
- [ ] Register via application UI
- [ ] Update user to admin role manually:
```sql
UPDATE public.users 
SET role = 'admin', 
    approval_status = 'approved', 
    is_verified = true,
    approved_at = NOW()
WHERE email = 'your-admin-email@uic.edu.ph';
```

---

## ✅ Feature Testing Checklist

### Authentication & Registration

#### Test 1: New User Registration
- [ ] Navigate to `/register`
- [ ] Fill all required fields
- [ ] Upload profile image (test with 3MB JPG)
- [ ] Submit registration
- [ ] Check success message appears
- [ ] Verify user appears in `users` table with `approval_status = 'pending'`
- [ ] Verify profile created in `user_profiles` table
- [ ] Verify pending registration created in `pending_registrations` table
- [ ] Check profile image uploaded to `alumni-profiles` bucket

**Expected Database State:**
```sql
-- Should show new user
SELECT id, email, approval_status, is_verified FROM users WHERE email = 'test@example.com';

-- Should show profile
SELECT user_id, phone, course FROM user_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Should show pending registration
SELECT status FROM pending_registrations WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

#### Test 2: Login with Pending Account
- [ ] Try to login with pending account
- [ ] Verify error message about pending approval
- [ ] Confirm user is logged out

#### Test 3: Admin Approval
- [ ] Login as admin
- [ ] Navigate to Admin Dashboard
- [ ] Check pending approvals count shows correctly
- [ ] Go to Pending Registrations page
- [ ] Approve a pending user
- [ ] Verify `approval_status` updated to 'approved' in database
- [ ] Verify `is_verified` set to true
- [ ] Verify `approved_at` timestamp set

#### Test 4: Login with Approved Account
- [ ] Login with approved account
- [ ] Verify successful login
- [ ] Verify redirected to alumni profile/dashboard
- [ ] Check session persists on page refresh

---

### Profile Management

#### Test 5: View Profile
- [ ] Login as approved alumni
- [ ] Navigate to Profile page
- [ ] Verify all profile data displays correctly
- [ ] Check profile image displays (if uploaded)

#### Test 6: Update Profile
- [ ] Click Edit button
- [ ] Modify phone number
- [ ] Modify current job and company
- [ ] Save changes
- [ ] Verify success message
- [ ] Check database updated:
```sql
SELECT phone, current_job, company, updated_at
FROM user_profiles
WHERE user_id = 'your-user-id';
```
- [ ] Verify `updated_at` timestamp changed

#### Test 7: Update Profile Image
- [ ] Click on profile image
- [ ] Upload new image (test with 4MB PNG)
- [ ] Verify preview updates
- [ ] Verify success message
- [ ] Check database:
```sql
SELECT profile_image_url FROM user_profiles WHERE user_id = 'your-user-id';
```
- [ ] Verify image accessible via public URL
- [ ] Check old image still exists or replaced in bucket

---

### Tracer Study

#### Test 8: Submit Tracer Study
- [ ] Login as alumni
- [ ] Navigate to Tracer Study page
- [ ] Fill all required fields in Step 1 (Personal Info)
- [ ] Click Next, verify validation works
- [ ] Fill Step 2 (Education)
- [ ] Fill Step 3 (Employment)
- [ ] Fill Step 4 (Career Path)
- [ ] Review in Step 5
- [ ] Submit form
- [ ] Verify success message

**Database Check:**
```sql
SELECT user_id, employment_status, sex, gender, graduation_year, created_at
FROM tracer_study_responses
WHERE user_id = 'your-user-id';
```

- [ ] Response exists in database
- [ ] `sex` field populated
- [ ] `gender` field populated (mapped from sex)
- [ ] `graduation_year` is integer
- [ ] All submitted fields saved correctly

#### Test 9: Update Tracer Study
- [ ] Revisit Tracer Study page
- [ ] Verify previous responses loaded
- [ ] Modify employment status
- [ ] Resubmit
- [ ] Check database:
```sql
SELECT employment_status, updated_at
FROM tracer_study_responses
WHERE user_id = 'your-user-id';
```
- [ ] Changes saved
- [ ] `updated_at` timestamp updated

---

### Job Opportunities

#### Test 10: View Job Opportunities
- [ ] Navigate to Job Opportunities page (no login required)
- [ ] Verify jobs display
- [ ] Test search functionality
- [ ] Filter by field/category

**Database Check:**
```sql
SELECT id, title, company, location, is_active
FROM job_opportunities
WHERE is_active = true
ORDER BY created_at DESC;
```

- [ ] Only active jobs displayed
- [ ] Jobs sorted by date

#### Test 11: Post Job (Admin Only)
- [ ] Login as admin
- [ ] Navigate to Job Opportunities
- [ ] Click "Post Job" button
- [ ] Fill job form:
  - Title
  - Company
  - Location
  - Salary Range
  - Description
  - Requirements
- [ ] Submit job posting
- [ ] Verify success message
- [ ] Check database:
```sql
SELECT title, company, posted_by, is_active, created_at
FROM job_opportunities
WHERE title = 'Your Test Job Title';
```
- [ ] Job created with `is_active = true`
- [ ] `posted_by` set to admin user ID
- [ ] Job appears in public list immediately

#### Test 12: Job Posting Access Control
- [ ] Logout
- [ ] Login as regular alumni (not admin)
- [ ] Navigate to Job Opportunities
- [ ] Verify "Post Job" button behavior
- [ ] Should show message about admin-only access

---

### Gallery

#### Test 13: View Gallery (Public Access)
- [ ] Navigate to `/gallery` (no login)
- [ ] Verify published albums display
- [ ] Click on an album
- [ ] Verify modal opens with images
- [ ] Test image navigation (prev/next)
- [ ] Test keyboard navigation (arrow keys, ESC)

**Database Check:**
```sql
SELECT a.id, a.title, a.is_published, COUNT(i.id) as image_count
FROM gallery_albums a
LEFT JOIN gallery_images i ON a.id = i.album_id
WHERE a.is_published = true
GROUP BY a.id, a.title, a.is_published;
```

- [ ] Only published albums visible
- [ ] Image counts match

#### Test 14: Admin Gallery Management
- [ ] Login as admin
- [ ] Navigate to Admin Gallery
- [ ] Create new album
- [ ] Upload images to album
- [ ] Set cover image
- [ ] Publish album
- [ ] Verify appears in public gallery

**Database Check:**
```sql
-- Check album created
SELECT id, title, is_published, created_by
FROM gallery_albums
WHERE title = 'Your Test Album';

-- Check images uploaded
SELECT album_id, image_url, display_order
FROM gallery_images
WHERE album_id = (SELECT id FROM gallery_albums WHERE title = 'Your Test Album');
```

- [ ] Album created
- [ ] Images associated with album
- [ ] Files exist in `gallery-images` bucket

---

### News & Announcements

#### Test 15: View News
- [ ] Navigate to News page (no login required)
- [ ] Verify published news displays
- [ ] Test search functionality
- [ ] Filter by category
- [ ] Click news item to view full article

**Database Check:**
```sql
SELECT id, title, category, is_published, published_at, is_important
FROM news
WHERE is_published = true
ORDER BY published_at DESC;
```

- [ ] Only published news visible
- [ ] Important news flagged correctly
- [ ] Categories populated

#### Test 16: Admin News Management
- [ ] Login as admin
- [ ] Navigate to Admin News
- [ ] Create new news article
- [ ] Set category
- [ ] Mark as important (optional)
- [ ] Publish news
- [ ] Verify appears in public news feed

**Database Check:**
```sql
SELECT title, content, category, is_published, published_at, created_by
FROM news
WHERE title = 'Your Test News Title';
```

- [ ] News created
- [ ] `published_at` timestamp set when published
- [ ] `created_by` set to admin user ID

---

### Admin Dashboard

#### Test 17: Dashboard Statistics
- [ ] Login as admin
- [ ] Navigate to Admin Dashboard
- [ ] Verify all statistics display:
  - Total Users
  - Pending Approvals
  - Total News
  - Total Jobs
  - Tracer Study Responses

**Database Check:**
```sql
-- Verify counts match dashboard
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE approval_status = 'pending') as pending_approvals,
  (SELECT COUNT(*) FROM news) as total_news,
  (SELECT COUNT(*) FROM job_opportunities) as total_jobs,
  (SELECT COUNT(*) FROM tracer_study_responses) as tracer_responses;
```

- [ ] All counts accurate

#### Test 18: Dashboard Charts
- [ ] Check Employment Status chart displays
- [ ] Check Gender Distribution chart displays
- [ ] Check Alumni by Graduation Year chart displays

**Database Check:**
```sql
-- Employment status distribution
SELECT employment_status, COUNT(*) as count
FROM tracer_study_responses
GROUP BY employment_status;

-- Gender distribution
SELECT gender, COUNT(*) as count
FROM tracer_study_responses
WHERE gender IS NOT NULL
GROUP BY gender;

-- Graduation year distribution
SELECT graduation_year, COUNT(*) as count
FROM tracer_study_responses
WHERE graduation_year IS NOT NULL
GROUP BY graduation_year
ORDER BY graduation_year;
```

- [ ] Chart data matches query results

#### Test 19: Recent Activity
- [ ] Verify recent activity feed shows:
  - Recent registrations
  - Recent news posts
  - Recent tracer study submissions
- [ ] Verify timestamps are correct

---

## 🔍 Error Scenarios Testing

### Test 20: Database Connection Errors
- [ ] Temporarily use wrong Supabase URL in constants.js
- [ ] Verify app shows appropriate error messages
- [ ] Restore correct URL

### Test 21: RLS Policy Testing
- [ ] Try to access admin-only data as regular user
- [ ] Verify access denied
- [ ] Try to modify other user's data
- [ ] Verify blocked by RLS

### Test 22: Storage Upload Errors
- [ ] Try uploading file larger than limit (>5MB for profiles)
- [ ] Verify error message
- [ ] Try uploading invalid file type (.pdf for profile)
- [ ] Verify error message

### Test 23: Form Validation
- [ ] Try submitting registration with missing fields
- [ ] Verify validation messages
- [ ] Try submitting tracer study with incomplete data
- [ ] Verify step validation works

---

## 🎯 Performance Testing

### Test 24: Query Performance
```sql
-- Test user profile query speed
EXPLAIN ANALYZE
SELECT u.*, p.*
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.id = 'test-user-id';

-- Test tracer study aggregation speed
EXPLAIN ANALYZE
SELECT employment_status, COUNT(*) 
FROM tracer_study_responses 
GROUP BY employment_status;
```

- [ ] Queries execute in < 100ms
- [ ] Indexes are being used

### Test 25: Large Dataset Testing
- [ ] Import test data (50+ users, 100+ tracer responses)
- [ ] Verify dashboard loads quickly
- [ ] Test search and filtering performance
- [ ] Check pagination works correctly

---

## 📊 Data Integrity Checks

### Test 26: Referential Integrity
```sql
-- Check for orphaned profiles
SELECT COUNT(*) 
FROM user_profiles 
WHERE user_id NOT IN (SELECT id FROM users);

-- Check for orphaned tracer responses
SELECT COUNT(*) 
FROM tracer_study_responses 
WHERE user_id NOT IN (SELECT id FROM users);

-- Check for orphaned gallery images
SELECT COUNT(*) 
FROM gallery_images 
WHERE album_id NOT IN (SELECT id FROM gallery_albums);
```

Expected: All counts should be 0

- [ ] No orphaned records found

### Test 27: Data Consistency
```sql
-- Check approval status consistency
SELECT id, email, approval_status, is_verified
FROM users
WHERE (approval_status = 'approved' AND is_verified = false)
   OR (approval_status != 'approved' AND is_verified = true);
```

Expected: 0 rows (no inconsistencies)

- [ ] Approval status and is_verified are consistent

---

## 🔐 Security Testing

### Test 28: Authentication
- [ ] Try accessing admin routes without login
- [ ] Verify redirect to login
- [ ] Try accessing alumni routes without approval
- [ ] Verify appropriate error messages

### Test 29: Authorization
- [ ] Login as regular alumni
- [ ] Try to access `/admin-dashboard` directly
- [ ] Verify access denied
- [ ] Try to modify another user's profile via API
- [ ] Verify RLS blocks the request

### Test 30: SQL Injection Prevention
- [ ] Try SQL injection in search fields
- [ ] Verify Supabase client sanitizes inputs
- [ ] Try XSS in form inputs
- [ ] Verify React escapes output

---

## 📱 Cross-Browser Testing

### Test 31: Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

Verify:
- [ ] All features work
- [ ] UI displays correctly
- [ ] File uploads work
- [ ] No console errors

---

## 🚀 Production Readiness

### Final Checklist
- [ ] All database tables created and verified
- [ ] All columns match schema requirements
- [ ] All RLS policies configured correctly
- [ ] All storage buckets created and policies set
- [ ] Admin user created and verified
- [ ] All features tested and working
- [ ] No critical errors in browser console
- [ ] No database query errors in Supabase logs
- [ ] Performance is acceptable (< 2s page loads)
- [ ] Mobile responsive design works
- [ ] Security tests passed
- [ ] Documentation is up to date

---

## 📝 Post-Migration Notes

Document any issues encountered:
- Issue: _______________________
- Resolution: ___________________
- Date: ________________________

---

## 🆘 Troubleshooting Common Issues

### Issue: "relation does not exist"
**Solution**: Table wasn't created. Run CREATE TABLE statement for that specific table.

### Issue: "column does not exist"
**Solution**: Run ALTER TABLE ADD COLUMN statement for missing column.

### Issue: "new row violates row-level security policy"
**Solution**: Check RLS policies are configured correctly. Verify user has proper role.

### Issue: "Storage bucket not found"
**Solution**: Create bucket via Supabase Dashboard → Storage.

### Issue: "Function is_admin() does not exist"
**Solution**: Re-run the function creation part of the schema script.

### Issue: Pending approvals not showing
**Solution**: 
```sql
-- Check if users exist with pending status
SELECT COUNT(*) FROM users WHERE approval_status = 'pending';

-- Check RLS policies on pending_registrations table
SELECT * FROM pg_policies WHERE tablename = 'pending_registrations';
```

---

## 📞 Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **React Documentation**: https://react.dev/

---

**Migration Completed By**: _______________  
**Date**: _______________  
**Sign-off**: _______________
