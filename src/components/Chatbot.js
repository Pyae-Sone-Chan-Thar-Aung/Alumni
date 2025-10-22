import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';
import ollamaService from '../services/ollamaService';
import './Chatbot.css';

const Chatbot = ({ isOpen, onToggle, tracerData = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your CCS Alumni AI assistant powered by Ollama. I can help you analyze tracer study data, answer questions about graduate outcomes, and provide insights about alumni careers. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentModel, setCurrentModel] = useState('llama2');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    const connected = await ollamaService.checkConnection();
    setIsConnected(connected);
    if (!connected) {
      const errorMessage = {
        id: Date.now(),
        text: "⚠️ Ollama is not running. Please start Ollama service to enable AI responses. For now, I'll provide basic responses.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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
    setShowSuggestions(false);

    try {
      let botResponse;
      
      if (isConnected) {
        // Use Ollama for AI responses
        const response = await ollamaService.sendMessage(currentInput, tracerData, {
          temperature: 0.7,
          top_p: 0.9
        });
        
        if (response.success) {
          botResponse = response.response;
        } else {
          botResponse = `❌ AI Error: ${response.error}\n\nFalling back to basic response:\n${getBasicResponse(currentInput)}`;
        }
      } else {
        // Fallback to basic responses
        botResponse = getBasicResponse(currentInput);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        model: isConnected ? currentModel : 'basic'
      };
      
      setMessages(prev => [...prev, botMessage]);
      if (!isOpen) setUnreadCount(c => c + 1);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `❌ Error: ${error.message}\n\nFalling back to basic response:\n${getBasicResponse(currentInput)}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBasicResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // If we have tracer study data, provide data-driven responses
    if (tracerData && tracerData.length > 0) {
      const responses = tracerData;
      const totalResponses = responses.length;
      const employed = responses.filter(r => 
        r.employment_status && 
        (r.employment_status.includes('Employed') || r.employment_status === 'Self-employed/Freelancer')
      );
      const employmentRate = Math.round((employed.length / totalResponses) * 100);
      
      if (lowerMessage.includes('employment') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
        return `Based on our tracer study data:\n\n📊 **Employment Statistics:**\n- Total Responses: ${totalResponses}\n- Employment Rate: ${employmentRate}%\n- Employed (Full-time): ${responses.filter(r => r.employment_status === 'Employed (Full-time)').length}\n- Employed (Part-time): ${responses.filter(r => r.employment_status === 'Employed (Part-time)').length}\n- Self-employed/Freelancer: ${responses.filter(r => r.employment_status === 'Self-employed/Freelancer').length}\n- Unemployed: ${responses.filter(r => r.employment_status === 'Unemployed').length}`;
      }
      
      if (lowerMessage.includes('industry') || lowerMessage.includes('company') || lowerMessage.includes('sector')) {
        const industries = responses.filter(r => r.industry && r.industry.trim()).map(r => r.industry);
        const industryCount = {};
        industries.forEach(industry => {
          industryCount[industry] = (industryCount[industry] || 0) + 1;
        });
        const topIndustries = Object.entries(industryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => `• ${name}: ${count} graduates`);
        
        return `🏢 **Top Industries for CCS Graduates:**\n\n${topIndustries.join('\n')}\n\nOur graduates work across ${Object.keys(industryCount).length} different industries, showing the versatility of CCS programs.`;
      }
      
      if (lowerMessage.includes('salary') || lowerMessage.includes('income') || lowerMessage.includes('wage')) {
        const salaryRanges = responses.filter(r => r.monthly_salary && r.monthly_salary.trim());
        return `💰 **Salary Information:**\n\nWe have salary data from ${salaryRanges.length} graduates. Compensation varies by industry, experience, and position level. Common salary ranges include entry-level to senior positions across various sectors.`;
      }
      
      if (lowerMessage.includes('program') || lowerMessage.includes('course') || lowerMessage.includes('curriculum')) {
        const curriculumHelpful = responses.filter(r => r.curriculum_helpful === true).length;
        const totalWithFeedback = responses.filter(r => r.curriculum_helpful !== null).length;
        const helpfulPercentage = totalWithFeedback > 0 ? Math.round((curriculumHelpful / totalWithFeedback) * 100) : 0;
        
        return `🎓 **Program Effectiveness:**\n\n${curriculumHelpful} out of ${totalWithFeedback} graduates (${helpfulPercentage}%) found the curriculum helpful for their careers.\n\nOur programs prepare students for diverse career paths with practical skills and knowledge.`;
      }
      
      if (lowerMessage.includes('year') || lowerMessage.includes('graduation') || lowerMessage.includes('class')) {
        const years = responses.filter(r => r.graduation_year).map(r => r.graduation_year.toString());
        const uniqueYears = [...new Set(years)].sort().reverse();
        return `📅 **Graduation Years Represented:**\n\n${uniqueYears.slice(0, 8).join(', ')}\n\nWe have responses from graduates across ${uniqueYears.length} different graduation years.`;
      }
    }
    
    // Default responses when no data is available
    if (lowerMessage.includes('employment') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
      return "I can provide detailed employment statistics when tracer study data is available. Please visit the Tracer Study section for comprehensive career outcome analysis.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to help with questions about CCS alumni data, employment outcomes, and career insights. What specific information are you looking for?";
    }
    
    return "I can help you with questions about CCS alumni employment outcomes, career paths, industry trends, and program effectiveness. What would you like to know?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  const suggestions = ollamaService.getPredefinedQuestions();

  const handleToggle = () => {
    if (!isOpen) setUnreadCount(0);
    onToggle && onToggle();
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={handleToggle} aria-label={isOpen ? 'Close chat' : 'Open chat'}>
        <FaComments />
        {unreadCount > 0 && <span className="chatbot-badge" aria-hidden>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaRobot />
              <span>CCS Alumni AI Assistant</span>
              <div className="connection-status">
                <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
                <span className="status-text">{isConnected ? 'Ollama Connected' : 'Basic Mode'}</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={handleToggle} aria-label="Close chat">
              <FaTimes />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
                <div className="message-content">
                  {message.text.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="message-meta">
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.model && (
                    <span className="message-model">via {message.model}</span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator dots" role="status" aria-live="polite" aria-label="Assistant is typing">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              </div>
            )}
            
            {showSuggestions && messages.length <= 2 && (
              <div className="suggestions-container">
                <div className="suggestions-header">
                  <FaLightbulb />
                  <span>Try asking:</span>
                </div>
                <div className="suggestions-grid">
                  {suggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about CCS alumni outcomes, employment rates, salaries, or career trends..."
              disabled={isTyping}
              rows={1}
              style={{ resize: 'none', overflow: 'hidden' }}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isTyping || !inputMessage.trim()}
              className={isTyping ? 'sending' : ''}
            >
              {isTyping ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 