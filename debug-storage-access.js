/**
 * Debug Storage Access Script
 * This script helps diagnose storage bucket access issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 Storage Access Debug Script');
console.log('='.repeat(40));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing Supabase configuration!');
  process.exit(1);
}

console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Using anon key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugStorageAccess() {
  try {
    console.log('\n🔍 Testing storage.listBuckets()...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    console.log('\n📊 RAW RESPONSE:');
    console.log('Data:', JSON.stringify(buckets, null, 2));
    console.log('Error:', JSON.stringify(error, null, 2));
    
    if (error) {
      console.log('\n❌ ERROR DETAILS:');
      console.log(`Message: ${error.message}`);
      console.log(`Code: ${error.code || 'N/A'}`);
      console.log(`Status: ${error.status || 'N/A'}`);
      console.log(`Details: ${error.details || 'N/A'}`);
      console.log(`Hint: ${error.hint || 'N/A'}`);
      
      if (error.message.includes('permission')) {
        console.log('\n💡 DIAGNOSIS: Permission issue detected');
        console.log('   The anon key might not have permission to list storage buckets');
      }
    } else {
      console.log('\n✅ SUCCESS:');
      console.log(`Found ${buckets?.length || 0} buckets:`);
      if (buckets && buckets.length > 0) {
        buckets.forEach((bucket, index) => {
          console.log(`   ${index + 1}. ${bucket.name || bucket.id} (${bucket.public ? 'public' : 'private'})`);
        });
      } else {
        console.log('   No buckets returned (this might be due to RLS policies)');
      }
    }
    
  } catch (err) {
    console.log('\n💥 UNEXPECTED ERROR:');
    console.log(`Type: ${err.constructor.name}`);
    console.log(`Message: ${err.message}`);
    console.log(`Stack: ${err.stack}`);
  }
}

async function testStorageOperations() {
  console.log('\n🧪 Testing other storage operations...');
  
  // Test 1: Try to access a specific bucket
  try {
    console.log('\n📁 Testing bucket access (alumni-profiles)...');
    const { data, error } = await supabase.storage
      .from('alumni-profiles')
      .list('', { limit: 1 });
    
    if (error) {
      console.log(`❌ Bucket access failed: ${error.message}`);
    } else {
      console.log(`✅ Bucket accessible, found ${data?.length || 0} items`);
    }
  } catch (err) {
    console.log(`❌ Bucket access error: ${err.message}`);
  }
  
  // Test 2: Check if we can get bucket info another way
  try {
    console.log('\n🔍 Testing direct storage query...');
    const { data, error } = await supabase
      .from('storage.buckets')
      .select('id, name, public');
    
    if (error) {
      console.log(`❌ Direct query failed: ${error.message}`);
    } else {
      console.log(`✅ Direct query succeeded, found ${data?.length || 0} buckets`);
      if (data && data.length > 0) {
        data.forEach((bucket, index) => {
          console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
      }
    }
  } catch (err) {
    console.log(`❌ Direct query error: ${err.message}`);
  }
}

async function main() {
  try {
    await debugStorageAccess();
    await testStorageOperations();
    
    console.log('\n📝 SUMMARY:');
    console.log('   If buckets exist in dashboard but not accessible via API,');
    console.log('   this indicates an RLS (Row Level Security) policy issue.');
    console.log('   The storage buckets exist but the anon key cannot see them.');
    
  } catch (error) {
    console.error('\n💥 Critical error:', error.message);
    process.exit(1);
  }
}

main();