import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaUsers, FaComments, FaSearch, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './BatchmateMessaging.css';

const BatchmateMessaging = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchmates, setBatchmates] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock batch data
  const batchGroups = [
    {
      id: 1,
      name: 'BS Computer Science 2020',
      members: 45,
      lastMessage: 'Anyone interested in the tech meetup this weekend?',
      lastMessageTime: '2 hours ago'
    },
    {
      id: 2,
      name: 'BS Nursing 2019',
      members: 38,
      lastMessage: 'Great to see everyone at the reunion!',
      lastMessageTime: '1 day ago'
    },
    {
      id: 3,
      name: 'BS Accountancy 2021',
      members: 52,
      lastMessage: 'Job opportunities posted in the portal',
      lastMessageTime: '3 days ago'
    }
  ];

  // Mock batchmates data
  const mockBatchmates = [
    {
      id: 1,
      name: 'Maria Santos',
      avatar: 'https://via.placeholder.com/40',
      isOnline: true,
      lastSeen: '2 minutes ago'
    },
    {
      id: 2,
      name: 'John Dela Cruz',
      avatar: 'https://via.placeholder.com/40',
      isOnline: false,
      lastSeen: '1 hour ago'
    },
    {
      id: 3,
      name: 'Ana Garcia',
      avatar: 'https://via.placeholder.com/40',
      isOnline: true,
      lastSeen: '5 minutes ago'
    },
    {
      id: 4,
      name: 'Carlos Reyes',
      avatar: 'https://via.placeholder.com/40',
      isOnline: false,
      lastSeen: '2 hours ago'
    }
  ];

  // Mock messages data
  const mockMessages = [
    {
      id: 1,
      sender: 'Maria Santos',
      senderId: 1,
      message: 'Hi everyone! How are you all doing?',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      senderId: 'current',
      message: 'Hello! I\'m doing great. Anyone interested in the tech meetup this weekend?',
      timestamp: '10:32 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Ana Garcia',
      senderId: 3,
      message: 'I\'m interested! What time and where?',
      timestamp: '10:35 AM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'John Dela Cruz',
      senderId: 2,
      message: 'Count me in too!',
      timestamp: '10:40 AM',
      isOwn: false
    }
  ];

  useEffect(() => {
    setBatchmates(mockBatchmates);
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now(),
      sender: 'You',
      senderId: 'current',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate response
      const response = {
        id: Date.now() + 1,
        sender: 'Maria Santos',
        senderId: 1,
        message: 'Thanks for the update!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);

    toast.success('Message sent!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectBatch = (batch) => {
    setSelectedBatch(batch);
    toast.info(`Joined ${batch.name} chat`);
  };

  const startNewConversation = (batchmate) => {
    toast.info(`Starting conversation with ${batchmate.name}`);
  };

  return (
    <div className="batchmate-messaging">
      <div className="messaging-container">
        {/* Sidebar */}
        <div className="messaging-sidebar">
          <div className="sidebar-header">
            <h3><FaComments /> Batchmate Messages</h3>
          </div>

          {/* Batch Groups */}
          <div className="batch-groups">
            <h4>Batch Groups</h4>
            {batchGroups.map(batch => (
              <div 
                key={batch.id}
                className={`batch-group ${selectedBatch?.id === batch.id ? 'active' : ''}`}
                onClick={() => selectBatch(batch)}
              >
                <div className="batch-info">
                  <h5>{batch.name}</h5>
                  <p>{batch.members} members</p>
                </div>
                <div className="batch-last-message">
                  <p>{batch.lastMessage}</p>
                  <span>{batch.lastMessageTime}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Online Batchmates */}
          <div className="online-batchmates">
            <h4>Online Batchmates</h4>
            {batchmates.map(batchmate => (
              <div 
                key={batchmate.id}
                className="batchmate-item"
                onClick={() => startNewConversation(batchmate)}
              >
                <div className="batchmate-avatar">
                  <img src={batchmate.avatar} alt={batchmate.name} />
                  <span className={`status-indicator ${batchmate.isOnline ? 'online' : 'offline'}`}></span>
                </div>
                <div className="batchmate-info">
                  <h5>{batchmate.name}</h5>
                  <p>{batchmate.isOnline ? 'Online' : `Last seen ${batchmate.lastSeen}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedBatch ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-info">
                  <h3>{selectedBatch.name}</h3>
                  <p>{selectedBatch.members} members</p>
                </div>
                <div className="chat-actions">
                  <button className="btn btn-outline">
                    <FaUsers />
                  </button>
                  <button className="btn btn-outline">
                    <FaSearch />
                  </button>
                  <button className="btn btn-outline">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`message ${message.isOwn ? 'own-message' : 'other-message'}`}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <span className="sender-name">{message.sender}</span>
                        <span className="message-time">{message.timestamp}</span>
                      </div>
                      <div className="message-text">
                        {message.message}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message other-message">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                />
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <FaComments />
              <h3>Select a batch group to start messaging</h3>
              <p>Choose from the batch groups on the left to connect with your batchmates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchmateMessaging;
