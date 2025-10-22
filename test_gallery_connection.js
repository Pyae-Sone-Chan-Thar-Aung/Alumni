// Test script to verify gallery functionality
// Run this with: node test_gallery_connection.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGalleryConnection() {
  console.log('🧪 Testing Gallery Connection...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Testing table access...');
    const { data: albums, error: albumError } = await supabase
      .from('gallery_albums')
      .select('id')
      .limit(1);
    
    if (albumError) {
      console.error('❌ Error accessing gallery_albums table:', albumError.message);
      return;
    }
    console.log('✅ gallery_albums table accessible');

    const { data: images, error: imageError } = await supabase
      .from('gallery_images')
      .select('id')
      .limit(1);
    
    if (imageError) {
      console.error('❌ Error accessing gallery_images table:', imageError.message);
      return;
    }
    console.log('✅ gallery_images table accessible');

    // Test 2: Fetch albums like the Gallery component does
    console.log('\n2️⃣ Testing gallery query (same as Gallery.js)...');
    const { data: galleryData, error: galleryError } = await supabase
      .from('gallery_albums')
      .select(`
        *,
        gallery_images (id, image_url, caption, display_order)
      `)
      .eq('is_published', true)
      .order('event_date', { ascending: false });

    if (galleryError) {
      console.error('❌ Gallery query failed:', galleryError.message);
      console.error('Error details:', galleryError);
      return;
    }

    console.log(`✅ Gallery query successful! Found ${galleryData?.length || 0} albums`);
    
    if (galleryData && galleryData.length > 0) {
      console.log('\n📋 Albums found:');
      galleryData.forEach((album, index) => {
        console.log(`  ${index + 1}. ${album.title} (${album.gallery_images?.length || 0} images)`);
        console.log(`     Date: ${album.event_date || 'No date'}`);
        console.log(`     Published: ${album.is_published ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No albums found. You may need to run the fix_gallery_issue.sql script.');
    }

    // Test 3: Check permissions by trying a simple count
    console.log('3️⃣ Testing permissions...');
    const { count, error: countError } = await supabase
      .from('gallery_albums')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Permission test failed:', countError.message);
      return;
    }
    
    console.log(`✅ Permission test passed. Total albums: ${count}`);

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testGalleryConnection().then(() => {
  console.log('\n🏁 Gallery connection test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
});