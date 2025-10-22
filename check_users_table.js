// Check actual users table structure
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');

  try {
    // Get one user to see available columns
    console.log('1️⃣ Getting sample user data...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message);
      return;
    }

    if (users && users.length > 0) {
      const user = users[0];
      console.log('✅ Users table accessible');
      console.log('📋 Available columns:');
      
      Object.keys(user).forEach(column => {
        const value = user[column];
        const type = typeof value;
        console.log(`  - ${column}: ${type} = ${value !== null ? JSON.stringify(value) : 'null'}`);
      });

      // Check for batch-related columns
      console.log('\n2️⃣ Looking for batch-related columns...');
      const batchColumns = Object.keys(user).filter(col => 
        col.toLowerCase().includes('batch') || 
        col.toLowerCase().includes('year') ||
        col.toLowerCase().includes('graduation')
      );
      
      if (batchColumns.length > 0) {
        console.log('📅 Found batch-related columns:');
        batchColumns.forEach(col => {
          console.log(`  ✅ ${col}: ${user[col]}`);
        });
      } else {
        console.log('⚠️  No batch-related columns found');
        console.log('   You may need to add a batch_year column or similar');
      }
    } else {
      console.log('⚠️  No users found in the table');
    }

    // Get total count
    console.log('\n3️⃣ Checking total user count...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting user count:', countError.message);
    } else {
      console.log(`📊 Total users in table: ${count}`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

checkUsersTable().then(() => {
  console.log('\n🏁 Check completed.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  process.exit(1);
});