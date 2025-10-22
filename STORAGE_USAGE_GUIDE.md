# Storage Buckets - Frontend Usage Guide

## ✅ Code Updates Complete!

The following files have been updated to use the correct bucket names:
- ✅ `src/pages/AlumniProfile.js` - Now uses `profiles` bucket
- ✅ `src/pages/Register.js` - Now uses `profiles` bucket
- ✅ `src/pages/Profile.js` - Now uses `profiles` bucket
- ✅ `src/components/gallery/AdminGallery.js` - Already using `gallery` bucket

---

## 📦 Bucket Usage Reference

### 1. **profiles** bucket - User Profile Images

**File Structure:** `{user_id}/{timestamp}.{ext}`

**Example Upload Code:**
```javascript
// Upload profile avatar
const fileExt = file.name.split('.').pop();
const fileName = `${Date.now()}.${fileExt}`;
const filePath = `${user.id}/${fileName}`;

const { data, error } = await supabase.storage
  .from('profiles')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });

if (error) throw error;

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('profiles')
  .getPublicUrl(filePath);

// Save to user_profiles table
await supabase
  .from('user_profiles')
  .upsert({
    user_id: user.id,
    profile_image_url: publicUrl
  });
```

---

### 2. **registration-documents** bucket - Verification Documents

**File Structure:** `{user_id}/{document_type}.{ext}`

**Example Upload Code:**
```javascript
// Upload verification document (student ID, proof of graduation, etc.)
const fileExt = file.name.split('.').pop();
const fileName = `verification_${Date.now()}.${fileExt}`;
const filePath = `${user.id}/${fileName}`;

const { data, error } = await supabase.storage
  .from('registration-documents')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

if (error) throw error;

// Get public URL (only accessible to owner and admins due to RLS)
const { data: { publicUrl } } = supabase.storage
  .from('registration-documents')
  .getPublicUrl(filePath);

// Save to pending_registrations table
await supabase
  .from('pending_registrations')
  .update({
    profile_image_url: publicUrl // or add a new field like verification_docs
  })
  .eq('user_id', user.id);
```

---

### 3. **news** bucket - News Article Images

**File Structure:** `{news_id}/{filename}.{ext}` or `featured/{timestamp}.{ext}`

**Example Upload Code (for AdminNews.js):**
```javascript
// Upload news featured image
const fileExt = file.name.split('.').pop();
const fileName = `featured_${Date.now()}.${fileExt}`;
const filePath = `${newsId || 'temp'}/${fileName}`;

const { data, error } = await supabase.storage
  .from('news')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

if (error) throw error;

const { data: { publicUrl } } = supabase.storage
  .from('news')
  .getPublicUrl(filePath);

// Save to news table
await supabase
  .from('news')
  .update({ image_url: publicUrl })
  .eq('id', newsId);
```

---

### 4. **gallery** bucket - Event Photos & Albums

**File Structure:** `{album_id}/{image_id}.{ext}` or `covers/{timestamp}.{ext}`

**Already implemented in:** `src/components/gallery/AdminGallery.js`

**Example Upload Code:**
```javascript
// Upload album cover
const fileExt = file.name.split('.').pop();
const fileName = `cover_${Date.now()}.${fileExt}`;
const filePath = `covers/${fileName}`;

const { error } = await supabase.storage
  .from('gallery')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

// Upload multiple album images
const uploadPromises = files.map(async (file, index) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${index}.${fileExt}`;
  const filePath = `album-${albumId}/${fileName}`;
  
  return await supabase.storage
    .from('gallery')
    .upload(filePath, file);
});

await Promise.all(uploadPromises);
```

---

### 5. **jobs** bucket - Company Logos

**File Structure:** `{job_id}/logo.{ext}` or `companies/{company_name}.{ext}`

**Example Upload Code (for AdminJobs.js):**
```javascript
// Upload company logo
const fileExt = file.name.split('.').pop();
const fileName = `logo_${Date.now()}.${fileExt}`;
const filePath = `${jobId}/${fileName}`;

const { data, error } = await supabase.storage
  .from('jobs')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });

if (error) throw error;

const { data: { publicUrl } } = supabase.storage
  .from('jobs')
  .getPublicUrl(filePath);

