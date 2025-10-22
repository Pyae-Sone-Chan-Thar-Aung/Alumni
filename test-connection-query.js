const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnectionQuery() {
  console.log('🔍 Testing connection query that frontend uses...\n');
  
  // Get a user ID first
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('approval_status', 'approved')
    .limit(1);
  
  if (usersError || !users || users.length === 0) {
    console.log('❌ No users found');
    return;
  }
  
  const testUserId = users[0].id;
  console.log(`Testing with user: ${users[0].first_name} ${users[0].last_name} (${testUserId})`);
  
  // Test the exact query from the frontend
  console.log('\n1. Testing frontend connection query...');
  try {
    const { data, error } = await supabase
      .from('user_connections')
      .select(`
        *,
        requester:users!requester_id(first_name, last_name, profile_picture),
        recipient:users!recipient_id(first_name, last_name, profile_picture)
      `)
      .or(`requester_id.eq.${testUserId},recipient_id.eq.${testUserId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log(`❌ Frontend query error: ${error.message}`);
      console.log(`   Error details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`✅ Frontend query successful: ${data?.length || 0} connections`);
      
      if (data && data.length > 0) {
        console.log('\n   Sample connection data:');
        data.slice(0, 2).forEach((conn, index) => {
          console.log(`   Connection ${index + 1}:`);
          console.log(`     ID: ${conn.id}`);
          console.log(`     Requester ID: ${conn.requester_id}`);
          console.log(`     Recipient ID: ${conn.recipient_id}`);
          console.log(`     Status: ${conn.status}`);
          console.log(`     Requester data: ${JSON.stringify(conn.requester, null, 2)}`);
          console.log(`     Recipient data: ${JSON.stringify(conn.recipient, null, 2)}`);
        });
      }
    }
  } catch (error) {
    console.log(`❌ Frontend query exception: ${error.message}`);
  }
  
  // Test alternative query without foreign key relationships
  console.log('\n2. Testing alternative query (manual joins)...');
  try {
    const { data: connections, error: connectionsError } = await supabase
      .from('user_connections')
      .select('*')
      .or(`requester_id.eq.${testUserId},recipient_id.eq.${testUserId}`)
      .order('created_at', { ascending: false });
    
    if (connectionsError) {
      console.log(`❌ Connections query error: ${connectionsError.message}`);
    } else {
      console.log(`✅ Connections query successful: ${connections?.length || 0} connections`);
      
      if (connections && connections.length > 0) {
        // Get user data separately
        const userIds = new Set();
        connections.forEach(conn => {
          userIds.add(conn.requester_id);
          userIds.add(conn.recipient_id);
        });
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, first_name, last_name, profile_picture')
          .in('id', Array.from(userIds));
        
        if (userError) {
          console.log(`❌ User data query error: ${userError.message}`);
        } else {
          console.log(`✅ User data query successful: ${userData?.length || 0} users`);
          
          // Combine the data
          const enrichedConnections = connections.map(conn => ({
            ...conn,
            requester: userData.find(u => u.id === conn.requester_id),
            recipient: userData.find(u => u.id === conn.recipient_id)
          }));
          
          console.log('\n   Enriched connection data:');
          enrichedConnections.slice(0, 2).forEach((conn, index) => {
            console.log(`   Connection ${index + 1}:`);
            console.log(`     Requester: ${conn.requester?.first_name} ${conn.requester?.last_name} (${conn.requester?.id})`);
            console.log(`     Recipient: ${conn.recipient?.first_name} ${conn.recipient?.last_name} (${conn.recipient?.id})`);
          });
        }
      }
    }
  } catch (error) {
    console.log(`❌ Alternative query exception: ${error.message}`);
  }
}

testConnectionQuery().catch(console.error);
