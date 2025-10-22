/**
 * Fix Storage Buckets Script
 * Creates the missing storage buckets required for the UIC Alumni Portal
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 UIC Alumni Portal - Storage Bucket Fix Script');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing Supabase configuration!');
  console.log('Required: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const requiredBuckets = [
  { id: 'alumni-profiles', name: 'alumni-profiles', public: true },
  { id: 'gallery-images', name: 'gallery-images', public: true },
  { id: 'news-images', name: 'news-images', public: true },
  { id: 'documents', name: 'documents', public: false }
];

async function createStorageBuckets() {
  try {
    console.log('\n🔍 Checking existing storage buckets...');
    
    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log(`❌ Error listing buckets: ${listError.message}`);
      return false;
    }
    
    const existingBucketNames = existingBuckets.map(b => b.name);
    console.log(`Found ${existingBuckets.length} existing buckets: ${existingBucketNames.join(', ')}`);
    
    // Create missing buckets
    let bucketsCreated = 0;
    let bucketsAlreadyExist = 0;
    
    for (const bucket of requiredBuckets) {
      if (existingBucketNames.includes(bucket.name)) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        bucketsAlreadyExist++;
        continue;
      }
      
      console.log(`🔨 Creating bucket '${bucket.name}'...`);
      
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        allowedMimeTypes: bucket.name.includes('images') ? 
          ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] : 
          undefined,
        fileSizeLimit: bucket.name === 'documents' ? 10485760 : 5242880 // 10MB for docs, 5MB for images
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Bucket '${bucket.name}' already exists`);
          bucketsAlreadyExist++;
        } else {
          console.log(`❌ Error creating bucket '${bucket.name}': ${error.message}`);
          return false;
        }
      } else {
        console.log(`✅ Successfully created bucket '${bucket.name}'`);
        bucketsCreated++;
      }
    }
    
    console.log('\n📊 BUCKET CREATION SUMMARY:');
    console.log(`✅ Buckets created: ${bucketsCreated}`);
    console.log(`ℹ️  Buckets already existed: ${bucketsAlreadyExist}`);
    console.log(`📋 Total required buckets: ${requiredBuckets.length}`);
    
    if (bucketsCreated + bucketsAlreadyExist === requiredBuckets.length) {
      console.log('\n🎉 All required storage buckets are now available!');
      return true;
    } else {
      console.log('\n⚠️ Some buckets may be missing. Please check manually.');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    return false;
  }
}

async function verifyStorageBuckets() {
  try {
    console.log('\n🧪 Verifying storage bucket configuration...');
    
    // List all buckets again to verify
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`❌ Verification failed: ${error.message}`);
      return false;
    }
    
    const bucketNames = buckets.map(b => b.name);
    const missingBuckets = requiredBuckets.filter(rb => !bucketNames.includes(rb.name));
    
    if (missingBuckets.length === 0) {
      console.log('✅ All required storage buckets verified successfully!');
      console.log(`📋 Available buckets: ${bucketNames.join(', ')}`);
      return true;
    } else {
      console.log(`❌ Missing buckets: ${missingBuckets.map(b => b.name).join(', ')}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Verification error: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('\n🚀 Starting storage bucket fix process...\n');
    
    // Step 1: Create missing buckets
    const bucketsCreated = await createStorageBuckets();
    
    if (!bucketsCreated) {
      console.log('\n❌ Failed to create storage buckets. Exiting...');
      process.exit(1);
    }
    
    // Step 2: Verify all buckets exist
    const bucketsVerified = await verifyStorageBuckets();
    
    if (!bucketsVerified) {
      console.log('\n❌ Storage bucket verification failed. Exiting...');
      process.exit(1);
    }
    
    console.log('\n🎊 Storage system fix completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run the test suite again: node test-all-features.js');
    console.log('   2. Verify the Storage System test now passes');
    console.log('   3. Test file upload functionality in the application');
    
  } catch (error) {
    console.error('\n💥 Critical error in main execution:', error.message);
    process.exit(1);
  }
}

// Execute the fix
main();