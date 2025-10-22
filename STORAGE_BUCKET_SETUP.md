# Storage Bucket Setup Guide

## 🗄️ Create Storage Bucket in Supabase

Since you haven't created the storage bucket yet, follow these steps:

### Step 1: Create the Bucket

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `sgalzbhfpydwnvprxrln`

2. **Navigate to Storage**
   - Click on **Storage** in the left sidebar
   - Click **New Bucket**

3. **Create Alumni Profiles Bucket**
   - **Name**: `alumni-profiles`
   - **Public bucket**: ✅ **Check this box** (for profile images)
   - Click **Create bucket**

### Step 2: Configure Bucket Policies

After creating the bucket, you need to set up policies:

1. **Click on your `alumni-profiles` bucket**
2. **Go to Policies tab**
3. **Add the following policies:**

#### Policy 1: Allow Public Read Access
```sql
-- Allow anyone to view profile images
CREATE POLICY "Public read access for profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'alumni-profiles');
```

#### Policy 2: Allow Authenticated Upload
```sql
-- Allow authenticated users to upload profile images
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'alumni-profiles' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Allow Users to Update Their Own Images
```sql
-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'alumni-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Allow Users to Delete Their Own Images
```sql
-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'alumni-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Test Storage Access

You can test if the bucket is working by trying to upload a test image through the Supabase dashboard.

### Step 4: Update Your Application

Once the bucket is created, your application will automatically work with it using the existing configuration in your code.

## 📁 Folder Structure

The bucket will organize files like this:
```
alumni-profiles/
├── user-id-1/
│   └── profile-image.jpg
├── user-id-2/
│   └── profile-image.png
└── gallery/
    ├── album-1/
    │   ├── image1.jpg
    │   └── image2.jpg
    └── album-2/
        └── image3.jpg
```

## 🔧 File Upload Limits

- **Max file size**: 5MB
- **Allowed types**: JPG, PNG, GIF
- **Naming convention**: `{user-id}/profile-{timestamp}.{ext}`

Your storage bucket is now ready for use! 🎉
