// Debug script to check batchmates data
// Run with: node debug_batchmates.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugBatchmates() {
  console.log('🔍 Debugging Batchmates Data...\n');

  try {
    // 1. Check if users table exists and has data
    console.log('1️⃣ Checking users table...');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, batch_year, is_verified, role')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message);
      return;
    }

    console.log('✅ Users table accessible');
    console.log(`📊 Found ${allUsers?.length || 0} users (showing first 5)`);
    
    if (allUsers && allUsers.length > 0) {
      console.log('\n👥 Sample users:');
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Batch: ${user.batch_year || 'Not set'}`);
        console.log(`     Verified: ${user.is_verified}`);
        console.log(`     Role: ${user.role}`);
        console.log('');
      });
    }

    // 2. Check batch year distribution
    console.log('2️⃣ Checking batch year distribution...');
    const { data: batchData, error: batchError } = await supabase
      .from('users')
      .select('batch_year')
      .not('batch_year', 'is', null);
    
    if (batchError) {
      console.error('❌ Error getting batch data:', batchError.message);
    } else {
      const batchCounts = {};
      batchData?.forEach(user => {
        const year = user.batch_year;
        batchCounts[year] = (batchCounts[year] || 0) + 1;
      });
      
      console.log('📈 Batch year distribution:');
      Object.entries(batchCounts)
        .sort(([a], [b]) => b - a)
        .forEach(([year, count]) => {
          console.log(`  ${year}: ${count} users`);
        });
    }

    // 3. Check for alumni users specifically
    console.log('\n3️⃣ Checking alumni users...');
    const { data: alumni, error: alumniError } = await supabase
      .from('users')
      .select('id, first_name, last_name, batch_year, is_verified')
      .eq('role', 'alumni')
      .eq('is_verified', true);
    
    if (alumniError) {
      console.error('❌ Error getting alumni:', alumniError.message);
    } else {
      console.log(`✅ Found ${alumni?.length || 0} verified alumni`);
      
      if (alumni && alumni.length > 0) {
        // Group by batch year
        const alumniByBatch = {};
        alumni.forEach(user => {
          const year = user.batch_year;
          if (!alumniByBatch[year]) alumniByBatch[year] = [];
          alumniByBatch[year].push(user);
        });
        
        console.log('\n👨‍🎓 Alumni by batch:');
        Object.entries(alumniByBatch)
          .sort(([a], [b]) => b - a)
          .forEach(([year, users]) => {
            console.log(`  Batch ${year}: ${users.length} alumni`);
            users.slice(0, 3).forEach(user => {
              console.log(`    - ${user.first_name} ${user.last_name}`);
            });
            if (users.length > 3) {
              console.log(`    ... and ${users.length - 3} more`);
            }
          });
      }
    }

    // 4. Check if required columns exist
    console.log('\n4️⃣ Checking for optional profile columns...');
    const { data: sampleUser, error: columnError } = await supabase
      .from('users')
      .select('current_job, company, location, profile_picture, last_login_at')
      .limit(1)
      .single();
    
    if (columnError && columnError.code !== 'PGRST116') {
      console.log('⚠️  Some optional columns might be missing:');
      console.log('   - current_job, company, location, profile_picture, last_login_at');
      console.log('   - These are optional but provide richer profile data');
    } else {
      console.log('✅ Optional profile columns are available');
    }

    // 5. Test the exact query from Batchmates component
    console.log('\n5️⃣ Testing Batchmates component query...');
    
    // Let's test with a common batch year
    const testBatchYear = 2024; // You can change this to a year that has users
    
    const { data: batchmates, error: batchmatesError } = await supabase
      .from('users')
      .select(`
        id, first_name, last_name, course, email,
        current_job, company, location, profile_picture,
        last_login_at, created_at
      `)
      .eq('batch_year', testBatchYear)
      .eq('is_verified', true)
      .neq('role', 'admin'); // Assuming you don't want admins in batchmates
      
    if (batchmatesError) {
      console.error('❌ Batchmates query failed:', batchmatesError.message);
      console.error('Details:', batchmatesError);
    } else {
      console.log(`✅ Batchmates query successful for batch ${testBatchYear}`);
      console.log(`📊 Found ${batchmates?.length || 0} potential batchmates`);
      
      if (batchmates && batchmates.length > 0) {
        console.log('\n🎓 Sample batchmates:');
        batchmates.slice(0, 3).forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.first_name} ${user.last_name}`);
          console.log(`     Course: ${user.course || 'Not specified'}`);
          console.log(`     Job: ${user.current_job || 'Not specified'}`);
          console.log('');
        });
      }
    }

    // 6. Check if new tables were created
    console.log('6️⃣ Checking if new batchmate tables exist...');
    
    const tables = ['user_connections', 'conversations', 'messages'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' not accessible: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the debug
debugBatchmates().then(() => {
  console.log('\n🏁 Debug completed.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});