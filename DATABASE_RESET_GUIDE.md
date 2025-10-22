# 🔄 Complete Database Reset Guide

This guide will help you perform a **complete database reset** and start fresh with the CCS Alumni Portal.

## ⚠️ WARNING

**This process will DELETE ALL DATA permanently:**
- All user accounts
- All alumni profiles  
- All news articles
- All gallery albums and images
- All job postings
- All tracer study responses

**Backup first if needed!**

---

## 📋 Reset Checklist

Follow these steps in order:

### 1️⃣ Clear Supabase Auth Users (Optional but Recommended)

If you want a completely fresh start including user accounts:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Delete all existing users (click the trash icon for each)
3. This will remove all authentication data

### 2️⃣ Delete Storage Buckets

1. Go to **Supabase Dashboard** → **Storage**
2. Delete each bucket:
   - `alumni-profiles`
   - `gallery-images`
   - `news-images`
3. Click the three dots (⋮) → Delete bucket → Confirm

### 3️⃣ Drop All Database Objects

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `DROP_ALL_DATABASE.sql` in your editor
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **Run**
6. Wait for completion (should take 5-10 seconds)
7. Verify output shows:
   ```
   ✅ Database successfully cleaned!
   Remaining tables: 0
   Remaining functions: 0
   Remaining policies: 0
   ```

### 4️⃣ Create Fresh Database Schema

1. Still in **Supabase Dashboard** → **SQL Editor**
2. Open `FRESH_DATABASE_COMPLETE.sql` in your editor
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **Run**
6. Wait for completion (should take 10-20 seconds)
7. Verify output shows:
   ```
   ✅ SUCCESS! All 8 tables created!
   DATABASE SETUP COMPLETE!
   ```

### 5️⃣ Recreate Storage Buckets

Follow the detailed instructions in `storage_setup_instructions.md`:

1. Create three buckets:
   - `alumni-profiles` (public, 5MB limit)
   - `gallery-images` (public, 5MB limit)
   - `news-images` (public, 5MB limit)

2. Configure policies for each bucket:
   - **alumni-profiles**: 4 policies (authenticated users can upload/update/delete, public can view)
   - **gallery-images**: 4 policies (admin-only write, public read)
   - **news-images**: 4 policies (admin-only write, public read)

📖 **See `storage_setup_instructions.md` for complete step-by-step instructions**

### 6️⃣ Create First Admin User

1. **Start your React app** (if not running):
   ```bash
   npm start
   ```

2. **Register a new account** using one of these emails:
   - `paung_230000001724@uic.edu.ph` (automatically promoted to admin)
   - `admin@uic.edu.ph` (automatically promoted to admin)

3. These emails are pre-configured in the database as admin accounts

4. **Verify admin access**:
   - Login with the registered account
   - You should see the Admin Dashboard
   - Check that you can access admin-only features

### 7️⃣ Verify Everything Works

Test each feature:

- [ ] **Registration**: Create a test alumni account
- [ ] **Login**: Login as both admin and alumni
- [ ] **Profile Upload**: Upload a profile picture
- [ ] **Admin Dashboard**: View dashboard statistics
- [ ] **Pending Approvals**: Admin can see pending registrations
- [ ] **Alumni Approval**: Admin can approve/reject alumni
- [ ] **News**: Admin can create news articles
- [ ] **Gallery**: Admin can create albums and upload photos
- [ ] **Jobs**: Admin can post job opportunities
- [ ] **Tracer Study**: Alumni can submit responses

---

## 🎯 Expected Results After Reset

After completing all steps, you should have:

✅ **Clean Database**
- 8 tables created
- All RLS policies active
- All triggers and functions working
- 2 pre-configured admin accounts

✅ **Storage Buckets**
- 3 buckets created and configured
- All policies active
- 5MB file size limits set

✅ **Admin Access**
- At least one admin user registered
- Admin dashboard accessible
- All admin features working

---

## 🐛 Troubleshooting

### Problem: "is_admin() function does not exist"

**Solution**: You must run `FRESH_DATABASE_COMPLETE.sql` BEFORE creating storage buckets. The function is created by that script.

### Problem: "relation does not exist" errors

**Solution**: Make sure you ran `FRESH_DATABASE_COMPLETE.sql` successfully. Check for any error messages in the SQL output.

### Problem: Images not uploading

**Solution**: 
1. Verify storage buckets exist
2. Check bucket policies are configured correctly
3. Verify bucket is set to "Public"
4. Check browser console for specific error messages

### Problem: Registration not working

**Solution**:
1. Check browser console for errors
2. Verify `users` table exists
3. Check that `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set in `.env`
4. Restart your React app after `.env` changes

### Problem: Admin features not accessible

**Solution**:
1. Verify you're logged in with an admin account
2. Check your email is in the admin list:
   ```sql
   SELECT email, role, approval_status FROM public.users WHERE role = 'admin';
   ```
3. If not admin, manually promote yourself:
   ```sql
   UPDATE public.users 
   SET role = 'admin', approval_status = 'approved', is_verified = true
   WHERE email = 'your-email@example.com';
   ```

---

## 📝 Notes

- **RLS is disabled on `users` table** - This is intentional to allow registration without authentication
- **Pre-configured admin emails** - Only specific emails are auto-promoted to admin
- **Storage policies cannot be created via SQL** - Must use Supabase Dashboard UI
- **Backup before reset** - There's no undo button!

---

## 🚀 Quick Command Reference

### Test if database is clean:
```sql
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as tables,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies;
```

### Test if is_admin() works:
```sql
SELECT public.is_admin(auth.uid()) as am_i_admin;
```

### List all admin users:
```sql
SELECT id, email, first_name, last_name, role, approval_status 
FROM public.users 
WHERE role = 'admin';
```

### Promote user to admin:
```sql
UPDATE public.users 
SET role = 'admin', approval_status = 'approved', is_verified = true, approved_at = NOW()
WHERE email = 'user@example.com';
```

---

## 🎉 Success!

If you've followed all steps and everything is working, you now have a **completely fresh CCS Alumni Portal database** ready for production or development use!

**Next Steps:**
- Configure your `.env` file with Supabase credentials
- Customize the system for your institution
- Add sample data for testing
- Deploy to production when ready

---

## 📞 Need Help?

If you encounter issues not covered in this guide:
1. Check the browser console for specific error messages
2. Check the Supabase logs for database errors
3. Review the RLS policies in Supabase Dashboard
4. Verify all environment variables are set correctly
