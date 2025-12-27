// Floating AI Chat Widget - Premium Design
(function() {
    'use strict';

    // Chat Widget HTML
    const chatHTML = `
        <div id="ai-chat-widget" class="ai-chat-widget">
            <!-- Chat Button -->
            <button id="chat-toggle" class="chat-toggle" aria-label="Open AI Assistant">
                <span class="chat-icon">🤖</span>
                <span class="chat-text">Chat with AI</span>
                <span class="chat-pulse"></span>
            </button>

            <!-- Chat Window -->
            <div id="chat-window" class="chat-window">
                <div class="chat-header">
                    <div class="chat-header-left">
                        <div class="chat-avatar">🤖</div>
                        <div>
                            <div class="chat-title">ArielAssist</div>
                            <div class="chat-status">
                                <span class="status-dot"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button id="chat-close" class="chat-close" aria-label="Close chat">✕</button>
                </div>

                <div class="chat-messages" id="chat-messages">
                    <div class="message ai-message">
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">
                            <div class="message-bubble">
                                Hi! I'm ArielAssist, your AI laundry concierge. I can help you:
                                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                                    <li>Book a pickup</li>
                                    <li>Track your order</li>
                                    <li>Answer questions</li>
                                    <li>Manage your account</li>
                                </ul>
                                How can I help you today?
                            </div>
                            <div class="message-time">Just now</div>
                        </div>
                    </div>
                </div>

                <div class="chat-input-container">
                    <div class="quick-actions" id="quick-actions">
                        <button class="quick-btn" data-message="I want to book a pickup">📅 Book Pickup</button>
                        <button class="quick-btn" data-message="Track my order">📦 Track Order</button>
                        <button class="quick-btn" data-message="What are your prices?">💰 Pricing</button>
                    </div>
                    <div class="chat-input-wrapper">
                        <input
                            type="text"
                            id="chat-input"
                            class="chat-input"
                            placeholder="Type your message..."
                            autocomplete="off"
                        >
                        <button id="chat-send" class="chat-send" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inject CSS
    const chatCSS = `
        .ai-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .chat-toggle {
            position: relative;
            background: linear-gradient(135deg, #FF6B00 0%, #F59E0B 50%, #FCD34D 100%);
            color: white;
            border: none;
            border-radius: 30px;
            padding: 15px 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(255, 107, 0, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .chat-toggle:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(255, 107, 0, 0.6);
        }

        .chat-icon {
            font-size: 24px;
            animation: bounce 2s infinite;
        }

        .chat-text {
            white-space: nowrap;
        }

        .chat-pulse {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 12px;
            height: 12px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 400px;
            max-width: calc(100vw - 40px);
            height: 600px;
            max-height: calc(100vh - 120px);
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }

        .chat-window.open {
            display: flex;
        }

        .chat-header {
            background: linear-gradient(135deg, #FF6B00 0%, #F59E0B 50%, #FCD34D 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .chat-avatar {
            width: 45px;
            height: 45px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }

        .chat-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .chat-status {
            font-size: 13px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .chat-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.2s ease;
        }

        .chat-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .message {
            display: flex;
            gap: 10px;
            animation: messageSlide 0.3s ease;
        }

        .message.user-message {
            flex-direction: row-reverse;
        }

        .message-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #FF6B00 0%, #F59E0B 50%, #FCD34D 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }

        .user-message .message-avatar {
            background: #e2e8f0;
        }

        .message-content {
            flex: 1;
            max-width: 75%;
        }

        .message-bubble {
            background: white;
            padding: 12px 16px;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            line-height: 1.6;
            color: #1a1a1a;
        }

        .user-message .message-bubble {
            background: linear-gradient(135deg, #FF6B00 0%, #F59E0B 50%, #FCD34D 100%);
            color: white;
        }

        .message-time {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 4px;
            padding-left: 4px;
        }

        .chat-input-container {
            background: white;
            border-top: 1px solid #e2e8f0;
            padding: 16px;
        }

        .quick-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }

        .quick-btn {
            background: #f1f5f9;
            border: none;
            padding: 8px 14px;
            border-radius: 12px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quick-btn:hover {
            background: #e2e8f0;
            transform: translateY(-1px);
        }

        .chat-input-wrapper {
            display: flex;
            gap: 8px;
        }

        .chat-input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 14px;
            transition: all 0.2s ease;
        }

        .chat-input:focus {
            outline: none;
            border-color: #FF6B00;
            box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }

        .chat-send {
            background: linear-gradient(135deg, #FF6B00 0%, #F59E0B 50%, #FCD34D 100%);
            border: none;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .chat-send:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(255, 107, 0, 0.4);
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes messageSlide {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .chat-window {
                width: calc(100vw - 40px);
                height: calc(100vh - 120px);
            }

            .chat-text {
                display: none;
            }

            .chat-toggle {
                width: 60px;
                height: 60px;
                padding: 0;
                border-radius: 50%;
                justify-content: center;
            }
        }
    `;

    // Initialize
    function init() {
        // Inject CSS
        const style = document.createElement('style');
        style.textContent = chatCSS;
        document.head.appendChild(style);

        // Inject HTML
        document.body.insertAdjacentHTML('beforeend', chatHTML);

        // Get elements
        const chatToggle = document.getElementById('chat-toggle');
        const chatClose = document.getElementById('chat-close');
        const chatWindow = document.getElementById('chat-window');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const chatMessages = document.getElementById('chat-messages');
        const quickActions = document.querySelectorAll('.quick-btn');

        // Toggle chat
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            if (chatWindow.classList.contains('open')) {
                chatInput.focus();
            }
        });

        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('open');
        });

        // Send message
        function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;

            addUserMessage(message);
            chatInput.value = '';

            // Simulate AI response
            setTimeout(() => {
                addAIResponse(message);
            }, 800);
        }

        chatSend.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Quick actions
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                chatInput.value = message;
                sendMessage();
            });
        });

        // Add user message
        function addUserMessage(text) {
            const messageHTML = `
                <div class="message user-message">
                    <div class="message-avatar">👤</div>
                    <div class="message-content">
                        <div class="message-bubble">${text}</div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', messageHTML);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Add AI response
        function addAIResponse(userMessage) {
            let response = getAIResponse(userMessage);

            const messageHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="message-bubble">${response}</div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', messageHTML);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Simple AI responses (replace with real AI later)
        function getAIResponse(message) {
            const msg = message.toLowerCase();

            if (msg.includes('book') || msg.includes('pickup') || msg.includes('schedule')) {
                return 'Great! Let me help you schedule a pickup. <a href="/#booking" style="color: #FF6B00; font-weight: 600;">Click here to fill out the booking form</a>, or tell me your preferred date and I\'ll help you.';
            }

            if (msg.includes('track') || msg.includes('order') || msg.includes('status')) {
                return 'I can help you track your order! <a href="/track.html" style="color: #FF6B00; font-weight: 600;">Click here to track your order</a>, or provide me your booking ID and email.';
            }

            if (msg.includes('price') || msg.includes('cost') || msg.includes('pricing')) {
                return 'Our pricing is simple:<br>• Standard (24hrs): $32/bag<br>• Same-Day: $42/bag<br>• Rush (4hrs): $50/bag<br><br>All prices include free pickup and delivery! <a href="/#pricing" style="color: #FF6B00; font-weight: 600;">See full pricing details</a>';
            }

            if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
                return 'Hello! How can I assist you with your laundry today? I can help you book a pickup, track orders, or answer any questions!';
            }

            return 'I\'m here to help! You can ask me about:<br>• Booking a pickup<br>• Tracking your order<br>• Pricing information<br>• Service areas<br><br>What would you like to know?';
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
