// ==================================
// AI ASSISTANT SERVICE
// Personal AI assistant for each user
// ==================================

require('dotenv').config();
const OpenAI = require('openai');

let openai = null;

// Initialize OpenAI client if API key is provided
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ AI Assistant service initialized');
} else {
    console.log('⚠️  OpenAI API key not configured - AI Assistant disabled');
}

/**
 * Generate AI assistant response
 * @param {string} userMessage - User's message
 * @param {Object} context - Context about the user and their orders
 * @returns {Promise<string>} AI response
 */
async function chat(userMessage, context = {}) {
    if (!openai) {
        return {
            success: false,
            message: "AI Assistant is not configured. Please add your OpenAI API key to enable this feature."
        };
    }

    try {
        const systemPrompt = buildSystemPrompt(context);

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const response = completion.choices[0].message.content;

        return {
            success: true,
            message: response,
            tokensUsed: completion.usage.total_tokens
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
    if (!openai) {
        return {
            success: false,
            message: "AI Assistant not configured"
        };
    }

    const prompt = topic
        ? `Give a helpful laundry tip about: ${topic}. Keep it to 2-3 sentences.`
        : `Give a random helpful laundry care tip. Keep it to 2-3 sentences.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
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

        return {
            success: true,
            tip: completion.choices[0].message.content
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
    return !!openai;
}

module.exports = {
    chat,
    getSuggestions,
    getLaundryCareTip,
    isConfigured
};
