const { createClient } = require('@supabase/supabase-js');

// Use the working configuration
const supabase = createClient(
  'https://gpsbydtilgoutlltyfvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM'
);

async function testAdminUsersQuery() {
  console.log('🧪 Testing AdminUsers component query logic...\n');
  
  try {
    console.log('🔍 Step 1: Trying user_management_view...');
    
    // Try the view first (this will likely fail)
    let { data: usersData, error: usersError } = await supabase
      .from('user_management_view')
      .select('*')
      .order('user_created_at', { ascending: false });
    
    // If view doesn't exist, fall back to direct table query
    if (usersError && usersError.message.includes('user_management_view')) {
      console.log('🔄 user_management_view not found, using direct table query...');
      usersError = null; // Clear the error to proceed with fallback
    }
    
    console.log('📊 View query result:', { data: usersData?.length || 0, error: usersError?.message });
    
    if (usersError) {
      console.log('❌ Error fetching users from view:', usersError);
      
      // Fallback to direct table query
      console.log('\n🔍 Step 2: Trying fallback query...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            phone,
            mobile,
            program,
            batch_year,
            graduation_year,
            current_job_title,
            current_company,
            address,
            city,
            country,
            profile_image_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (fallbackError) {
        console.log('❌ Fallback query also failed:', fallbackError);
        return;
      }
      
      console.log(`✅ Fallback query successful! Found ${fallbackData.length} users`);
      
      // Process fallback data (simulate AdminUsers processing)
      const processedUsers = (fallbackData || []).map(u => {
        const profile = u.user_profiles?.[0] || {};
        return {
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          email: u.email,
          course: profile.program || 'N/A',  // 'program' in database
          batch: profile.batch_year || 'N/A',
          status: u.approval_status || (u.is_verified ? 'approved' : 'pending'),
          registrationDate: u.registration_date?.slice(0,10) || u.created_at?.slice(0,10) || '',
          phone: profile.phone || profile.mobile || 'N/A',  // Use phone or mobile
          role: u.role || 'alumni'
        };
      });
      
      console.log(`\n📋 Processed ${processedUsers.length} users:`);
      processedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.course} - ${user.status}`);
      });
      
      return;
    }
    
    if (!usersData || usersData.length === 0) {
      console.log('⚠️ No users found in database');
      return;
    }
    
    // Process view data (this should work once view is created)
    const processedUsers = usersData.map(u => ({
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
      email: u.email,
      course: u.course || u.program || 'N/A',  // Handle both column names
      batch: u.batch_year || 'N/A',
      status: u.approval_status || (u.is_verified ? 'approved' : 'pending'),
      registrationDate: u.registration_date?.slice(0,10) || u.user_created_at?.slice(0,10) || '',
      phone: u.phone || 'N/A',
      role: u.role || 'alumni'
    }));
    
    console.log(`✅ Found ${usersData.length} users from view`);
    console.log(`📋 Final processed users:`, processedUsers);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function main() {
  await testAdminUsersQuery();
  console.log('\n✨ Test completed!');
}

main();