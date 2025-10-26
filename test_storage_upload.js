// Test Storage Upload for Alumni Profile Images
// Run this in browser console while logged in as an alumni user

async function testStorageUpload() {
    console.log('🧪 Testing Storage Upload Permissions...');
    
    try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error('❌ Authentication error:', authError);
            return;
        }
        
        console.log('✅ User authenticated:', user.email, 'ID:', user.id);
        
        // Test creating a simple text file to upload
        const testContent = 'Test upload from alumni profile';
        const testFile = new Blob([testContent], { type: 'text/plain' });
        const fileName = `test_${Date.now()}.txt`;
        const filePath = `${user.id}/${fileName}`;
        
        console.log('📤 Attempting to upload test file:', filePath);
        
        // Test upload
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('alumni-profiles')
            .upload(filePath, testFile, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (uploadError) {
            console.error('❌ Upload failed:', uploadError);
            console.error('Error details:', {
                message: uploadError.message,
                statusCode: uploadError.statusCode,
                error: uploadError.error
            });
            return;
        }
        
        console.log('✅ Upload successful:', uploadData);
        
        // Test getting public URL
        const { data: { publicUrl } } = supabase.storage
            .from('alumni-profiles')
            .getPublicUrl(filePath);
        
        console.log('✅ Public URL generated:', publicUrl);
        
        // Test profile update
        console.log('📝 Testing profile update...');
        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: user.id,
                profile_image_url: publicUrl,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        
        if (profileError) {
            console.error('❌ Profile update failed:', profileError);
            console.error('Profile error details:', {
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
                code: profileError.code
            });
            return;
        }
        
        console.log('✅ Profile update successful!');
        
        // Cleanup - delete test file
        const { error: deleteError } = await supabase.storage
            .from('alumni-profiles')
            .remove([filePath]);
        
        if (deleteError) {
            console.warn('⚠️ Could not delete test file:', deleteError);
        } else {
            console.log('🧹 Test file cleaned up');
        }
        
        console.log('🎉 All tests passed! Image upload should work.');
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Also test bucket policies
async function testBucketPolicies() {
    console.log('🔒 Testing Bucket Access...');
    
    try {
        // Test bucket access
        const { data: bucketData, error: bucketError } = await supabase.storage
            .from('alumni-profiles')
            .list('', { limit: 1 });
        
        if (bucketError) {
            console.error('❌ Bucket access error:', bucketError);
        } else {
            console.log('✅ Bucket accessible:', bucketData);
        }
        
    } catch (error) {
        console.error('💥 Bucket test error:', error);
    }
}

console.log('Run testStorageUpload() to test file upload');
console.log('Run testBucketPolicies() to test bucket access');