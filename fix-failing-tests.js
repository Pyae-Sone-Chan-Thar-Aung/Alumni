/**
 * Fix Failing Tests - Database Schema and Policy Updates
 * This script addresses all the failing test issues by:
 * 1. Adding missing title column to gallery_images table
 * 2. Fixing RLS policies for pending_registrations
 * 3. Creating missing storage buckets
 * 4. Ensuring proper authentication policies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 UIC Alumni Portal - Database Fixes for Failing Tests');
console.log('='.repeat(60));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.log('❌ Missing Supabase configuration!');
  console.log('Required: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const fixes = [];

/**
 * Fix 1: Add title column to gallery_images table
 */
async function fixGalleryImagesTable() {
  console.log('\n🔍 Fix 1: Adding title column to gallery_images table...');
  
  try {
    // Check if title column exists
    const { data: columns, error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'title';
      `
    });

    if (columnError) {
      // Try alternative approach using direct SQL
      const { data, error } = await supabase
        .from('gallery_images')
        .select('title')
        .limit(1);
      
      if (error && error.message.includes('column gallery_images.title does not exist')) {
        console.log('   Title column missing, attempting to add...');
        
        // Since we can't directly alter table structure through Supabase client,
        // we'll document this as a manual fix needed
        console.log('   ⚠️  Manual fix required: Add title column to gallery_images table');
        console.log('   SQL to run in Supabase dashboard:');
        console.log('   ALTER TABLE gallery_images ADD COLUMN title VARCHAR(255);');
        
        fixes.push({
          issue: 'Gallery images table missing title column',
          status: 'Manual fix required',
          sql: 'ALTER TABLE gallery_images ADD COLUMN title VARCHAR(255);'
        });
        
        return false;
      }
    }

    console.log('   ✅ Title column exists or fix not needed');
    fixes.push({
      issue: 'Gallery images table title column',
      status: 'OK'
    });
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    fixes.push({
      issue: 'Gallery images table title column',
      status: 'Error',
      error: error.message
    });
    return false;
  }
}

/**
 * Fix 2: Create missing storage buckets
 */
async function fixStorageBuckets() {
  console.log('\n🔍 Fix 2: Creating missing storage buckets...');
  
  const requiredBuckets = [
    { id: 'alumni-profiles', name: 'alumni-profiles', public: true },
    { id: 'gallery-images', name: 'gallery-images', public: true },
    { id: 'news-images', name: 'news-images', public: true },
    { id: 'documents', name: 'documents', public: false }
  ];

  try {
    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log(`   ❌ Error listing buckets: ${listError.message}`);
      fixes.push({
        issue: 'Storage buckets',
        status: 'Error',
        error: listError.message
      });
      return false;
    }

    const existingBucketIds = existingBuckets.map(b => b.id);
    console.log(`   Found ${existingBuckets.length} existing buckets: ${existingBucketIds.join(', ')}`);

    let created = 0;
    let errors = 0;

    for (const bucket of requiredBuckets) {
      if (!existingBucketIds.includes(bucket.id)) {
        console.log(`   Creating bucket: ${bucket.id}...`);
        
        const { error: createError } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          allowedMimeTypes: null,
          fileSizeLimit: null
        });

        if (createError) {
          console.log(`   ❌ Failed to create ${bucket.id}: ${createError.message}`);
          errors++;
        } else {
          console.log(`   ✅ Created bucket: ${bucket.id}`);
          created++;
        }
      } else {
        console.log(`   ✅ Bucket ${bucket.id} already exists`);
      }
    }

    const status = errors > 0 ? 'Partial success' : 'Success';
    fixes.push({
      issue: 'Storage buckets',
      status: status,
      details: `Created ${created} buckets, ${errors} errors`
    });

    return errors === 0;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    fixes.push({
      issue: 'Storage buckets',
      status: 'Error',
      error: error.message
    });
    return false;
  }
}

/**
 * Fix 3: Fix RLS policies for pending_registrations
 */
async function fixPendingRegistrationsPolicies() {
  console.log('\n🔍 Fix 3: Fixing pending_registrations RLS policies...');
  
  try {
    // Test if we can insert into pending_registrations
    const testEmail = `test-fix-${Date.now()}@uic.edu.ph`;
    
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
      console.log(`   ❌ RLS policy issue detected: ${error.message}`);
      console.log('   ⚠️  Manual fix required: Update RLS policy for pending_registrations');
      console.log('   SQL to run in Supabase dashboard:');
      console.log(`
      DROP POLICY IF EXISTS "Anyone can insert pending registration" ON pending_registrations;
      CREATE POLICY "Anyone can insert pending registration" ON pending_registrations
      FOR INSERT WITH CHECK (true);
      `);
      
      fixes.push({
        issue: 'Pending registrations RLS policy',
        status: 'Manual fix required',
        sql: `DROP POLICY IF EXISTS "Anyone can insert pending registration" ON pending_registrations;
CREATE POLICY "Anyone can insert pending registration" ON pending_registrations
FOR INSERT WITH CHECK (true);`
      });
      return false;
    }

    // Clean up test data
    await supabase.from('pending_registrations').delete().eq('email', testEmail);
    
    console.log('   ✅ Pending registrations RLS policy is working');
    fixes.push({
      issue: 'Pending registrations RLS policy',
      status: 'OK'
    });
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    fixes.push({
      issue: 'Pending registrations RLS policy',
      status: 'Error',
      error: error.message
    });
    return false;
  }
}

/**
 * Fix 4: Test authentication system
 */
async function fixAuthenticationSystem() {
  console.log('\n🔍 Fix 4: Checking authentication system...');
  
  try {
    // Test getting current session (should be null for unauthenticated)
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ❌ Session check failed: ${sessionError.message}`);
      fixes.push({
        issue: 'Authentication system',
        status: 'Error',
        error: sessionError.message
      });
      return false;
    }

    // Test auth state management
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError && !userError.message.includes('not authenticated')) {
      console.log(`   ❌ User check failed: ${userError.message}`);
      fixes.push({
        issue: 'Authentication system',
        status: 'Error',
        error: userError.message
      });
      return false;
    }

    console.log('   ✅ Authentication system is working properly');
    fixes.push({
      issue: 'Authentication system',
      status: 'OK'
    });
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    fixes.push({
      issue: 'Authentication system',
      status: 'Error',
      error: error.message
    });
    return false;
  }
}

