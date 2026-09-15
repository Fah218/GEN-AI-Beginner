document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('send-btn');
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.querySelector('.sidebar');

    // Toggle sidebar on mobile
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Simple markdown to HTML parser (for basic bold, code, and newlines)
    function parseMarkdown(text) {
        let html = text
            // Escape HTML tags to prevent XSS
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            // Code blocks ```code```
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code `code`
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Headers ###
            .replace(/### (.*?)\n/g, '<h3>$1</h3>')
            // Lists * or -
            .replace(/^\* (.*)/gm, '<li>$1</li>')
            // Newlines to <br>
            .replace(/\n/g, '<br>');
        
        // Wrap consecutive <li> in <ul>
        html = html.replace(/(<li>.*<\/li>(?:<br>)*)+/g, match => `<ul>${match.replace(/<br>/g, '')}</ul>`);
        return html;
    }

    function addMessage(content, sender = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        
        if (sender === 'bot') {
            messageContentDiv.innerHTML = parseMarkdown(content);
        } else {
            messageContentDiv.textContent = content;
        }

        messageDiv.appendChild(messageContentDiv);
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingDiv.appendChild(dot);
        }
        
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        messageInput.value = '';
        messageInput.disabled = true;
        sendBtn.disabled = true;

        showTypingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            removeTypingIndicator();
            
            if (response.ok) {
                const data = await response.json();
                addMessage(data.reply, 'bot');
            } else {
                addMessage('Sorry, an error occurred while connecting to the server.', 'bot');
            }
        } catch (error) {
            removeTypingIndicator();
            addMessage('Failed to reach the server. Please check your connection.', 'bot');
        } finally {
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
        }
    });
});
