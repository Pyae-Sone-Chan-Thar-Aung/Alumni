# Hybrid Chatbot with AI & Multi-Language Support

## Overview

The CCS Alumni chatbot now features a **HYBRID SYSTEM** that combines:
1. **Guided Button Mode** - Structured conversation with predefined topics
2. **AI Chat Mode** - Free-text input with Ollama AI supporting multi-language conversations

This addresses your client's requirement for **multi-language support** (English, Filipino, Cebuano) while maintaining the structured guidance system.

---

## Two Modes

### 📝 **Guided Mode** (Default)
- Button-based navigation
- Predefined topics and responses
- Easy for users who want quick answers
- No typing required

### 🤖 **AI Chat Mode**
- Free-text input field
- Multi-language AI responses (English, Filipino, Cebuano)
- Ollama AI integration
- Natural conversation
- Fallback to basic responses if Ollama is offline

---

## How It Works

### User Experience

```
┌─────────────────────────────────────┐
│  🤖 Ask Jaguar              [×]     │
├─────────────────────────────────────┤
│  Bot: Hi. My name is Jaguar!        │
│                                     │
│  [  I'm a student  ]                │ ← Guided Mode
│  [ I'm an alumnus  ]                │   (Buttons)
│  [ I'm an employer ]                │
│  [  I'm a staff    ]                │
│                                     │
├─────────────────────────────────────┤
│  🤖  [Type here...]          📤    │ ← Input always visible
│      ↑                        ↑     │
│   Toggle  Input field       Send   │
└─────────────────────────────────────┘
```

**Switching to AI Mode:**
1. User clicks the 🤖 button (mode toggle)
2. Bot shows: "AI Mode activated!"
3. Input field becomes active
4. User can type questions in any language
5. AI responds in the same language

**Switching back to Guided Mode:**
1. User clicks the 📝 button
2. Conversation resets to welcome screen
3. Buttons reappear for guided navigation

---

## Multi-Language Support

### Language Detection
The AI automatically detects and responds in the user's language:

**Example Conversations:**

#### English:
```
User: How do I update my profile?
AI: To update your profile:
1. Click on your name in the top right
2. Select 'Profile' from the dropdown
3. Click 'Edit Profile' button
...
```

#### Filipino/Tagalog:
```
User: Paano ko i-update ang aking profile?
AI: Upang i-update ang iyong profile:
1. I-click ang iyong pangalan sa kanang sulok sa itaas
2. Piliin ang 'Profile' mula sa dropdown
3. I-click ang 'Edit Profile' button
...
```

#### Cebuano:
```
User: Unsaon nako pag-update sa akong profile?
AI: Aron ma-update ang imong profile:
1. I-click ang imong ngalan sa tuong sulok sa ibabaw
2. Pilia ang 'Profile' gikan sa dropdown
3. I-click ang 'Edit Profile' button
...
```

---

## AI System Prompt

The AI is instructed with:

```
You are Jaguar, the CCS Alumni System assistant.

IMPORTANT LANGUAGE INSTRUCTIONS:
- Detect the user's language (English, Filipino/Tagalog, or Cebuano)
- Respond in the SAME language the user is using
- Be natural and conversational in that language

Your role:
- Help users navigate the CCS Alumni system
- Answer questions about features and functionality
- Provide system guidance and support
- Be friendly, helpful, and respectful

IMPORTANT PRIVACY RULES:
- NEVER reveal other users' passwords, emails, phone numbers, or addresses
- NEVER share individual salary information
- Only provide aggregated, anonymous statistics
- Protect all personal and confidential data
```

---

## Components

### Toggle Button (🤖 / 📝)
- **Location**: Left side of input container
- **Function**: Switches between AI and Guided modes
- **Icons**: 
  - 🤖 = Switch to AI Mode (when in Guided Mode)
  - 📝 = Switch to Guided Mode (when in AI Mode)

