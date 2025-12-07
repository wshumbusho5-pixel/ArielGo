// ==================================
// AI ASSISTANT SERVICE
// Personal AI assistant for each user
// Supports both OpenAI and Ollama
// ==================================

require('dotenv').config();
const OpenAI = require('openai');
const { Ollama } = require('ollama');

let aiProvider = null;
let providerType = 'none';

// Try to initialize AI providers in order of preference
// 1. OpenAI (if API key provided)
// 2. Ollama (if running locally)

if (process.env.OPENAI_API_KEY) {
    // Use OpenAI
    aiProvider = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    providerType = 'openai';
    console.log('✅ AI Assistant service initialized (OpenAI GPT-4)');
} else {
    // Try Ollama as fallback
    try {
        aiProvider = new Ollama({
            host: process.env.OLLAMA_HOST || 'http://localhost:11434'
        });
        providerType = 'ollama';
        console.log('✅ AI Assistant service initialized (Ollama)');
        console.log('💡 Using local Ollama - install a model with: ollama pull llama2');
    } catch (error) {
        console.log('⚠️  No AI provider configured - AI Assistant disabled');
        console.log('   Option 1: Add OPENAI_API_KEY to .env for OpenAI');
        console.log('   Option 2: Install Ollama from https://ollama.ai');
    }
}

/**
 * Generate AI assistant response
 * @param {string} userMessage - User's message
 * @param {Object} context - Context about the user and their orders
 * @returns {Promise<string>} AI response
 */
async function chat(userMessage, context = {}) {
    if (!aiProvider) {
        return {
            success: false,
            message: "AI Assistant is not configured. Please add OPENAI_API_KEY to .env or install Ollama."
        };
    }

    try {
        const systemPrompt = buildSystemPrompt(context);

        let response;
        let tokensUsed = 0;

        if (providerType === 'openai') {
            // Use OpenAI
            const completion = await aiProvider.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            response = completion.choices[0].message.content;
            tokensUsed = completion.usage.total_tokens;

        } else if (providerType === 'ollama') {
            // Use Ollama
            const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';

            const completion = await aiProvider.chat({
                model: ollamaModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                options: {
                    temperature: 0.7,
                    num_predict: 500
                }
            });

            response = completion.message.content;
            tokensUsed = 0; // Ollama doesn't return token count
        }

        return {
            success: true,
            message: response,
            tokensUsed: tokensUsed,
            provider: providerType
        };

    } catch (error) {
        console.error('AI Assistant error:', error.message);
        return {
            success: false,
            error: error.message,
            message: "I'm having trouble responding right now. Please try again or contact support."
        };
    }
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context) {
    let prompt = `You are ArielAssist, a helpful and friendly AI assistant for ArielGo, a premium laundry pickup and delivery service.

Your role:
- Help customers with their laundry orders
- Answer questions about services, pricing, and scheduling
- Provide order status updates
- Offer laundry care tips and advice
- Handle customer service inquiries professionally

ArielGo Services:
- Standard Service: $32/bag, 24-hour turnaround
- Same-Day Service: $42/bag, picked up and returned same day
- Rush Service: $50/bag, 4-hour turnaround
- Free pickup and delivery in Seattle's U-District

Service Area: University District, Seattle, WA
Contact: (717) 537-8893 or hello@arielgo.com

Guidelines:
- Be warm, friendly, and professional
- Keep responses concise (2-3 sentences max unless explaining something complex)
- If asked about an order status, use the provided context
- If you don't know something, admit it and offer to connect them with support
- Suggest booking a pickup when appropriate
- Give helpful laundry tips when relevant (stain removal, fabric care, etc.)
`;

    // Add user-specific context if provided
    if (context.userName) {
        prompt += `\n\nCustomer Name: ${context.userName}`;
    }

    if (context.userEmail) {
        prompt += `\nCustomer Email: ${context.userEmail}`;
    }

    if (context.activeOrders && context.activeOrders.length > 0) {
        prompt += `\n\nCustomer's Active Orders:`;
        context.activeOrders.forEach(order => {
            prompt += `\n- Order #${order.id}: ${order.service} service, ${order.numberOfBags} bag(s), Status: ${order.status}, Pickup: ${order.pickupDate}`;
        });
    }

    if (context.orderHistory) {
        prompt += `\n\nTotal orders: ${context.orderHistory.totalOrders}`;
        if (context.orderHistory.totalOrders > 0) {
            prompt += `\nLast order: ${context.orderHistory.lastOrderDate}`;
        }
    }

    return prompt;
}

/**
 * Get conversation suggestions based on context
 */
function getSuggestions(context = {}) {
    const suggestions = [];

    // If user has no orders
    if (!context.activeOrders || context.activeOrders.length === 0) {
        suggestions.push(
            "How do I schedule a pickup?",
            "What are your prices?",
            "Do you offer same-day service?"
        );
    } else {
        // User has active orders
        suggestions.push(
            "What's the status of my order?",
            "When will my laundry be delivered?",
            "Can I add more bags to my order?"
        );
    }

    // Always include helpful topics
    suggestions.push(
        "How should I prepare my laundry?",
        "What items can't you clean?",
        "Do you have any special offers?"
    );

    return suggestions.slice(0, 6); // Return max 6 suggestions
}

/**
 * Generate laundry care tip
 */
async function getLaundryCareTip(topic = null) {
    if (!aiProvider) {
        return {
            success: false,
            message: "AI Assistant not configured"
        };
    }

    const prompt = topic
        ? `Give a helpful laundry tip about: ${topic}. Keep it to 2-3 sentences.`
        : `Give a random helpful laundry care tip. Keep it to 2-3 sentences.`;

    try {
        let tip;

        if (providerType === 'openai') {
            const completion = await aiProvider.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a laundry expert. Give practical, helpful laundry tips."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.8,
                max_tokens: 150
            });

            tip = completion.choices[0].message.content;

        } else if (providerType === 'ollama') {
            const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';

            const completion = await aiProvider.chat({
                model: ollamaModel,
                messages: [
                    {
                        role: "system",
                        content: "You are a laundry expert. Give practical, helpful laundry tips."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                options: {
                    temperature: 0.8,
                    num_predict: 150
                }
            });

            tip = completion.message.content;
        }

        return {
            success: true,
            tip: tip,
            provider: providerType
        };

    } catch (error) {
        console.error('Error generating tip:', error.message);
        return {
            success: false,
            message: "Couldn't generate tip right now."
        };
    }
}

/**
 * Check if AI assistant is configured
 */
function isConfigured() {
    return !!aiProvider;
}

/**
 * Get current AI provider info
 */
function getProviderInfo() {
    return {
        configured: !!aiProvider,
        provider: providerType,
        model: providerType === 'openai'
            ? (process.env.OPENAI_MODEL || 'gpt-4')
            : providerType === 'ollama'
            ? (process.env.OLLAMA_MODEL || 'llama2')
            : null
    };
}

module.exports = {
    chat,
    getSuggestions,
    getLaundryCareTip,
    isConfigured,
    getProviderInfo
};
