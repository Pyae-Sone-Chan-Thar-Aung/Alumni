# Admin User Setup Guide

## 🔐 Main Admin Account

**Email**: `paung_230000001724@uic.edu.ph`  
**Password**: `UICalumni2025`  
**Role**: Admin (full system access)

---

## 📋 Setup Methods

You have **2 options** to create the admin user:

---

## ✅ OPTION 1: Via Application (Recommended)

### Step 1: Run Database Script First
Run `FRESH_DATABASE_COMPLETE.sql` in Supabase SQL Editor. This creates a placeholder for the admin email.

### Step 2: Register Via App
1. Open your application in browser
2. Go to **Register** page
3. Fill in the form with:
   - **Email**: `paung_230000001724@uic.edu.ph`
   - **Password**: `UICalumni2025`
   - **First Name**: Main
   - **Last Name**: Administrator
   - Fill other required fields (phone, course, batch, etc.)
4. Submit registration

### Step 3: Auto-Promotion
The `Login.js` component has auto-promotion code that will automatically upgrade this email to admin role on first login:

```javascript
// Auto-promote specified admin email
if (formData.email.toLowerCase() === 'paung_230000001724@uic.edu.ph') {
  await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', formData.email.toLowerCase());
}
```

### Step 4: Login
1. Login with the credentials
2. You'll be automatically redirected to **Admin Dashboard**
3. ✅ Admin access granted!

---

## ✅ OPTION 2: Via Supabase Dashboard (Manual)

### Step 1: Run Database Script
Run `FRESH_DATABASE_COMPLETE.sql` - this already creates the admin user in the database.

### Step 2: Create Auth User in Supabase
1. Go to Supabase Dashboard
2. Click **Authentication** in left sidebar
3. Click **Users** tab
4. Click **Add user** button (or **Invite user**)
5. Enter:
   - **Email**: `paung_230000001724@uic.edu.ph`
   - **Password**: `UICalumni2025`
   - ✅ Check "Auto Confirm User"
6. Click **Create user**

### Step 3: Link to Database User
The database already has this email marked as admin (from the SQL script), so once the auth user is created, they'll be linked automatically.

### Step 4: Login
1. Open your app
2. Login with the credentials
3. Should redirect to Admin Dashboard
4. ✅ Full admin access!

---

## 🔍 Verify Admin Status

Run this query in Supabase SQL Editor:

```sql
SELECT 
    id,
    email, 
    first_name,
    last_name,
    role, 
    approval_status,
    is_verified,
    approved_at
FROM public.users 
WHERE email = 'paung_230000001724@uic.edu.ph';
```

**Expected Result:**
- `role`: `admin`
- `approval_status`: `approved`
- `is_verified`: `true`
- `approved_at`: (timestamp)

---

## 🔐 How User Roles Work

### Database Structure (`users` table)
```sql
role TEXT CHECK (role IN ('admin', 'alumni'))
```

- **admin**: Full system access
  - Can approve/reject registrations
  - Can manage all content (news, gallery, jobs)
  - Can view all tracer study responses
  - Access to Admin Dashboard

- **alumni**: Limited access
  - Can view their own profile
  - Can submit tracer study
  - Can view public content (news, gallery, jobs)
  - Cannot access admin features

### Role Checking (`is_admin()` function)
```sql
CREATE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;
```

This function is used throughout the system to check permissions.

---

## 🚦 Login Flow

### For Admin Users:
1. Enter credentials
2. System checks `role` column in database
3. If `role = 'admin'`:
   - ✅ Bypass approval status check
   - ✅ Redirect to `/admin-dashboard`
   - ✅ Full access granted

### For Alumni Users:
1. Enter credentials
2. System checks `approval_status` column
3. If `approval_status = 'pending'`:
   - ❌ Login blocked
   - Show: "Your account is pending admin approval"
4. If `approval_status = 'approved'`:
   - ✅ Login successful
   - ✅ Redirect to `/alumni-profile`
   - ✅ Limited access granted

---

## 👥 Adding More Admins

### Method 1: Via Database
```sql
UPDATE public.users 
SET role = 'admin',
    approval_status = 'approved',
    is_verified = true,
    approved_at = NOW()
WHERE email = 'new-admin@uic.edu.ph';
```

### Method 2: Via Admin Dashboard (Future Feature)
You can create an admin user management page where existing admins can promote other users.

---

## 🔒 Security Notes

1. **Passwords NOT in Database**
   - Passwords are managed by Supabase Auth
   - Only password hashes are stored securely by Supabase
   - Never store plain-text passwords

2. **Role-Based Access Control**
   - All admin routes protected at component level
   - RLS policies enforce database-level security
   - `is_admin()` function used in all sensitive queries

3. **Admin Email Auto-Promotion**
   - The email `paung_230000001724@uic.edu.ph` is hardcoded in `Login.js`
   - This ensures it's always promoted to admin
   - Even if someone tampers with the database

---

## 🧪 Testing Admin Access

### Test 1: Admin Login
1. Login as: `paung_230000001724@uic.edu.ph`
2. Should redirect to `/admin-dashboard`
3. Should see admin navigation menu

### Test 2: Admin Dashboard
1. Should see statistics:
   - Total Users
   - Pending Approvals
   - Total News
   - Total Jobs
   - Tracer Study Responses
2. Should see charts (employment, gender, graduation year)

### Test 3: Pending Registrations
1. Click "Pending Registrations" in admin menu
2. Should see list of pending users
3. Should be able to approve/reject users

### Test 4: Content Management
1. Click "Manage News" - should work
2. Click "Manage Gallery" - should work
3. Click "Manage Jobs" - should work
4. All admin-only features should be accessible

---

## 🆘 Troubleshooting

### Issue: "Account pending approval" when logging in as admin
**Solution**: Check database role:
```sql
SELECT role, approval_status FROM users WHERE email = 'paung_230000001724@uic.edu.ph';
```
If role is not 'admin', update it:
```sql
UPDATE users SET role = 'admin', approval_status = 'approved', is_verified = true WHERE email = 'paung_230000001724@uic.edu.ph';
```

### Issue: Can login but no admin menu
**Solution**: Clear browser cache and localStorage, then login again.

### Issue: "User not found" error
**Solution**: The auth user doesn't exist. Create it via Supabase Dashboard (Option 2 above).

---

## 📝 Summary

✅ **Main Admin**: `paung_230000001724@uic.edu.ph` / `UICalumni2025`  
✅ **Database Role**: `admin` (set by SQL script)  
✅ **Auto-Promotion**: Enabled in `Login.js`  
✅ **Full Access**: Admin Dashboard + All Management Features  

**Backup Admin**: `admin@uic.edu.ph` (also created by SQL script)

---

*After setting up the admin user, proceed to test all features using the `DATABASE_MIGRATION_CHECKLIST.md`*
