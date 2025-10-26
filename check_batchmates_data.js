// Check batchmates data issue
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBatchmatesData() {
  console.log('🔍 Checking Batchmates Data Issue...\n');

  try {
    // 1. Check users table structure
    console.log('1️⃣ Checking USERS table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, course, batch_year, current_job, company, location, profile_picture')
      .eq('is_verified', true)
      .limit(3);
    
    if (usersError) {
      console.error('❌ Error querying users:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} verified users`);
      if (users && users.length > 0) {
        console.log('\n📋 Sample user from USERS table:');
        console.log(JSON.stringify(users[0], null, 2));
        
        // Check which fields exist
        const sampleUser = users[0];
        console.log('\n🔍 Checking field availability in USERS table:');
        console.log(`  - course: ${sampleUser.course !== undefined ? '✅ EXISTS' : '❌ MISSING'} = ${sampleUser.course}`);
        console.log(`  - batch_year: ${sampleUser.batch_year !== undefined ? '✅ EXISTS' : '❌ MISSING'} = ${sampleUser.batch_year}`);
        console.log(`  - current_job: ${sampleUser.current_job !== undefined ? '✅ EXISTS' : '❌ MISSING'} = ${sampleUser.current_job}`);
        console.log(`  - company: ${sampleUser.company !== undefined ? '✅ EXISTS' : '❌ MISSING'} = ${sampleUser.company}`);
        console.log(`  - location: ${sampleUser.location !== undefined ? '✅ EXISTS' : '❌ MISSING'} = ${sampleUser.location}`);
        console.log(`  - profile_picture: ${sampleUser.profile_picture !== undefined ? '✅ EXISTS' : '❌ MISSING'} = ${sampleUser.profile_picture}`);
      }
    }

    // 2. Check user_profiles table
    console.log('\n\n2️⃣ Checking USER_PROFILES table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.error('❌ Error querying user_profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} user profiles`);
      if (profiles && profiles.length > 0) {
        console.log('\n📋 Sample profile from USER_PROFILES table:');
        console.log(JSON.stringify(profiles[0], null, 2));
      } else {
        console.log('⚠️  No data in user_profiles table - this is likely the issue!');
      }
    }

    // 3. Try the joined query that Batchmates.js should use
    console.log('\n\n3️⃣ Testing JOINED query (users + user_profiles)...');
    const { data: joinedData, error: joinError } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles (
          phone,
          course,
          batch_year,
          graduation_year,
          current_job,
          company,
          address,
          city,
          country,
          profile_image_url
        )
      `)
      .eq('is_verified', true)
      .limit(3);
    
    if (joinError) {
      console.error('❌ Error with joined query:', joinError.message);
    } else {
      console.log(`✅ Joined query successful, found ${joinedData?.length || 0} users`);
      if (joinedData && joinedData.length > 0) {
        console.log('\n📋 Sample joined data:');
        const sample = joinedData[0];
        console.log(`Name: ${sample.first_name} ${sample.last_name}`);
        console.log(`Email: ${sample.email}`);
        console.log(`Users table - course: ${sample.course}`);
        console.log(`Users table - batch_year: ${sample.batch_year}`);
        console.log(`Profile data:`, sample.user_profiles);
        
        if (sample.user_profiles && sample.user_profiles.length > 0) {
          const profile = sample.user_profiles[0];
          console.log('\n✅ User has profile data:');
          console.log(`  - course: ${profile.course}`);
          console.log(`  - batch_year: ${profile.batch_year}`);
          console.log(`  - current_job: ${profile.current_job}`);
          console.log(`  - company: ${profile.company}`);
          console.log(`  - city: ${profile.city}`);
          console.log(`  - country: ${profile.country}`);
          console.log(`  - profile_image_url: ${profile.profile_image_url}`);
        } else {
          console.log('\n⚠️  User has NO profile data in user_profiles table');
        }
      }
    }

    // 4. Check specific users mentioned in the screenshot
    console.log('\n\n4️⃣ Checking specific users from screenshot...');
    const testUsers = ['Jhon Mike Luna', 'Larrah Alfaro', 'Global GLC'];
    
    for (const name of testUsers) {
      const names = name.split(' ');
      const firstName = names[0];
      
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (*)
        `)
        .ilike('first_name', `%${firstName}%`)
        .limit(1)
        .single();
      
      if (!error && user) {
        console.log(`\n👤 Found: ${user.first_name} ${user.last_name}`);
        console.log(`   Users table - course: ${user.course || 'NULL'}`);
        console.log(`   Users table - batch_year: ${user.batch_year || 'NULL'}`);
        console.log(`   Profile exists: ${user.user_profiles && user.user_profiles.length > 0 ? 'YES' : 'NO'}`);
        if (user.user_profiles && user.user_profiles.length > 0) {
          const p = user.user_profiles[0];
          console.log(`   Profile - course: ${p.course || 'NULL'}`);
          console.log(`   Profile - batch_year: ${p.batch_year || 'NULL'}`);
        }
      }
    }

    // 5. Summary and recommendations
    console.log('\n\n📊 SUMMARY AND DIAGNOSIS:');
    console.log('='.repeat(60));
    
    if (users && users.length > 0) {
      const hasUsersTableData = users[0].course || users[0].batch_year || users[0].current_job;
      const hasProfilesData = profiles && profiles.length > 0;
      
      if (hasUsersTableData && !hasProfilesData) {
        console.log('✅ Data exists in USERS table');
        console.log('❌ No data in USER_PROFILES table');
        console.log('\n💡 SOLUTION: The users table has the data directly.');
        console.log('   The Batchmates.js query should work if columns exist.');
        console.log('   Check if the SQL migration was run to add these columns.');
      } else if (!hasUsersTableData && hasProfilesData) {
        console.log('❌ No data in USERS table columns');
        console.log('✅ Data exists in USER_PROFILES table');
        console.log('\n💡 SOLUTION: The joined query should work.');
        console.log('   Make sure the relationship is set up correctly.');
      } else if (hasUsersTableData && hasProfilesData) {
        console.log('✅ Data exists in BOTH tables');
        console.log('\n💡 SOLUTION: Use the joined query with fallbacks.');
      } else {
        console.log('❌ No data found in either table');
        console.log('\n💡 SOLUTION: Need to populate the data first.');
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkBatchmatesData().then(() => {
  console.log('\n🏁 Diagnostic completed.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Diagnostic failed:', error);
  process.exit(1);
});
