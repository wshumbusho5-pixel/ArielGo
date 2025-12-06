// ==================================
// AI ASSISTANT CHAT WIDGET
// ==================================

const API_BASE = window.location.origin;

class AIChat {
    constructor(options = {}) {
        this.userEmail = options.userEmail || null;
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;

        this.init();
    }

    init() {
        // Create chat widget HTML
        const widgetHTML = `
            <div id="ai-chat-widget" class="ai-chat-widget">
                <!-- Chat Button -->
                <button id="ai-chat-toggle" class="ai-chat-toggle" aria-label="Chat with ArielAssist">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="ai-chat-badge" id="ai-chat-badge" style="display: none;">1</span>
                </button>

                <!-- Chat Window -->
                <div id="ai-chat-window" class="ai-chat-window" style="display: none;">
                    <div class="ai-chat-header">
                        <div class="ai-chat-title">
                            <div class="ai-avatar">🤖</div>
                            <div>
                                <div class="ai-name">ArielAssist</div>
                                <div class="ai-status" id="ai-status">Ready to help</div>
                            </div>
                        </div>
                        <button id="ai-chat-close" class="ai-chat-close-btn" aria-label="Close chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="ai-chat-messages" id="ai-chat-messages">
                        <div class="ai-message ai-assistant-message">
                            <div class="ai-message-content">
                                Hi! I'm ArielAssist, your personal laundry assistant. How can I help you today?
                            </div>
                        </div>
                    </div>

                    <!-- Suggestions -->
                    <div class="ai-chat-suggestions" id="ai-chat-suggestions"></div>

                    <!-- Input Area -->
                    <div class="ai-chat-input-area">
                        <input
                            type="text"
                            id="ai-chat-input"
                            class="ai-chat-input"
                            placeholder="Type your message..."
                            autocomplete="off"
                        >
                        <button id="ai-chat-send" class="ai-chat-send-btn" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.insertAdjacentHTML('beforeend', widgetHTML);

        // Bind events
        this.bindEvents();

        // Load suggestions
        this.loadSuggestions();

        // Check AI status
        this.checkAIStatus();
    }

    bindEvents() {
        const toggleBtn = document.getElementById('ai-chat-toggle');
        const closeBtn = document.getElementById('ai-chat-close');
        const sendBtn = document.getElementById('ai-chat-send');
        const input = document.getElementById('ai-chat-input');

        toggleBtn.addEventListener('click', () => this.toggle());
        closeBtn.addEventListener('click', () => this.close());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async checkAIStatus() {
        try {
            const response = await fetch(`${API_BASE}/api/assistant/status`);
            const data = await response.json();

            const statusEl = document.getElementById('ai-status');
            if (data.configured) {
                statusEl.textContent = 'Online';
                statusEl.style.color = '#10b981';
            } else {
                statusEl.textContent = 'Offline';
                statusEl.style.color = '#94a3b8';
                this.addMessage('System message: AI Assistant is not currently configured.', 'system');
            }
        } catch (error) {
            console.error('Failed to check AI status:', error);
        }
    }

    async loadSuggestions() {
        try {
            const response = await fetch(`${API_BASE}/api/assistant/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: this.userEmail })
            });

            const data = await response.json();

            if (data.success && data.suggestions) {
                this.displaySuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    }

    displaySuggestions(suggestions) {
        const suggestionsEl = document.getElementById('ai-chat-suggestions');

        if (!suggestions || suggestions.length === 0) {
            suggestionsEl.style.display = 'none';
            return;
        }

        // Show first 3 suggestions
        const html = suggestions.slice(0, 3).map(suggestion =>
            `<button class="ai-suggestion-btn" data-suggestion="${this.escapeHtml(suggestion)}">
                ${this.escapeHtml(suggestion)}
            </button>`
        ).join('');

        suggestionsEl.innerHTML = html;
        suggestionsEl.style.display = 'flex';

        // Add click handlers
        suggestionsEl.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.getAttribute('data-suggestion');
                document.getElementById('ai-chat-input').value = suggestion;
                this.sendMessage();
            });
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const window = document.getElementById('ai-chat-window');
        const badge = document.getElementById('ai-chat-badge');

        window.style.display = 'flex';
        badge.style.display = 'none';
        this.isOpen = true;

        // Focus input
        setTimeout(() => {
            document.getElementById('ai-chat-input').focus();
        }, 100);

        // Scroll to bottom
        this.scrollToBottom();
    }

    close() {
        const window = document.getElementById('ai-chat-window');
        window.style.display = 'none';
        this.isOpen = false;
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Clear input
        input.value = '';

        // Add user message
        this.addMessage(message, 'user');

        // Hide suggestions
        document.getElementById('ai-chat-suggestions').style.display = 'none';

        // Show typing indicator
        this.showTyping();

        try {
            const response = await fetch(`${API_BASE}/api/assistant/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    userEmail: this.userEmail
                })
            });

            const data = await response.json();

            // Hide typing indicator
            this.hideTyping();

            if (data.success) {
                this.addMessage(data.message, 'assistant');
            } else {
                this.addMessage(data.message || 'Sorry, I encountered an error. Please try again.', 'error');
            }

        } catch (error) {
            this.hideTyping();
            console.error('Chat error:', error);
            this.addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'error');
        }
    }

    addMessage(text, type) {
        const messagesEl = document.getElementById('ai-chat-messages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-message-content';
        contentDiv.textContent = text;

        messageDiv.appendChild(contentDiv);
        messagesEl.appendChild(messageDiv);

        this.scrollToBottom();

        // Show badge if window is closed
        if (!this.isOpen && type === 'assistant') {
            const badge = document.getElementById('ai-chat-badge');
            badge.style.display = 'block';
        }
    }

    showTyping() {
        const messagesEl = document.getElementById('ai-chat-messages');

        const typingDiv = document.createElement('div');
        typingDiv.id = 'ai-typing-indicator';
        typingDiv.className = 'ai-message ai-assistant-message';
        typingDiv.innerHTML = `
            <div class="ai-message-content">
                <div class="ai-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesEl.appendChild(typingDiv);
        this.scrollToBottom();
        this.isTyping = true;
    }

    hideTyping() {
        const typingEl = document.getElementById('ai-typing-indicator');
        if (typingEl) {
            typingEl.remove();
        }
        this.isTyping = false;
    }

    scrollToBottom() {
        const messagesEl = document.getElementById('ai-chat-messages');
        setTimeout(() => {
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }, 50);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setUserEmail(email) {
        this.userEmail = email;
        this.loadSuggestions();
    }
}

// Auto-initialize if user email is available
let aiChat = null;

document.addEventListener('DOMContentLoaded', () => {
    // Try to get user email from page context
    const userEmail = window.userEmail || null;
    aiChat = new AIChat({ userEmail });
});
