# Admin Dashboard - Pending Registrations Fix

## Problem
The admin dashboard and admin users page were not showing pending registrations for approval.

## Root Causes Identified

1. **Data Fetching Issue**: The AdminUsers.js was trying to fetch `course` and `batch_year` directly from the `users` table, but these fields are actually in the `user_profiles` table.

2. **Row Level Security (RLS) Policies**: The queries needed proper admin permissions to view unverified users.

3. **View Compatibility**: The `user_details` view might not work properly with RLS policies.

## Fixes Applied

### 1. Updated AdminUsers.js
- Changed from using `user_details` view to direct table queries
- Added proper error handling
- Now fetches users and profiles separately, then joins them in JavaScript

### 2. Updated AdminDashboard.js
- Updated pending users query to use direct table access
- Simplified the pending users display

### 3. Created SQL Scripts
- `fix_admin_access.sql`: Contains database-level fixes for RLS policies
- `setup_admin_user.sql`: Helper script to verify admin user setup

## Steps to Complete the Fix

### Step 1: Verify Admin User Setup
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Find the user with email `paung_230000001724@uic.edu.ph`
4. Copy the UUID from the `id` column
5. Go to **SQL Editor** and run the queries from `setup_admin_user.sql`
6. Replace `YOUR_ADMIN_UUID_HERE` with the actual UUID and run the INSERT statement

### Step 2: Apply Database Fixes (Optional)
Run the queries from `fix_admin_access.sql` in your Supabase SQL Editor to ensure proper RLS policies.

### Step 3: Test the Application
1. Log in as admin (`paung_230000001724@uic.edu.ph`)
2. Go to the Admin Dashboard - you should see pending registrations in the "Pending Requests" section
3. Go to Admin > User Management - you should see all users with proper filtering by status

## What Was Fixed

### Before:
```javascript
// This was trying to get course and batch_year from wrong table
const { data } = await supabase.from('users').select('*');
// course and batch_year were undefined because they're in user_profiles
```

### After:
```javascript
// Now fetches from both tables properly
const { data: usersData } = await supabase.from('users').select('*');
const { data: profilesData } = await supabase.from('user_profiles').select('*');
// Joins the data in JavaScript
```

## Expected Behavior Now

1. **Admin Dashboard**:
   - Shows correct count of pending approvals
   - Displays up to 5 pending users in "Pending Requests" section
   - "Review Registrations" button works correctly

2. **Admin Users Page**:
   - Shows all users (approved, pending, rejected)
   - Filter by status works correctly
   - Approve/Reject buttons work for pending users
   - Course and batch information displays correctly

## Verification Checklist

- [ ] Admin user exists in `public.users` table with `role = 'admin'` and `is_verified = true`
- [ ] Admin can log in successfully
- [ ] Admin Dashboard shows pending registrations count
- [ ] Admin Dashboard shows pending users in the list
- [ ] Admin Users page loads all users
- [ ] Status filter works (All, Pending, Approved, Rejected)
- [ ] Approve/Reject buttons work for pending users
- [ ] Success/error toasts appear when updating user status

## If Issues Persist

1. Check browser console for JavaScript errors
2. Check browser Network tab for failed API requests
3. Verify in Supabase Dashboard that the admin user has correct role
4. Test the SQL queries directly in Supabase SQL Editor

## Test User Creation

To test the approval system, create a test user:
1. Go to your registration page
2. Register with a test email
3. The user should appear as "pending" in admin dashboard
4. Admin should be able to approve/reject the user
