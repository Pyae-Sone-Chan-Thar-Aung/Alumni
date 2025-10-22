# CCS Alumni Portal - Storage Buckets Strategy

## Overview
This document details the storage bucket strategy for the CCS Alumni Portal database with 9 tables. Each bucket is designed to align with specific tables and their data storage needs.

---

## Your 9 Database Tables
1. **users** - Core user authentication and roles
2. **user_profiles** - Extended user profile information
3. **pending_registrations** - Registration approval workflow
4. **news** - News articles and announcements
5. **gallery_albums** - Photo album metadata
6. **gallery_images** - Individual photos in albums
7. **job_opportunities** - Job postings
8. **tracer_study_responses** - Alumni survey data

---

## Recommended Storage Buckets

### 1. **profiles** (Public Bucket)
**Related Tables:** `user_profiles`

**Purpose:** Store user profile images/avatars

**File Structure:** `{user_id}/avatar.{ext}` or `{user_id}/profile.{ext}`

**Access Control:**
- **READ:** Public (anyone can view profile images)
- **UPLOAD/UPDATE:** Owner only (users can only upload their own profile images)
- **DELETE:** Owner + Admins

**Public Setting:** `public: true` (CDN-friendly URLs for fast profile image loading)

**Example Files:**
- `550e8400-e29b-41d4-a716-446655440000/avatar.jpg`
- `550e8400-e29b-41d4-a716-446655440000/profile.png`

---

### 2. **registration-documents** (Private Bucket)
**Related Tables:** `pending_registrations`

**Purpose:** Store verification documents submitted during registration (student IDs, alumni proof, certificates)

**File Structure:** `{user_id}/{document_type}.{ext}` or `{registration_id}/{filename}`

**Access Control:**
- **READ:** Owner + Admins only
- **UPLOAD:** Owner only (during registration)
- **DELETE:** Admins only

**Public Setting:** `public: false` (sensitive verification documents)

**Example Files:**
- `550e8400-e29b-41d4-a716-446655440000/student_id.pdf`
- `550e8400-e29b-41d4-a716-446655440000/alumni_proof.jpg`

---

### 3. **news** (Public Bucket)
**Related Tables:** `news`

**Purpose:** Store featured images for news articles and announcements

**File Structure:** `{news_id}/featured.{ext}` or `{news_id}/{filename}`

**Access Control:**
- **READ:** Public (anyone can view news images)
- **UPLOAD/UPDATE/DELETE:** Admins only

**Public Setting:** `public: true` (news images should be publicly accessible)

**Example Files:**
- `7c9e6679-7425-40de-944b-e07fc1f90ae7/featured.jpg`
- `7c9e6679-7425-40de-944b-e07fc1f90ae7/banner.png`

---

### 4. **gallery** (Public Bucket)
**Related Tables:** `gallery_albums`, `gallery_images`

**Purpose:** Store all event photos and album images

**File Structure:** `{album_id}/{image_id}.{ext}` or `albums/{album_id}/cover.{ext}`

**Access Control:**
- **READ:** Public (anyone can view gallery)
- **UPLOAD/UPDATE/DELETE:** Admins only (or authorized event managers)

**Public Setting:** `public: true` (gallery should be publicly viewable)

**Example Files:**
- `albums/abc123/cover.jpg` (album cover)
- `abc123/img-001.jpg` (individual photos)
- `abc123/img-002.png`

---

### 5. **jobs** (Public Bucket)
**Related Tables:** `job_opportunities`

**Purpose:** Store company logos and job-related images

**File Structure:** `{job_id}/company-logo.{ext}` or `{job_id}/{filename}`

**Access Control:**
- **READ:** Public (job postings are public)
- **UPLOAD/UPDATE/DELETE:** Admins + Job posters (if you allow companies to post)

**Public Setting:** `public: true` (job postings should be publicly accessible)

**Example Files:**
- `def456/company-logo.png`
- `def456/job-banner.jpg`

---

### 6. **tracer-study-documents** (Private Bucket)
**Related Tables:** `tracer_study_responses`

**Purpose:** Store supporting documents for tracer study responses (employment proof, certificates, etc.)

**File Structure:** `{user_id}/{document_name}.{ext}` or `{response_id}/{filename}`

**Access Control:**
- **READ:** Owner + Admins only
- **UPLOAD/UPDATE:** Owner only
- **DELETE:** Owner + Admins

