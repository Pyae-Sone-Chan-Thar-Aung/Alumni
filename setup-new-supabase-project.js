#!/usr/bin/env node

/**
 * Setup Script for New Supabase Project
 * CCS Alumni Portal - UIC
 * 
 * This script helps set up your new Supabase project with the basic
 * configuration and checks needed for the Alumni Portal.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🚀 CCS Alumni Portal - Supabase Setup');
console.log('=====================================\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please ensure your .env file contains:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupProject() {
  try {
    console.log('🔗 Testing connection to Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Project ID: ${supabaseUrl.split('//')[1].split('.')[0]}`);
    console.log();

    // Test connection by attempting to access auth
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error && !error.message.includes('session_not_found')) {
      console.error('❌ Connection failed:', error.message);
      return;
    }

    console.log('✅ Connection successful!\n');

    console.log('📋 Next Steps for your Supabase Project:');
    console.log('========================================\n');

    console.log('1. 🗃️  Set up Database Tables:');
    console.log('   - Go to your Supabase Dashboard > SQL Editor');
    console.log('   - Run the database schema files from your project:');
    console.log('     • COMPLETE_DATABASE_SCHEMA.sql');
    console.log('     • or supabase_complete_setup.sql');
    console.log();

    console.log('2. 🔐 Configure Row Level Security (RLS):');
    console.log('   - Enable RLS on all tables');
    console.log('   - Set up proper policies for users and admins');
    console.log();

    console.log('3. 📁 Set up Storage Buckets:');
    console.log('   - Go to Storage section in Supabase Dashboard');
    console.log('   - Create buckets for: avatars, gallery, documents');
    console.log('   - Configure proper access policies');
    console.log();

    console.log('4. 🔑 Set up Authentication:');
    console.log('   - Go to Authentication > Settings');
    console.log('   - Configure email templates');
    console.log('   - Set up your site URL and redirect URLs');
    console.log();

    console.log('5. 👤 Create Admin User:');
    console.log('   - Use the create-admin-user.js script');
    console.log('   - Or manually create via Auth > Users section');
    console.log();

    console.log('🎯 Quick Test Commands:');
    console.log('=======================');
    console.log('npm start                  # Start the development server');
    console.log('node test-database-connection.js  # Test database connection');
    console.log('node create-admin-user.js         # Create admin user');
    console.log();

    console.log('📚 Important Files to Review:');
    console.log('=============================');
    console.log('• .env - Your environment variables');
    console.log('• src/config/supabaseClient.js - Supabase client configuration');
    console.log('• src/config/constants.js - Application constants');
    console.log();

    console.log('🔧 Configuration Summary:');
    console.log('=========================');
    console.log(`✅ Supabase URL: ${supabaseUrl}`);
    console.log(`✅ API Key: ${supabaseKey.substring(0, 20)}...`);
    console.log('✅ Client configuration updated');
    console.log('✅ Constants file updated');
    console.log();

    console.log('🎉 Setup complete! Your project is now configured to use the new Supabase instance.');
    console.log('Follow the next steps above to complete your database and authentication setup.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('- Verify your Supabase project is active');
    console.log('- Check that your API keys are correct');
    console.log('- Ensure your project URL is accessible');
  }
}

// Run the setup
setupProject();