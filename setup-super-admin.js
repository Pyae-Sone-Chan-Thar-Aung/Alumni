#!/usr/bin/env node

/**
 * Super Admin Setup Script
 * CCS Alumni Portal - UIC
 * 
 * This script creates the super admin user with proper Supabase Auth integration
 * Email: paung_230000001724@uic.edu.ph
 * Password: UICalumni2025
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPER_ADMIN_EMAIL = 'paung_230000001724@uic.edu.ph';
const SUPER_ADMIN_PASSWORD = 'UICalumni2025';
const SUPER_ADMIN_DATA = {
  first_name: 'Admin',
  last_name: 'User',
  role: 'super_admin',
  approval_status: 'approved',
  is_verified: true,
  is_active: true
};

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 CCS Alumni Portal - Super Admin Setup');
console.log('=========================================\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please ensure your .env file contains:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSuperAdmin() {
  try {
    console.log('👤 Creating Super Admin User...');
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Role: ${SUPER_ADMIN_DATA.role}\n`);

    // Step 1: Check if user already exists in auth
    console.log('🔍 Checking if user already exists...');
    
    // First, try to sign in to see if the user exists
    const { data: existingSession, error: signInError } = await supabase.auth.signInWithPassword({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    });

    if (existingSession?.user && !signInError) {
      console.log('✅ User already exists in Supabase Auth');
      
      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', SUPER_ADMIN_EMAIL)
        .single();

      if (!userError && userData) {
        console.log('✅ User already exists in users table');
        
        // Update role to ensure it's super_admin
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'super_admin',
            approval_status: 'approved',
            is_verified: true,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', SUPER_ADMIN_EMAIL);

        if (updateError) {
          console.error('❌ Error updating user role:', updateError.message);
        } else {
          console.log('✅ User role updated to super_admin');
        }
        
        console.log('\n🎉 Super Admin setup complete!');
        console.log('📧 You can now log in with:');
        console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
        console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
        return;
      }
    }

    // Step 2: Create new user if doesn't exist
    console.log('🆕 Creating new user account...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      options: {
        data: {
          first_name: SUPER_ADMIN_DATA.first_name,
          last_name: SUPER_ADMIN_DATA.last_name,
          role: SUPER_ADMIN_DATA.role
        }
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      
      // If user already exists, try to get their info
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  User already registered, attempting to sign in...');
        
        const { data: signInData, error: signInError2 } = await supabase.auth.signInWithPassword({
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD
        });

        if (signInError2) {
          console.error('❌ Error signing in:', signInError2.message);
          console.log('\n💡 If the password is incorrect, you may need to:');
          console.log('1. Go to your Supabase Dashboard > Authentication > Users');
          console.log('2. Find the user and reset their password');
          console.log('3. Or delete the user and run this script again');
          return;
        }

        authData.user = signInData.user;
      } else {
        throw authError;
      }
    }

    if (!authData?.user) {
      throw new Error('Failed to create or retrieve user');
    }

    console.log('✅ Auth user created/retrieved successfully');
    console.log(`   Auth ID: ${authData.user.id}`);

    // Step 3: Create or update user in our users table
    console.log('💾 Creating/updating user in database...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        auth_id: authData.user.id,
        email: SUPER_ADMIN_EMAIL,
        first_name: SUPER_ADMIN_DATA.first_name,
        last_name: SUPER_ADMIN_DATA.last_name,
        role: SUPER_ADMIN_DATA.role,
        approval_status: SUPER_ADMIN_DATA.approval_status,
        is_verified: SUPER_ADMIN_DATA.is_verified,
        is_active: SUPER_ADMIN_DATA.is_active,
        approved_at: new Date().toISOString(),
        registration_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select();

    if (userError) {
      console.error('❌ Error creating user record:', userError.message);
      throw userError;
    }

    console.log('✅ User record created/updated successfully');

    // Step 4: Create user profile
    console.log('👤 Creating user profile...');
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userData[0].id,
        first_name: SUPER_ADMIN_DATA.first_name,
        last_name: SUPER_ADMIN_DATA.last_name,
        email: SUPER_ADMIN_EMAIL,
        is_public: false, // Admin profile should be private
        allow_contact: false,
        show_email: false,
        show_phone: false,
        show_address: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (profileError) {
      console.warn('⚠️  Warning: Error creating user profile:', profileError.message);
      // Don't fail the entire process for profile creation
    } else {
      console.log('✅ User profile created successfully');
    }

    // Step 5: Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, approval_status, is_verified, is_active')
      .eq('email', SUPER_ADMIN_EMAIL)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError.message);
    } else {
      console.log('✅ Setup verification successful:');
      console.log(`   ID: ${verifyData.id}`);
      console.log(`   Email: ${verifyData.email}`);
      console.log(`   Name: ${verifyData.first_name} ${verifyData.last_name}`);
      console.log(`   Role: ${verifyData.role}`);
      console.log(`   Status: ${verifyData.approval_status}`);
      console.log(`   Verified: ${verifyData.is_verified}`);
      console.log(`   Active: ${verifyData.is_active}`);
    }

    // Success message
    console.log('\n🎉 SUPER ADMIN SETUP COMPLETED SUCCESSFULLY!');
    console.log('================================================');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log(`   Role: ${SUPER_ADMIN_DATA.role}`);
    console.log('\n🚀 You can now:');
    console.log('   1. Start your application: npm start');
    console.log('   2. Go to http://localhost:3000/login');
    console.log('   3. Login with the credentials above');
    console.log('   4. Access the admin dashboard');
    console.log('\n💡 Next Steps:');
    console.log('   - Test the login functionality');
    console.log('   - Verify admin dashboard access');
    console.log('   - Create additional users through the system');
    
  } catch (error) {
    console.error('\n❌ SETUP FAILED:', error.message);
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Ensure your database schema is properly set up');
    console.log('2. Check your Supabase project is active');
    console.log('3. Verify your .env configuration');
    console.log('4. Check Supabase Auth settings');
    console.log('\n📚 For help, check:');
    console.log('- NEW_SUPABASE_SETUP_GUIDE.md');
    console.log('- DATABASE_SETUP_INSTRUCTIONS.md');
    console.log('- Your Supabase project dashboard');
  }
}

// Run the setup
createSuperAdmin();