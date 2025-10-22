const { createClient } = require('@supabase/supabase-js');

// Use the working configuration
const supabase = createClient(
  'https://gpsbydtilgoutlltyfvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM'
);

async function examineSchema() {
  console.log('🔍 Examining database schema...\n');
  
  // Check users table structure
  console.log('📋 Users table structure:');
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Error:', usersError.message);
    } else if (users.length > 0) {
      console.log('✅ Sample user record:');
      console.log(JSON.stringify(users[0], null, 2));
      console.log('\n📊 Available columns:', Object.keys(users[0]).join(', '));
    }
  } catch (error) {
    console.log('❌ Error examining users table:', error.message);
  }
  
  // Check if user_profiles table exists
  console.log('\n📋 User profiles table:');
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error:', profilesError.message);
    } else if (profiles.length > 0) {
      console.log('✅ Sample profile record:');
      console.log(JSON.stringify(profiles[0], null, 2));
      console.log('\n📊 Available columns:', Object.keys(profiles[0]).join(', '));
    } else {
      console.log('ℹ️ No profile records found');
    }
  } catch (error) {
    console.log('❌ Error examining user_profiles table:', error.message);
  }
}

async function createUserManagementView() {
  console.log('\n🛠️ Creating user_management_view...');
  
  const createViewSQL = `
    CREATE OR REPLACE VIEW user_management_view AS
    SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.approval_status,
      u.is_verified,
      u.registration_date,
      u.created_at as user_created_at,
      u.approved_at,
      p.phone,
      p.course,
      p.batch_year,
      p.graduation_year,
      p.current_job,
      p.company,
      p.address,
      p.city,
      p.country,
      p.profile_image_url
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id;
  `;
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: createViewSQL 
    });
    
    if (error) {
      console.log('❌ Error creating view with RPC:', error.message);
      console.log('\n📝 SQL to run manually in Supabase SQL Editor:');
      console.log(createViewSQL);
    } else {
      console.log('✅ View created successfully!');
    }
  } catch (error) {
    console.log('❌ Error executing SQL:', error.message);
    console.log('\n📝 Please run this SQL manually in your Supabase SQL Editor:');
    console.log(createViewSQL);
  }
}

async function testView() {
  console.log('\n🧪 Testing user_management_view...');
  
  try {
    const { data, error } = await supabase
      .from('user_management_view')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ View test failed:', error.message);
    } else {
      console.log(`✅ View works! Found ${data.length} records`);
      if (data.length > 0) {
        console.log('📋 Sample record:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }
  } catch (error) {
    console.log('❌ Error testing view:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database schema analysis and view creation...\n');
  
  await examineSchema();
  await createUserManagementView();
  await testView();
  
  console.log('\n✨ Process completed!');
}

main();