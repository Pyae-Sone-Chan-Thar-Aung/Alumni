# 🚀 New Supabase Project Setup Guide
## CCS Alumni Portal - University of the Immaculate Conception

This guide will help you set up your new Supabase project for the CCS Alumni Portal.

---

## ✅ Configuration Complete

Your project has been successfully configured to use the new Supabase instance:

- **Project URL**: `https://cnjdmddqwfryvqnhirkb.supabase.co`
- **Project ID**: `cnjdmddqwfryvqnhirkb`
- **Environment variables updated**: ✅
- **Configuration files updated**: ✅

---

## 🗃️ Step 1: Database Setup

### Option A: Complete Database Schema (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/projects/cnjdmddqwfryvqnhirkb)
2. Navigate to **SQL Editor**
3. Create a new query and paste the contents of one of these files:
   - `COMPLETE_DATABASE_SCHEMA.sql` (most comprehensive)
   - `FRESH_DATABASE_COMPLETE.sql` (alternative)
4. Execute the SQL script

### Option B: Manual Setup
If you prefer manual setup, execute these files in order:
1. `final_database_setup.sql`
2. `complete-database-setup.sql`
3. `complete_tracer_study_setup.sql`

---

## 🔐 Step 2: Row Level Security (RLS)

The database schema should automatically enable RLS, but verify:

1. Go to **Database > Tables**
2. For each table, ensure RLS is **enabled**
3. Check that policies are properly configured for:
   - `users` table
   - `user_profiles` table  
   - `news_announcements` table
   - `job_opportunities` table
   - `tracer_study_responses` table

---

## 📁 Step 3: Storage Buckets

Create the following storage buckets:

### 1. Create Buckets
Go to **Storage** and create these buckets:
- `avatars` - For profile pictures
- `gallery` - For gallery images
- `documents` - For document uploads
- `news-images` - For news article images

### 2. Configure Bucket Policies
For each bucket, set up policies:

```sql
-- Example policy for avatars bucket
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🔑 Step 4: Authentication Settings

1. Go to **Authentication > Settings**
2. Configure the following:

### Site URL
- Set to: `http://localhost:3000` (development)
- For production: `https://yourdomain.com`

### Redirect URLs
Add these allowed redirect URLs:
- `http://localhost:3000/**`
- `https://yourdomain.com/**` (for production)

### Email Templates
Customize the email templates:
- **Confirm signup**
- **Magic Link**
- **Change Email Address**
- **Reset Password**

---

## 👤 Step 5: Create Admin User

### Option A: Using Script
Run the admin creation script:
```bash
node create-admin-user.js
```

### Option B: Manual Creation
1. Go to **Authentication > Users**
2. Click **Add user**
3. Create user with:
   - Email: `admin@uic.edu.ph` (or your preferred admin email)
   - Password: Strong password
   - Email confirmed: ✅
4. After creation, update the user's metadata to set role as 'admin'

---

## 🧪 Step 6: Testing

### Test Database Connection
```bash
node test-database-connection.js
```

### Test the Application
```bash
npm start
```

### Verify Functionality
1. **Registration**: Try registering a new user
2. **Login**: Test login with admin credentials
3. **Dashboard**: Check if admin dashboard loads
4. **Database**: Verify data is being saved/retrieved

---

## 🔧 Environment Variables Summary

Your `.env` file now contains:
```env
REACT_APP_SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamRtZGRxd2ZyeXZxbmhpcmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQzNjgsImV4cCI6MjA3NTA2MDM2OH0.NuThtXWP29FEvWYNMme4ipSLiBHOPhco7EoFMJlPfG8
```

---

## 🚨 Important Security Notes

1. **Never commit your `.env` file** to version control
2. **Service Role Key**: Keep your service role key secret (not included in client code)
3. **RLS Policies**: Always test your RLS policies thoroughly
4. **CORS**: Configure CORS settings if deploying to a custom domain

---

## 🐛 Troubleshooting

### Common Issues:

**Connection Issues:**
- Verify your project URL and API keys
- Check if your Supabase project is active
- Ensure no typos in environment variables

**Authentication Issues:**
- Verify site URL and redirect URLs are correct
- Check email confirmation settings
- Ensure user roles are properly set

**Database Issues:**
- Check if RLS is properly configured
- Verify table structure matches expected schema
- Test policies with different user roles

**Storage Issues:**
- Ensure buckets are created and public/private settings are correct
- Check storage policies
- Verify file upload limits

---

## 📞 Next Steps After Setup

1. **Deploy to Production**: When ready, update environment variables for production
2. **Monitoring**: Set up monitoring and alerts in Supabase dashboard
3. **Backups**: Configure automatic backups
4. **Performance**: Monitor database performance and optimize queries
5. **Security**: Regularly audit RLS policies and access controls

---

## 📚 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/projects/cnjdmddqwfryvqnhirkb)
- [Supabase Documentation](https://supabase.com/docs)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)

---

**🎉 Congratulations!** Your new Supabase project is ready to use. Follow the steps above to complete the setup and start developing your CCS Alumni Portal.