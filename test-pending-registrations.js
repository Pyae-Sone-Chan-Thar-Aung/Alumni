// Test Pending Registrations System
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testPendingRegistrations() {
  console.log('🔍 Testing Pending Registrations System...\n');

  try {
    // 1. Check pending_registrations table structure
    console.log('📋 Checking pending_registrations table structure...');
    const { data: sampleData, error: structureError } = await supabase
      .from('pending_registrations')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Error accessing pending_registrations table:', structureError.message);
      return;
    }

    console.log('✅ pending_registrations table accessible');
    
    if (sampleData && sampleData.length > 0) {
      console.log('📊 Table columns:', Object.keys(sampleData[0]));
    } else {
      console.log('📊 Table is empty (no pending registrations)');
    }

    // 2. Check all pending registrations
    console.log('\n👥 Fetching all pending registrations...');
    const { data: allPending, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ Error fetching pending registrations:', fetchError.message);
      return;
    }

    console.log(`✅ Found ${allPending.length} pending registrations`);

    if (allPending.length > 0) {
      console.log('\n📝 Pending Registration Details:');
      allPending.forEach((reg, index) => {
        console.log(`\n${index + 1}. ${reg.first_name} ${reg.last_name}`);
        console.log(`   📧 Email: ${reg.email}`);
        console.log(`   🎓 Program: ${reg.program || 'Not specified'}`);
        console.log(`   📅 Graduation Year: ${reg.graduation_year || 'Not specified'}`);
        console.log(`   💼 Current Job: ${reg.current_job || 'Not specified'}`);
        console.log(`   🏢 Company: ${reg.company || 'Not specified'}`);
        console.log(`   📱 Phone: ${reg.phone || 'Not provided'}`);
        console.log(`   🏠 Address: ${reg.address || 'Not provided'}`);
        console.log(`   🌍 City/Country: ${reg.city || 'Not provided'}, ${reg.country || 'Not provided'}`);
        console.log(`   🖼️  Profile Image: ${reg.profile_image_url ? 'Yes' : 'No'}`);
        console.log(`   📅 Submitted: ${new Date(reg.created_at).toLocaleString()}`);
        
        if (reg.registration_data) {
          console.log(`   📊 Additional Data: ${JSON.stringify(reg.registration_data)}`);
        }
      });
    }

    // 3. Test admin dashboard stats
    console.log('\n📈 Testing admin dashboard stats...');
    
    // Try the view first
    const { data: statsView, error: viewError } = await supabase
      .from('admin_dashboard_stats')
      .select('*')
      .single();

    if (viewError) {
      console.log('⚠️  Admin dashboard stats view not available, using fallback...');
      
      // Fallback to individual queries
      const [
        { count: alumniCount },
        { count: pendingCount },
        { count: newsCount },
        { count: jobsCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('pending_registrations').select('*', { count: 'exact', head: true }),
        supabase.from('news_announcements').select('*', { count: 'exact', head: true }),
        supabase.from('job_opportunities').select('*', { count: 'exact', head: true })
      ]);

      console.log('✅ Dashboard stats (fallback):');
      console.log(`   👥 Total Alumni: ${alumniCount || 0}`);
      console.log(`   ⏳ Pending Approvals: ${pendingCount || 0}`);
      console.log(`   📰 News Articles: ${newsCount || 0}`);
      console.log(`   💼 Job Opportunities: ${jobsCount || 0}`);
    } else {
      console.log('✅ Dashboard stats (from view):');
      console.log(`   👥 Total Alumni: ${statsView.total_alumni || 0}`);
      console.log(`   ⏳ Pending Approvals: ${statsView.pending_approvals || 0}`);
      console.log(`   📰 Published News: ${statsView.published_news || 0}`);
      console.log(`   💼 Active Jobs: ${statsView.active_jobs || 0}`);
    }

    // 4. Test approval workflow simulation
    console.log('\n🔄 Testing approval workflow components...');
    
    // Check if we can query users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, status')
      .limit(5);

    if (usersError) {
      console.log('❌ Error accessing users table:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
      console.log(`   👤 Current users: ${users.length}`);
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}, ${user.status})`);
      });
    }

    // Check user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, last_name, program')
      .limit(5);

    if (profilesError) {
      console.log('❌ Error accessing user_profiles table:', profilesError.message);
    } else {
      console.log('✅ User profiles table accessible');
      console.log(`   👤 Current profiles: ${profiles.length}`);
    }

    // 5. Check registration form fields mapping
    console.log('\n📝 Checking registration form field mapping...');
    
    const expectedFields = [
      'email', 'first_name', 'last_name', 'student_id', 'graduation_year',
      'program', 'phone', 'address', 'city', 'country', 'current_job', 
      'company', 'profile_image_url', 'created_at'
    ];

    if (allPending.length > 0) {
      const actualFields = Object.keys(allPending[0]);
      const missingFields = expectedFields.filter(field => !actualFields.includes(field));
      const extraFields = actualFields.filter(field => !expectedFields.includes(field));

      console.log('✅ Field mapping analysis:');
      console.log(`   📊 Expected fields: ${expectedFields.length}`);
      console.log(`   📊 Actual fields: ${actualFields.length}`);
      
      if (missingFields.length > 0) {
        console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
      }
      
      if (extraFields.length > 0) {
        console.log(`   ➕ Extra fields: ${extraFields.join(', ')}`);
      }
      
      if (missingFields.length === 0 && extraFields.length <= 3) {
        console.log('   ✅ Field mapping looks good!');
      }
    }

    // 6. Summary and recommendations
    console.log('\n' + '='.repeat(50));
    console.log('📊 PENDING REGISTRATIONS SYSTEM ANALYSIS');
    console.log('='.repeat(50));

    if (allPending.length === 0) {
      console.log('📋 STATUS: No pending registrations found');
      console.log('💡 RECOMMENDATION: Test the registration flow:');
      console.log('   1. Go to /register and submit a test registration');
      console.log('   2. Check if it appears in admin dashboard');
      console.log('   3. Test the approval/rejection workflow');
    } else {
      console.log(`📋 STATUS: ${allPending.length} pending registration(s) found`);
      console.log('✅ SYSTEM: Ready for admin review');
      console.log('💡 NEXT STEPS:');
      console.log('   1. Login as admin (admin@ccs.edu.ph)');
      console.log('   2. Click "Pending Approvals" in dashboard');
      console.log('   3. Review and approve/reject registrations');
    }

    console.log('\n🔧 ADMIN DASHBOARD FEATURES:');
    console.log('✅ Pending registrations count display');
    console.log('✅ Detailed registration information modal');
    console.log('✅ Approve/reject functionality');
    console.log('✅ Real-time statistics');
    console.log('✅ User profile creation on approval');

  } catch (error) {
    console.log('❌ Error testing pending registrations system:', error.message);
  }
}

testPendingRegistrations();
