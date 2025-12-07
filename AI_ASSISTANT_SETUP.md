# AI Assistant Setup Guide

## Overview

ArielGo includes **ArielAssist**, an AI-powered personal assistant that helps customers with their laundry orders, answers questions, and provides helpful laundry care tips.

The assistant supports **two AI providers**:
1. **OpenAI** (GPT-4 / GPT-3.5) - Cloud-based, requires API key
2. **Ollama** (Local LLMs) - Runs locally, free and private

## Features

- 🤖 **Personalized Conversations**: AI knows about each user's active orders and history
- 💬 **Smart Suggestions**: Context-aware question suggestions
- 📦 **Order Integration**: Automatically provides updates about user's bookings
- 🧺 **Laundry Tips**: Generates helpful laundry care advice
- 📱 **Floating Chat Widget**: Beautiful, responsive chat interface
- 🔄 **Dual Provider Support**: Use OpenAI or Ollama

## Quick Start

### Option 1: Using Ollama (Free, Local)

**Best for**: Development, testing, privacy-focused use

1. **Install Ollama**
   ```bash
   # macOS
   brew install ollama

   # Or download from https://ollama.ai
   ```

2. **Pull a model**
   ```bash
   ollama pull llama2
   # or for better quality:
   ollama pull llama3
   ollama pull mistral
   ```

3. **Start your server**
   ```bash
   npm start
   ```

   You should see:
   ```
   ✅ AI Assistant service initialized (Ollama)
   💡 Using local Ollama - install a model with: ollama pull llama2
   ```

That's it! The AI assistant is now working with Ollama.

### Option 2: Using OpenAI (Cloud)

**Best for**: Production, highest quality responses

1. **Get an OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in
   - Navigate to **API Keys** section
   - Click **Create new secret key**
   - Copy your API key (starts with `sk-...`)

2. **Add to .env file**
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Start your server**
   ```bash
   npm start
   ```

   You should see:
   ```
   ✅ AI Assistant service initialized (OpenAI GPT-4)
   ```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# === AI ASSISTANT CONFIGURATION ===

# OpenAI (Cloud)
OPENAI_API_KEY=sk-your-key-here          # Optional: Your OpenAI API key
OPENAI_MODEL=gpt-4                       # Optional: Override model (gpt-4, gpt-3.5-turbo)

# Ollama (Local)
OLLAMA_HOST=http://localhost:11434       # Optional: Custom Ollama host
OLLAMA_MODEL=llama2                      # Optional: Override model (llama2, llama3, mistral, etc.)
```

### Provider Priority

The system uses this fallback order:
1. **OpenAI** - If `OPENAI_API_KEY` is set
2. **Ollama** - If Ollama is installed and running
3. **Disabled** - If neither is available

## Ollama Setup (Detailed)

### Installation

```bash
# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download installer from https://ollama.ai
```

### Available Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **llama2** | 3.8GB | Fast | Good | General use, development |
| **llama3** | 4.7GB | Medium | Better | Production |
| **mistral** | 4.1GB | Fast | Great | Balanced performance |
| **gemma** | 1.7GB | Fastest | Good | Low resource systems |
| **llama2:13b** | 7.3GB | Slow | Excellent | High quality responses |

### Download Models

```bash
# Download a model
ollama pull llama2

# See available models
ollama list

# Remove a model
ollama rm llama2
```

### Using Custom Models

```bash
# In .env
OLLAMA_MODEL=mistral

# Or use specific sizes
OLLAMA_MODEL=llama2:13b
```

### Verify Ollama is Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# You should see a list of installed models
```

## OpenAI Setup (Detailed)

### Getting an API Key

1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to **API Keys** → **Create new secret key**
4. Copy the key (starts with `sk-...`)
5. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```

### Model Selection

```bash
# Use GPT-4 (best quality, more expensive)
OPENAI_MODEL=gpt-4

# Use GPT-3.5 Turbo (faster, cheaper)
OPENAI_MODEL=gpt-3.5-turbo

# Use GPT-4 Turbo (balanced)
OPENAI_MODEL=gpt-4-turbo-preview
```

### Cost Considerations

**GPT-4 Pricing**:
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- **Estimated**: $0.02-$0.10 per conversation

**GPT-3.5 Turbo Pricing**:
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- **Estimated**: $0.001-$0.01 per conversation

💡 **Tip**: Use GPT-3.5 for development and testing, GPT-4 for production.

## API Endpoints

### Chat with Assistant
```http
POST /api/assistant/chat
Content-Type: application/json

{
  "message": "What's the status of my order?",
  "userEmail": "customer@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Your order #123 is confirmed...",
  "provider": "ollama",
  "tokensUsed": 0
}
```

### Get Conversation Suggestions
```http
POST /api/assistant/suggestions
Content-Type: application/json

