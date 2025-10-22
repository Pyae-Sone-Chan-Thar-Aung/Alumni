/**
 * Create Storage Buckets using SQL Insert
 * Alternative approach using direct SQL inserts to storage.buckets table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 UIC Alumni Portal - Storage Bucket Creation (SQL Method)');
console.log('='.repeat(60));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const bucketInsertSQL = `
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('alumni-profiles', 'alumni-profiles', true),
  ('gallery-images', 'gallery-images', true),
  ('news-images', 'news-images', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;
`;

async function createBucketsWithSQL() {
  try {
    console.log('\n🔍 Attempting to create storage buckets using SQL...');
    
    // Try to execute SQL directly
    const { data, error } = await supabase.rpc('sql', {
      query: bucketInsertSQL
    });
    
    if (error) {
      console.log(`❌ SQL execution failed: ${error.message}`);
      
      // Try alternative method - check if buckets exist first
      console.log('\n🔄 Trying alternative approach...');
      return await checkAndReportBuckets();
    }
    
    console.log('✅ SQL execution successful');
    return true;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return await checkAndReportBuckets();
  }
}

async function checkAndReportBuckets() {
  try {
    console.log('\n🔍 Checking current bucket status...');
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`❌ Cannot access storage buckets: ${error.message}`);
      return false;
    }
    
    const requiredBuckets = ['alumni-profiles', 'gallery-images', 'news-images', 'documents'];
    const existingBuckets = buckets.map(b => b.name);
    const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
    
    console.log(`\n📊 BUCKET STATUS:`);
    console.log(`✅ Existing buckets (${existingBuckets.length}): ${existingBuckets.join(', ') || 'none'}`);
    console.log(`❌ Missing buckets (${missingBuckets.length}): ${missingBuckets.join(', ') || 'none'}`);
    
    if (missingBuckets.length === 0) {
      console.log('\n🎉 All required storage buckets exist!');
      return true;
    } else {
      console.log('\n⚠️ Some buckets are missing.');
      console.log('\n📝 MANUAL STEPS REQUIRED:');
      console.log('   You need to create the missing buckets manually in your Supabase dashboard:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/sgalzbhfpydwnvprxrln/storage/buckets');
      console.log('   2. Create the following buckets:');
      
      missingBuckets.forEach(bucket => {
        const isPublic = bucket !== 'documents';
        console.log(`      - ${bucket} (public: ${isPublic})`);
      });
      
      console.log('\n   OR run this SQL in your Supabase SQL editor:');
      console.log('   ```sql');
      console.log('   INSERT INTO storage.buckets (id, name, public)');
      console.log('   VALUES');
      requiredBuckets.forEach((bucket, index) => {
        const isPublic = bucket !== 'documents';
        const comma = index < requiredBuckets.length - 1 ? ',' : '';
        console.log(`     ('${bucket}', '${bucket}', ${isPublic})${comma}`);
      });
      console.log('   ON CONFLICT (id) DO NOTHING;');
      console.log('   ```');
      
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error checking buckets: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('\n🚀 Starting bucket creation process...\n');
    
    const success = await createBucketsWithSQL();
    
    if (success) {
      console.log('\n🎊 Storage buckets are ready!');
      console.log('\n📝 Next steps:');
      console.log('   1. Run the test suite: node test-all-features.js');
      console.log('   2. Verify the Storage System test passes');
    } else {
      console.log('\n⚠️ Manual intervention required to create storage buckets.');
      console.log('   Follow the instructions above to create them manually.');
    }
    
  } catch (error) {
    console.error('\n💥 Critical error:', error.message);
    process.exit(1);
  }
}

main();