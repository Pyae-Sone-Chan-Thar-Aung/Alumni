// Ollama Service for CCS Alumni Chatbot
class OllamaService {
  constructor() {
    // Allow override via env var (e.g., REACT_APP_OLLAMA_URL=http://localhost:11434)
    this.baseURL = process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434';
    this.model = 'llama3.2:1b'; // Use a smaller model that fits in available memory
    this.conversationHistory = [];
  }

  // Set custom Ollama configuration
  configure(config) {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.model) this.model = config.model;
  }

  // Check if Ollama is running
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama connection failed:', error);
      return false;
    }
  }

  // Get available models
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  // Pull a model if it doesn't exist
  async pullModel(modelName) {
    try {
      const response = await fetch(`${this.baseURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model ${modelName}`);
      }

      return true;
    } catch (error) {
      console.error(`Error pulling model ${modelName}:`, error);
      return false;
    }
  }

  // Generate context from tracer study data
  generateContext(tracerData) {
    if (!tracerData || tracerData.length === 0) return '';

    // Handle array of responses directly
    const responses = Array.isArray(tracerData) ? tracerData : tracerData.responses || [];
    
    if (responses.length === 0) return '';

    // Calculate basic statistics
    const totalResponses = responses.length;
    const employed = responses.filter(r => 
      r.employment_status && 
      (r.employment_status.includes('Employed') || r.employment_status === 'Self-employed/Freelancer')
    );
    const employmentRate = Math.round((employed.length / totalResponses) * 100);

    // Get top industries
    const industries = responses
      .filter(r => r.industry && r.industry.trim())
      .map(r => r.industry);
    const industryCount = {};
    industries.forEach(industry => {
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });
    const topIndustries = Object.entries(industryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count})`);

    // Get graduation years
    const years = responses
      .filter(r => r.graduation_year)
      .map(r => r.graduation_year.toString());
    const uniqueYears = [...new Set(years)].sort().reverse();
    
    const context = `
CCS Alumni Tracer Study Data Context:

SUMMARY STATISTICS:
- Total Responses: ${totalResponses}
- Employment Rate: ${employmentRate}%
- Top Industries: ${topIndustries.join(', ') || 'N/A'}
- Graduation Years: ${uniqueYears.slice(0, 5).join(', ') || 'N/A'}

EMPLOYMENT STATUS BREAKDOWN:
- Employed (Full-time): ${responses.filter(r => r.employment_status === 'Employed (Full-time)').length}
- Employed (Part-time): ${responses.filter(r => r.employment_status === 'Employed (Part-time)').length}
- Self-employed/Freelancer: ${responses.filter(r => r.employment_status === 'Self-employed/Freelancer').length}
- Unemployed: ${responses.filter(r => r.employment_status === 'Unemployed').length}
- Graduate Student: ${responses.filter(r => r.employment_status === 'Student (Graduate Studies)').length}

RECENT GRADUATES SAMPLE:
${responses.slice(0, 5).map(grad => 
  `- ${grad.full_name || 'Anonymous'}: ${grad.degree || 'N/A'} ${grad.major || 'N/A'}, Class of ${grad.graduation_year || 'N/A'}, 
    Status: ${grad.employment_status || 'N/A'}, Company: ${grad.company_name || 'N/A'}, 
    Position: ${grad.job_title || 'N/A'}, Location: ${grad.work_location || 'N/A'}`
).join('\n')}

You are an AI assistant for the CCS Alumni system. Use this data to answer questions about:
- Employment statistics and trends
- Graduate outcomes by program or year
- Industry distribution
- Career paths and opportunities
- Alumni success stories

Be helpful, accurate, and reference the actual data when possible. Keep responses concise and informative.
`;

    return context;
  }

  // Send message to Ollama
  async sendMessage(message, tracerData = null, options = {}) {
    try {
      // Check connection first
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        throw new Error('Ollama is not running. Please start Ollama service.');
      }

      // Generate context if tracer data is provided
      const context = tracerData ? this.generateContext(tracerData) : '';
      
      // Prepare the prompt
      const systemPrompt = context ? 
        `${context}\n\nUser Question: ${message}` : 
        message;

      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Try different models in order of preference (smallest first for memory constraints)
      const modelsToTry = ['llama3.2:1b', 'llama3.2:3b', 'llama3.1:8b', 'gpt-oss:20b'];
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const requestBody = {
            model: modelName,
            prompt: systemPrompt,
            stream: false,
            options: {
              temperature: options.temperature || 0.7,
              top_p: options.top_p || 0.9,
              top_k: options.top_k || 40,
              ...options
            }
          };

          const response = await fetch(`${this.baseURL}/api/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes('system memory') || errorText.includes('memory')) {
              console.log(`Model ${modelName} requires too much memory, trying next model...`);
              continue;
            }
            if (errorText.includes('model') && errorText.includes('not found')) {
              console.log(`Model ${modelName} not found, trying next model...`);
              continue;
            }
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          // Update current model to the working one
          this.model = modelName;
          
          // Add response to conversation history
          this.conversationHistory.push({
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString()
          });

          return {
            success: true,
            response: data.response,
            model: modelName,
            timestamp: new Date().toISOString()
          };

        } catch (error) {
          lastError = error;
          console.log(`Failed with model ${modelName}: ${error.message}`);
          continue;
        }
      }

      // If all models failed, throw the last error
      throw lastError || new Error('All models failed to respond');

    } catch (error) {
      console.error('Ollama service error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Stream response (for real-time typing effect)
  async streamMessage(message, tracerData = null, onChunk = null) {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        throw new Error('Ollama is not running. Please start Ollama service.');
      }

      const context = tracerData ? this.generateContext(tracerData) : '';
      const systemPrompt = context ? 
        `${context}\n\nUser Question: ${message}` : 
        message;

      const requestBody = {
        model: this.model,
        prompt: systemPrompt,
        stream: true
      };

      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              if (onChunk) onChunk(data.response);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      return {
        success: true,
        response: fullResponse,
        model: this.model
      };

    } catch (error) {
      console.error('Stream error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get predefined questions for the CCS Alumni system
  getPredefinedQuestions() {
    return [
      "What is the current employment rate of CCS graduates?",
      "Which industries do most CCS graduates work in?",
      "What is the average salary of CCS graduates?",
      "How many graduates responded to the tracer study?",
      "What are the career outcomes for Computer Science graduates?",
      "Which companies hire the most CCS alumni?",
      "What is the employment trend over the years?",
      "How do different programs compare in terms of employment?",
      "What skills are most in demand for CCS graduates?",
      "What advice would you give to current CCS students?"
    ];
  }
}

// Create singleton instance
const ollamaService = new OllamaService();

export default ollamaService;