### Input Field
- **Enabled**: Only in AI Mode
- **Disabled**: In Guided Mode (shows gray with hint)
- **Placeholder**: 
  - AI Mode: "Type your question... (English/Filipino/Cebuano)"
  - Guided Mode: "Click 🤖 for AI chat mode"

### Send Button (📤)
- **Enabled**: Only when in AI Mode and text is entered
- **Disabled**: In Guided Mode or when input is empty
- **Action**: Sends message to Ollama AI

### Typing Indicator
- Shows three bouncing dots when AI is processing
- Appears in bot message bubble
- Indicates AI is "thinking"

---

## Ollama Integration

### Connection Status
- **Checked** automatically when chatbot opens
- **Connected ✓**: AI responses via Ollama
- **Disconnected**: Falls back to basic responses

### Basic Fallback Responses
When Ollama is offline, the system provides multilingual fallback:

```javascript
// Multi-language basic responses
- "kamusta/kumusta/hello/hi" → Greeting in English & Filipino
- "salamat/thank" → "You're welcome! / Walang anuman!"
- "help/tulong" → Lists available help topics
- Default → Explains AI chat capability in 3 languages
```

### Models Used
The system tries models in order:
1. `llama3.2:1b` (smallest, fastest)
2. `llama3.2:3b` 
3. `llama3.1:8b`
4. `gpt-oss:20b` (if available)

Uses the first model that works based on available memory.

---

## Privacy Protection

### Built-in Safeguards

**❌ Blocked Queries:**
- "Show me John's email"
- "What is Maria's salary?"
- "Give me phone numbers of graduates"
- "What's the admin password?"

**✅ Allowed Queries:**
- "How do I update my profile?" (Guidance)
- "What industries do CCS graduates work in?" (Aggregated data)
- "How do I connect with batchmates?" (System help)
- "Show me employment statistics" (Anonymous data only)

### AI Instructions
The AI is explicitly instructed to:
- NEVER reveal personal data
- Only provide aggregated statistics
- Respect user privacy at all times
- Redirect privacy-sensitive questions to admin contact

---

## User Interface Elements

### Mode Indicator
In AI Mode, the bot shows:
```
🤖 AI Mode activated! (Ollama Connected ✓)

You can now type your questions in English, Filipino, 
or Cebuano, and I'll respond in your language!

Type your question below...
```

### Input Container Layout
```
┌──────────────────────────────────────┐
│  [🤖]  [Type here...]  [📤]         │
│   ↑         ↑             ↑          │
│ Toggle   Input        Send          │
└──────────────────────────────────────┘
```

---

## CSS Styling

### Input Container
```css
.chatbot-input-container {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}
```

### Mode Toggle Button
```css
.mode-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--uic-pink);
  background: white;
  font-size: 1.2rem;
}
```

### Input Field
```css
.chatbot-input {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
}

.chatbot-input:focus:not(:disabled) {
  border-color: var(--uic-pink);
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
}

.chatbot-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  color: #999;
}
```

### Send Button
```css
.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--uic-pink);
  color: white;
}
```

---

## Benefits of Hybrid Approach

### ✅ **Best of Both Worlds**
- **Guided Mode**: Fast, structured, no typing needed
- **AI Mode**: Flexible, natural, multi-language

### ✅ **Language Flexibility**
- Supports English, Filipino, and Cebuano
- AI detects language automatically
- Natural conversation in user's language

### ✅ **Client Requirement Met**
- ✓ Multi-language support
- ✓ Free-text input capability
- ✓ AI-powered responses (when Ollama is available)
- ✓ Graceful fallback when offline

### ✅ **User Choice**
- Users can switch modes anytime
- No forced path
- Accommodates different preferences

### ✅ **Privacy Protected**
- AI instructions prevent data leaks
- Guided mode has no privacy risks
- Both modes respect data protection

---

## Usage Scenarios

