const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMessagingTables() {
  console.log('🔍 Testing messaging system tables...\n');
  
  const tests = [
    {
      name: 'Messages Table',
      query: () => supabase.from('messages').select('id').limit(1),
      required: true
    },
    {
      name: 'User Connections Table',
      query: () => supabase.from('user_connections').select('id').limit(1),
      required: true
    },
    {
      name: 'Notifications Table',
      query: () => supabase.from('notifications').select('id').limit(1),
      required: true
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
        console.log(`✅ ${test.name}: Table exists and accessible`);
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      if (test.required) failedTests++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  
  if (failedTests > 0) {
    console.log('\n🔧 The messaging system tables are missing!');
    console.log('Please run the SQL script in your Supabase SQL Editor:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of fix_messaging_system_tables.sql');
    console.log('4. Execute the script');
  } else {
    console.log('\n🎉 All messaging system tables are working!');
  }
}

testMessagingTables().catch(console.error);
