# Storage Bucket Setup Instructions

This document contains instructions for setting up Supabase storage buckets for the CCS Alumni Portal.

## ⚠️ IMPORTANT: Do This AFTER Running Database Scripts

Storage buckets should be created AFTER you have:
1. ✅ Run `DROP_ALL_DATABASE.sql` (if resetting)
2. ✅ Run `FRESH_DATABASE_COMPLETE.sql` (creates the `is_admin()` function needed for policies)

## Required Storage Buckets

The following storage buckets need to be created in your Supabase project:

1. **alumni-profiles** - For storing alumni profile pictures
2. **gallery-images** - For storing gallery album photos
3. **news-images** - For storing news article images

## 🗑️ If Resetting: Delete Old Buckets First

If you're doing a complete reset:

1. Go to Supabase Dashboard → Storage
2. For each bucket (alumni-profiles, gallery-images, news-images):
   - Click the three dots (⋮) next to the bucket name
   - Click "Delete bucket"
   - Confirm deletion

## Setup Instructions

Since storage policies cannot be created via SQL, you must set up the buckets through the Supabase Dashboard.

### Step 1: Navigate to Storage

1. Go to your Supabase Dashboard
2. Select your project
3. Click on "Storage" in the left sidebar

### Step 2: Create Each Bucket

For each bucket (alumni-profiles, gallery-images, news-images):

1. Click "New bucket"
2. Enter the bucket name (exactly as shown above)
3. Set the bucket to **Public** ✅ (allows direct URL access)
4. Click "Create bucket"

### Step 3: Configure Bucket Settings

After creating each bucket:

1. Click on the bucket name
2. Go to "Configuration" tab
3. Set the following:
   - **File size limit**: 5242880 (5MB in bytes)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/gif,image/webp`

### Step 4: Configure Bucket Policies

For each bucket, you need to set up the following policies:

#### For alumni-profiles bucket:

1. Click on the bucket name
2. Go to "Policies" tab
3. Click "New Policy"
4. Add the following policies:

**Policy 1: Allow authenticated uploads**
```
Policy name: Allow authenticated users to upload
Allowed operation: INSERT
Target roles: authenticated
Policy definition:
(bucket_id = 'alumni-profiles')
```

**Policy 2: Allow public read access**
```
Policy name: Allow public read access
Allowed operation: SELECT
Target roles: public (anon)
Policy definition:
(bucket_id = 'alumni-profiles')
```

**Policy 3: Allow authenticated users to update**
```
Policy name: Allow authenticated users to update
Allowed operation: UPDATE
Target roles: authenticated
Policy definition:
(bucket_id = 'alumni-profiles')
```

**Policy 4: Allow authenticated users to delete**
```
Policy name: Allow authenticated users to delete
Allowed operation: DELETE
Target roles: authenticated
Policy definition:
(bucket_id = 'alumni-profiles')
```

#### For gallery-images bucket:

**Policy 1: Allow admin uploads**
```
Policy name: Allow admin to upload
Allowed operation: INSERT
Target roles: authenticated
Policy definition:
(bucket_id = 'gallery-images' AND (SELECT public.is_admin(auth.uid())))
```

**Policy 2: Allow public read access**
```
Policy name: Allow public read access
Allowed operation: SELECT
Target roles: public (anon)
Policy definition:
(bucket_id = 'gallery-images')
```

**Policy 3: Allow admin updates**
```
Policy name: Allow admin to update
Allowed operation: UPDATE
Target roles: authenticated
Policy definition:
(bucket_id = 'gallery-images' AND (SELECT public.is_admin(auth.uid())))
```

**Policy 4: Allow admin deletes**
```
Policy name: Allow admin to delete
Allowed operation: DELETE
Target roles: authenticated
Policy definition:
(bucket_id = 'gallery-images' AND (SELECT public.is_admin(auth.uid())))
```

#### For news-images bucket:

Use the same policies as gallery-images (admin-only write access, public read access).

### Step 5: Verify Setup

After creating all buckets and policies, verify:

- [ ] All three buckets are visible in Storage
- [ ] Each bucket has 4 policies configured
- [ ] Each bucket is set to "Public"
- [ ] File size limits are set to 5MB
- [ ] Allowed MIME types include image formats
- [ ] You can see the green checkmarks indicating policies are active

## Troubleshooting

### "is_admin() function does not exist" error
- **Solution**: You must run `FRESH_DATABASE_COMPLETE.sql` first before creating storage buckets
- The `is_admin()` function is required for admin-only policies

### Images not uploading
- Check that the bucket exists
- Verify upload policies are correctly configured
- Check browser console for specific errors
- Ensure file size is under 5MB
- Verify MIME type is allowed

### Images not displaying
- Verify bucket is set to "Public"
- Check that SELECT policies allow public access
- Verify the URL format is correct
- Open image URL directly in browser to test

### Permission errors
- Ensure user is authenticated
- Verify RLS policies on database tables
- Check that `is_admin()` function exists and works
- Test `SELECT public.is_admin(auth.uid())` in SQL editor

## Security Considerations

- Profile images can be uploaded by any authenticated user
- Gallery and news images can only be uploaded by admins
- All images are publicly accessible via URL (as intended for a public-facing portal)
- File size is limited to 5MB to prevent abuse
- Only image MIME types are allowed

## Quick Test After Setup

Run this query in Supabase SQL Editor to verify `is_admin()` function works:

```sql
-- Test if you're an admin (should return true for admin users)
SELECT public.is_admin(auth.uid()) as am_i_admin;
```
