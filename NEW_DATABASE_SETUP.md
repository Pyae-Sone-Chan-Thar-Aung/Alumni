# New Database Setup Guide

## 🔄 Database Migration Complete

Your CCS Alumni system has been updated to use the new Supabase database:

### 📋 **New Database Credentials**
- **Project URL**: `https://sgalzbhfpydwnvprxrln.supabase.co`
- **Anon Key**: You need to get this from your Supabase dashboard

## 🚀 **Quick Setup Steps**

### 1. Get Your Actual Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `sgalzbhfpydwnvprxrln`
3. Go to **Settings** → **API**
4. Copy the **anon/public** key (it should be a long JWT token)

### 2. Update Environment Variables

Replace `YOUR_ACTUAL_ANON_KEY_HERE` in your `.env` file with the actual key:

```env
REACT_APP_SUPABASE_URL=https://sgalzbhfpydwnvprxrln.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here
```

### 3. Set Up Database Schema

Run the complete database schema in your Supabase SQL editor:

```bash
# Copy the contents of production_database_schema.sql
# Paste it in Supabase Dashboard → SQL Editor → New Query
# Click "Run" to execute
```

### 4. Configure Storage Buckets

In your Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Create a new bucket called `alumni-profiles`
3. Set it to **Public** access
4. Configure policies:
   - **Upload**: Allow authenticated users
   - **View**: Allow public access
   - **Update**: Allow authenticated users
   - **Delete**: Allow authenticated users

### 5. Test Database Connection

Create a simple test to verify connection:

```javascript
// test-connection.js
import { supabase } from './src/config/supabaseClient.js';

const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Connection failed:', error);
    } else {
      console.log('✅ Database connection successful!');
    }
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
};

testConnection();
```

## 🔧 **Configuration Files Updated**

### Files Modified:
- ✅ `.env` - Updated with new database URL
- ✅ `src/config/constants.js` - Updated API endpoints
- ✅ `src/config/supabaseClient.js` - Already configured properly

## 🗄️ **Database Schema Setup**

Your database needs these tables to function properly:

### Core Tables:
- `users` - Authentication and user management
- `user_profiles` - Extended user information
- `pending_registrations` - Admin approval workflow
- `user_sessions` - Session management

### Feature Tables:
- `news_announcements` - News and announcements
- `gallery_albums` - Photo gallery albums
- `gallery_images` - Gallery images
- `job_opportunities` - Job postings
- `tracer_study_responses` - Alumni survey data
- `audit_logs` - System audit trail

### Admin Views:
- `admin_dashboard_stats` - Real-time statistics
- `recent_activities` - Activity feed
- `user_statistics` - Alumni analytics

## 🔐 **Security Configuration**

### Row Level Security (RLS):
- Enabled on all sensitive tables
- Admin-only access for management functions
- User-specific data isolation
- Public access for appropriate content

### Storage Security:
- Profile images: Public read, authenticated write
- File size limit: 5MB
- Allowed types: JPG, PNG, GIF

## 🚦 **Next Steps**

1. **Get your actual anon key** from Supabase dashboard
2. **Update the .env file** with the real key
3. **Run the database schema** in Supabase SQL editor
4. **Set up storage buckets** as described above
5. **Test the connection** using the test script
6. **Start your application** and verify everything works

## 🔍 **Troubleshooting**

### Common Issues:

**Connection Error:**
- Verify the anon key is correct and complete
- Check that the URL matches your project
- Ensure environment variables are loaded

**Database Errors:**
- Run the complete schema setup
- Check table permissions and RLS policies
- Verify user roles are set correctly

**Storage Issues:**
- Create the `alumni-profiles` bucket
- Set correct bucket policies
- Check file size and type restrictions

## 📞 **Support**

If you encounter any issues:

1. Check the browser console for error messages
2. Verify Supabase dashboard shows your project is active
3. Test individual components step by step
4. Check that all environment variables are properly set

Your system is now ready to work with the new database! 🎉
