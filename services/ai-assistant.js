// ==================================
// AI ASSISTANT SERVICE
// Personal AI assistant for each user
// OpenAI GPT-3.5-Turbo (Cost-optimized)
// Rate-limited to 5 questions per user per day
// ==================================

require('dotenv').config();
const OpenAI = require('openai');

let aiProvider = null;
let providerType = 'none';

// Initialize OpenAI (required)
if (process.env.OPENAI_API_KEY) {
    aiProvider = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    providerType = 'openai';
    console.log('✅ AI Assistant service initialized (OpenAI GPT-3.5-Turbo)');
    console.log('💰 Cost-optimized: ~$0.002 per conversation');
} else {
    console.log('⚠️  AI Assistant disabled - OPENAI_API_KEY not configured');
    console.log('   Add OPENAI_API_KEY to .env to enable AI features');
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

        // Use OpenAI GPT-3.5-Turbo (cost-optimized)
        const completion = await aiProvider.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 300  // Reduced to control costs
        });

        const response = completion.choices[0].message.content;
        const tokensUsed = completion.usage.total_tokens;

        return {
            success: true,
            message: response,
            tokensUsed: tokensUsed,
            provider: 'openai',
            model: 'gpt-3.5-turbo'
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
        // Use OpenAI GPT-3.5-Turbo
        const completion = await aiProvider.chat.completions.create({
            model: "gpt-3.5-turbo",
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
            max_tokens: 100  // Reduced to control costs
        });

        const tip = completion.choices[0].message.content;

        return {
            success: true,
            tip: tip,
            provider: 'openai',
            model: 'gpt-3.5-turbo'
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
        model: 'gpt-3.5-turbo'
    };
}

module.exports = {
    chat,
    getSuggestions,
    getLaundryCareTip,
    isConfigured,
    getProviderInfo
};
