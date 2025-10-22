# 📦 Manual Storage Bucket Setup Guide

## Overview
Since standard Supabase permissions don't allow direct SQL modification of storage buckets, we need to create them manually through the Dashboard.

---

## 🚀 Step-by-Step Instructions

### Step 1: Execute the SQL Fix First
1. **Open Supabase Dashboard** → SQL Editor
2. **Run the `SUPABASE_STANDARD_FIX.sql` script**
3. **Verify** you see the success messages

### Step 2: Create Storage Buckets Manually

#### Navigate to Storage
1. In your Supabase Dashboard sidebar, click **"Storage"**
2. You should see a "Create Bucket" button

#### Create Each Bucket

**1. Alumni Profiles Bucket**
- Click **"Create Bucket"**
- **Bucket Name**: `alumni-profiles`
- **Public**: ✅ **Yes** (check this box)
- **File size limit**: `50 MB`
- Click **"Create Bucket"**

**2. Gallery Images Bucket**  
- Click **"Create Bucket"**
- **Bucket Name**: `gallery-images` 
- **Public**: ✅ **Yes** (check this box)
- **File size limit**: `50 MB`
- Click **"Create Bucket"**

**3. News Images Bucket**
- Click **"Create Bucket"**
- **Bucket Name**: `news-images`
- **Public**: ✅ **Yes** (check this box)  
- **File size limit**: `50 MB`
- Click **"Create Bucket"**

**4. Documents Bucket**
- Click **"Create Bucket"**
- **Bucket Name**: `documents`
- **Public**: ❌ **No** (leave unchecked - this should be private)
- **File size limit**: `100 MB`
- Click **"Create Bucket"**

---

## ✅ Verification

After creating all buckets, you should see:

### In Storage Dashboard
- ✅ `alumni-profiles` (Public)
- ✅ `gallery-images` (Public)  
- ✅ `news-images` (Public)
- ✅ `documents` (Private)

### Run the Test Suite
```bash
node test-all-features.js
```

**Expected Results:**
- **Registration System**: ✅ PASSED
- **Storage System**: ✅ PASSED  
- **Overall Pass Rate**: 100% (11/11 tests)

---

## 🔧 Troubleshooting

### If Bucket Creation Fails
1. **Check project permissions** - ensure you're an admin/owner
2. **Refresh the dashboard** and try again
3. **Check bucket naming** - use exact names as specified
4. **Verify project billing** - storage requires an active plan

### If Tests Still Fail After Setup
1. **Wait 30 seconds** after bucket creation (propagation time)
2. **Refresh your application** 
3. **Check bucket permissions** in Storage settings
4. **Verify bucket names** match exactly

---

## 🎯 Quick Reference

| Bucket Name | Public | Purpose |
|-------------|---------|---------|
| `alumni-profiles` | ✅ Yes | User profile images |
| `gallery-images` | ✅ Yes | Photo gallery |  
| `news-images` | ✅ Yes | News article images |
| `documents` | ❌ No | Private documents |

---

## 💡 Pro Tips

- **Create buckets in order** as listed above
- **Double-check the "Public" checkbox** - this is critical  
- **Use exact bucket names** - any typos will cause test failures
- **Wait for propagation** - allow 30 seconds before testing

---

Once all buckets are created, your system should be fully functional with 100% test pass rate!