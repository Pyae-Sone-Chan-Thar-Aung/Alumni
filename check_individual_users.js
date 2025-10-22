// Check individual user details for proper batch assignment
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkIndividualUsers() {
  console.log('🔍 Checking individual user details...\n');

  try {
    // Get all users with full details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at');
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message);
      return;
    }

    console.log(`📊 Found ${users.length} users in total\n`);
    
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.is_verified}`);
      console.log(`   Registration Date: ${user.registration_date}`);
      console.log(`   Created At: ${user.created_at}`);
      
      // Check if they have any batch-related info we can infer from
      const registrationYear = new Date(user.registration_date).getFullYear();
      console.log(`   Registration Year: ${registrationYear}`);
      
      // Suggest batch years based on registration patterns
      if (registrationYear === 2025) {
        console.log(`   🎓 Suggested Batch: 2024 (recent graduate)`);
      } else if (registrationYear >= 2022) {
        console.log(`   🎓 Suggested Batch: ${registrationYear - 1} (graduated year before registration)`);
      } else {
        console.log(`   🎓 Suggested Batch: 2020-2022 range`);
      }
      
      console.log(''); // Empty line
    });

    // Suggest realistic batch assignments
    console.log('💡 Suggested Batch Year Assignments:\n');
    
    users.forEach((user, index) => {
      const registrationYear = new Date(user.registration_date).getFullYear();
      let suggestedBatch;
      
      // Assign different batch years to create variety
      if (index === 0) {
        suggestedBatch = 2022;
      } else if (index === 1) {
        suggestedBatch = 2021; 
      } else if (index === 2) {
        suggestedBatch = 2020;
      } else {
        suggestedBatch = 2023;
      }
      
      console.log(`${user.first_name} ${user.last_name} → Batch ${suggestedBatch}`);
    });

    console.log('\n📝 This will create:');
    const batchGroups = {};
    users.forEach((user, index) => {
      const batch = index === 0 ? 2022 : index === 1 ? 2021 : index === 2 ? 2020 : 2023;
      if (!batchGroups[batch]) batchGroups[batch] = [];
      batchGroups[batch].push(`${user.first_name} ${user.last_name}`);
    });
    
    Object.entries(batchGroups).forEach(([batch, members]) => {
      console.log(`   Batch ${batch}: ${members.join(', ')} (${members.length} member${members.length > 1 ? 's' : ''})`);
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

checkIndividualUsers().then(() => {
  console.log('\n🏁 Individual user check completed.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  process.exit(1);
});