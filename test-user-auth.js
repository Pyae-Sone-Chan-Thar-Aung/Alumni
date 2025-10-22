const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUserAuthentication() {
  console.log('🔍 Testing user authentication and UUID handling...\n');
  
  // 1. Check current user session
  console.log('1. Checking current user session...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log(`❌ Auth error: ${error.message}`);
    } else if (!user) {
      console.log('❌ No authenticated user found');
      console.log('   This explains the "null" UUID error - user is not logged in');
    } else {
      console.log(`✅ Authenticated user found:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.created_at}`);
    }
  } catch (error) {
    console.log(`❌ Auth check exception: ${error.message}`);
  }
  
  // 2. Test messages query with a valid user ID
  console.log('\n2. Testing messages query with valid user ID...');
  try {
    // Get a valid user ID from the database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('approval_status', 'approved')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const testUserId = users[0].id;
    console.log(`   Testing with user: ${users[0].first_name} ${users[0].last_name} (${testUserId})`);
    
    // Test the messages query
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${testUserId},recipient_id.eq.${testUserId}`)
      .order('created_at', { ascending: false });
    
    if (messagesError) {
      console.log(`❌ Messages query error: ${messagesError.message}`);
    } else {
      console.log(`✅ Messages query successful: ${messages?.length || 0} messages`);
    }
  } catch (error) {
    console.log(`❌ Messages query exception: ${error.message}`);
  }
  
  // 3. Test with null user ID (simulating the error)
  console.log('\n3. Testing messages query with null user ID...');
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.null,recipient_id.eq.null`)
      .order('created_at', { ascending: false });
    
    if (messagesError) {
      console.log(`❌ Null UUID query error: ${messagesError.message}`);
      console.log(`   This is likely the same error you're seeing in the frontend`);
    } else {
      console.log(`✅ Null UUID query successful: ${messages?.length || 0} messages`);
    }
  } catch (error) {
    console.log(`❌ Null UUID query exception: ${error.message}`);
  }
  
  // 4. Check if there are any messages in the database
  console.log('\n4. Checking total messages in database...');
  try {
    const { data: allMessages, error: allMessagesError } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id, subject, created_at');
    
    if (allMessagesError) {
      console.log(`❌ All messages query error: ${allMessagesError.message}`);
    } else {
      console.log(`✅ Total messages in database: ${allMessages?.length || 0}`);
      
      if (allMessages && allMessages.length > 0) {
        console.log('   Sample messages:');
        allMessages.slice(0, 3).forEach((msg, index) => {
          console.log(`   Message ${index + 1}:`);
          console.log(`     ID: ${msg.id}`);
          console.log(`     Sender: ${msg.sender_id}`);
          console.log(`     Recipient: ${msg.recipient_id}`);
          console.log(`     Subject: ${msg.subject}`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ All messages query exception: ${error.message}`);
  }
  
  console.log('\n📊 Summary:');
  console.log('The "null" UUID error suggests that:');
  console.log('1. The user is not properly authenticated');
  console.log('2. The user.id is null or undefined');
  console.log('3. The frontend is trying to query with a null user ID');
  console.log('\nTo fix this:');
  console.log('1. Make sure you are logged in to the application');
  console.log('2. Check that the AuthContext is providing a valid user');
  console.log('3. Add null checks in the frontend code');
}

testUserAuthentication().catch(console.error);
