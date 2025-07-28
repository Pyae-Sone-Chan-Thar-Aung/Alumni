import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your UIC Alumni Portal assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('event') || lowerMessage.includes('activity')) {
      return "Here are the current events and activities:\n\n• Alumni Homecoming 2024 - March 15, 2024\n• Career Fair - April 20, 2024\n• Batch Reunion - Various dates\n• Professional Development Workshop - Monthly\n\nCheck the News & Announcements page for more details!";
    }
    
    if (lowerMessage.includes('announcement') || lowerMessage.includes('news')) {
      return "Latest announcements:\n\n• Registration for Alumni Homecoming 2024 is now open\n• New job opportunities posted in Tech and Medical fields\n• Alumni directory update in progress\n• Scholarship opportunities for current students\n\nVisit the News page for complete information!";
    }
    
    if (lowerMessage.includes('program') || lowerMessage.includes('course')) {
      return "UIC offers various programs:\n\n• College of Business and Accountancy\n• College of Computer Studies\n• College of Education\n• College of Engineering\n• College of Health Sciences\n• College of Liberal Arts\n• College of Science and Mathematics\n\nContact the admissions office for more details!";
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('career')) {
      return "Job opportunities are available in:\n\n• Technology Field\n• Medical Field\n• Governance Field\n• Engineering Field\n• Teaching Field\n• Entertainment Industry\n• Business Field\n\nVisit the Job Opportunities page to explore current openings!";
    }
    
    if (lowerMessage.includes('batch') || lowerMessage.includes('batchmate')) {
      return "Connect with your batchmates:\n\n• Join your batch group in the Batchmates section\n• Share updates and announcements\n• Organize reunions and events\n• Network with fellow alumni\n\nVisit the Batchmates page to get started!";
    }
    
    if (lowerMessage.includes('profile') || lowerMessage.includes('update')) {
      return "To update your profile:\n\n• Go to your Profile page\n• Fill in your detailed information\n• Upload your profile image\n• Update your contact details\n• Add your current employment status\n\nKeep your profile updated to stay connected!";
    }
    
    return "I'm here to help! You can ask me about:\n\n• Current events and activities\n• Latest announcements and news\n• University programs and courses\n• Job opportunities\n• Batchmate connections\n• Profile updates\n\nHow else can I assist you?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={onToggle}>
        <FaComments />
      </button>
      
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaRobot />
              <span>UIC Alumni Assistant</span>
            </div>
            <button className="chatbot-close" onClick={onToggle}>
              <FaTimes />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
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
          
          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
            />
            <button onClick={handleSendMessage} disabled={isTyping || !inputMessage.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 