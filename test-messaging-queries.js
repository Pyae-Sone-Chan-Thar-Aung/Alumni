const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMessagingQueries() {
  console.log('🔍 Testing messaging system queries...\n');
  
  // Test the exact query from MessagingSystem.js
  console.log('1. Testing messages query with user relationships...');
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(first_name, last_name, profile_picture),
        recipient:users!recipient_id(first_name, last_name, profile_picture)
      `)
      .limit(1);

    if (error) {
      console.log(`❌ Messages query error: ${error.message}`);
      console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`✅ Messages query successful: ${data?.length || 0} records`);
    }
  } catch (error) {
    console.log(`❌ Messages query exception: ${error.message}`);
  }

  console.log('\n2. Testing user_connections query with user relationships...');
  try {
    const { data, error } = await supabase
      .from('user_connections')
      .select(`
        *,
        requester:users!requester_id(first_name, last_name, profile_picture),
        recipient:users!recipient_id(first_name, last_name, profile_picture)
      `)
      .limit(1);

    if (error) {
      console.log(`❌ User connections query error: ${error.message}`);
      console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`✅ User connections query successful: ${data?.length || 0} records`);
    }
  } catch (error) {
    console.log(`❌ User connections query exception: ${error.message}`);
  }

  console.log('\n3. Testing notifications query with user relationships...');
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        related_user:users!related_user_id(first_name, last_name, profile_picture)
      `)
      .limit(1);

    if (error) {
      console.log(`❌ Notifications query error: ${error.message}`);
      console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`✅ Notifications query successful: ${data?.length || 0} records`);
    }
  } catch (error) {
    console.log(`❌ Notifications query exception: ${error.message}`);
  }

  console.log('\n4. Testing users table structure...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_picture')
      .limit(1);

    if (error) {
      console.log(`❌ Users query error: ${error.message}`);
      console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`✅ Users query successful: ${data?.length || 0} records`);
      if (data && data.length > 0) {
        console.log(`   Sample user: ${JSON.stringify(data[0], null, 2)}`);
      }
    }
  } catch (error) {
    console.log(`❌ Users query exception: ${error.message}`);
  }

  console.log('\n5. Testing foreign key relationships...');
  try {
    // Check if there are any messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id')
      .limit(1);

    if (messagesError) {
      console.log(`❌ Messages structure error: ${messagesError.message}`);
    } else {
      console.log(`✅ Messages structure OK: ${messages?.length || 0} records`);
      if (messages && messages.length > 0) {
        console.log(`   Sample message: ${JSON.stringify(messages[0], null, 2)}`);
        
        // Test if we can find the sender
        const { data: sender, error: senderError } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .eq('id', messages[0].sender_id)
          .single();

        if (senderError) {
          console.log(`❌ Sender lookup error: ${senderError.message}`);
        } else {
          console.log(`✅ Sender lookup successful: ${JSON.stringify(sender, null, 2)}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Foreign key test exception: ${error.message}`);
  }
}

testMessagingQueries().catch(console.error);
