# 🚀 Quick Start: Invitation System

## What Changed?

The "Add User" button now **sends invitation emails** instead of directly creating users.

---

## ⚡ Quick Setup (2 Steps)

### Step 1: Create Database Table
1. Open Supabase SQL Editor
2. Copy & paste the content from `create_pending_invitations_table.sql`
3. Run it

### Step 2: Test It!
1. Restart your React app if needed
2. Go to User Management
3. Click "Add User"
4. Fill the form
5. Click "Send Invitation"

---

## 📧 How It Works

### Old Way ❌
```
Click "Add User" → Fill form → User created directly → Appears in list
```

### New Way ✅
```
Click "Add User" → Fill form → Invitation sent → User receives email → 
User clicks link → User sets password → User created → Appears in list
```

---

## 🎯 What to Tell Users

"You've been invited to the CCS Alumni Portal! Check your email inbox for an invitation link. Click the link and follow the instructions to complete your registration."

---

## 🔍 Monitoring Invitations

To see pending invitations:
1. Go to Supabase Dashboard
2. Open Table Editor
3. Select `pending_invitations` table
4. View all sent invitations

---

## 📝 Important Notes

- ⏰ Invitations expire after **7 days**
- 🔒 Only **super admins** can send invitations
- ✉️ Users **must have a valid email**
- 🚫 Cannot invite existing users (duplicate check)
- 📧 Check Supabase email settings if emails don't arrive

---

## 🛠️ Need Help?

See the full documentation: `INVITATION_SYSTEM_SETUP.md`
