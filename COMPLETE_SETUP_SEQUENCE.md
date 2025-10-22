# 🚀 Complete Setup Sequence
## CCS Alumni Portal - New Supabase Project Setup

Follow this exact sequence to set up your CCS Alumni Portal from scratch.

---

## ✅ **Step 1: Database Schema Setup**

1. **Open your Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/projects/cnjdmddqwfryvqnhirkb
   - Navigate to **SQL Editor**

2. **Execute the Database Schema:**
   - Open `UPDATED_COMPLETE_DATABASE_SCHEMA.sql` in your editor
   - Copy the **ENTIRE contents** (all 1,317 lines)
   - Create a new query in Supabase SQL Editor
   - Paste the complete script
   - Click **RUN** to execute

3. **Verify Success:**
   - Look for: "✅ SUCCESS: All required tables created successfully!"
   - Check that the completion message appears
   - Verify all 11 tables are created in the Database section

---

## ✅ **Step 2: Authentication Configuration**

1. **Configure Auth Settings:**
   - Go to **Authentication > Settings** in your Supabase Dashboard
   - Set **Site URL:** `http://localhost:3000`
   - Add **Redirect URLs:** `http://localhost:3000/**`

2. **Email Templates (Optional):**
   - Customize confirmation and password reset emails
   - Update branding to match UIC Alumni Portal

---

## ✅ **Step 3: Storage Buckets Setup**

Create the following storage buckets in **Storage** section:

| Bucket Name | Settings | Purpose |
|-------------|----------|---------|
| `avatars` | Public, 5MB limit | Profile pictures |
| `gallery` | Public, 10MB limit | Gallery images |
| `documents` | Public, 5MB limit | Document uploads |
| `news-images` | Public, 5MB limit | News article images |

### Storage Bucket Policies:
For each bucket, set up these policies (via RLS):
- **SELECT:** Public access for viewing
- **INSERT:** Authenticated users can upload
- **UPDATE/DELETE:** Users can manage their own files + admins

---

## ✅ **Step 4: Super Admin Account Setup**

1. **Run the Super Admin Setup Script:**
   ```bash
   cd "C:\Users\Admin\OneDrive - uic.edu.ph\Desktop\CCSAlumni"
   node setup-super-admin.js
   ```

2. **Verify Super Admin Creation:**
   - The script will create the admin account with:
     - **Email:** `paung_230000001724@uic.edu.ph`
     - **Password:** `UICalumni2025`
     - **Role:** `super_admin`
     - **Status:** `approved`

3. **Check Success Messages:**
   - Look for: "🎉 SUPER ADMIN SETUP COMPLETED SUCCESSFULLY!"
   - Verify the account details in the output

---

## ✅ **Step 5: Test Your Setup**

1. **Test Database Connection:**
   ```bash
   node test-database-connection.js
   ```

2. **Start the Application:**
   ```bash
   npm start
   ```

3. **Test Admin Login:**
   - Go to: http://localhost:3000/login
   - Login with:
     - **Email:** `paung_230000001724@uic.edu.ph`
     - **Password:** `UICalumni2025`
   - Verify you can access the admin dashboard

---

## ✅ **Step 6: Verify All Features**

Test each major component:

### 🔐 Authentication
- [ ] User registration works
- [ ] Admin login works
- [ ] Password reset functions
- [ ] Role-based access control

### 👥 User Management
- [ ] Pending registrations appear in admin dashboard
- [ ] Admin can approve/reject users
- [ ] User profiles can be created and updated
- [ ] Batchmate connections work

### 📰 Content Management
- [ ] News articles can be created/edited
- [ ] Gallery albums and images can be managed
- [ ] Job opportunities can be posted
- [ ] Content visibility controls work

### 📊 Analytics & Reports
- [ ] Admin dashboard shows statistics
- [ ] Tracer study forms work
- [ ] Analytics charts display data
- [ ] Export functions work

### 💬 Communication
- [ ] Messaging system functions
- [ ] Event registration works
- [ ] Notifications are sent

---

## 🔧 **Configuration Summary**

### Environment Variables (`.env`)
```env
REACT_APP_SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamRtZGRxd2ZyeXZxbmhpcmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQzNjgsImV4cCI6MjA3NTA2MDM2OH0.NuThtXWP29FEvWYNMme4ipSLiBHOPhco7EoFMJlPfG8
```

### Super Admin Credentials
```
Email: paung_230000001724@uic.edu.ph
Password: UICalumni2025
Role: super_admin
```

### Database Tables Created (11 total)
- `users` - User accounts and authentication
- `user_profiles` - Extended user information
- `pending_registrations` - Registration approval workflow
- `news_announcements` - News and announcements
- `gallery_albums` & `gallery_images` - Photo galleries
- `job_opportunities` - Job board
- `tracer_study_responses` - Graduate surveys
- `messages` - Internal messaging
- `events` & `event_registrations` - Event management

---

## 🐛 **Troubleshooting**

### Database Issues
- **Schema fails to execute:** Check for syntax errors, ensure you copied the complete script
- **Tables missing:** Re-run the schema script, check for error messages
- **Permissions errors:** Verify you have admin access to your Supabase project

### Authentication Issues
- **Can't create admin:** Check if email already exists, try password reset
- **Login fails:** Verify credentials, check auth settings in Supabase
- **Access denied:** Ensure user has correct role and approval status

### Application Issues
- **App won't start:** Check environment variables, ensure dependencies installed
- **Features not working:** Verify database setup, check browser console for errors
- **Styling issues:** Clear browser cache, check CSS files loaded correctly

---

## 📚 **Next Steps After Setup**

1. **Production Deployment:**
   - Update environment variables for production
   - Configure domain-specific URLs
   - Set up SSL certificates
   - Configure backup schedules

2. **Content Population:**
   - Add initial news articles
   - Create gallery albums
   - Post job opportunities
   - Import alumni data

3. **System Administration:**
   - Set up monitoring and alerts
   - Configure email templates
   - Establish backup procedures
   - Create admin documentation

4. **User Onboarding:**
   - Create user guides
   - Set up help documentation
   - Plan training sessions
   - Establish support procedures

---

## 🎉 **Success Checklist**

- [ ] Database schema executed successfully (1,317 lines)
- [ ] Super admin account created (`paung_230000001724@uic.edu.ph`)
- [ ] Storage buckets created and configured
- [ ] Authentication settings configured
- [ ] Application starts without errors
- [ ] Admin login successful
- [ ] All major features tested and working
- [ ] Production deployment planned

**Congratulations! Your CCS Alumni Portal is now fully configured and ready for use!**

---

**📞 Support:** If you encounter any issues, refer to the troubleshooting section above or check the individual setup guide files in your project directory.