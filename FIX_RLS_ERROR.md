# Fix: Row-Level Security Policy Error

## Error Message
```
Failed to send invitation: new row violates row-level security policy for table "pending_invitations"
```

---

## Quick Fix (Choose One)

### ✅ Option 1: Run the Fix Script (Recommended)

1. Open Supabase SQL Editor
2. Copy the content from **`fix_pending_invitations_rls.sql`**
3. Paste and run it
4. Try sending invitation again

This sets up **permissive policies** that allow all authenticated users to manage invitations (you can restrict it later).

---

### ⚡ Option 2: Temporarily Disable RLS (For Testing Only)

Run this in Supabase SQL Editor:

```sql
ALTER TABLE public.pending_invitations DISABLE ROW LEVEL SECURITY;
```

**Warning:** This completely disables security on the table. Only use for testing!

To re-enable later:
```sql
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;
```

---

## What Caused This?

The RLS policies require that:
- User must be authenticated
- User's `auth_id` in the `users` table must match their current session `auth.uid()`
- User must have `super_admin` or `admin` role

If any of these don't match, the policy blocks the insert.

---

## Verify Your Setup

Run this query to check your user mapping:

```sql
SELECT 
    id,
    auth_id,
    email,
    role,
    auth.uid() as current_auth_uid
FROM public.users
WHERE email = 'YOUR_EMAIL_HERE';
```

**Check:**
- Does `auth_id` match `current_auth_uid`?
- Is `role` set to `super_admin` or `admin`?

If not, update your user record:

```sql
UPDATE public.users
SET auth_id = auth.uid()
WHERE email = 'YOUR_EMAIL_HERE';
```

---

## After Fixing

Once the invitation system works, you can tighten security by updating the policies to only allow super_admin access.

---

## Test Again

1. Go to User Management
2. Click "Add User"
3. Fill the form
4. Click "Send Invitation"

It should work now! ✅
