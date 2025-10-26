import React from 'react';
import MessagingSystem from '../components/MessagingSystem';
import './Messages.css';

const Messages = () => {
  return (
    <div className="messages-page">
      <div className="container">
        <div className="page-header">
          <h1>Messages & Connections</h1>
        </div>
        
        <MessagingSystem />
      </div>
    </div>
  );
};

export default Messages;
