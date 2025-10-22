# 🚀 Complete Supabase Setup Guide for UIC Alumni Portal

## 📋 Step-by-Step Instructions

### Step 1: Run the Main Database Setup
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy and paste the entire contents of `supabase_complete_setup.sql`
5. Click **"Run"** button
6. Wait for the "Database setup completed successfully!" message

### Step 2: Setup Storage for Profile Images
1. In the SQL Editor, click **"New Query"**
2. Copy and paste the contents of `supabase_storage_setup.sql`
3. Click **"Run"** button
4. Wait for the "Storage setup completed successfully!" message

### Step 3: Verify Your Setup
1. Go to **Table Editor** (left sidebar)
2. You should see these tables created:
   - `users`
   - `user_profiles`
   - `news`
   - `job_opportunities`
   - `batch_groups`
   - `batch_messages`
   - `direct_messages`
   - `chatbot_messages`
   - `tracer_study_responses`

3. Go to **Storage** (left sidebar)
4. You should see a `profiles` bucket created

### Step 4: Create Your Admin Account
1. Go to **Authentication** → **Users** (left sidebar)
2. Click **"Add user"**
3. Fill in the details:
   - **Email**: `paung_230000001724@uic.edu.ph`
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**
5. Copy the User ID (UUID) that gets generated

### Step 5: Set Up Admin User in Database
1. Go back to **SQL Editor**
2. Run this query (replace `YOUR_USER_ID_HERE` with the actual UUID from Step 4):

```sql
-- Insert admin user into public.users table
INSERT INTO public.users (id, email, first_name, last_name, role, is_verified)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual UUID from Auth users
  'paung_230000001724@uic.edu.ph',
  'Paung',
  'Admin',
  'admin',
  true
);
```

3. Also create a profile for the admin:

```sql
-- Insert admin profile
INSERT INTO public.user_profiles (user_id, batch_year, course, current_job, company, address, bio)
VALUES (
  'YOUR_USER_ID_HERE', -- Same UUID as above
  2020,
  'Computer Science',
  'System Administrator',
  'University of the Immaculate Conception',
  'Davao City, Philippines',
  'Administrator of the UIC Alumni Portal System'
);
```

### Step 6: Test Your Setup
1. Start your React application: `npm start`
2. Go to the login page
3. Login with: `paung_230000001724@uic.edu.ph` and your chosen password
4. You should be redirected to the Admin Dashboard
5. Check that you can see statistics and navigate to different admin sections

### Step 7: Create Your Environment File
1. Create a `.env` file in your project root
2. Add these variables:

```env
REACT_APP_SUPABASE_URL=https://xveajhcqrnhxxkhgmtbc.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ZWFqaGNxcm5oeHhraGdtdGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTg2ODEsImV4cCI6MjA3MzIzNDY4MX0.vpknFrW9SYTIUumEZvRd7gOwFUoSsf69LHOF9W1alxw
```

### Step 8: Test Registration and Tracer Study
1. Create a test alumni account by registering
2. Login as the new alumni user
3. Navigate to "Tracer Study" in the menu
4. Fill out the complete form
5. Submit and verify it saves correctly

## 🔧 Troubleshooting

### If you get permission errors:
- Make sure you're using the correct API keys
- Check that RLS policies are enabled
- Verify your user is properly set up in the database

### If the admin user doesn't work:
- Double-check the UUID matches exactly
- Ensure the user exists in both `auth.users` and `public.users`
- Try logging out and back in

### If storage doesn't work:
- Verify the `profiles` bucket exists
- Check storage policies are created
- Make sure file uploads are under 50MB

## 📊 What You'll Have After Setup

✅ **Complete database schema** with all tables and relationships  
✅ **Row Level Security** protecting user data  
✅ **Admin account** ready to use  
✅ **Profile image storage** configured  
✅ **Tracer Study form** fully functional  
✅ **User management** system working  
✅ **News and job posting** capabilities  
✅ **Batch-based messaging** system  
✅ **Chatbot integration** ready  

## 🎯 Next Steps

1. **Test all features** with different user roles
2. **Customize the UI** if needed
3. **Add more sample data** for testing
4. **Configure email templates** for notifications
5. **Set up backup strategies** for your data

Your UIC Alumni Portal is now ready to use! 🎉