{
  "userEmail": "customer@example.com"
}
```

### Get Laundry Care Tip
```http
GET /api/assistant/tip?topic=stain-removal
```

### Check AI Status
```http
GET /api/assistant/status
```

Response:
```json
{
  "configured": true,
  "provider": "ollama",
  "model": "llama2",
  "message": "AI Assistant ready (Ollama llama2)"
}
```

## How It Works

### 1. User Context

When a customer chats, the system:
- Fetches their active orders
- Gets their order history
- Passes context to the AI

### 2. Personalized Responses

The AI provides:
- Order status updates
- Service recommendations
- Booking assistance
- Laundry care tips

### 3. Smart Suggestions

Different suggestions based on user state:
- **New users**: "How do I schedule a pickup?"
- **Active orders**: "What's the status of my order?"

## Comparison: OpenAI vs Ollama

| Feature | OpenAI | Ollama |
|---------|--------|--------|
| **Setup** | Add API key | Install + download model |
| **Cost** | Pay per use | Free |
| **Speed** | Very fast | Fast (varies by model) |
| **Quality** | Excellent (GPT-4) | Good to Excellent |
| **Privacy** | Data sent to OpenAI | 100% local |
| **Internet** | Required | Not required |
| **Best for** | Production | Development, privacy |

## Troubleshooting

### "AI Assistant is not configured"

**Check**:
1. Is OpenAI API key in `.env`?
2. Is Ollama installed? Run `ollama --version`
3. Is Ollama running? Run `curl http://localhost:11434/api/tags`

**Fix**:
```bash
# Option 1: Add OpenAI key
echo "OPENAI_API_KEY=sk-your-key" >> .env

# Option 2: Install Ollama
brew install ollama
ollama pull llama2
```

### Ollama "Connection refused"

**Cause**: Ollama service not running

**Fix**:
```bash
# Start Ollama service
ollama serve

# Or on macOS, Ollama should auto-start
```

### OpenAI "Invalid API key"

**Fix**:
1. Verify key in `.env` is correct
2. Check key is active at platform.openai.com
3. Restart server after adding key

### Slow responses with Ollama

**Try**:
1. Use a smaller model: `ollama pull gemma`
2. Use GPU acceleration if available
3. Reduce `num_predict` in ai-assistant.js

### Out of memory with Ollama

**Fix**:
```bash
# Use smaller model
ollama pull gemma  # Only 1.7GB

# Or close other applications
```

## Chat Widget

The AI chat widget appears on:
- Main website (`/`)
- Order tracking page (`/track.html`)

### Features:
- Floating button in bottom-right
- Animated typing indicators
- Click-to-use suggestions
- Mobile-responsive
- Shows provider status

## Customization

### Modify AI Personality

Edit `services/ai-assistant.js`:

```javascript
function buildSystemPrompt(context) {
    let prompt = `You are ArielAssist, a helpful and friendly AI assistant...`;

    // Customize personality, tone, knowledge here

    return prompt;
}
```

### Adjust Response Settings

```javascript
// For OpenAI
const completion = await aiProvider.chat.completions.create({
    model: "gpt-4",
    temperature: 0.7,      // Creativity (0-1)
    max_tokens: 500       // Response length
});

// For Ollama
const completion = await aiProvider.chat({
    model: "llama2",
    options: {
        temperature: 0.7,  // Creativity (0-1)
        num_predict: 500  // Response length
    }
});
```

## Production Recommendations

### For Best Quality
```bash
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4
```

### For Cost Efficiency
```bash
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-3.5-turbo
```

### For Privacy/Self-Hosted
```bash
# Use Ollama with a good model
OLLAMA_MODEL=llama3
```

### Hybrid Approach
- **Development**: Use Ollama (free)
- **Staging**: Use GPT-3.5 Turbo (cheap)
- **Production**: Use GPT-4 (best quality)

## Security Notes

⚠️ **Never commit API keys to version control!**

- Keep `.env` in `.gitignore`
- Use environment variables in production
- Rotate keys regularly
- Monitor usage in OpenAI dashboard

## Advanced Configuration

### Multiple Providers

You can switch providers by setting/unsetting env vars:

```bash
# Use OpenAI
export OPENAI_API_KEY=sk-xxx

# Switch to Ollama
unset OPENAI_API_KEY

# Restart server
npm start
```

### Custom Ollama Host

```bash
# For remote Ollama server
OLLAMA_HOST=http://192.168.1.100:11434
```

### Rate Limiting

Add rate limiting in production:

```javascript
// In server.js
const rateLimit = require('express-rate-limit');

const assistantLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.post('/api/assistant/chat', assistantLimiter, async (req, res) => {
    // ...
});
```

## Testing the Assistant

### Test with curl

```bash
# Check status
curl http://localhost:3001/api/assistant/status

# Send message
curl -X POST http://localhost:3001/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your hours?",
    "userEmail": "test@example.com"
  }'
```

### Test in Browser

1. Open http://localhost:3001
2. Click the chat button (bottom-right)
3. Type a message
4. See AI response

## Support

Need help? Check:
- Server logs: `npm start` output
- API status: http://localhost:3001/api/assistant/status
- Ollama docs: https://ollama.ai/docs
- OpenAI docs: https://platform.openai.com/docs

## Future Enhancements

Potential improvements:
- [ ] Conversation history storage
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Sentiment analysis
- [ ] Proactive notifications
- [ ] Admin chat dashboard
- [ ] Fine-tuned custom models
