# Ollama AI Setup Guide - Quick Start

## Problem: AI Responses Not Working

If you're seeing **repetitive or basic responses** instead of intelligent AI answers, it means **Ollama is not running** or not connected properly.

---

## Quick Fix (3 Steps)

### Step 1: Check if Ollama is Installed

Open PowerShell or Command Prompt and run:
```bash
ollama --version
```

**If you see an error** → Ollama is not installed. Go to Step 2.  
**If you see a version number** → Ollama is installed. Go to Step 3.

---

### Step 2: Install Ollama (If Not Installed)

1. **Download Ollama:**
   - Visit: https://ollama.ai/
   - Click "Download for Windows"
   - Run the installer

2. **Verify Installation:**
   ```bash
   ollama --version
   ```

---

### Step 3: Start Ollama Service

#### Option A: Start Ollama Server
```bash
ollama serve
```
- **Leave this terminal window open** while using the chatbot
- You should see: `Listening on 127.0.0.1:11434`

#### Option B: Run as Background Service (Windows)
Ollama usually runs automatically after installation, but if not:
1. Check Windows Services
2. Look for "Ollama" service
3. Start it if stopped

---

### Step 4: Pull an AI Model

In a **new terminal window**, run:
```bash
ollama pull llama3.2:1b
```

**Why this model?**
- `llama3.2:1b` is small (1.3 GB)
- Runs on most computers
- Good for multi-language support
- Faster responses

**Alternative models** (if you have more RAM):
```bash
# Medium model (better quality, needs ~3GB RAM)
ollama pull llama3.2:3b

# Large model (best quality, needs ~8GB RAM)
ollama pull llama3.1:8b
```

---

## Testing Ollama

### Test 1: Check if Ollama is Running
```bash
curl http://localhost:11434/api/tags
```

**Expected output:** JSON list of installed models

**If error:** Ollama is not running → Go back to Step 3

---

### Test 2: Test AI Response
```bash
ollama run llama3.2:1b
```

Then type:
```
>>> Hello, how are you?
```

**Expected:** You get an intelligent AI response

**If working:** Press `Ctrl+D` to exit, then test the chatbot!

---

## How to Know if It's Working in Your Chatbot

### Visual Indicators:

1. **Click the 🤖 button** to enter AI Mode

2. **Look for the connection message:**
   - ✅ **"Ollama AI Connected - Intelligent responses enabled!"**  
     → Working! AI will respond intelligently
   
   - ⚠️ **"Ollama not running - Using basic fallback responses"**  
     → Not working! Start Ollama (Step 3)

3. **Test with a question:**

**English Test:**
```
You: How do I update my profile?
```

**Expected AI Response:**
```
AI: To update your profile in the CCS Alumni System:

1. Click on your name/avatar in the top right corner
2. Select "Profile" from the dropdown menu
3. Click the "Edit Profile" button
4. Update your information (employment, education, etc.)
5. Click "Save" to apply changes

Is there anything specific you'd like to update?
```

**Filipino Test:**
```
You: Paano ko i-update ang aking profile?
```

**Expected AI Response (in Filipino):**
```
AI: Upang i-update ang iyong profile sa CCS Alumni System:

1. I-click ang iyong pangalan sa kanang sulok sa itaas
2. Piliin ang "Profile" mula sa dropdown menu
3. I-click ang "Edit Profile" button
4. I-update ang iyong impormasyon
5. I-click ang "Save" para i-save ang changes

May specific na gusto mong i-update?
```

---

## Common Issues & Solutions

### Issue 1: "Connection Refused" Error
**Cause:** Ollama server is not running  
**Solution:**
```bash
ollama serve
```
Keep this terminal open!

---

### Issue 2: "Model Not Found" Error
**Cause:** AI model not downloaded  
**Solution:**
```bash
ollama pull llama3.2:1b
```
Wait for download to complete (1-2 minutes)

---

### Issue 3: Slow Responses
**Cause:** Large model on limited RAM  
**Solution:** Use smaller model
```bash
# Use the 1B model (smallest, fastest)
ollama pull llama3.2:1b

# Stop current model
ollama stop llama3.1:8b

# The system will automatically use llama3.2:1b
```

---

### Issue 4: Ollama Running But Still Not Working
**Cause:** Firewall or port blocked  
**Solution:**
1. Check if Ollama is listening:
   ```bash
   netstat -an | findstr "11434"
   ```
   Expected: `TCP 127.0.0.1:11434`

2. Check browser console:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for "Ollama" messages
   - Should see: "Ollama AI Response: ..."

---

## Development Workflow

### When Coding (Recommended):
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start React App
npm start
```

### Testing Multi-Language:
1. Click 🤖 to enter AI Mode
2. Check status: ✅ Connected
3. Test English: "How do I apply for jobs?"
4. Test Filipino: "Paano ako mag-apply sa trabaho?"
5. Test Cebuano: "Unsaon nako pag-apply sa trabaho?"

---

## Performance Tips

### For Best Performance:
1. **Use smallest model that works:**
   - `llama3.2:1b` - Good for most use cases
   - `llama3.2:3b` - Better quality, slower
   - `llama3.1:8b` - Best quality, much slower

2. **Keep Ollama running in background:**
   - Set up as Windows service
   - Or keep terminal open

3. **Adjust temperature for consistency:**
   - Current setting: `0.8` (creative)
   - For more consistent: `0.5-0.7`
   - For more creative: `0.8-1.0`

---

## Checking Browser Console

To see detailed AI responses:

1. **Open Browser (Chrome/Edge)**
2. **Press F12** (Developer Tools)
3. **Go to Console tab**
4. **Look for these messages:**
   ```
   Ollama AI Response: [AI's actual response]
   Ollama Error: [if there's an error]
   Ollama not connected - using fallback responses
   ```

This helps debug connection issues!

---

## System Requirements

### Minimum (for llama3.2:1b):
- **RAM:** 4GB available
- **Storage:** 2GB free space
- **OS:** Windows 10/11, macOS, Linux

### Recommended (for llama3.2:3b):
- **RAM:** 8GB available
- **Storage:** 4GB free space
- **CPU:** Modern processor (2018+)

### Optimal (for llama3.1:8b):
- **RAM:** 16GB available
- **Storage:** 10GB free space
- **GPU:** Optional (speeds up responses)

---

## Quick Checklist

Before asking "Why is AI not working?", verify:

- [ ] Ollama is installed (`ollama --version`)
- [ ] Ollama server is running (`ollama serve`)
- [ ] Model is downloaded (`ollama list`)
- [ ] Port 11434 is accessible
- [ ] React app is running (`npm start`)
- [ ] Clicked 🤖 button to enter AI Mode
- [ ] Saw ✅ "Ollama AI Connected" message
- [ ] Tested with actual question

---

## Need Help?

### Check Logs:
```bash
# Windows
%USERPROFILE%\.ollama\logs

# Check if model is loaded
ollama ps
```

### Community Support:
- Ollama GitHub: https://github.com/ollama/ollama
- Ollama Discord: https://discord.gg/ollama

---

## Summary Commands

```bash
# 1. Install Ollama
# Download from https://ollama.ai/

# 2. Start Ollama
ollama serve

# 3. Pull model (in new terminal)
ollama pull llama3.2:1b

# 4. Test
ollama run llama3.2:1b

# 5. Start your app
npm start

# 6. Test in chatbot
# Click 🤖 → Should see ✅ Connected
```

---

**Now your AI chatbot should work with intelligent, multi-language responses!** 🎉

If you still see basic/repetitive responses, Ollama is not running correctly. Double-check Steps 1-4.
