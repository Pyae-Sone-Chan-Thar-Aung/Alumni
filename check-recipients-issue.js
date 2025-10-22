const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRecipientsIssue() {
  console.log('🔍 Investigating recipient selection issue...\n');
  
  // 1. Check total number of users
  console.log('1. Checking total users...');
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, approval_status')
      .eq('approval_status', 'approved');
    
    if (usersError) {
      console.log(`❌ Users query error: ${usersError.message}`);
    } else {
      console.log(`✅ Found ${users?.length || 0} approved users`);
      if (users && users.length > 0) {
        console.log('   Sample users:');
        users.slice(0, 3).forEach(user => {
          console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ Users query exception: ${error.message}`);
  }

  // 2. Check user_connections table
  console.log('\n2. Checking user connections...');
  try {
    const { data: connections, error: connectionsError } = await supabase
      .from('user_connections')
      .select('id, requester_id, recipient_id, status, created_at');
    
    if (connectionsError) {
      console.log(`❌ Connections query error: ${connectionsError.message}`);
    } else {
      console.log(`✅ Found ${connections?.length || 0} total connections`);
      
      if (connections && connections.length > 0) {
        const statusCounts = connections.reduce((acc, conn) => {
          acc[conn.status] = (acc[conn.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log('   Connection status breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   - ${status}: ${count}`);
        });
        
        console.log('   Sample connections:');
        connections.slice(0, 3).forEach(conn => {
          console.log(`   - ${conn.status}: ${conn.requester_id} -> ${conn.recipient_id}`);
        });
      } else {
        console.log('   ⚠️ No connections found in database');
      }
    }
  } catch (error) {
    console.log(`❌ Connections query exception: ${error.message}`);
  }

  // 3. Check accepted connections specifically
  console.log('\n3. Checking accepted connections...');
  try {
    const { data: acceptedConnections, error: acceptedError } = await supabase
      .from('user_connections')
      .select('id, requester_id, recipient_id, created_at')
      .eq('status', 'accepted');
    
    if (acceptedError) {
      console.log(`❌ Accepted connections query error: ${acceptedError.message}`);
    } else {
      console.log(`✅ Found ${acceptedConnections?.length || 0} accepted connections`);
      
      if (acceptedConnections && acceptedConnections.length > 0) {
        console.log('   Accepted connections:');
        acceptedConnections.forEach(conn => {
          console.log(`   - ${conn.requester_id} <-> ${conn.recipient_id}`);
        });
      } else {
        console.log('   ⚠️ No accepted connections found - this is why no recipients are available!');
      }
    }
  } catch (error) {
    console.log(`❌ Accepted connections query exception: ${error.message}`);
  }

  // 4. Check messages table
  console.log('\n4. Checking existing messages...');
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id, subject, created_at');
    
    if (messagesError) {
      console.log(`❌ Messages query error: ${messagesError.message}`);
    } else {
      console.log(`✅ Found ${messages?.length || 0} total messages`);
      
      if (messages && messages.length > 0) {
        console.log('   Sample messages:');
        messages.slice(0, 3).forEach(msg => {
          console.log(`   - From ${msg.sender_id} to ${msg.recipient_id}: "${msg.subject}"`);
        });
      } else {
        console.log('   ℹ️ No messages found in database');
      }
    }
  } catch (error) {
    console.log(`❌ Messages query exception: ${error.message}`);
  }

  console.log('\n📊 Summary:');
  console.log('The recipient dropdown is empty because there are no accepted connections.');
  console.log('To fix this, you need to:');
  console.log('1. Create some user connections');
  console.log('2. Accept those connections');
  console.log('3. Then you can send messages between connected users');
}

checkRecipientsIssue().catch(console.error);