// Save to job_opportunities table
await supabase
  .from('job_opportunities')
  .update({ company_logo_url: publicUrl })
  .eq('id', jobId);
```

---

### 6. **tracer-study-documents** bucket - Survey Attachments

**File Structure:** `{user_id}/{document_name}.{ext}`

**Example Upload Code (for TracerStudy.js):**
```javascript
// Upload supporting document (employment certificate, etc.)
const fileExt = file.name.split('.').pop();
const fileName = `document_${Date.now()}.${fileExt}`;
const filePath = `${user.id}/${fileName}`;

const { data, error } = await supabase.storage
  .from('tracer-study-documents')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

if (error) throw error;

// Private bucket - only owner and admins can access
const { data: { publicUrl } } = supabase.storage
  .from('tracer-study-documents')
  .getPublicUrl(filePath);

// Save reference to tracer_study_responses
// You might want to add a JSON field to store multiple documents
await supabase
  .from('tracer_study_responses')
  .update({
    supporting_documents: supabase.raw(`
      COALESCE(supporting_documents, '[]'::jsonb) || 
      '${JSON.stringify({ url: publicUrl, filename: file.name, uploaded_at: new Date() })}'::jsonb
    `)
  })
  .eq('user_id', user.id);
```

---

## 🔒 Access Control Summary

| Bucket | Read | Upload | Update | Delete |
|--------|------|--------|--------|--------|
| **profiles** | Public | Owner | Owner | Owner + Admin |
| **registration-documents** | Owner + Admin | Owner | Owner | Admin only |
| **news** | Public | Admin only | Admin only | Admin only |
| **gallery** | Public | Admin only | Admin only | Admin only |
| **jobs** | Public | Admin only | Admin only | Admin only |
| **tracer-study-documents** | Owner + Admin | Owner | Owner | Owner + Admin |

---

## 🧪 Testing Checklist

After updating your code, test the following:

### ✅ As Regular User (Alumni):
- [ ] Upload profile image on Register page
- [ ] Upload/update profile image on Profile/AlumniProfile page
- [ ] Upload verification documents (if implemented)
- [ ] Upload tracer study documents (if implemented)
- [ ] View news images (public)
- [ ] View gallery images (public)
- [ ] View job logos (public)

### ✅ As Admin:
- [ ] Upload news images
- [ ] Upload/manage gallery albums and photos
- [ ] Upload job company logos
- [ ] View all registration documents
- [ ] View all tracer study documents
- [ ] Delete any files if needed

### ✅ Access Control:
- [ ] Users can only upload to their own folder in `profiles`
- [ ] Users cannot access other users' private documents
- [ ] Admins can access all files
- [ ] Anonymous users can view public buckets but not upload

---

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"
**Solution:** Make sure you're uploading to the correct folder structure (`{user_id}/filename`)

### Error: "The resource already exists"
**Solution:** Use `upsert: true` in upload options or change the filename

### Error: "Object not found"
**Solution:** Check bucket name spelling and file path

### Error: "Unable to upload file"
**Solution:** 
1. Check file size limits (5MB for profiles, 10MB for others)
2. Check file type is allowed
3. Verify bucket exists in Supabase dashboard
4. Check RLS policies are correctly set up

---

## 📚 Next Steps

1. **Test all upload functionality** across different pages
2. **Add image upload to AdminNews** (if you want news images)
3. **Add logo upload to AdminJobs** (if you want company logos)
4. **Add document upload to TracerStudy** (if you want supporting docs)
5. **Monitor storage usage** in Supabase dashboard
6. **Optimize images** before upload (resize, compress) for better performance

---

## 💡 Best Practices

1. **Always validate file size and type** on the frontend before uploading
2. **Use meaningful filenames** with timestamps to avoid collisions
3. **Handle upload errors gracefully** with user-friendly messages
4. **Show upload progress** for large files
5. **Delete old files** when users upload new ones (especially for profile images)
6. **Compress images** before upload to save storage space
7. **Use lazy loading** for galleries with many images

---

## 📞 Need Help?

- Check the Supabase Storage documentation: https://supabase.com/docs/guides/storage
- Review the policies in your Supabase Dashboard > Storage > Policies
- Run the verification queries at the end of `STORAGE_BUCKETS_SETUP.sql`
