import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import { toast } from 'react-toastify';

const MessagingDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      checkDatabaseStatus();
    }
  }, [user?.id]);

  const checkDatabaseStatus = async () => {
    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('id', user.id)
        .single();

      // Check if messages table is accessible
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      // Check if user_connections table is accessible
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('user_connections')
        .select('id')
        .limit(1);

      // Check if notifications table is accessible
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      setDebugInfo({
        user: {
          exists: !userError,
          data: userData,
          error: userError?.message
        },
        messages: {
          accessible: !messagesError,
          error: messagesError?.message
        },
        connections: {
          accessible: !connectionsError,
          error: connectionsError?.message
        },
        notifications: {
          accessible: !notificationsError,
          error: notificationsError?.message
        }
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo({ error: error.message });
    }
  };

  const testSendMessage = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    try {
      // Get another user to send message to
      const { data: otherUsers, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .neq('id', user.id)
        .limit(1);

      if (usersError || !otherUsers || otherUsers.length === 0) {
        toast.error('No other users found to send message to');
        return;
      }

      const recipient = otherUsers[0];

      console.log('Testing message send:', {
        sender_id: user.id,
        recipient_id: recipient.id,
        subject: 'Debug Test Message',
        content: testMessage
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipient.id,
          subject: 'Debug Test Message',
          content: testMessage
        })
        .select();

      if (error) {
        console.error('Test message error:', error);
        toast.error(`Test failed: ${error.message}`);
      } else {
        console.log('Test message sent successfully:', data);
        toast.success('Test message sent successfully!');
        setTestMessage('');
        checkDatabaseStatus();
      }
    } catch (error) {
      console.error('Test message failed:', error);
      toast.error(`Test failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>Messaging System Debug Info</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>User Info:</h4>
        <pre>{JSON.stringify(debugInfo.user, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Database Tables:</h4>
        <div>
          <strong>Messages Table:</strong> {debugInfo.messages?.accessible ? '✅ Accessible' : '❌ Error: ' + debugInfo.messages?.error}
        </div>
        <div>
          <strong>Connections Table:</strong> {debugInfo.connections?.accessible ? '✅ Accessible' : '❌ Error: ' + debugInfo.connections?.error}
        </div>
        <div>
          <strong>Notifications Table:</strong> {debugInfo.notifications?.accessible ? '✅ Accessible' : '❌ Error: ' + debugInfo.notifications?.error}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Test Message Sending:</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message"
            style={{ padding: '8px', flex: 1 }}
          />
          <button
            onClick={testSendMessage}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Send Test Message
          </button>
        </div>
      </div>

      <div>
        <button
          onClick={checkDatabaseStatus}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Refresh Debug Info
        </button>
      </div>
    </div>
  );
};

export default MessagingDebug;
