// Database Connection Test Script
// Run this with: node test-database-connection.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Testing Database Connection...');
console.log('URL:', SUPABASE_URL ? 'Set' : 'Missing');
console.log('Key:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration');
  console.log('Please check your .env file has:');
  console.log('REACT_APP_SUPABASE_URL=your-supabase-url');
  console.log('REACT_APP_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseConnection() {
  console.log('\n📊 Testing Database Tables...\n');
  
  const tests = [
    {
      name: 'Users Table',
      query: () => supabase.from('users').select('count').limit(1),
      required: true
    },
    {
      name: 'User Profiles Table',
      query: () => supabase.from('user_profiles').select('count').limit(1),
      required: true
    },
    {
      name: 'Pending Registrations Table',
      query: () => supabase.from('pending_registrations').select('count').limit(1),
      required: true
    },
    {
      name: 'User Sessions Table',
      query: () => supabase.from('user_sessions').select('count').limit(1),
      required: true
    },
    {
      name: 'News Announcements Table',
      query: () => supabase.from('news_announcements').select('count').limit(1),
      required: true
    },
    {
      name: 'Job Opportunities Table',
      query: () => supabase.from('job_opportunities').select('count').limit(1),
      required: true
    },
    {
      name: 'Gallery Albums Table',
      query: () => supabase.from('gallery_albums').select('count').limit(1),
      required: true
    },
    {
      name: 'Gallery Images Table',
      query: () => supabase.from('gallery_images').select('count').limit(1),
      required: true
    },
    {
      name: 'Tracer Study Responses Table',
      query: () => supabase.from('tracer_study_responses').select('count').limit(1),
      required: true
    },
    {
      name: 'Admin Dashboard Stats View',
      query: () => supabase.from('admin_dashboard_stats').select('*').limit(1),
      required: false
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      const { data, error } = await test.query();
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        if (test.required) failedTests++;
      } else {
        console.log(`✅ ${test.name}: Connected successfully`);
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      if (test.required) failedTests++;
    }
  }

  console.log('\n📈 Testing User Management Queries...\n');

  // Test specific user management queries
  const userTests = [
    {
      name: 'Fetch All Users',
      query: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, status, email_verified, created_at')
          .limit(5);
        return { data, error, count: data?.length };
      }
    },
    {
      name: 'Fetch Pending Users (status)',
      query: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('status', 'pending')
          .limit(5);
        return { data, error, count: data?.length };
      }
    },
    {
      name: 'Fetch Approved Users',
      query: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('status', 'approved')
          .limit(5);
        return { data, error, count: data?.length };
      }
    },
    {
      name: 'Fetch Users with Profiles',
      query: async () => {
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            user_profiles (
              first_name,
              last_name,
              phone,
              program,
              graduation_year,
              profile_image_url
            )
          `)
          .limit(3);
        return { data, error, count: data?.length };
      }
    }
  ];

  for (const test of userTests) {
    try {
      const result = await test.query();
      
      if (result.error) {
        console.log(`❌ ${test.name}: ${result.error.message}`);
      } else {
        console.log(`✅ ${test.name}: Found ${result.count} records`);
        if (result.data && result.data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(result.data[0], null, 2).substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  console.log('\n🔧 Testing Database Schema...\n');

  // Check for required columns
  const schemaTests = [
    {
      name: 'Users Table Schema',
      query: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, status, email_verified, created_at, updated_at, last_login')
          .limit(1);
        return { data, error };
      }
    },
    {
      name: 'User Profiles Table Schema',
      query: async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, phone, program, graduation_year, current_job, company, city, country, profile_image_url')
          .limit(1);
        return { data, error };
      }
    }
  ];

  for (const test of schemaTests) {
    try {
      const result = await test.query();
      
      if (result.error) {
        console.log(`❌ ${test.name}: Missing columns - ${result.error.message}`);
      } else {
        console.log(`✅ ${test.name}: All required columns present`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  
  if (failedTests > 0) {
    console.log('\n🔧 Recommendations:');
    console.log('1. Run fix_user_management_schema.sql in your Supabase SQL Editor');
    console.log('2. Check your .env file configuration');
    console.log('3. Verify your Supabase project is active');
    console.log('4. Check RLS policies are not blocking queries');
  } else {
    console.log('\n🎉 All critical database connections are working!');
  }
}

testDatabaseConnection().catch(console.error);