**Public Setting:** `public: false` (survey responses may contain sensitive information)

**Example Files:**
- `550e8400-e29b-41d4-a716-446655440000/employment-certificate.pdf`
- `550e8400-e29b-41d4-a716-446655440000/company-id.jpg`

---

## Summary Table

| Bucket Name | Related Table(s) | Public? | Who Can Read | Who Can Write | Purpose |
|------------|------------------|---------|--------------|---------------|---------|
| `profiles` | user_profiles | ✅ Yes | Everyone | Owner + Admins | Profile avatars |
| `registration-documents` | pending_registrations | ❌ No | Owner + Admins | Owner | Verification docs |
| `news` | news | ✅ Yes | Everyone | Admins | News images |
| `gallery` | gallery_albums, gallery_images | ✅ Yes | Everyone | Admins | Event photos |
| `jobs` | job_opportunities | ✅ Yes | Everyone | Admins | Company logos |
| `tracer-study-documents` | tracer_study_responses | ❌ No | Owner + Admins | Owner + Admins | Survey attachments |

---

## Implementation Options

### Option 1: Manual Creation (Supabase Dashboard)
1. Go to Storage in your Supabase Dashboard
2. Click "Create bucket" for each bucket
3. Set the "Public bucket" toggle according to the table above
4. Then run the SQL script to create the policies

### Option 2: SQL Creation (Recommended)
Run the provided `STORAGE_BUCKETS_SETUP.sql` script which will:
1. Create all 6 buckets programmatically
2. Set up all RLS policies automatically
3. Create helper functions (like `is_admin()`)

**Answer to your question:** Yes, you need to run the SQL in the SQL Editor to create the policies. Even if you create buckets manually in the Dashboard, you'll need SQL for the policies (unless you use the Dashboard's policy builder UI for each policy individually, which is tedious).

---

## File Size & Validation Recommendations

### Client-Side Validation (in your app):
- **Profile images:** Max 5MB, formats: jpg, jpeg, png, webp
- **Registration documents:** Max 10MB, formats: pdf, jpg, jpeg, png
- **News images:** Max 10MB, formats: jpg, jpeg, png, webp
- **Gallery photos:** Max 10MB, formats: jpg, jpeg, png
- **Job logos:** Max 2MB, formats: jpg, jpeg, png, svg
- **Tracer study docs:** Max 10MB, formats: pdf, jpg, jpeg, png

### Storage Bucket Settings:
- Set file size limits in bucket settings (Dashboard: Storage > Bucket > Settings)
- Enable automatic image optimization for public buckets (if available)

---

## Next Steps

1. **Review this strategy** - Ensure it matches your application's needs
2. **Run the SQL script** - Execute `STORAGE_BUCKETS_SETUP.sql` to create buckets and policies
3. **Test access** - Try uploading/downloading files with different user roles
4. **Update your frontend** - Use the correct bucket names in your upload code
5. **Monitor usage** - Check Storage dashboard for usage and errors

---

## Important Notes

⚠️ **RLS is enabled by default** on `storage.objects` in Supabase - you must create policies or files won't be accessible

⚠️ **Public bucket ≠ No policies** - Even public buckets need RLS policies for API access (SELECT, INSERT, UPDATE, DELETE)

⚠️ **Test with different user roles** - Always test as admin, owner, and anonymous user to ensure policies work correctly

✅ **Bucket names cannot be changed** after creation - choose carefully!

---

## Database Schema Reference

Your 9 tables and their file storage needs:
1. ✅ **users** - No direct file storage (uses user_profiles for profile images)
2. ✅ **user_profiles** - Needs `profile_image_url` → `profiles` bucket
3. ✅ **pending_registrations** - Needs `profile_image_url` + verification docs → `registration-documents` bucket
4. ✅ **news** - Needs `image_url` → `news` bucket
5. ✅ **gallery_albums** - Needs `cover_image_url` → `gallery` bucket
6. ✅ **gallery_images** - Needs `image_url` → `gallery` bucket
7. ✅ **job_opportunities** - Needs `company_logo_url` → `jobs` bucket
8. ✅ **tracer_study_responses** - Optional supporting documents → `tracer-study-documents` bucket
9. ⚪ **Additional tables** - No file storage needed currently

All buckets are **well-related to your tables** and designed to support your application's complete workflow from registration → approval → content management → surveys.
