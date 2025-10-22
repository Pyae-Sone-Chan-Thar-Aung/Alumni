// Test Storage Bucket
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testStorageBucket() {
  console.log('🗄️ Testing Alumni Profiles Storage Bucket...\n');

  try {
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError.message);
      return;
    }

    console.log('📋 Available buckets:', buckets.map(b => b.name));
    
    // Check for alumni-profiles bucket
    const alumniProfilesBucket = buckets.find(b => b.name === 'alumni-profiles');
    
    if (alumniProfilesBucket) {
      console.log('✅ Alumni profiles bucket found!');
      console.log('📂 Bucket details:', {
        name: alumniProfilesBucket.name,
        public: alumniProfilesBucket.public,
        created_at: alumniProfilesBucket.created_at
      });

      // Test upload capability (create a small test file)
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('alumni-profiles')
        .upload(testFileName, testFile);

      if (uploadError) {
        console.log('⚠️ Upload test failed:', uploadError.message);
        console.log('💡 You may need to set up storage policies');
      } else {
        console.log('✅ Upload test successful!');
        
        // Clean up test file
        await supabase.storage
          .from('alumni-profiles')
          .remove([testFileName]);
        
        console.log('🧹 Test file cleaned up');
      }

      console.log('\n🎉 Storage bucket is ready for profile images!');
      
    } else {
      console.log('❌ Alumni profiles bucket not found');
      console.log('💡 Make sure you created the bucket with name: alumni-profiles');
    }

  } catch (error) {
    console.log('❌ Error testing storage:', error.message);
  }
}

testStorageBucket();
