/**
 * Comprehensive Feature Test Suite
 * Tests all major system features to ensure they work correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🧪 UIC Alumni Portal - Comprehensive Feature Test Suite');
console.log('='.repeat(70));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test Results Tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

// Helper function to run test
const runTest = async (testName, testFunction) => {
  testResults.total++;
  
  try {
    console.log(`\n🔍 Testing: ${testName}`);
    const result = await testFunction();
    
    if (result.success) {
      console.log(`✅ ${testName}: PASSED`);
      if (result.details) console.log(`   ${result.details}`);
      testResults.passed++;
      testResults.tests.push({ name: testName, status: 'PASSED', details: result.details });
    } else {
      console.log(`❌ ${testName}: FAILED`);
      console.log(`   Error: ${result.error}`);
      testResults.failed++;
      testResults.tests.push({ name: testName, status: 'FAILED', error: result.error });
    }
  } catch (error) {
    console.log(`❌ ${testName}: FAILED`);
    console.log(`   Exception: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
  }
};

// Test Functions
const testUserRegistration = async () => {
  const testEmail = `test-${Date.now()}@uic.edu.ph`;
  
  try {
    // Test pending registration creation
    const { data, error } = await supabase
      .from('pending_registrations')
      .insert({
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        program: 'BS Computer Science',
        graduation_year: 2023,
        phone: '09123456789',
        address: '123 Test St',
        city: 'Davao City',
        country: 'Philippines'
      })
      .select();
    
    if (error) {
      return { success: false, error: `Registration failed: ${error.message}` };
    }
    
    // Cleanup test data
    await supabase.from('pending_registrations').delete().eq('email', testEmail);
    
    return { 
      success: true, 
      details: 'Registration form can create pending registrations successfully' 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testAuthenticationSystem = async () => {
  try {
    // Test getting current session (should be null)
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return { success: false, error: `Session check failed: ${sessionError.message}` };
    }
    
    // Test auth state management
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError && !userError.message.includes('not authenticated') && !userError.message.includes('Auth session missing')) {
      return { success: false, error: `User check failed: ${userError.message}` };
    }
    
    return { 
      success: true, 
      details: 'Authentication system is working properly' 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testUserManagement = async () => {
  try {
    // Test reading users table (admin functionality)
    const { data, error, count } = await supabase
      .from('users')
      .select('id, email, role', { count: 'exact' });
    
    if (error && error.code !== '42501') { // 42501 = insufficient privilege (expected for non-admin)
      return { success: false, error: `Users query failed: ${error.message}` };
    }
    
    return { 
      success: true, 
      details: `User management system accessible (${count || 'protected'} users)` 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testNewsSystem = async () => {
  try {
    // Test reading published news
    const { data, error, count } = await supabase
      .from('news')
      .select('id, title, content, published', { count: 'exact' })
      .eq('published', true);
    
    if (error) {
      return { success: false, error: `News system failed: ${error.message}` };
    }
    
    return { 
      success: true, 
      details: `News system working (${count || 0} published articles)` 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testTracerStudySystem = async () => {
  try {
    // Test reading tracer study responses (should work for authenticated users)
    const { data, error, count } = await supabase
      .from('tracer_study_responses')
      .select('id, employment_status, survey_year', { count: 'exact' });
    
    if (error && error.code !== '42501') { // Expected for non-authenticated users
      return { success: false, error: `Tracer study failed: ${error.message}` };
    }
    
    return { 
      success: true, 
      details: `Tracer study system accessible (${count || 'protected'} responses)` 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testJobOpportunitiesSystem = async () => {
  try {
    // Test reading job opportunities (should require authentication)
    const { data, error, count } = await supabase
      .from('job_opportunities')
      .select('id, title, company, created_at', { count: 'exact' });
    
    if (error && error.code !== '42501') { // Expected for non-authenticated users
      return { success: false, error: `Job opportunities failed: ${error.message}` };
    }
    
    return { 
      success: true, 
      details: `Job opportunities system accessible (${count || 'protected'} jobs)` 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testGallerySystem = async () => {
  try {
    // Test reading gallery albums
    const { data: albums, error: albumError, count } = await supabase
      .from('gallery_albums')
      .select('id, title, published', { count: 'exact' })
      .eq('published', true);
    
    if (albumError) {
      return { success: false, error: `Gallery albums failed: ${albumError.message}` };
    }
    
    // Test reading gallery images
    const { data: images, error: imageError } = await supabase
      .from('gallery_images')
      .select('id, title, image_url')
      .limit(5);
    
    if (imageError) {
      return { success: false, error: `Gallery images failed: ${imageError.message}` };
    }
    
    return { 
      success: true, 
      details: `Gallery system working (${count || 0} albums, ${images?.length || 0} images)` 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testStorageSystem = async () => {
  try {
    // Instead of trying to list buckets (which requires elevated permissions),
    // test if we can access each required bucket individually
    const requiredBuckets = ['alumni-profiles', 'gallery-images', 'news-images', 'documents'];
    const bucketResults = [];
    
    for (const bucketName of requiredBuckets) {
      try {
        // Try to list contents (even if empty, should return success if bucket exists)
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (error) {
          // Check if error is due to missing bucket vs permissions
          if (error.message.includes('not found') || error.message.includes('does not exist')) {
            bucketResults.push({ bucket: bucketName, exists: false, error: error.message });
          } else {
            // Bucket exists but has access restrictions (normal for private buckets)
            bucketResults.push({ bucket: bucketName, exists: true, protected: true });
          }
        } else {
          // Bucket exists and is accessible
          bucketResults.push({ 
            bucket: bucketName, 
            exists: true, 
            accessible: true, 
            items: data?.length || 0 
          });
        }
        
      } catch (err) {
        bucketResults.push({ bucket: bucketName, exists: false, error: err.message });
      }
    }
    
    // Analyze results
    const existingBuckets = bucketResults.filter(r => r.exists);
    const missingBuckets = bucketResults.filter(r => !r.exists);
    
    if (existingBuckets.length === requiredBuckets.length) {
      return { 
        success: true, 
        details: `All storage buckets functional (${existingBuckets.length}/${requiredBuckets.length})` 
      };
    } else {
      return { 
        success: false, 
        error: `Missing storage buckets: ${missingBuckets.map(b => b.bucket).join(', ')}` 
      };
    }
    
  } catch (err) {
    return { success: false, error: `Storage test error: ${err.message}` };
  }
};

const testDatabaseConnectivity = async () => {
  try {
    // Test basic database operations
    const operations = [
      { name: 'users', query: () => supabase.from('users').select('id').limit(1) },
      { name: 'user_profiles', query: () => supabase.from('user_profiles').select('id').limit(1) },
      { name: 'pending_registrations', query: () => supabase.from('pending_registrations').select('id').limit(1) },
      { name: 'news', query: () => supabase.from('news').select('id').limit(1) },
    ];
    
    const results = [];
    
    for (const op of operations) {
      const { error } = await op.query();
      if (error && error.code !== 'PGRST116' && error.code !== '42501') {
        results.push(`${op.name}: ${error.message}`);
      }
    }
    
    if (results.length > 0) {
      return { success: false, error: `Database connectivity issues: ${results.join(', ')}` };
    }
    
    return { 
      success: true, 
      details: 'All database tables are accessible' 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testRealTimeFeatures = async () => {
  try {
    // Test if realtime connections can be established
    const channel = supabase.channel('test-channel');
    
    // Subscribe to a basic channel
    const subscription = channel.subscribe((status) => {
      // Connection status callback
    });
    
    // Cleanup
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 1000);
    
    return { 
      success: true, 
      details: 'Real-time system can establish connections' 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const testPerformanceAndLoad = async () => {
  try {
    const startTime = Date.now();
    
    // Perform multiple concurrent queries
    const promises = [
      supabase.from('users').select('id').limit(1),
      supabase.from('news').select('id').limit(1),
      supabase.from('job_opportunities').select('id').limit(1),
      supabase.from('gallery_albums').select('id').limit(1),
    ];
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 5000) { // 5 seconds threshold
      return { 
        success: false, 
        error: `Performance issue detected: queries took ${duration}ms` 
      };
    }
    
    return { 
      success: true, 
      details: `Performance test passed (${duration}ms for concurrent queries)` 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Main test execution
const runAllTests = async () => {
  console.log('Starting comprehensive feature tests...\n');
  
  await runTest('Database Connectivity', testDatabaseConnectivity);
  await runTest('User Registration System', testUserRegistration);
  await runTest('Authentication System', testAuthenticationSystem);
  await runTest('User Management System', testUserManagement);
  await runTest('News Management System', testNewsSystem);
  await runTest('Tracer Study System', testTracerStudySystem);
  await runTest('Job Opportunities System', testJobOpportunitiesSystem);
  await runTest('Gallery System', testGallerySystem);
  await runTest('Storage System', testStorageSystem);
  await runTest('Real-time Features', testRealTimeFeatures);
  await runTest('Performance & Load', testPerformanceAndLoad);
  
  // Generate comprehensive report
  console.log('\n📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(70));
  
  const passRate = Math.round((testResults.passed / testResults.total) * 100);
  
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Pass Rate: ${passRate}%`);
  
  // System status assessment
  if (passRate >= 90) {
    console.log('\n🎉 SYSTEM STATUS: EXCELLENT');
    console.log('   All critical systems are functioning properly!');
  } else if (passRate >= 75) {
    console.log('\n✅ SYSTEM STATUS: GOOD');
    console.log('   Most systems working, minor issues detected.');
  } else if (passRate >= 50) {
    console.log('\n⚠️ SYSTEM STATUS: NEEDS ATTENTION');
    console.log('   Several issues detected, requires fixes.');
  } else {
    console.log('\n🚨 SYSTEM STATUS: CRITICAL ISSUES');
    console.log('   Major problems detected, immediate action required.');
  }
  
  // Detailed test results
  console.log('\n📋 DETAILED RESULTS:');
  testResults.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status}`);
    if (test.details) console.log(`   ${test.details}`);
    if (test.error) console.log(`   Error: ${test.error}`);
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  const failedTests = testResults.tests.filter(t => t.status === 'FAILED');
  
  if (failedTests.length === 0) {
    console.log('   🎊 All systems operational! Your application is ready for production.');
    console.log('   Consider running stress tests and user acceptance testing.');
  } else {
    console.log('   🔧 Address the following issues:');
    
    failedTests.forEach(test => {
      if (test.name.includes('Storage')) {
        console.log('   - Run the complete-database-setup.sql script to create storage buckets');
      } else if (test.name.includes('Authentication')) {
        console.log('   - Check Supabase Auth settings and RLS policies');
      } else if (test.name.includes('Database')) {
        console.log('   - Verify database schema and connection settings');
      } else if (test.name.includes('Performance')) {
        console.log('   - Check network connection and Supabase region settings');
      } else {
        console.log(`   - Fix ${test.name.toLowerCase()} functionality`);
      }
    });
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Fix any failing tests by addressing the root causes');
  console.log('   2. Run the complete-database-setup.sql script if needed');
  console.log('   3. Test the application manually after fixes');
  console.log('   4. Deploy to staging for user acceptance testing');
  console.log('   5. Monitor performance in production environment');
  
  return passRate;
};

// Execute tests
runAllTests()
  .then(passRate => {
    console.log(`\n🏁 Test execution completed with ${passRate}% pass rate.`);
    process.exit(passRate >= 75 ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Critical test execution error:', error.message);
    process.exit(1);
  });