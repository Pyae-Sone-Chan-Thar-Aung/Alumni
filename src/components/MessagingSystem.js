import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import { toast } from 'react-toastify';
import {
  FaInbox,
  FaPaperPlane,
  FaSearch,
  FaUser,
  FaClock,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaReply,
  FaTrash,
  FaBell,
  FaBellSlash
} from 'react-icons/fa';
import './MessagingSystem.css';

const MessagingSystem = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [connections, setConnections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [composeMessage, setComposeMessage] = useState({
    recipient_id: '',
    subject: '',
    content: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load all data
  useEffect(() => {
    if (user?.id) {
      loadMessages();
      loadConnections();
      loadNotifications();
    } else {
      console.log('No authenticated user found, skipping data load');
      setLoading(false);
    }
  }, [user?.id]);

  // Load messages (inbox and sent)
  const loadMessages = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available, skipping messages load');
        setMessages([]);
        setUnreadCount(0);
        return;
      }

      console.log('Loading messages for user:', user.id);

      // First, get the messages without foreign key relationships
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Messages query error:', messagesError);
        throw messagesError;
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('No messages found');
        setMessages([]);
        setUnreadCount(0);
        return;
      }

      // Get all unique user IDs from messages
      const userIds = new Set();
      messagesData.forEach(msg => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      // Fetch user data for all message participants
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, profile_picture')
        .in('id', Array.from(userIds));

      if (usersError) {
        console.error('Users query error:', usersError);
        throw usersError;
      }

      // Enrich messages with user data
      const enrichedMessages = messagesData.map(msg => ({
        ...msg,
        sender: usersData.find(u => u.id === msg.sender_id),
        recipient: usersData.find(u => u.id === msg.recipient_id)
      }));

      console.log('Messages loaded:', enrichedMessages);
      setMessages(enrichedMessages);

      // Count unread messages
      const unread = enrichedMessages.filter(msg =>
        msg.recipient_id === user.id && !msg.is_read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error(`Failed to load messages: ${error.message}`);
    }
  };

  // Load connections
  const loadConnections = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available, skipping connections load');
        setConnections([]);
        return;
      }

      console.log('Loading connections for user:', user.id);

      // First, get the connections without foreign key relationships
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('user_connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (connectionsError) {
        console.error('Connections query error:', connectionsError);
        throw connectionsError;
      }

      if (!connectionsData || connectionsData.length === 0) {
        console.log('No connections found');
        setConnections([]);
        return;
      }

      // Get all unique user IDs from connections
      const userIds = new Set();
      connectionsData.forEach(conn => {
        userIds.add(conn.requester_id);
        userIds.add(conn.recipient_id);
      });

      // Fetch user data for all connected users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, profile_picture')
        .in('id', Array.from(userIds));

      if (usersError) {
        console.error('Users query error:', usersError);
        throw usersError;
      }

      // Enrich connections with user data
      const enrichedConnections = connectionsData.map(conn => ({
        ...conn,
        requester: usersData.find(u => u.id === conn.requester_id),
        recipient: usersData.find(u => u.id === conn.recipient_id)
      }));

      console.log('Connections loaded:', enrichedConnections);
      setConnections(enrichedConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error(`Failed to load connections: ${error.message}`);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available, skipping notifications load');
        setNotifications([]);
        setLoading(false);
        return;
      }

      console.log('Loading notifications for user:', user.id);

      // First, get the notifications without foreign key relationships
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) {
        console.error('Notifications query error:', notificationsError);
        throw notificationsError;
      }

      if (!notificationsData || notificationsData.length === 0) {
        console.log('No notifications found');
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Get all unique user IDs from notifications
      const userIds = new Set();
      notificationsData.forEach(notif => {
        if (notif.related_user_id) {
          userIds.add(notif.related_user_id);
        }
      });

      // Fetch user data for related users
      let usersData = [];
      if (userIds.size > 0) {
        const { data: usersDataResult, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, profile_picture')
          .in('id', Array.from(userIds));

        if (usersError) {
          console.error('Users query error:', usersError);
          throw usersError;
        }
        usersData = usersDataResult || [];
      }

      // Enrich notifications with user data
      const enrichedNotifications = notificationsData.map(notif => ({
        ...notif,
        related_user: usersData.find(u => u.id === notif.related_user_id)
      }));

      console.log('Notifications loaded:', enrichedNotifications);
      setNotifications(enrichedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error(`Failed to load notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to send messages');
      return;
    }
    
    if (!composeMessage.recipient_id || !composeMessage.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('Sending message:', {
        sender_id: user.id,
        recipient_id: composeMessage.recipient_id,
        subject: composeMessage.subject || 'No Subject',
        content: composeMessage.content
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: composeMessage.recipient_id,
          subject: composeMessage.subject || 'No Subject',
          content: composeMessage.content
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      toast.success('Message sent successfully!');
      setComposeMessage({ recipient_id: '', subject: '', content: '' });
      loadMessages();
      loadNotifications();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user.id);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Handle connection request
  const handleConnectionRequest = async (connectionId, action) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success(`Connection request ${action} successfully!`);
      loadConnections();
      loadNotifications();
    } catch (error) {
      console.error('Error handling connection request:', error);
      toast.error(`Failed to ${action} connection request`);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Filter messages based on active tab and search term
  const getFilteredMessages = () => {
    let filtered = messages;

    // Filter by tab first
    if (activeTab === 'inbox') {
      filtered = messages.filter(msg => msg.recipient_id === user.id);
    } else if (activeTab === 'sent') {
      filtered = messages.filter(msg => msg.sender_id === user.id);
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(msg => {
        // Search in subject
        const subjectMatch = msg.subject?.toLowerCase().includes(searchLower) || false;
        
        // Search in content
        const contentMatch = msg.content?.toLowerCase().includes(searchLower) || false;
        
        // Search in sender name
        const senderName = msg.sender ? 
          `${msg.sender.first_name || ''} ${msg.sender.last_name || ''}`.toLowerCase().trim() : '';
        const senderMatch = senderName.includes(searchLower);
        
        // Search in recipient name
        const recipientName = msg.recipient ? 
          `${msg.recipient.first_name || ''} ${msg.recipient.last_name || ''}`.toLowerCase().trim() : '';
        const recipientMatch = recipientName.includes(searchLower);
        
        return subjectMatch || contentMatch || senderMatch || recipientMatch;
      });
    }

    return filtered;
  };

  // Filter connections based on search term
  const getFilteredConnections = () => {
    let filtered = connections;

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(conn => {
        // Search in requester name
        const requesterName = conn.requester ? 
          `${conn.requester.first_name || ''} ${conn.requester.last_name || ''}`.toLowerCase().trim() : '';
        const requesterMatch = requesterName.includes(searchLower);
        
        // Search in recipient name
        const recipientName = conn.recipient ? 
          `${conn.recipient.first_name || ''} ${conn.recipient.last_name || ''}`.toLowerCase().trim() : '';
        const recipientMatch = recipientName.includes(searchLower);
        
        // Search in connection message
        const messageMatch = conn.message?.toLowerCase().includes(searchLower) || false;
        
        return requesterMatch || recipientMatch || messageMatch;
      });
    }

    return filtered;
  };

  // Filter notifications based on search term
  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(notif => {
        // Search in title
        const titleMatch = notif.title?.toLowerCase().includes(searchLower) || false;
        
        // Search in message
        const messageMatch = notif.message?.toLowerCase().includes(searchLower) || false;
        
        // Search in related user name
        const relatedUserName = notif.related_user ? 
          `${notif.related_user.first_name || ''} ${notif.related_user.last_name || ''}`.toLowerCase().trim() : '';
        const relatedUserMatch = relatedUserName.includes(searchLower);
        
        return titleMatch || messageMatch || relatedUserMatch;
      });
    }

    return filtered;
  };

  // Get connection requests for current user
  const getConnectionRequests = () => {
    return getFilteredConnections().filter(conn =>
      conn.recipient_id === user.id && conn.status === 'pending'
    );
  };

  // Get accepted connections
  const getAcceptedConnections = () => {
    return getFilteredConnections().filter(conn =>
      (conn.requester_id === user.id || conn.recipient_id === user.id) &&
      conn.status === 'accepted'
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="messaging-system">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading messaging system...</p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="messaging-system">
        <div className="error-state">
          <h3>Authentication Required</h3>
          <p>You must be logged in to access the messaging system.</p>
          <p>Please log in to your account to send and receive messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-system">
      <div className="messaging-header">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search messages, connections, or alumni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="messaging-tabs">
        <button
          className={`tab ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          <FaInbox />
          Inbox {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <FaPaperPlane />
          Sent
        </button>
        <button
          className={`tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <FaUser />
          Connections
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <FaBell />
          Notifications
        </button>
        <button
          className={`tab ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          <FaPaperPlane />
          Compose
        </button>
      </div>

      <div className="messaging-content">
        {activeTab === 'inbox' && (
          <div className="messages-list">
            <h3>Inbox Messages</h3>
            {getFilteredMessages().length === 0 ? (
              <div className="empty-state">
                <FaInbox />
                <p>{searchTerm ? 'No messages match your search' : 'No messages in your inbox'}</p>
              </div>
            ) : (
              <div className="message-items">
                {getFilteredMessages().map(message => (
                  <div
                    key={message.id}
                    className={`message-item ${!message.is_read ? 'unread' : ''}`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.is_read) markAsRead(message.id);
                    }}
                  >
                    <div className="message-avatar">
                      <img
                        src={message.sender?.profile_picture || '/default-avatar.png'}
                        alt={message.sender?.first_name}
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <h4>{message.sender?.first_name} {message.sender?.last_name}</h4>
                        <span className="message-time">{formatDate(message.created_at)}</span>
                      </div>
                      <h5 className="message-subject">{message.subject}</h5>
                      <p className="message-preview">{message.content.substring(0, 100)}...</p>
                    </div>
                    <div className="message-status">
                      {message.is_read ? <FaCheckDouble className="read" /> : <FaCheck className="unread" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="messages-list">
            <h3>Sent Messages</h3>
            {getFilteredMessages().length === 0 ? (
              <div className="empty-state">
                <FaPaperPlane />
                <p>{searchTerm ? 'No sent messages match your search' : 'No sent messages'}</p>
              </div>
            ) : (
              <div className="message-items">
                {getFilteredMessages().map(message => (
                  <div
                    key={message.id}
                    className="message-item"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="message-avatar">
                      <img
                        src={message.recipient?.profile_picture || '/default-avatar.png'}
                        alt={message.recipient?.first_name}
                      />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <h4>To: {message.recipient?.first_name} {message.recipient?.last_name}</h4>
                        <span className="message-time">{formatDate(message.created_at)}</span>
                      </div>
                      <h5 className="message-subject">{message.subject}</h5>
                      <p className="message-preview">{message.content.substring(0, 100)}...</p>
                    </div>
                    <div className="message-status">
                      {message.is_read ? <FaCheckDouble className="read" /> : <FaCheck className="unread" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="connections-list">
            <h3>Connections</h3>

            {/* Connection Requests */}
            {getConnectionRequests().length > 0 && (
              <div className="connection-section">
                <h4>Connection Requests</h4>
                {getConnectionRequests().map(connection => (
                  <div key={connection.id} className="connection-item">
                    <div className="connection-avatar">
                      <img
                        src={connection.requester?.profile_picture || '/default-avatar.png'}
                        alt={connection.requester?.first_name}
                      />
                    </div>
                    <div className="connection-content">
                      <h4>{connection.requester?.first_name} {connection.requester?.last_name}</h4>
                      <p>Wants to connect with you</p>
                      {connection.message && <p className="connection-message">"{connection.message}"</p>}
                      <span className="connection-time">{formatDate(connection.created_at)}</span>
                    </div>
                    <div className="connection-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleConnectionRequest(connection.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleConnectionRequest(connection.id, 'rejected')}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Accepted Connections */}
            <div className="connection-section">
              <h4>Your Connections</h4>
              {getAcceptedConnections().length === 0 ? (
                <div className="empty-state">
                  <FaUser />
                  <p>{searchTerm ? 'No connections match your search' : 'No connections yet'}</p>
                </div>
              ) : (
                getAcceptedConnections().map(connection => {
                  const otherUser = connection.requester_id === user.id ?
                    connection.recipient : connection.requester;

                  return (
                    <div key={connection.id} className="connection-item accepted">
                      <div className="connection-avatar">
                        <img
                          src={otherUser?.profile_picture || '/default-avatar.png'}
                          alt={otherUser?.first_name}
                        />
                      </div>
                      <div className="connection-content">
                        <h4>{otherUser?.first_name} {otherUser?.last_name}</h4>
                        <p>Connected since {formatDate(connection.updated_at)}</p>
                      </div>
                      <div className="connection-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setComposeMessage(prev => ({ ...prev, recipient_id: otherUser.id }));
                            setActiveTab('compose');
                          }}
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-list">
            <h3>Notifications</h3>
            {getFilteredNotifications().length === 0 ? (
              <div className="empty-state">
                <FaBell />
                <p>{searchTerm ? 'No notifications match your search' : 'No notifications'}</p>
              </div>
            ) : (
              <div className="notification-items">
                {getFilteredNotifications().map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {notification.type === 'message_received' && <FaPaperPlane />}
                      {notification.type === 'connection_request' && <FaUser />}
                      {notification.type === 'connection_accepted' && <FaCheck />}
                      {notification.type === 'message_read' && <FaCheckDouble />}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">{formatDate(notification.created_at)}</span>
                    </div>
                    {!notification.is_read && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="compose-message">
            <h3>Compose Message</h3>
            <form onSubmit={sendMessage}>
              <div className="form-group">
                <label>To:</label>
                <select
                  value={composeMessage.recipient_id}
                  onChange={(e) => setComposeMessage(prev => ({ ...prev, recipient_id: e.target.value }))}
                  required
                >
                  <option value="">Select recipient</option>
                  {getAcceptedConnections().map(connection => {
                    const otherUser = connection.requester_id === user.id ?
                      connection.recipient : connection.requester;
                    return (
                      <option key={connection.id} value={otherUser.id}>
                        {otherUser.first_name} {otherUser.last_name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  value={composeMessage.subject}
                  onChange={(e) => setComposeMessage(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Message subject (optional)"
                />
              </div>

              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={composeMessage.content}
                  onChange={(e) => setComposeMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={8}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FaPaperPlane /> Send Message
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setComposeMessage({ recipient_id: '', subject: '', content: '' })}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content message-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedMessage.subject}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedMessage(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="message-detail-header">
                <div className="message-detail-avatar">
                  <img
                    src={selectedMessage.sender?.profile_picture || '/default-avatar.png'}
                    alt={selectedMessage.sender?.first_name}
                  />
                </div>
                <div className="message-detail-info">
                  <h4>
                    {activeTab === 'inbox' ? 'From' : 'To'}: {activeTab === 'inbox' ?
                      `${selectedMessage.sender?.first_name} ${selectedMessage.sender?.last_name}` :
                      `${selectedMessage.recipient?.first_name} ${selectedMessage.recipient?.last_name}`
                    }
                  </h4>
                  <p>{formatDate(selectedMessage.created_at)}</p>
                </div>
              </div>

              <div className="message-detail-content">
                {selectedMessage.content}
              </div>

              {selectedMessage.is_read && selectedMessage.read_at && (
                <div className="message-read-info">
                  <FaCheckDouble className="read" />
                  Read on {formatDate(selectedMessage.read_at)}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {activeTab === 'inbox' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setComposeMessage(prev => ({
                      ...prev,
                      recipient_id: selectedMessage.sender_id,
                      subject: `Re: ${selectedMessage.subject}`
                    }));
                    setSelectedMessage(null);
                    setActiveTab('compose');
                  }}
                >
                  <FaReply /> Reply
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingSystem;
