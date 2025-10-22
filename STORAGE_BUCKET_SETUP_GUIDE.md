# Storage Bucket Setup Guide for CCS Alumni Portal

## Overview
The CCS Alumni Portal requires three storage buckets in Supabase for file uploads. These buckets MUST be created and configured via the Supabase Dashboard UI (not via SQL).

## Required Storage Buckets

### 1. alumni-profiles
**Purpose**: Store alumni profile images

**Configuration**:
- **Bucket Name**: `alumni-profiles`
- **Public Access**: ✅ Enabled (Public bucket)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: `image/jpeg`, `image/jpg`, `image/png`

**Storage Policies** (Create via Dashboard → Storage → alumni-profiles → Policies):

```sql
-- Policy 1: Anyone can view profile images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'alumni-profiles' );

-- Policy 2: Authenticated users can upload profile images
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'alumni-profiles' AND
  auth.role() = 'authenticated'
);

-- Policy 3: Users can update their own profile images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'alumni-profiles' AND
  auth.role() = 'authenticated'
);

-- Policy 4: Users can delete their own profile images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'alumni-profiles' AND
  auth.role() = 'authenticated'
);
```

---

### 2. gallery-images
**Purpose**: Store gallery album photos

**Configuration**:
- **Bucket Name**: `gallery-images`
- **Public Access**: ✅ Enabled (Public bucket)
- **File Size Limit**: 10MB
- **Allowed MIME Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

**Storage Policies**:

```sql
-- Policy 1: Anyone can view gallery images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'gallery-images' );

-- Policy 2: Admins can upload gallery images
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Admins can update gallery images
CREATE POLICY "Admins can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Admins can delete gallery images
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

### 3. news-images
**Purpose**: Store news article images

**Configuration**:
- **Bucket Name**: `news-images`
- **Public Access**: ✅ Enabled (Public bucket)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

**Storage Policies**:

```sql
-- Policy 1: Anyone can view news images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'news-images' );

-- Policy 2: Admins can upload news images
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Admins can update news images
CREATE POLICY "Admins can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Admins can delete news images
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## Step-by-Step Setup Instructions

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com
2. Log in to your account
3. Select your CCS Alumni project

### Step 2: Create Storage Buckets
1. Click on **Storage** in the left sidebar
2. Click **New bucket** button
3. For each bucket:
   - Enter the bucket name exactly as shown above
   - Enable **Public bucket** option
   - Click **Create bucket**

### Step 3: Configure Storage Policies
For each bucket:
1. Click on the bucket name in the Storage page
2. Click on the **Policies** tab
3. Click **New policy**
4. Choose **Custom policy**
5. Copy and paste each policy from above
6. Click **Review** then **Save policy**

### Step 4: Verify Setup
Run this test query in your SQL Editor to verify buckets exist:

```sql
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id IN ('alumni-profiles', 'gallery-images', 'news-images');
```

Expected result: 3 rows showing all three buckets.

---

## File Upload Validation in Application

The application enforces these validations:

### Profile Images (alumni-profiles)
- Max size: 5MB
- Allowed types: JPG, JPEG, PNG
- Files uploaded as: `{user_id}_{timestamp}.{ext}`

### Gallery Images (gallery-images)
- Max size: 10MB
- Allowed types: JPG, JPEG, PNG, WEBP
- Files uploaded as: `{album_id}_{timestamp}.{ext}`

### News Images (news-images)
- Max size: 5MB
- Allowed types: JPG, JPEG, PNG, WEBP
- Files uploaded as: `news_{news_id}_{timestamp}.{ext}`

---

## Troubleshooting

### Issue: "new row violates row-level security policy"
**Solution**: Make sure you've created all storage policies correctly via the Dashboard.

### Issue: "Bucket not found"
**Solution**: 
1. Verify bucket name is exactly correct (case-sensitive)
2. Check bucket was created in the correct project
3. Try refreshing the Storage page

### Issue: "File size exceeds limit"
**Solution**: Check file size before upload in the application code. This is already implemented.

### Issue: "Invalid file type"
**Solution**: Ensure MIME type validation in application code matches bucket configuration.

---

## Security Notes

1. ✅ **Public buckets** are safe because:
   - Only public URLs are exposed (no direct file system access)
   - RLS policies control who can upload/update/delete
   - Anyone can view, but only authorized users can modify

2. ✅ **File naming convention** prevents conflicts:
   - Includes user_id or unique identifiers
   - Includes timestamp for uniqueness
   - Uses upsert to handle duplicates

3. ✅ **Admin-only operations** are protected:
   - Gallery image management
   - News image management
   - Enforced at both storage policy and application level

---

## Testing Checklist

After setup, test these scenarios:

- [ ] Alumni can upload profile image during registration
- [ ] Alumni can update profile image from profile page
- [ ] Public users can view gallery images without login
- [ ] Admins can upload gallery images
- [ ] Admins can upload news images
- [ ] Non-admins cannot upload to gallery or news buckets
- [ ] File size limits are enforced
- [ ] Only allowed file types can be uploaded

---

## Component Files Using Storage

| Component | Bucket | Operations |
|-----------|--------|------------|
| `Register.js` | alumni-profiles | Upload (INSERT) |
| `AlumniProfile.js` | alumni-profiles | Upload, Update (INSERT, UPDATE) |
| `Profile.js` | alumni-profiles | Upload, Update (INSERT, UPDATE) |
| `AdminGallery.js` | gallery-images | Upload, Update, Delete (All) |
| `AdminNews.js` | news-images | Upload, Update, Delete (All) |

---

## Maintenance

### Cleaning Up Old Files
Consider implementing a cleanup job to remove:
- Orphaned images (files not referenced in database)
- Old profile images when users upload new ones
- Deleted album images

### Monitoring Storage Usage
Check storage usage regularly in Supabase Dashboard:
1. Go to **Settings** → **Usage**
2. Monitor storage size
3. Set up alerts for approaching limits

---

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Verify all policies are created correctly
3. Ensure bucket names match exactly in code
4. Test with a new user registration

For Supabase-specific issues, consult:
- https://supabase.com/docs/guides/storage
- https://supabase.com/docs/guides/storage/security/access-control