### Scenario 1: Quick Navigation (Guided Mode)
```
User wants to know about job opportunities
→ Stays in Guided Mode
→ Clicks "I'm an alumnus"
→ Clicks "Job Opportunities"
→ Gets instant, structured answer
```

### Scenario 2: Specific Question in Filipino (AI Mode)
```
User: Ano ang requirements para sa profile verification?
→ Clicks 🤖 to enter AI Mode
→ Types question in Filipino
→ AI responds in Filipino with detailed steps
→ Natural back-and-forth conversation
```

### Scenario 3: Cebuano Speaker (AI Mode)
```
User: Kumusta, unsa ang mahimo nako dinhi?
→ Already in AI Mode
→ AI detects Cebuano
→ Responds in Cebuano
→ User continues conversation in Cebuano
```

---

## Setup Instructions

### Prerequisites
For full AI functionality:
1. **Install Ollama**: https://ollama.ai/
2. **Pull a model**: 
   ```bash
   ollama pull llama3.2:1b
   ```
3. **Start Ollama**:
   ```bash
   ollama serve
   ```

### Without Ollama
The chatbot still works with:
- ✅ Guided Mode (full functionality)
- ✅ Basic AI Mode (fallback responses)
- ❌ Advanced multilingual AI (requires Ollama)

---

## Testing Guide

### Test Guided Mode
1. Open chatbot
2. Click any button option
3. Navigate through conversation
4. Verify all paths work

### Test AI Mode
1. Click 🤖 button
2. Verify input field activates
3. Type a question in English
4. Verify response arrives

### Test Multi-Language
1. In AI Mode, type in Filipino:
   ```
   Kumusta! Paano ako makapag-register?
   ```
2. Verify AI responds in Filipino

3. Type in Cebuano:
   ```
   Unsaon nako pag-connect sa akong mga batchmates?
   ```
4. Verify AI responds in Cebuano

### Test Mode Switching
1. Start in Guided Mode
2. Click 🤖 → Switch to AI Mode
3. Type a message
4. Click 📝 → Return to Guided Mode
5. Verify conversation resets

### Test Privacy
1. In AI Mode, ask:
   ```
   What is John Doe's email address?
   ```
2. Verify AI refuses or redirects

---

## Troubleshooting

### Issue: AI Not Responding
**Cause**: Ollama not running
**Solution**:
1. Check Ollama status
2. Start Ollama: `ollama serve`
3. Refresh chatbot

### Issue: Wrong Language Response
**Cause**: Ambiguous input or model limitation
**Solution**:
1. Be more explicit: "Please respond in Filipino"
2. Use more text in your question
3. Try a larger model if available

### Issue: Input Field Disabled
**Cause**: Not in AI Mode
**Solution**: Click the 🤖 button to enable AI Mode

### Issue: Send Button Not Working
**Cause**: Input is empty or AI is typing
**Solution**: 
- Type a message first
- Wait for current response to complete

---

## Future Enhancements

### Potential Additions
1. **Voice Input**: Speech-to-text in multiple languages
2. **Conversation History**: Save chat history across sessions
3. **Suggested Responses**: Quick reply buttons in AI mode
4. **Language Selector**: Manual language selection
5. **Translation**: Translate between languages
6. **Context Memory**: Remember previous conversation context
7. **File Upload**: Attach files/images to questions
8. **Emoji Support**: Enhanced emoji reactions

---

## Conclusion

The hybrid chatbot system successfully combines:
- ✅ **Guided navigation** for quick, structured help
- ✅ **AI chat mode** for flexible, natural conversation
- ✅ **Multi-language support** (English, Filipino, Cebuano)
- ✅ **Privacy protection** at all levels
- ✅ **Graceful degradation** when Ollama is offline

This solution meets your client's requirements while maintaining the structured guidance you initially built!

---

**Last Updated**: January 2025  
**Version**: 3.0 (Hybrid AI + Guided System)  
**Ollama Integration**: ✓ Enabled  
**Languages**: English, Filipino/Tagalog, Cebuano
