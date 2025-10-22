# 🚀 Database Setup Instructions
## CCS Alumni Portal - New Supabase Project

### Quick Setup Steps:

1. **📋 Copy the SQL Script:**
   - Open `UPDATED_COMPLETE_DATABASE_SCHEMA.sql`
   - Copy the ENTIRE contents (1,317 lines)

2. **🔧 Execute in Supabase:**
   - Go to [your Supabase Dashboard](https://supabase.com/dashboard/projects/cnjdmddqwfryvqnhirkb)
   - Navigate to **SQL Editor**
   - Create a new query
   - Paste the complete script
   - Click **RUN** to execute

3. **✅ Verify Success:**
   - Check the Messages panel for: "✅ SUCCESS: All required tables created successfully!"
   - Verify completion message appears

4. **📁 Create Storage Buckets:** (Manual - via Dashboard)
   - Go to **Storage** section
   - Create these buckets:
     - `avatars` (Public, 5MB limit)
     - `gallery` (Public, 10MB limit) 
     - `documents` (Public, 5MB limit)
     - `news-images` (Public, 5MB limit)

5. **🔐 Configure Authentication:**
   - Go to **Authentication > Settings**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

### What This Schema Includes:

✅ **11 Core Tables:**
- `users` - User accounts and roles
- `user_profiles` - Extended user information  
- `pending_registrations` - Registration approval workflow
- `news_announcements` - News and announcements
- `gallery_albums` & `gallery_images` - Photo galleries
- `job_opportunities` - Job postings
- `tracer_study_responses` - Graduate tracking surveys
- `messages` - Internal messaging system
- `events` & `event_registrations` - Event management

✅ **Security Features:**
- Row Level Security (RLS) policies on all tables
- Admin role checking functions
- Proper user permissions and access controls

✅ **Performance Optimizations:**
- Strategic database indexes
- Optimized queries for common operations
- Efficient data relationships

✅ **Additional Features:**
- Automatic timestamp updates
- User approval workflows
- Data validation constraints
- Seed data for initial setup

### Set Up Super Admin:

```bash
# After running the database schema, create the super admin user
node setup-super-admin.js
```

### Test Your Setup:

```bash
# Test database connection
node test-database-connection.js

# Start the application
npm start
```

### Super Admin Account:
- **Email:** `paung_230000001724@uic.edu.ph`
- **Password:** `UICalumni2025`
- **Role:** `super_admin`
- **Status:** `approved`

---

**📞 Need Help?** 
Check the comments in the SQL file or refer to `NEW_SUPABASE_SETUP_GUIDE.md` for detailed instructions.