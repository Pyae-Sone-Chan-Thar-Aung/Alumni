// Quick debug script to check profile data
// Run this in browser console while logged in

// Check if we can fetch profile data correctly
async function debugProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.log('No user found');
        return;
    }
    
    console.log('Current user ID:', user.id);
    
    // Test direct profile fetch
    const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
    console.log('Profile data:', profileData);
    console.log('Profile error:', error);
    
    if (profileData) {
        console.log('Date of birth:', profileData.date_of_birth);
        console.log('Postal code:', profileData.postal_code);
    }
}

// Test if columns exist in database
async function testColumns() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('postal_code, date_of_birth')
        .limit(1);
        
    console.log('Column test data:', data);
    console.log('Column test error:', error);
}

console.log('Run debugProfileData() to test profile fetching');
console.log('Run testColumns() to test if columns exist');