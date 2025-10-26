// Test Profile Update Functionality
// This script helps debug the profile update issues

import supabase from './src/config/supabaseClient.js';

// Test function to check profile update
async function testProfileUpdate() {
    console.log('🔍 Testing Profile Update Functionality...');
    
    try {
        // First, check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.error('❌ Authentication Error:', authError);
            return;
        }
        
        if (!user) {
            console.log('⚠️ No authenticated user found. Please log in first.');
            return;
        }
        
        console.log('✅ User authenticated:', user.email);
        
        // Check current profile data
        const { data: currentProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('❌ Error fetching current profile:', fetchError);
            return;
        }
        
        console.log('📋 Current profile data:', currentProfile);
        
        // Test updating postal code and date of birth
        const testData = {
            user_id: user.id,
            postal_code: '1234',
            date_of_birth: '1990-01-01',
            updated_at: new Date().toISOString()
        };
        
        console.log('🔄 Attempting to update profile with test data:', testData);
        
        const { data: updateResult, error: updateError } = await supabase
            .from('user_profiles')
            .upsert(testData, { onConflict: 'user_id' })
            .select();
            
        if (updateError) {
            console.error('❌ Update Error:', updateError);
            console.error('Error Details:', {
                message: updateError.message,
                details: updateError.details,
                hint: updateError.hint,
                code: updateError.code
            });
            return;
        }
        
        console.log('✅ Profile updated successfully:', updateResult);
        
        // Verify the update
        const { data: verifyProfile, error: verifyError } = await supabase
            .from('user_profiles')
            .select('postal_code, date_of_birth')
            .eq('user_id', user.id)
            .single();
            
        if (verifyError) {
            console.error('❌ Verification Error:', verifyError);
            return;
        }
        
        console.log('✅ Verification successful:', verifyProfile);
        
        if (verifyProfile.postal_code === '1234' && verifyProfile.date_of_birth === '1990-01-01') {
            console.log('🎉 All tests passed! Postal code and date of birth can be updated.');
        } else {
            console.log('⚠️ Update may not have worked as expected.');
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Test database schema
async function testDatabaseSchema() {
    console.log('🔍 Testing Database Schema...');
    
    try {
        // Check if the columns exist by attempting a select
        const { data, error } = await supabase
            .from('user_profiles')
            .select('postal_code, date_of_birth')
            .limit(1);
            
        if (error) {
            console.error('❌ Schema Error:', error);
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                console.log('💡 Solution: Run the fix_profile_editing.sql script to add missing columns.');
            }
            return;
        }
        
        console.log('✅ Columns postal_code and date_of_birth exist in the database');
        
    } catch (error) {
        console.error('💥 Unexpected schema error:', error);
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Profile Update Tests...\n');
    
    await testDatabaseSchema();
    console.log('\n---\n');
    await testProfileUpdate();
    
    console.log('\n✨ Tests completed.');
}

// Run tests
runTests();