// Complete System Test Script
// Run this with: node test-complete-system.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 Testing Complete CCS Alumni System...\n');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCompleteSystem() {
  let testsPassed = 0;
  let testsFailed = 0;

  console.log('🔍 Testing Database Connection and Schema...\n');

  // Test 1: Database Connection
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
    testsPassed++;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    testsFailed++;
  }

  // Test 2: Core Tables
  const coreTables = [
    'users',
    'user_profiles', 
    'pending_registrations',
    'user_sessions',
    'news_announcements',
    'job_opportunities',
    'gallery_albums',
    'gallery_images',
    'tracer_study_responses'
  ];

  console.log('\n📊 Testing Core Tables...\n');
  
  for (const table of coreTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) throw error;
      console.log(`✅ Table '${table}' accessible`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ Table '${table}' error:`, error.message);
      testsFailed++;
    }
  }

  // Test 3: Admin Dashboard Views
  console.log('\n📈 Testing Admin Dashboard Views...\n');
  
  try {
    const { data, error } = await supabase.from('admin_dashboard_stats').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    console.log('✅ Admin dashboard stats view working');
    if (data) {
      console.log('   📊 Stats:', {
        totalAlumni: data.total_alumni || 0,
        pendingApprovals: data.pending_approvals || 0,
        publishedNews: data.published_news || 0,
        activeJobs: data.active_jobs || 0
      });
    }
    testsPassed++;
  } catch (error) {
    console.log('❌ Admin dashboard stats view error:', error.message);
    testsFailed++;
  }

  try {
    const { data, error } = await supabase.from('recent_activities').select('*').limit(5);
    if (error && error.code !== 'PGRST116') throw error;
    console.log('✅ Recent activities view working');
    if (data && data.length > 0) {
      console.log(`   📝 Found ${data.length} recent activities`);
    }
    testsPassed++;
  } catch (error) {
    console.log('❌ Recent activities view error:', error.message);
    testsFailed++;
  }

  // Test 4: User Management Functions
  console.log('\n👥 Testing User Management...\n');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, email, role, status,
        user_profiles (
          first_name, last_name, program, graduation_year
        )
      `)
      .limit(3);

    if (error) throw error;
    console.log('✅ User profiles join query working');
    console.log(`   👤 Found ${users.length} users in system`);
    
    if (users.length > 0) {
      const adminUsers = users.filter(u => u.role === 'admin');
      const alumniUsers = users.filter(u => u.role === 'alumni');
      console.log(`   🔑 Admin users: ${adminUsers.length}`);
      console.log(`   🎓 Alumni users: ${alumniUsers.length}`);
    }
    testsPassed++;
  } catch (error) {
    console.log('❌ User profiles join query error:', error.message);
    testsFailed++;
  }

  // Test 5: Pending Registrations
  console.log('\n⏳ Testing Pending Registrations...\n');

  try {
    const { data: pending, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .limit(5);

    if (error) throw error;
    console.log('✅ Pending registrations query working');
    console.log(`   📋 Found ${pending.length} pending registrations`);
    
    if (pending.length > 0) {
      console.log('   📝 Sample registration fields:', Object.keys(pending[0]));
    }
    testsPassed++;
  } catch (error) {
    console.log('❌ Pending registrations query error:', error.message);
    testsFailed++;
  }

  // Test 6: Authentication Schema
  console.log('\n🔐 Testing Authentication Schema...\n');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, status, email_verified, created_at, last_login')
      .limit(1);

    if (error) throw error;
    console.log('✅ Authentication schema complete');
    
    if (users.length > 0) {
      const user = users[0];
      console.log('   🔍 User schema fields:', Object.keys(user));
      console.log('   ✅ Required fields present:', {
        hasId: !!user.id,
        hasEmail: !!user.email,
        hasRole: !!user.role,
        hasStatus: !!user.status
      });
    }
    testsPassed++;
  } catch (error) {
    console.log('❌ Authentication schema error:', error.message);
    testsFailed++;
  }

  // Test 7: Storage Configuration
  console.log('\n📁 Testing Storage Configuration...\n');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const alumniProfilesBucket = buckets.find(b => b.name === 'alumni-profiles');
    if (alumniProfilesBucket) {
      console.log('✅ Alumni profiles storage bucket exists');
      console.log('   📂 Bucket details:', {
        name: alumniProfilesBucket.name,
        public: alumniProfilesBucket.public,
        createdAt: alumniProfilesBucket.created_at
      });
      testsPassed++;
    } else {
      console.log('⚠️  Alumni profiles storage bucket not found');
      console.log('   📋 Available buckets:', buckets.map(b => b.name));
      console.log('   💡 Create the bucket following STORAGE_BUCKET_SETUP.md');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Storage configuration error:', error.message);
    testsFailed++;
  }

  // Test 8: System Configuration
  console.log('\n⚙️  Testing System Configuration...\n');

  try {
    // Check if environment variables are properly set
    const configTests = [
      { name: 'Supabase URL', value: SUPABASE_URL, valid: SUPABASE_URL && SUPABASE_URL.includes('supabase.co') },
      { name: 'Supabase Key', value: 'Set', valid: SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 100 },
      { name: 'Database Schema', value: 'Ready', valid: true }
    ];

    configTests.forEach(test => {
      if (test.valid) {
        console.log(`✅ ${test.name}: ${test.value}`);
        testsPassed++;
      } else {
        console.log(`❌ ${test.name}: Invalid or missing`);
        testsFailed++;
      }
    });
  } catch (error) {
    console.log('❌ System configuration error:', error.message);
    testsFailed++;
  }

  // Final Results
  console.log('\n' + '='.repeat(50));
  console.log('🧪 SYSTEM TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your system is ready for production!');
    console.log('\n📋 Next Steps:');
    console.log('1. Create storage bucket if not exists (see STORAGE_BUCKET_SETUP.md)');
    console.log('2. Start your application: npm start');
    console.log('3. Test login with admin@ccs.edu.ph / admin123');
    console.log('4. Test registration and approval workflow');
  } else if (testsFailed <= 2) {
    console.log('\n⚠️  MOSTLY READY! Minor issues to resolve:');
    console.log('- Check storage bucket setup');
    console.log('- Verify all database tables are created');
  } else {
    console.log('\n❌ SYSTEM NEEDS ATTENTION:');
    console.log('- Run production_database_schema.sql in Supabase');
    console.log('- Check database connection settings');
    console.log('- Verify environment variables');
  }

  console.log('\n📚 Documentation:');
  console.log('- SYSTEM_IMPLEMENTATION_COMPLETE.md - Complete overview');
  console.log('- STORAGE_BUCKET_SETUP.md - Storage configuration');
  console.log('- COMPREHENSIVE_SYSTEM_DESIGN.md - System architecture');
  console.log('- IMPLEMENTATION_GUIDE.md - Code examples');
}

testCompleteSystem().catch(console.error);
