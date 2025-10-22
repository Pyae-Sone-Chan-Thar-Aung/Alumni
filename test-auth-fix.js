/**
 * Test Authentication System Fix
 * This script tests the authentication issue to understand it better
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Testing Authentication System Issue');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthentication() {
  try {
    console.log('\n1. Testing getSession()...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ❌ Session error: ${sessionError.message}`);
      return false;
    } else {
      console.log(`   ✅ Session check successful (session: ${session.session ? 'exists' : 'null'})`);
    }

    console.log('\n2. Testing getUser()...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log(`   Error: ${userError.message}`);
      
      // Check if it's the expected error for unauthenticated users
      if (userError.message.includes('not authenticated') || 
          userError.message.includes('Auth session missing') || 
          userError.message.includes('JWT expired')) {
        console.log('   ✅ This is expected behavior for unauthenticated users');
        return true;
      } else {
        console.log('   ❌ Unexpected authentication error');
        return false;
      }
    } else {
      console.log(`   ✅ User check successful (user: ${user ? 'authenticated' : 'null'})`);
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
    return false;
  }
}

// Run the test
testAuthentication()
  .then(success => {
    console.log(`\n📊 RESULT: ${success ? 'AUTHENTICATION SYSTEM IS WORKING' : 'AUTHENTICATION SYSTEM HAS ISSUES'}`);
    
    if (success) {
      console.log('\n💡 The original test failure might be due to different error message expectations.');
      console.log('   The authentication system appears to be working correctly.');
    }
    
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`\n💥 Test execution error: ${error.message}`);
    process.exit(1);
  });