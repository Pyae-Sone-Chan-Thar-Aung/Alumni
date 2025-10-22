// Create Admin User Script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function createAdminUser() {
  console.log('👨‍💼 Creating Admin User Account...\n');

  const adminEmail = 'paung_230000001724@uic.edu.ph';
  const adminPassword = 'UICalumni2025';

  try {
    // Step 1: Create user with Supabase Auth
    console.log('🔐 Creating authentication account...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authError) {
      console.log('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Authentication account created successfully');
    console.log('   User ID:', authData.user.id);

    // Step 2: Insert into users table
    console.log('👤 Creating user record...');
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        role: 'admin',
        status: 'approved',
        email_verified: true,
        created_at: new Date().toISOString(),
        last_login: null
      });

    if (userError) {
      console.log('❌ Error creating user record:', userError.message);
      return;
    }

    console.log('✅ User record created successfully');

    // Step 3: Create admin profile
    console.log('📝 Creating admin profile...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        first_name: 'Admin',
        last_name: 'User',
        program: 'System Administrator',
        graduation_year: null,
        current_job: 'System Administrator',
        company: 'UIC CCS Alumni Portal',
        phone: null,
        address: null,
        city: null,
        country: 'Philippines',
        profile_image_url: null,
        bio: 'System Administrator for CCS Alumni Portal',
        linkedin_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.log('❌ Error creating admin profile:', profileError.message);
      return;
    }

    console.log('✅ Admin profile created successfully');

    // Step 4: Verify the admin user was created
    console.log('\n🔍 Verifying admin user...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select(`
        id, email, role, status,
        user_profiles (
          first_name, last_name, current_job, company
        )
      `)
      .eq('email', adminEmail)
      .single();

    if (verifyError) {
      console.log('❌ Error verifying user:', verifyError.message);
      return;
    }

    console.log('✅ Admin user verification successful:');
    console.log('   📧 Email:', verifyUser.email);
    console.log('   👤 Role:', verifyUser.role);
    console.log('   ✅ Status:', verifyUser.status);
    console.log('   📝 Name:', verifyUser.user_profiles[0]?.first_name, verifyUser.user_profiles[0]?.last_name);
    console.log('   💼 Job:', verifyUser.user_profiles[0]?.current_job);

    console.log('\n🎉 SUCCESS! Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   📧 Email: paung_230000001724@uic.edu.ph');
    console.log('   🔑 Password: UICalumni2025');
    console.log('   👨‍💼 Role: Admin');
    console.log('\n💡 You can now login with these credentials to access the admin dashboard!');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

createAdminUser();
