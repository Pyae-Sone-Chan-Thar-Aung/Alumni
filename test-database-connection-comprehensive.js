/**
 * Comprehensive Database Connection Test
 * Tests Supabase connectivity and database schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 UIC Alumni Portal - Database Connection Test');
console.log('='.repeat(60));

// Validate environment variables
console.log('\n📋 Environment Variables Check:');
console.log(`SUPABASE_URL: ${SUPABASE_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing'}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('\n❌ Critical Error: Missing Supabase configuration!');
  console.log('Please check your .env file and ensure it contains:');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Test functions
const testConnection = async () => {
  try {
    console.log('\n🔌 Testing Basic Connection...');
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    return true;
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`);
    return false;
  }
};

const testRequiredTables = async () => {
  console.log('\n🗃️ Testing Required Tables...');
  
  const requiredTables = [
    'users',
    'user_profiles', 
    'pending_registrations',
    'news',
    'job_opportunities',
    'tracer_study_responses',
    'gallery_albums',
    'gallery_images',
    'batchmate_messages'
  ];
  
  const results = {};
  
  for (const tableName of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
        results[tableName] = { exists: false, error: error.message };
      } else {
        console.log(`✅ ${tableName}: Found (${count || 0} records)`);
        results[tableName] = { exists: true, count: count || 0 };
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
      results[tableName] = { exists: false, error: err.message };
    }
  }
  
  return results;
};

const testAuth = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Get current session (should be null)
    const { data: session } = await supabase.auth.getSession();
    console.log(`📝 Current session: ${session.session ? 'Active' : 'None'}`);
    
    // Test if we can access auth.users (admin only)
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log(`ℹ️ Auth admin access: Not available (${error.message})`);
      console.log('   This is normal for client-side connections.');
    } else {
      console.log(`✅ Auth admin access: Available (${data.users?.length || 0} users)`);
    }
    
    return true;
  } catch (err) {
    console.log(`❌ Auth test failed: ${err.message}`);
    return false;
  }
};

const testStorageBuckets = async () => {
  console.log('\n📦 Testing Storage Buckets...');
  
  const requiredBuckets = [
    'alumni-profiles',
    'gallery-images', 
    'news-images',
    'documents'
  ];
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`❌ Storage access failed: ${error.message}`);
      return false;
    }
    
    const bucketNames = buckets.map(b => b.name);
    
    for (const bucketName of requiredBuckets) {
      if (bucketNames.includes(bucketName)) {
        console.log(`✅ ${bucketName}: Found`);
      } else {
        console.log(`❌ ${bucketName}: Missing`);
      }
    }
    
    return true;
  } catch (err) {
    console.log(`❌ Storage test failed: ${err.message}`);
    return false;
  }
};

const testSampleOperations = async () => {
  console.log('\n🧪 Testing Sample Operations...');
  
  try {
    // Test read operation on users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);
    
    if (userError) {
      console.log(`❌ Users read test: ${userError.message}`);
    } else {
      console.log(`✅ Users read test: Success (${userData?.length || 0} records)`);
    }
    
    // Test read operation on pending_registrations
    const { data: pendingData, error: pendingError } = await supabase
      .from('pending_registrations')
      .select('id, email, first_name, last_name')
      .limit(5);
    
    if (pendingError) {
      console.log(`❌ Pending registrations read test: ${pendingError.message}`);
    } else {
      console.log(`✅ Pending registrations read test: Success (${pendingData?.length || 0} records)`);
    }
    
    // Test read operation on news
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .select('id, title, created_at')
      .limit(5);
    
    if (newsError && newsError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.log(`❌ News read test: ${newsError.message}`);
    } else {
      console.log(`✅ News read test: Success (${newsData?.length || 0} records)`);
    }
    
    return true;
  } catch (err) {
    console.log(`❌ Sample operations failed: ${err.message}`);
    return false;
  }
};

const generateDiagnosticReport = (results) => {
  console.log('\n📊 DIAGNOSTIC REPORT');
  console.log('='.repeat(60));
  
  const { connectionTest, tablesTest, authTest, storageTest, operationsTest } = results;
  
  console.log(`🔌 Connection: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🗃️ Tables: ${Object.values(tablesTest).every(t => t.exists) ? '✅ PASS' : '⚠️ PARTIAL'}`);
  console.log(`🔐 Authentication: ${authTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📦 Storage: ${storageTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🧪 Operations: ${operationsTest ? '✅ PASS' : '❌ FAIL'}`);
  
  // Detailed issues
  const issues = [];
  const missingTables = Object.entries(tablesTest).filter(([_, result]) => !result.exists);
  
  if (!connectionTest) {
    issues.push('❌ Basic database connection failed');
  }
  
  if (missingTables.length > 0) {
    issues.push(`❌ Missing tables: ${missingTables.map(([name]) => name).join(', ')}`);
  }
  
  if (!authTest) {
    issues.push('❌ Authentication system issues');
  }
  
  if (!storageTest) {
    issues.push('❌ Storage bucket issues');
  }
  
  if (!operationsTest) {
    issues.push('❌ Database operations failing');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️ ISSUES FOUND:');
    issues.forEach(issue => console.log(`   ${issue}`));
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Database is ready for use.');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (!connectionTest) {
    console.log('   1. Verify Supabase project is active and URL is correct');
    console.log('   2. Check if Supabase project has been paused/deleted');
    console.log('   3. Verify network connectivity');
  }
  
  if (missingTables.length > 0) {
    console.log('   1. Run database schema setup scripts');
    console.log('   2. Check if RLS policies are properly configured');
    console.log('   3. Verify table names match exactly (case-sensitive)');
  }
  
  if (!storageTest) {
    console.log('   1. Create missing storage buckets in Supabase dashboard');
    console.log('   2. Configure proper storage policies');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. If connection fails: Check Supabase project status');
  console.log('   2. If tables missing: Run database setup scripts');
  console.log('   3. If operations fail: Check RLS policies and permissions');
  console.log('   4. Test the application after fixing issues');
};

// Main test execution
const runComprehensiveTest = async () => {
  try {
    const results = {
      connectionTest: await testConnection(),
      tablesTest: await testRequiredTables(),
      authTest: await testAuth(),
      storageTest: await testStorageBuckets(),
      operationsTest: await testSampleOperations()
    };
    
    generateDiagnosticReport(results);
    
  } catch (error) {
    console.log(`\n💥 Critical Error: ${error.message}`);
    console.log('\nThis suggests a fundamental configuration issue.');
    console.log('Please check your Supabase project status and configuration.');
  }
};

// Run the test
runComprehensiveTest();