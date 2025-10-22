// Test Database Fixes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testDatabaseFixes() {
  console.log('🔧 Testing Database Schema Fixes...\n');

  const tests = [];

  // Test 1: Gallery functionality
  console.log('📸 Testing Gallery...');
  try {
    const { data: albums, error: albumsError } = await supabase
      .from('gallery_albums')
      .select(`
        id, title, description, cover_image_url,
        gallery_images (
          id, title, image_url, display_order
        )
      `)
      .eq('is_public', true);

    if (albumsError) {
      console.log('❌ Gallery test failed:', albumsError.message);
      tests.push({ name: 'Gallery', status: 'FAILED', error: albumsError.message });
    } else {
      console.log(`✅ Gallery test passed - Found ${albums.length} albums`);
      tests.push({ name: 'Gallery', status: 'PASSED', count: albums.length });
    }
  } catch (error) {
    console.log('❌ Gallery test error:', error.message);
    tests.push({ name: 'Gallery', status: 'ERROR', error: error.message });
  }

  // Test 2: News functionality
  console.log('\n📰 Testing News...');
  try {
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('*')
      .eq('is_published', true);

    if (newsError) {
      console.log('❌ News test failed:', newsError.message);
      tests.push({ name: 'News', status: 'FAILED', error: newsError.message });
    } else {
      console.log(`✅ News test passed - Found ${news.length} articles`);
      tests.push({ name: 'News', status: 'PASSED', count: news.length });
    }
  } catch (error) {
    console.log('❌ News test error:', error.message);
    tests.push({ name: 'News', status: 'ERROR', error: error.message });
  }

  // Test 3: Job opportunities
  console.log('\n💼 Testing Job Opportunities...');
  try {
    const { data: jobs, error: jobsError } = await supabase
      .from('job_opportunities')
      .select('*')
      .eq('is_active', true);

    if (jobsError) {
      console.log('❌ Jobs test failed:', jobsError.message);
      tests.push({ name: 'Jobs', status: 'FAILED', error: jobsError.message });
    } else {
      console.log(`✅ Jobs test passed - Found ${jobs.length} opportunities`);
      tests.push({ name: 'Jobs', status: 'PASSED', count: jobs.length });
    }
  } catch (error) {
    console.log('❌ Jobs test error:', error.message);
    tests.push({ name: 'Jobs', status: 'ERROR', error: error.message });
  }

  // Test 4: Tracer study
  console.log('\n📊 Testing Tracer Study...');
  try {
    const { data: responses, error: tracerError } = await supabase
      .from('tracer_study_responses')
      .select('first_name, last_name, graduation_year, employment_status');

    if (tracerError) {
      console.log('❌ Tracer study test failed:', tracerError.message);
      tests.push({ name: 'Tracer Study', status: 'FAILED', error: tracerError.message });
    } else {
      console.log(`✅ Tracer study test passed - Found ${responses.length} responses`);
      tests.push({ name: 'Tracer Study', status: 'PASSED', count: responses.length });
    }
  } catch (error) {
    console.log('❌ Tracer study test error:', error.message);
    tests.push({ name: 'Tracer Study', status: 'ERROR', error: error.message });
  }

  // Test 5: Users management
  console.log('\n👥 Testing Users Management...');
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id, email, role, status,
        user_profiles (
          first_name, last_name, program
        )
      `)
      .limit(5);

    if (usersError) {
      console.log('❌ Users test failed:', usersError.message);
      tests.push({ name: 'Users', status: 'FAILED', error: usersError.message });
    } else {
      console.log(`✅ Users test passed - Found ${users.length} users`);
      tests.push({ name: 'Users', status: 'PASSED', count: users.length });
    }
  } catch (error) {
    console.log('❌ Users test error:', error.message);
    tests.push({ name: 'Users', status: 'ERROR', error: error.message });
  }

  // Test 6: Check specific columns
  console.log('\n🔍 Testing Column Existence...');
  try {
    // Test display_order column
    const { data: imageWithOrder, error: orderError } = await supabase
      .from('gallery_images')
      .select('id, display_order')
      .limit(1);

    if (orderError) {
      console.log('❌ display_order column test failed:', orderError.message);
      tests.push({ name: 'display_order column', status: 'FAILED', error: orderError.message });
    } else {
      console.log('✅ display_order column exists');
      tests.push({ name: 'display_order column', status: 'PASSED' });
    }
  } catch (error) {
    console.log('❌ Column test error:', error.message);
    tests.push({ name: 'display_order column', status: 'ERROR', error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🧪 DATABASE FIXES TEST RESULTS');
  console.log('='.repeat(50));

  const passed = tests.filter(t => t.status === 'PASSED').length;
  const failed = tests.filter(t => t.status === 'FAILED').length;
  const errors = tests.filter(t => t.status === 'ERROR').length;

  tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
    const extra = test.count !== undefined ? ` (${test.count} items)` : '';
    const errorMsg = test.error ? ` - ${test.error}` : '';
    console.log(`${icon} ${test.name}${extra}${errorMsg}`);
  });

  console.log('\n📊 Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);

  if (failed === 0 && errors === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your database schema is fixed!');
    console.log('\n🚀 You can now:');
    console.log('   - Visit the Gallery page');
    console.log('   - Use Manage Users in admin dashboard');
    console.log('   - View and manage News');
    console.log('   - Post Job Opportunities');
    console.log('   - View Tracer Study data');
  } else {
    console.log('\n⚠️  Some issues remain. Please:');
    console.log('   1. Run the fix-database-schema-issues.sql script');
    console.log('   2. Check your database permissions');
    console.log('   3. Verify your environment variables');
  }
}

testDatabaseFixes().catch(console.error);
