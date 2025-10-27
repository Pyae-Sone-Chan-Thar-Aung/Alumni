# Invitation System Setup Guide

## Overview
The User Management system now uses an **invitation-based workflow** instead of directly adding users. When a super admin clicks "Add User", they fill out the form and an invitation email is sent to the user. The user must accept the invitation via email to complete their registration.

---

## 🗄️ Step 1: Create the Database Table

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Navigate to **SQL Editor**

2. **Run the SQL Script**
   - Open the file: `create_pending_invitations_table.sql`
   - Copy the entire content
   - Paste it into the Supabase SQL Editor
   - Click **Run** or press `Ctrl+Enter`

3. **Verify Table Creation**
   - Go to **Table Editor** in Supabase
   - You should see a new table called `pending_invitations`

---

## 📧 Step 2: Configure Email Settings (Supabase)

For the invitation emails to work, you need to configure Supabase email settings:

### Option A: Use Supabase Default Email (Development)
- Supabase provides a default email service for development
- No additional configuration needed
- Limited to development/testing

### Option B: Configure Custom SMTP (Production)
1. Go to **Settings > Auth** in Supabase Dashboard
2. Scroll to **SMTP Settings**
3. Configure your email provider:
   - **Host**: smtp.gmail.com (for Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: your-app-password
4. Customize the invitation email template under **Email Templates**

---

## 🎯 How It Works

### For Super Admin:
1. Click **"Add User"** button in User Management
2. Fill out the invitation form:
   - Select role: Alumni or Admin
   - Enter email, name, and other details
   - For alumni: provide academic information
3. Click **"Send Invitation"**
4. User receives an invitation email

### For Invited User:
1. Receives invitation email at their inbox
2. Clicks the invitation link in the email
3. Completes registration by:
   - Setting their password
   - Confirming their information
4. Once confirmed, they can log in

---

## 🔑 Key Features

### Invitation Tracking
- All invitations are stored in `pending_invitations` table
- Status tracking: pending → sent → accepted → expired
- Invitations expire after **7 days**

### Security
- Duplicate email check (prevents inviting existing users)
- Row Level Security (RLS) enabled
- Only super admins can send invitations

### Invitation States
- **Pending**: Invitation created but email not yet sent
- **Sent**: Invitation email successfully sent
- **Accepted**: User completed registration
- **Expired**: Invitation expired after 7 days

---

## 📝 Database Schema

```sql
pending_invitations
├── id (UUID)
├── email (TEXT, UNIQUE)
├── first_name (TEXT)
├── last_name (TEXT)
├── role (TEXT: 'admin' | 'alumni')
├── program (TEXT)
├── batch_year (TEXT)
├── graduation_year (TEXT)
├── invitation_status (TEXT)
├── invited_at (TIMESTAMP)
├── expires_at (TIMESTAMP)
└── invited_by (UUID, references users)
```

---

## 🧪 Testing the System

1. **Test Invitation Flow**
   ```
   1. Log in as super admin
   2. Go to User Management
   3. Click "Add User"
   4. Fill the form with a test email
   5. Click "Send Invitation"
   ```

2. **Check Invitation in Database**
   - Go to Supabase Table Editor
   - Open `pending_invitations` table
   - Verify the new invitation record

3. **Check Email**
   - Check the inbox of the invited email
   - Look for the invitation email
   - Click the invitation link

---

## 🎨 UI Changes

### Before (Direct Creation)
- Button: "Add User"
- Action: Creates user immediately
- Result: User appears in list instantly

### After (Invitation System)
- Button: "Add User" 
- Modal Title: "Invite New User"
- Action: Sends invitation email
- Result: User must accept invitation first

---

## 🔧 Troubleshooting

### Invitation emails not sending?
- Check Supabase email configuration
- Verify SMTP settings (if using custom SMTP)
- Check Supabase logs for errors

### Invitation not showing in table?
- Verify RLS policies are set correctly
- Check if super admin role is assigned properly
- Look for errors in browser console

### Invitation link not working?
- Check the redirect URL configuration
- Verify the complete-registration page exists
- Check email template settings

---

## 📚 Next Steps

To fully complete the invitation system, you may want to create:

1. **Complete Registration Page** (`/complete-registration`)
   - Accept invitation token
   - Let user set password
   - Confirm user details
   - Create user account in `users` table

2. **Pending Invitations View**
   - Show list of pending invitations
   - Allow resending invitations
   - Allow canceling invitations

3. **Email Template Customization**
   - Customize invitation email design
   - Add your branding
   - Include helpful instructions

---

## ✅ Summary

The invitation system is now set up! Super admins can:
- ✉️ Send invitation emails to new users
- 🎓 Invite both alumni and admin users
- 📊 Track invitation status
- ⏰ Automatic expiration after 7 days

Users must:
- 📧 Check their email
- 🔗 Click invitation link
- ✍️ Complete registration
- 🔐 Set their password

This provides better security and control over who can access your system!
