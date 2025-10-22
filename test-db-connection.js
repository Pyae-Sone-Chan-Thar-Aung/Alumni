const { createClient } = require('@supabase/supabase-js');

// Test both configurations
const configs = [
  {
    name: 'From .env file',
    url: 'https://gpsbydtilgoutlltyfvl.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM'
  },
  {
    name: 'From constants.js fallback',
    url: 'https://cnjdmddqwfryvqnhirkb.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamRtZGRxd2ZyeXZxbmhpcmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQzNjgsImV4cCI6MjA3NTA2MDM2OH0.NuThtXWP29FEvWYNMme4ipSLiBHOPhco7EoFMJlPfG8'
  }
];

async function testConnection(config) {
  console.log(`\n🔍 Testing connection: ${config.name}`);
  console.log(`📡 URL: ${config.url}`);
  
  try {
    const supabase = createClient(config.url, config.key);
    
    // Test 1: Basic connection
    console.log('⏳ Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Basic connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Check if users table exists
    console.log('⏳ Testing users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Users table access failed:', usersError.message);
    } else {
      console.log(`✅ Users table accessible, found ${usersData?.length || 0} users`);
      if (usersData?.length > 0) {
        console.log('📋 Sample user:', usersData[0]);
      }
    }
    
    // Test 3: Check if user_management_view exists
    console.log('⏳ Testing user_management_view...');
    const { data: viewData, error: viewError } = await supabase
      .from('user_management_view')
      .select('*')
      .limit(5);
    
    if (viewError) {
      console.log('❌ user_management_view access failed:', viewError.message);
    } else {
      console.log(`✅ user_management_view accessible, found ${viewData?.length || 0} records`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database connection tests...');
  
  for (const config of configs) {
    await testConnection(config);
  }
  
  console.log('\n📊 Test completed!');
}

main();