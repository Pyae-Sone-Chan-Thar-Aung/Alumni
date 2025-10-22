const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://gpsbydtilgoutlltyfvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createSampleConnections() {
  console.log('🔧 Creating sample connections for testing...\n');
  
  try {
    // 1. Get all approved users
    console.log('1. Fetching approved users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('approval_status', 'approved');
    
    if (usersError) {
      console.log(`❌ Error fetching users: ${usersError.message}`);
      return;
    }
    
    if (!users || users.length < 2) {
      console.log('❌ Need at least 2 approved users to create connections');
      return;
    }
    
    console.log(`✅ Found ${users.length} approved users:`);
    users.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
    });
    
    // 2. Create connections between users
    console.log('\n2. Creating sample connections...');
    const connections = [];
    
    // Create connections between different users
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        connections.push({
          requester_id: users[i].id,
          recipient_id: users[j].id,
          status: 'accepted', // Directly create accepted connections for testing
          message: `Hello ${users[j].first_name}! Let's connect.`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        // Also create reverse connection
        connections.push({
          requester_id: users[j].id,
          recipient_id: users[i].id,
          status: 'accepted',
          message: `Hello ${users[i].first_name}! Let's connect.`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
    
    console.log(`   Creating ${connections.length} connections...`);
    
    // 3. Insert connections
    const { data: insertedConnections, error: insertError } = await supabase
      .from('user_connections')
      .insert(connections)
      .select();
    
    if (insertError) {
      console.log(`❌ Error inserting connections: ${insertError.message}`);
      return;
    }
    
    console.log(`✅ Successfully created ${insertedConnections?.length || 0} connections`);
    
    // 4. Verify connections were created
    console.log('\n3. Verifying connections...');
    const { data: allConnections, error: verifyError } = await supabase
      .from('user_connections')
      .select('id, requester_id, recipient_id, status')
      .eq('status', 'accepted');
    
    if (verifyError) {
      console.log(`❌ Error verifying connections: ${verifyError.message}`);
    } else {
      console.log(`✅ Verified: ${allConnections?.length || 0} accepted connections exist`);
      
      // Show sample connections
      if (allConnections && allConnections.length > 0) {
        console.log('\n   Sample connections:');
        allConnections.slice(0, 5).forEach(conn => {
          const requester = users.find(u => u.id === conn.requester_id);
          const recipient = users.find(u => u.id === conn.recipient_id);
          console.log(`   - ${requester?.first_name} ${requester?.last_name} ↔ ${recipient?.first_name} ${recipient?.last_name}`);
        });
      }
    }
    
    console.log('\n🎉 Sample connections created successfully!');
    console.log('Now you can:');
    console.log('1. Go to the Messages page');
    console.log('2. Click on "Compose"');
    console.log('3. You should now see recipients in the "To:" dropdown');
    console.log('4. Send test messages between connected users');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createSampleConnections().catch(console.error);