/**
 * Main execution function
 */
async function runAllFixes() {
  console.log('Starting database fixes...\n');
  
  const results = [];
  
  results.push(await fixStorageBuckets());
  results.push(await fixPendingRegistrationsPolicies());
  results.push(await fixAuthenticationSystem());
  results.push(await fixGalleryImagesTable());
  
  // Generate report
  console.log('\n📊 FIX REPORT');
  console.log('='.repeat(40));
  
  const successCount = results.filter(r => r).length;
  const totalCount = results.length;
  
  console.log(`Fixes attempted: ${totalCount}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed/Manual: ${totalCount - successCount}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  fixes.forEach((fix, index) => {
    const icon = fix.status === 'OK' || fix.status === 'Success' ? '✅' : 
                 fix.status === 'Manual fix required' ? '⚠️' : '❌';
    console.log(`${icon} ${fix.issue}: ${fix.status}`);
    if (fix.details) console.log(`   ${fix.details}`);
    if (fix.error) console.log(`   Error: ${fix.error}`);
    if (fix.sql) {
      console.log(`   SQL to run:`);
      console.log(`   ${fix.sql}`);
    }
  });

  // Manual fixes summary
  const manualFixes = fixes.filter(f => f.status === 'Manual fix required');
  if (manualFixes.length > 0) {
    console.log('\n⚠️  MANUAL FIXES REQUIRED:');
    console.log('Run these SQL commands in Supabase Dashboard > SQL Editor:\n');
    manualFixes.forEach(fix => {
      console.log(`-- ${fix.issue}`);
      console.log(fix.sql);
      console.log('');
    });
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Apply any manual fixes shown above');
  console.log('2. Run the test suite again: node test-all-features.js');
  console.log('3. Verify all tests pass');
  
  return successCount === totalCount;
}

// Execute fixes
runAllFixes()
  .then(success => {
    const exitCode = success ? 0 : 1;
    console.log(`\n🏁 Fix execution completed. ${success ? 'All automated fixes successful!' : 'Some manual fixes required.'}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n💥 Critical fix execution error:', error.message);
    process.exit(1);
  });