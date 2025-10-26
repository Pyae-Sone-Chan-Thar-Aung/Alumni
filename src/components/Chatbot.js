import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import ollamaService from '../services/ollamaService';
import './Chatbot.css';

const Chatbot = ({ isOpen, onToggle }) => {
  const [conversationState, setConversationState] = useState('welcome');
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isOllamaConnected, setIsOllamaConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Conversation flow configuration
  const conversationFlows = {
    welcome: {
      message: "Hi. My name is Jaguar! I'm the College for Computer Studies (CCS)'s friendly virtual assistant. I'm happy to answer your career-related questions. To start, tell me about yourself!",
      options: [
        { id: 'student', label: "I'm a student" },
        { id: 'alumni', label: "I'm an alumnus/alumna" },
        { id: 'employer', label: "I'm an employer" },
        { id: 'staff', label: "I'm a staff" }
      ]
    },
    student: {
      message: "Great! As a CCS student, I can help you with:",
      options: [
        { id: 'navigation', label: 'System Navigation' },
        { id: 'features', label: 'System Features' },
        { id: 'alumni_insights', label: 'Alumni Career Insights' },
        { id: 'go_back', label: 'Go back' }
      ]
    },
    alumni: {
      message: "Welcome, alumnus/alumna! How can I assist you today?",
      options: [
        { id: 'profile_help', label: 'Update My Profile' },
        { id: 'networking', label: 'Connect with Batchmates' },
        { id: 'job_board', label: 'Job Opportunities' },
        { id: 'events', label: 'Upcoming Events' },
        { id: 'go_back', label: 'Go back' }
      ]
    },
    employer: {
      message: "Welcome! As an employer, I can help you with:",
      options: [
        { id: 'post_job', label: 'How to Post Jobs' },
        { id: 'find_talent', label: 'Find CCS Graduates' },
        { id: 'contact_admin', label: 'Contact Admin' },
        { id: 'go_back', label: 'Go back' }
      ]
    },
    staff: {
      message: "Hello, staff member! How can I help you today?",
      options: [
        { id: 'admin_features', label: 'Admin Features' },
        { id: 'reports', label: 'Generate Reports' },
        { id: 'user_management', label: 'User Management' },
        { id: 'go_back', label: 'Go back' }
      ]
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConversation = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: conversationFlows.welcome.message,
      sender: 'bot',
      timestamp: new Date(),
      options: conversationFlows.welcome.options
    };
    setMessages([welcomeMessage]);
    setConversationState('welcome');
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeConversation();
      checkOllamaConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const checkOllamaConnection = async () => {
    const connected = await ollamaService.checkConnection();
    setIsOllamaConnected(connected);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      let botResponse;
      
      if (isOllamaConnected) {
        // Build conversation context with proper system instructions
        const contextData = {
          systemRole: "You are Jaguar, a helpful AI assistant for the CCS Alumni System. You help users navigate the system, answer questions about features, and provide guidance.",
          languageRules: `CRITICAL LANGUAGE RULES:
- Automatically detect if the user is writing in English, Filipino/Tagalog, or Cebuano
- ALWAYS respond in the SAME language as the user's question
- Match the user's language naturally and fluently
- Do not mix languages unless the user does`,
          privacyRules: `STRICT PRIVACY RULES:
- NEVER share: passwords, email addresses, phone numbers, home addresses, or personal contact information of other users
- NEVER share: individual salary data or personal financial information
- ONLY share: general system information, public features, and aggregated anonymous statistics
- If asked for private data: politely refuse and suggest contacting admin@ccs.edu`,
          systemKnowledge: `CCS Alumni System Features:
1. Profile Management: Users can update their profile, add employment info, education details
2. Alumni Directory: Search and connect with batchmates (respects privacy settings)
3. Job Board: Browse job opportunities, apply for positions
4. Events: View upcoming alumni events, reunions, workshops
5. Tracer Study: Submit employment data, view anonymous statistics
6. Messaging: Communicate with batchmates you're connected with
7. Gallery: View photos from CCS events

How to help users:
- Navigation: Guide them to the right page/feature
- Features: Explain what each section does
- Troubleshooting: Help with common issues
- Privacy: Always respect and protect user privacy`,
          userQuestion: currentInput
        };

        // Create intelligent prompt
        const intelligentPrompt = `${contextData.systemRole}

${contextData.languageRules}

${contextData.privacyRules}

${contextData.systemKnowledge}

User asks: "${contextData.userQuestion}"

Provide a helpful, accurate response in the user's language:`;

        const response = await ollamaService.sendMessage(intelligentPrompt, null, {
          temperature: 0.8,
          top_p: 0.9,
          top_k: 40,
          num_predict: 256
        });
        
        if (response.success) {
          botResponse = response.response;
          console.log('Ollama AI Response:', botResponse);
        } else {
          console.error('Ollama Error:', response.error);
          botResponse = getBasicResponse(currentInput);
        }
      } else {
        // Fallback to basic responses when Ollama is not connected
        console.warn('Ollama not connected - using fallback responses');
        botResponse = getBasicResponse(currentInput);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      if (!isOpen) setUnreadCount(c => c + 1);
    } catch (error) {
      console.error('Message send error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: getBasicResponse(currentInput),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getBasicResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Multi-language basic responses
    if (lowerMessage.includes('kamusta') || lowerMessage.includes('kumusta') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm Jaguar, your CCS Alumni assistant. How can I help you today? \n\nKumusta! Ako si Jaguar, ang iyong CCS Alumni assistant. Paano kita matutulungan?";
    }
    
    if (lowerMessage.includes('salamat') || lowerMessage.includes('thank')) {
      return "You're welcome! / Walang anuman!";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('tulong')) {
      return "I can help you with:\n• System navigation\n• Alumni features\n• Job opportunities\n• Profile updates\n• Events information\n\nYou can also click the 📝 button below to switch to guided mode with buttons.";
    }
    
    return "I can help you navigate the CCS Alumni system. You can ask me questions in English, Filipino, or Cebuano! \n\nPwede mo akong tanungin sa English, Filipino, o Cebuano! \n\nClick the 📝 button below for guided mode with topic buttons.";
  };

  const toggleAIMode = async () => {
    setIsAIMode(!isAIMode);
    if (!isAIMode) {
      // Check Ollama connection when entering AI mode
      await checkOllamaConnection();
      
      // Switching to AI mode
      const connectionStatus = isOllamaConnected 
        ? '✅ Ollama AI Connected - Intelligent responses enabled!' 
        : '⚠️ Ollama not running - Using basic fallback responses';
      
      const aiMessage = {
        id: Date.now(),
        text: `🤖 **AI Chat Mode Activated!**\n\n${connectionStatus}\n\n🌐 Multi-Language Support:\n• English\n• Filipino/Tagalog\n• Cebuano\n\nI'll automatically detect and respond in your language!\n\n💡 **Try asking:**\n- "How do I update my profile?"\n- "Paano ko makikita ang job opportunities?"\n- "Unsaon nako pag-connect sa akong batchmates?"\n\nType your question below...`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } else {
      // Switching back to button mode
      initializeConversation();
    }
  };

  const handleOptionClick = (optionId) => {
    // Add user's selection to messages
    const userMessage = {
      id: Date.now(),
      text: conversationFlows[conversationState]?.options.find(opt => opt.id === optionId)?.label || optionId,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Handle special cases
    if (optionId === 'go_back') {
      initializeConversation();
      return;
    }

    // Handle user type selection
    if (['student', 'alumni', 'employer', 'staff'].includes(optionId)) {
      setConversationState(optionId);

      const responseMessage = {
        id: Date.now() + 1,
        text: conversationFlows[optionId].message,
        sender: 'bot',
        timestamp: new Date(),
        options: conversationFlows[optionId].options
      };
      setMessages(prev => [...prev, responseMessage]);
      if (!isOpen) setUnreadCount(c => c + 1);
      return;
    }

    // Handle topic-specific responses
    const response = getTopicResponse(optionId);
    const botMessage = {
      id: Date.now() + 1,
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      options: response.options
    };

    setMessages(prev => [...prev, botMessage]);
    if (!isOpen) setUnreadCount(c => c + 1);
  };

  const getTopicResponse = (topicId) => {
    // Privacy protection is built into all responses
    // Individual user data is never exposed through the chatbot

    const responses = {
      // Student responses
      navigation: {
        text: "🗺️ **System Navigation Help:**\n\n" +
          "• **Home**: View announcements and system overview\n" +
          "• **Alumni Directory**: Search and connect with graduates\n" +
          "• **Job Board**: Browse career opportunities\n" +
          "• **Events**: Upcoming alumni events and reunions\n" +
          "• **Tracer Study**: View graduate employment outcomes\n" +
          "• **Profile**: Update your personal information\n\n" +
          "Use the navigation menu at the top to access these features.",
        options: [
          { id: 'features', label: 'Tell me about features' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      features: {
        text: "✨ **CCS Alumni System Features:**\n\n" +
          "📱 **Networking**: Connect with batchmates and alumni\n" +
          "💼 **Job Board**: Find career opportunities posted by employers\n" +
          "📊 **Tracer Study**: View employment statistics and outcomes\n" +
          "📸 **Gallery**: Browse photos from CCS events\n" +
          "💬 **Messaging**: Communicate with your batchmates\n" +
          "🔔 **Notifications**: Stay updated on announcements\n\n" +
          "All features are designed to help you stay connected with the CCS community!",
        options: [
          { id: 'alumni_insights', label: 'Show me alumni insights' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      alumni_insights: {
        text: "📈 **Alumni Career Insights:**\n\n" +
          "Our tracer study shows CCS graduates excel across various industries:\n\n" +
          "• IT/Software Development\n" +
          "• Data Science & Analytics\n" +
          "• Cybersecurity\n" +
          "• Digital Marketing\n" +
          "• Entrepreneurship\n\n" +
          "Visit the **Tracer Study** page for detailed statistics and employment trends. " +
          "Note: Individual salary and personal data are kept confidential for privacy protection.",
        options: [
          { id: 'navigation', label: 'How to navigate' },
          { id: 'go_back', label: 'Go back' }
        ]
      },

      // Alumni responses
      profile_help: {
        text: "👤 **Update Your Profile:**\n\n" +
          "1. Click on your name/avatar in the top right\n" +
          "2. Select 'Profile' from the dropdown\n" +
          "3. Click 'Edit Profile' button\n" +
          "4. Update your information (employment, location, etc.)\n" +
          "5. Save changes\n\n" +
          "Keep your profile updated so batchmates can find and connect with you!",
        options: [
          { id: 'networking', label: 'Connect with batchmates' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      networking: {
        text: "🤝 **Connect with Batchmates:**\n\n" +
          "• Go to **Alumni Directory** to search for classmates\n" +
          "• Filter by graduation year, program, or location\n" +
          "• View public profiles (private data is protected)\n" +
          "• Send connection requests\n" +
          "• Use **Messaging** to communicate\n\n" +
          "Remember: Respect privacy - only contact information marked as public is visible.",
        options: [
          { id: 'job_board', label: 'Browse jobs' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      job_board: {
        text: "💼 **Job Opportunities:**\n\n" +
          "Access the **Job Board** to:\n" +
          "• Browse current job openings\n" +
          "• Filter by industry, location, or job type\n" +
          "• Save jobs to your favorites\n" +
          "• Apply directly through the system\n\n" +
          "New opportunities are posted regularly by employers and the CCS admin team.",
        options: [
          { id: 'events', label: 'View events' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      events: {
        text: "📅 **Upcoming Events:**\n\n" +
          "Stay connected through:\n" +
          "• Alumni homecoming events\n" +
          "• Career fairs and networking sessions\n" +
          "• Workshop and seminars\n" +
          "• Virtual meetups\n\n" +
          "Check the **Events** page for the latest schedule and RSVP information.",
        options: [
          { id: 'profile_help', label: 'Update my profile' },
          { id: 'go_back', label: 'Go back' }
        ]
      },

      // Employer responses
      post_job: {
        text: "📝 **How to Post Jobs:**\n\n" +
          "1. Contact the CCS admin team at admin@ccs.edu\n" +
          "2. Provide job details (title, description, requirements)\n" +
          "3. Admin will review and post your opportunity\n" +
          "4. Qualified alumni can view and apply\n\n" +
          "Your job posting will reach our network of skilled CCS graduates!",
        options: [
          { id: 'find_talent', label: 'Find CCS graduates' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      find_talent: {
        text: "🎯 **Find CCS Graduates:**\n\n" +
          "Work with our admin team to connect with talented alumni. " +
          "We can help match your requirements with qualified candidates.\n\n" +
          "Note: For privacy protection, direct access to alumni data is restricted. " +
          "Contact admin@ccs.edu for recruitment assistance.",
        options: [
          { id: 'contact_admin', label: 'Contact admin' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      contact_admin: {
        text: "📧 **Contact CCS Admin:**\n\n" +
          "Email: admin@ccs.edu\n" +
          "Phone: (123) 456-7890\n" +
          "Office Hours: Mon-Fri, 9AM-5PM\n\n" +
          "We're here to help with recruitment, partnerships, and collaborations!",
        options: [
          { id: 'post_job', label: 'Post a job' },
          { id: 'go_back', label: 'Go back' }
        ]
      },

      // Staff responses
      admin_features: {
        text: "🔧 **Admin Features:**\n\n" +
          "• **User Management**: Manage alumni accounts\n" +
          "• **Content Moderation**: Review posts and reports\n" +
          "• **Job Postings**: Approve and publish opportunities\n" +
          "• **Analytics Dashboard**: View system statistics\n" +
          "• **Event Management**: Create and manage events\n\n" +
          "Access these features from the Admin Dashboard.",
        options: [
          { id: 'reports', label: 'Generate reports' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      reports: {
        text: "📊 **Generate Reports:**\n\n" +
          "Available reports:\n" +
          "• Employment statistics\n" +
          "• User engagement metrics\n" +
          "• Tracer study results\n" +
          "• Event attendance\n\n" +
          "Go to **Admin Dashboard → Reports** to access reporting tools.",
        options: [
          { id: 'user_management', label: 'User management' },
          { id: 'go_back', label: 'Go back' }
        ]
      },
      user_management: {
        text: "👥 **User Management:**\n\n" +
          "• View all registered users\n" +
          "• Verify alumni accounts\n" +
          "• Manage permissions\n" +
          "• Handle account issues\n\n" +
          "⚠️ Remember to protect user privacy and follow data protection policies.",
        options: [
          { id: 'admin_features', label: 'View admin features' },
          { id: 'go_back', label: 'Go back' }
        ]
      }
    };

    return responses[topicId] || {
      text: "I can help you navigate the CCS Alumni system. What would you like to know?",
      options: [{ id: 'go_back', label: 'Go back' }]
    };
  };


  const handleToggle = () => {
    if (!isOpen) setUnreadCount(0);
    onToggle && onToggle();
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={handleToggle} aria-label={isOpen ? 'Close chat' : 'Open chat'}>
        <div className="chatbot-toggle-icon">
          <div className="robot-face">
            <div className="robot-antenna"></div>
            <div className="robot-mouth"></div>
          </div>
        </div>
        <span className="chatbot-toggle-text">Ask Jaguar</span>
        {unreadCount > 0 && <span className="chatbot-badge" aria-hidden>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="header-robot-icon">🤖</span>
              <span>Ask Jaguar</span>
            </div>
            <button className="chatbot-close" onClick={handleToggle} aria-label="Close chat">
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message-bubble ${message.sender}`}>
                <div className="message-text">
                  {message.text.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>

                {!isAIMode && message.options && message.options.length > 0 && (
                  <div className="message-options">
                    {message.options.map((option) => (
                      <button
                        key={option.id}
                        className="option-btn"
                        onClick={() => handleOptionClick(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-bubble bot">
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <button 
              className="mode-toggle-btn"
              onClick={toggleAIMode}
              title={isAIMode ? 'Switch to Guided Mode' : 'Switch to AI Chat Mode'}
            >
              {isAIMode ? '📝' : '🤖'}
            </button>
            <input
              type="text"
              className="chatbot-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isAIMode ? "Type your question... (English/Filipino/Cebuano)" : "Click 🤖 for AI chat mode"}
              disabled={isTyping || !isAIMode}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim() || !isAIMode}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 