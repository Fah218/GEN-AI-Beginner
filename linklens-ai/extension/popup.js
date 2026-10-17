document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const resetBtn = document.getElementById('reset-btn');
  const postBadge = document.getElementById('post-badge');
  const statusMessage = document.getElementById('status-message');
  const shortcutChips = document.querySelectorAll('.shortcut-chip');
  const chatThread = document.getElementById('chat-thread');
  const chatEmptyState = document.getElementById('chat-empty-state');
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');

  // Preserved legacy elements for compatibility
  const analyzeBtn = document.getElementById('analyze-btn');
  const operationSelect = document.getElementById('operation-select');
  const legacySegmentBtns = document.querySelectorAll('.segment-btn');

  // State
  let currentPostText = '';
  let conversationHistory = []; // Array of { role: 'user' | 'assistant', content: string }
  let isResponding = false;

  const SHORTCUT_PROMPTS = {
    summarize: 'Summarize the main points of this post in 2-3 concise sentences.',
    explain: 'Explain the core topic of this post simply, as if to a beginner.',
    keyTakeaways: 'Extract 3-5 key takeaways from this post as bullet points.'
  };

  /**
   * Display a status banner with semantic color styling
   */
  function showStatus(message, type = 'info') {
    if (!statusMessage) return;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
  }

  function hideStatus() {
    if (!statusMessage) return;
    statusMessage.style.display = 'none';
  }

  /**
   * Update the post context indicator badge in the header
   */
  function updatePostBadge(text, stateClass = 'badge-detecting') {
    if (!postBadge) return;
    postBadge.className = `post-badge ${stateClass}`;
    postBadge.textContent = text;
  }

  /**
   * Scroll chat thread container to bottom
   */
  function scrollToBottom() {
    if (chatThread) {
      chatThread.scrollTo({
        top: chatThread.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Set loading UI state
   */
  function setLoading(loading) {
    isResponding = loading;

    if (sendBtn) sendBtn.disabled = loading;
    if (chatInput) chatInput.disabled = loading;
    if (resetBtn) resetBtn.disabled = loading;

    shortcutChips.forEach(chip => {
      chip.disabled = loading;
    });

    if (typingIndicator) {
      typingIndicator.style.display = loading ? 'flex' : 'none';
    }

    if (loading) {
      scrollToBottom();
    }
  }

  /**
   * Copy text to clipboard with modern API and reliable textarea fallback
   */
  async function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('[LinkLens AI] navigator.clipboard.writeText failed, using fallback:', err);
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) return true;
    } catch (fallbackErr) {
      console.error('[LinkLens AI] Fallback copy failed:', fallbackErr);
    }

    return false;
  }

  /**
   * Safely render AI response without using innerHTML
   * Formats paragraphs, bullet lists, and **bold** labels using standard DOM methods
   */
  function renderSafeOutput(container, text) {
    container.replaceChildren();

    if (!text || typeof text !== 'string') {
      return;
    }

    const lines = text.split('\n');
    let currentList = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        currentList = null;
        continue;
      }

      // Check for bullet list item: starts with * or - followed by whitespace
      if (/^[\*\-]\s+/.test(line)) {
        if (!currentList) {
          currentList = document.createElement('ul');
          currentList.className = 'bubble-list';
          container.appendChild(currentList);
        }
        const li = document.createElement('li');
        li.className = 'bubble-list-item';
        appendFormattedInlineText(li, line.replace(/^[\*\-]\s+/, ''));
        currentList.appendChild(li);
      } else {
        currentList = null;
        const p = document.createElement('p');
        p.className = 'bubble-paragraph';
        appendFormattedInlineText(p, line);
        container.appendChild(p);
      }
    }
  }

  /**
   * Safely parse and append text with **bold** markers as <strong> nodes
   */
  function appendFormattedInlineText(parentEl, text) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const strong = document.createElement('strong');
        strong.textContent = part.slice(2, -2);
        parentEl.appendChild(strong);
      } else if (part) {
        parentEl.appendChild(document.createTextNode(part));
      }
    }
  }

  /**
   * Append a user chat bubble
   */
  function appendUserBubble(text) {
    if (!chatMessages) return;

    if (chatEmptyState) {
      chatEmptyState.style.display = 'none';
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bubble-user';

    const content = document.createElement('div');
    content.className = 'bubble-content';
    content.textContent = text;

    bubble.appendChild(content);
    chatMessages.appendChild(bubble);
    scrollToBottom();
  }

  /**
   * Append an assistant chat bubble with safe formatting and copy button
   */
  function appendAssistantBubble(text) {
    if (!chatMessages) return;

    if (chatEmptyState) {
      chatEmptyState.style.display = 'none';
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bubble-assistant';

    // Bubble Header with bot label and Copy button
    const header = document.createElement('div');
    header.className = 'bubble-header';

    const senderLabel = document.createElement('span');
    senderLabel.className = 'bubble-sender';
    senderLabel.textContent = 'LinkLens AI';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'bubble-copy-btn';
    copyBtn.type = 'button';
    copyBtn.title = 'Copy response';
    copyBtn.setAttribute('aria-label', 'Copy response');

    const copyIcon = document.createElement('span');
    copyIcon.className = 'copy-icon';
    copyIcon.textContent = '📋';

    const copyText = document.createElement('span');
    copyText.className = 'copy-text';
    copyText.textContent = 'Copy';

    copyBtn.appendChild(copyIcon);
    copyBtn.appendChild(copyText);

    copyBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard(text);
      if (ok) {
        copyBtn.classList.add('copied');
        copyText.textContent = 'Copied!';
        copyIcon.textContent = '✓';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyText.textContent = 'Copy';
          copyIcon.textContent = '📋';
        }, 2000);
      }
    });

    header.appendChild(senderLabel);
    header.appendChild(copyBtn);
    bubble.appendChild(header);

    // Bubble Body with safe markdown formatting
    const body = document.createElement('div');
    body.className = 'bubble-content';
    renderSafeOutput(body, text);
    bubble.appendChild(body);

    chatMessages.appendChild(bubble);
    scrollToBottom();
  }

  /**
   * Extract the visible LinkedIn post from the active browser tab
   */
  async function extractPostFromTab() {
    updatePostBadge('Detecting post...', 'badge-detecting');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url || !tab.url.includes('linkedin.com')) {
        updatePostBadge('Not on LinkedIn', 'badge-warning');
        showStatus('Please navigate to an active LinkedIn page first.', 'info');
        return null;
      }

      const response = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractPost' }, (res) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              error: 'Could not contact LinkedIn page. Please refresh the page and try again.'
            });
          } else {
            resolve(res);
          }
        });
      });

      if (response && response.success && response.text) {
        currentPostText = response.text;
        const lengthStr = response.text.length > 999 
          ? `${(response.text.length / 1000).toFixed(1)}k`
          : `${response.text.length}`;
        updatePostBadge(`Post detected (${lengthStr} chars)`, 'badge-detected');
        hideStatus();
        return response.text;
      } else {
        currentPostText = '';
        updatePostBadge('No post detected', 'badge-warning');
        showStatus(
          (response && response.error) ? response.error : 'No visible LinkedIn post found. Scroll to center a post and try again.',
          'warning'
        );
        return null;
      }
    } catch (err) {
      console.error('[LinkLens AI] Tab extraction error:', err);
      updatePostBadge('Extraction error', 'badge-warning');
      showStatus('An error occurred while accessing the active tab.', 'error');
      return null;
    }
  }

  /**
   * Main Chat Dispatcher: sends user prompt to /api/chat with post context and conversation history
   */
  async function handleSendMessage(userPrompt) {
    if (isResponding) return;

    const trimmedPrompt = (userPrompt || '').trim();
    if (!trimmedPrompt) return;

    // Ensure we have the LinkedIn post context
    if (!currentPostText) {
      const extracted = await extractPostFromTab();
      if (!extracted) {
        return;
      }
    }

    hideStatus();
    appendUserBubble(trimmedPrompt);

    if (chatInput) chatInput.value = '';

    // Add to conversation history
    conversationHistory.push({
      role: 'user',
      content: trimmedPrompt
    });

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postText: currentPostText,
          messages: conversationHistory
        })
      });

      if (response.status === 429) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = (errorData && errorData.error)
          ? errorData.error
          : 'Gemini API quota has been reached. Please retry after the quota resets.';
        showStatus(errorMsg, 'error');
        // Roll back unfulfilled user turn
        conversationHistory.pop();
        return;
      }

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success && data.reply) {
        appendAssistantBubble(data.reply);
        conversationHistory.push({
          role: 'assistant',
          content: data.reply
        });
      } else {
        const errorMsg = (data && data.error) ? data.error : 'AI analysis request failed.';
        if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.toLowerCase().includes('quota')) {
          showStatus('Gemini API quota has been reached. Please retry after the quota resets.', 'error');
        } else {
          showStatus(errorMsg, 'error');
        }
        // Roll back unfulfilled user turn
        conversationHistory.pop();
      }
    } catch (networkErr) {
      console.error('[LinkLens AI] Backend network error:', networkErr);
      showStatus('Cannot connect to the backend server. Please make sure npm start is running on http://localhost:3000.', 'error');
      conversationHistory.pop();
    } finally {
      setLoading(false);
      if (chatInput) chatInput.focus();
    }
  }

  // Handle Chat Form Submit
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (chatInput) {
        handleSendMessage(chatInput.value);
      }
    });
  }

  // Handle Shortcut Chip Clicks
  shortcutChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (isResponding) return;
      const op = chip.dataset.op;
      const prompt = SHORTCUT_PROMPTS[op];
      if (prompt) {
        handleSendMessage(prompt);
      }
    });
  });

  // Handle Reset / New Post Button Click
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (isResponding) return;

      conversationHistory = [];
      currentPostText = '';

      if (chatMessages) {
        chatMessages.replaceChildren();
      }

      if (chatEmptyState) {
        chatEmptyState.style.display = 'flex';
      }

      hideStatus();
      if (chatInput) chatInput.value = '';

      await extractPostFromTab();
    });
  }

  // Preserved legacy support for analyzeBtn and operationSelect
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      const op = operationSelect ? operationSelect.value : 'summarize';
      const prompt = SHORTCUT_PROMPTS[op] || SHORTCUT_PROMPTS.summarize;
      handleSendMessage(prompt);
    });
  }

  legacySegmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (operationSelect) operationSelect.value = btn.dataset.op;
      const prompt = SHORTCUT_PROMPTS[btn.dataset.op];
      if (prompt) handleSendMessage(prompt);
    });
  });

  // Initial automatic post extraction on popup open
  extractPostFromTab();
});
