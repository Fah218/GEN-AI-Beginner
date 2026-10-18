document.addEventListener('DOMContentLoaded', () => {
  // Header Elements
  const historyBtn = document.getElementById('history-btn');
  const resetBtn = document.getElementById('reset-btn');
  const postBadge = document.getElementById('post-badge');
  const statusMessage = document.getElementById('status-message');

  // Views
  const chatView = document.getElementById('chat-view');
  const historyView = document.getElementById('history-view');
  const historyBackBtn = document.getElementById('history-back-btn');
  const historyEmptyState = document.getElementById('history-empty-state');
  const historyNoResults = document.getElementById('history-no-results');
  const noResultsSubtitle = document.getElementById('no-results-subtitle');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const historySearchInput = document.getElementById('history-search-input');
  const historySearchClear = document.getElementById('history-search-clear');
  const historyList = document.getElementById('history-list');

  // Chat Elements
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
  let currentConversationId = null;
  let currentPostText = '';
  let conversationHistory = []; // Array of { role: 'user' | 'assistant', content: string }
  let isResponding = false;
  let searchQuery = '';
  let confirmingDeleteId = null;

  const SHORTCUT_PROMPTS = {
    summarize: 'Summarize the main points of this post in 2-3 concise sentences.',
    explain: 'Explain the core topic of this post simply, as if to a beginner.',
    keyTakeaways: 'Extract 3-5 key takeaways from this post as bullet points.',
    comments: 'Generate 3 distinct, high-quality LinkedIn comment suggestions for this post across three tones:\n- **Professional**: Courteous, articulate, and value-adding\n- **Casual**: Warm, authentic, friendly, and conversational\n- **Insightful**: Thought-provoking, analytical, or asking a smart follow-up question\nFormat each tone with a bold header followed by the exact comment text ready to copy.'
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
   * Inspect and handle chrome.storage errors and quota exhaustion
   */
  function checkStorageError(context = '') {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
      const err = chrome.runtime.lastError.message || '';
      console.error(`[LinkLens AI] Storage error in ${context}:`, err);
      if (err.toLowerCase().includes('quota') || err.toLowerCase().includes('exceeded')) {
        showStatus('Extension storage is full. Please delete older conversations in History to free up space.', 'error');
      } else {
        showStatus(`Storage error: ${err}`, 'error');
      }
      return true;
    }
    return false;
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
    if (historyBtn) historyBtn.disabled = loading;

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
   * Switch between Chat view and History view
   */
  function showHistoryView() {
    confirmingDeleteId = null;
    if (chatView) chatView.style.display = 'none';
    if (historyView) historyView.style.display = 'flex';
    renderHistoryList();
    if (historySearchInput && !searchQuery) {
      setTimeout(() => historySearchInput.focus(), 50);
    }
  }

  function showChatView() {
    confirmingDeleteId = null;
    if (historyView) historyView.style.display = 'none';
    if (chatView) chatView.style.display = 'flex';
  }

  /**
   * Format timestamp for display (e.g. "Today at 3:15 PM" or "Oct 17, 3:15 PM")
   */
  function formatTimestamp(ts) {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  }

  /**
   * Generate an informative, useful title for a conversation
   */
  function generateConversationTitle(firstPrompt, postText) {
    const p = (firstPrompt || '').trim();
    const cleanPost = (postText || '').trim().replace(/\s+/g, ' ');
    const postSnippet = cleanPost.slice(0, 36);

    if (p.includes('LinkedIn comment suggestions') || p.includes('comment suggestions') || p.startsWith('💬 Comments')) {
      return postSnippet ? `💬 Comments: ${postSnippet}...` : '💬 Comment Ideas';
    }
    if (p.includes('Summarize the main points') || p.startsWith('⚡ Summarize')) {
      return postSnippet ? `⚡ Summary: ${postSnippet}...` : '⚡ Post Summary';
    }
    if (p.includes('Explain the core topic') || p.startsWith('💡 Explain')) {
      return postSnippet ? `💡 Explain: ${postSnippet}...` : '💡 Post Explanation';
    }
    if (p.includes('Extract 3-5 key takeaways') || p.startsWith('📌 Takeaways')) {
      return postSnippet ? `📌 Takeaways: ${postSnippet}...` : '📌 Key Takeaways';
    }

    if (p.length > 40) {
      return `💬 ${p.slice(0, 38)}...`;
    }
    return `💬 ${p || 'LinkedIn Chat'}`;
  }

  /**
   * Load stored conversations with seamless Stage 8.1 migration support and error checking
   */
  async function loadStoredData() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      return { conversations: [], activeId: null };
    }

    try {
      const data = await chrome.storage.local.get([
        'conversations',
        'activeConversationId',
        'conversationHistory',
        'currentPostText'
      ]);

      if (checkStorageError('loadStoredData')) {
        return { conversations: [], activeId: null };
      }

      let conversations = Array.isArray(data.conversations) ? data.conversations : [];
      let activeId = data.activeConversationId || null;

      // Stage 8.1 Migration: migrate legacy single-conversation data
      if (
        conversations.length === 0 &&
        Array.isArray(data.conversationHistory) &&
        data.conversationHistory.length > 0 &&
        typeof data.currentPostText === 'string' &&
        data.currentPostText.trim() !== ''
      ) {
        const legacyId = 'conv_' + Date.now() + '_migrated';
        const legacyTitle = generateConversationTitle(data.conversationHistory[0]?.content || '', data.currentPostText);
        const migratedConv = {
          id: legacyId,
          title: legacyTitle,
          postText: data.currentPostText,
          messages: data.conversationHistory,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        conversations = [migratedConv];
        activeId = legacyId;

        await chrome.storage.local.set({
          conversations: conversations,
          activeConversationId: activeId
        });
        checkStorageError('migrateLegacyData');
        await chrome.storage.local.remove(['conversationHistory', 'currentPostText']);
      }

      return { conversations, activeId };
    } catch (err) {
      console.warn('[LinkLens AI] Failed to load stored conversation data:', err);
      return { conversations: [], activeId: null };
    }
  }

  /**
   * Save the active conversation (create new or update existing)
   */
  async function saveActiveConversation() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

    try {
      const { conversations } = await loadStoredData();
      const now = Date.now();

      let convIndex = -1;
      if (currentConversationId) {
        convIndex = conversations.findIndex(c => c.id === currentConversationId);
      }

      if (convIndex >= 0) {
        conversations[convIndex].messages = conversationHistory;
        conversations[convIndex].postText = currentPostText;
        conversations[convIndex].updatedAt = now;
      } else {
        currentConversationId = 'conv_' + now + '_' + Math.random().toString(36).slice(2, 7);
        const firstUserMsg = conversationHistory.find(m => m.role === 'user');
        const title = generateConversationTitle(firstUserMsg ? firstUserMsg.content : '', currentPostText);
        const newConv = {
          id: currentConversationId,
          title: title,
          postText: currentPostText,
          messages: conversationHistory,
          createdAt: now,
          updatedAt: now
        };
        conversations.unshift(newConv);
      }

      // Keep sorted by most recent
      conversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      await chrome.storage.local.set({
        conversations: conversations,
        activeConversationId: currentConversationId
      });

      checkStorageError('saveActiveConversation');
    } catch (err) {
      console.warn('[LinkLens AI] Failed to save conversation:', err);
    }
  }

  /**
   * Load and activate a saved conversation
   */
  function loadConversation(conv) {
    if (!conv) return;

    confirmingDeleteId = null;
    currentConversationId = conv.id;
    currentPostText = conv.postText || '';
    conversationHistory = Array.isArray(conv.messages) ? conv.messages : [];

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ activeConversationId: conv.id });
      checkStorageError('setActiveConversationId');
    }

    if (chatMessages) {
      chatMessages.replaceChildren();
    }

    if (chatEmptyState) {
      chatEmptyState.style.display = conversationHistory.length === 0 ? 'flex' : 'none';
    }

    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        appendUserBubble(msg.content);
      } else if (msg.role === 'assistant') {
        appendAssistantBubble(msg.content);
      }
    }

    if (currentPostText) {
      const lengthStr = currentPostText.length > 999
        ? `${(currentPostText.length / 1000).toFixed(1)}k`
        : `${currentPostText.length}`;
      updatePostBadge(`Post detected (${lengthStr} chars)`, 'badge-detected');
    } else {
      updatePostBadge('Saved chat loaded', 'badge-detected');
    }

    hideStatus();
    showChatView();
    scrollToBottom();
  }

  /**
   * Delete an individual conversation by ID
   */
  async function deleteConversation(id) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

    try {
      const { conversations, activeId } = await loadStoredData();
      const updatedConversations = conversations.filter(c => c.id !== id);

      const updates = { conversations: updatedConversations };

      // If the deleted conversation was the active one, reset the chat view
      if (id === currentConversationId || id === activeId) {
        currentConversationId = null;
        updates.activeConversationId = null;
        conversationHistory = [];
        currentPostText = '';

        if (chatMessages) {
          chatMessages.replaceChildren();
        }

        if (chatEmptyState) {
          chatEmptyState.style.display = 'flex';
        }

        updatePostBadge('Detecting post...', 'badge-detecting');
        extractPostFromTab();
      }

      await chrome.storage.local.set(updates);
      checkStorageError('deleteConversation');
      confirmingDeleteId = null;
      renderHistoryList();
    } catch (err) {
      console.warn('[LinkLens AI] Failed to delete conversation:', err);
    }
  }

  /**
   * Render the history list with search filtering, inline confirmation, and empty states
   */
  async function renderHistoryList() {
    if (!historyList) return;

    const { conversations } = await loadStoredData();
    historyList.replaceChildren();

    // Zero total conversations state
    if (conversations.length === 0) {
      if (historyEmptyState) historyEmptyState.style.display = 'flex';
      if (historyNoResults) historyNoResults.style.display = 'none';
      if (historySearchClear) historySearchClear.style.display = 'none';
      if (historySearchInput) historySearchInput.value = '';
      return;
    }

    if (historyEmptyState) historyEmptyState.style.display = 'none';

    // Apply live search query filtering
    const q = (searchQuery || '').trim().toLowerCase();
    let filtered = conversations;
    if (q) {
      filtered = conversations.filter(c => {
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const postMatch = (c.postText || '').toLowerCase().includes(q);
        const msgMatch = Array.isArray(c.messages) && c.messages.some(m => (m.content || '').toLowerCase().includes(q));
        return titleMatch || postMatch || msgMatch;
      });
    }

    // Zero search results state
    if (filtered.length === 0) {
      if (historyNoResults) {
        historyNoResults.style.display = 'flex';
        if (noResultsSubtitle) {
          noResultsSubtitle.textContent = `No saved chats match "${searchQuery}".`;
        }
      }
      return;
    }

    if (historyNoResults) historyNoResults.style.display = 'none';

    // Render filtered conversation cards
    for (const conv of filtered) {
      const item = document.createElement('div');
      item.className = 'history-item';
      if (conv.id === currentConversationId) {
        item.classList.add('active-item');
      }

      // Content container (clickable to load)
      const contentArea = document.createElement('div');
      contentArea.className = 'history-item-content';

      const titleRow = document.createElement('div');
      titleRow.className = 'history-item-title-row';

      const titleEl = document.createElement('span');
      titleEl.className = 'history-item-title';
      titleEl.textContent = conv.title || 'LinkedIn Conversation';
      titleRow.appendChild(titleEl);

      if (conv.id === currentConversationId) {
        const activeBadge = document.createElement('span');
        activeBadge.className = 'history-active-badge';
        activeBadge.textContent = 'Active';
        titleRow.appendChild(activeBadge);
      }

      const metaRow = document.createElement('div');
      metaRow.className = 'history-item-meta';

      const timeEl = document.createElement('span');
      timeEl.className = 'history-item-time';
      timeEl.textContent = formatTimestamp(conv.updatedAt || conv.createdAt);

      const countEl = document.createElement('span');
      countEl.className = 'history-item-count';
      const msgCount = Array.isArray(conv.messages) ? conv.messages.length : 0;
      countEl.textContent = `${msgCount} message${msgCount === 1 ? '' : 's'}`;

      metaRow.appendChild(timeEl);
      metaRow.appendChild(document.createTextNode(' • '));
      metaRow.appendChild(countEl);

      contentArea.appendChild(titleRow);
      contentArea.appendChild(metaRow);

      // Delete action area: inline confirmation or standard trash icon
      if (conv.id === confirmingDeleteId) {
        const confirmGroup = document.createElement('div');
        confirmGroup.className = 'delete-confirm-group';

        const confirmText = document.createElement('span');
        confirmText.className = 'delete-confirm-text';
        confirmText.textContent = 'Delete?';

        const yesBtn = document.createElement('button');
        yesBtn.className = 'delete-confirm-yes';
        yesBtn.type = 'button';
        yesBtn.textContent = 'Yes';
        yesBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteConversation(conv.id);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'delete-confirm-no';
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          confirmingDeleteId = null;
          renderHistoryList();
        });

        confirmGroup.appendChild(confirmText);
        confirmGroup.appendChild(yesBtn);
        confirmGroup.appendChild(cancelBtn);

        item.appendChild(contentArea);
        item.appendChild(confirmGroup);
      } else {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'history-item-delete';
        deleteBtn.type = 'button';
        deleteBtn.title = 'Delete conversation';
        deleteBtn.setAttribute('aria-label', `Delete conversation ${conv.title}`);
        deleteBtn.textContent = '🗑️';

        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          confirmingDeleteId = conv.id;
          renderHistoryList();
        });

        item.appendChild(contentArea);
        item.appendChild(deleteBtn);
      }

      item.addEventListener('click', () => {
        loadConversation(conv);
      });

      historyList.appendChild(item);
    }
  }

  /**
   * Reset the search query and refresh the history view
   */
  function resetSearch() {
    searchQuery = '';
    if (historySearchInput) {
      historySearchInput.value = '';
      historySearchInput.focus();
    }
    if (historySearchClear) {
      historySearchClear.style.display = 'none';
    }
    confirmingDeleteId = null;
    renderHistoryList();
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
   * Helper to detect and extract multi-tone comment suggestions
   */
  function parseCommentSuggestions(text) {
    if (!text || typeof text !== 'string') return null;

    const hasProf = /Professional/i.test(text);
    const hasCas = /Casual/i.test(text);
    const hasIns = /Insightful/i.test(text);

    // Require at least two tones to confirm it is a multi-tone comment suggestion set
    if (!((hasProf && hasCas) || (hasProf && hasIns) || (hasCas && hasIns))) {
      return null;
    }

    const parts = text.split(/(?:^|\n)(?:[-*]\s*)?(?:\*\*|###?\s*)?(Professional|Casual|Insightful)(?:\*\*)?:?\s*\n*/i);
    const intro = (parts[0] || '').trim();
    const suggestions = [];

    const TONE_EMOJIS = {
      professional: '👔 Professional',
      casual: '☕ Casual',
      insightful: '🧠 Insightful'
    };

    for (let i = 1; i < parts.length; i += 2) {
      const rawTone = parts[i];
      const toneKey = rawTone.toLowerCase();
      let content = (parts[i + 1] || '').trim();

      // Clean leading bullets or surrounding quotes
      content = content.replace(/^[-*]\s+/, '').replace(/^["'](.*)["']$/, '$1').trim();

      if (toneKey && content) {
        suggestions.push({
          toneKey,
          label: TONE_EMOJIS[toneKey] || rawTone,
          content
        });
      }
    }

    return suggestions.length > 0 ? { intro, suggestions } : null;
  }

  /**
   * Safely render AI response without using innerHTML
   * Formats comment suggestion cards with individual copy buttons,
   * or standard paragraphs, bullet lists, and **bold** labels using standard DOM methods
   */
  function renderSafeOutput(container, text) {
    container.replaceChildren();

    if (!text || typeof text !== 'string') {
      return;
    }

    // Check if response is a comment suggestion set
    const parsedComments = parseCommentSuggestions(text);
    if (parsedComments) {
      if (parsedComments.intro) {
        const introP = document.createElement('p');
        introP.className = 'bubble-paragraph';
        appendFormattedInlineText(introP, parsedComments.intro);
        container.appendChild(introP);
      }

      for (const item of parsedComments.suggestions) {
        const card = document.createElement('div');
        card.className = 'comment-suggestion-card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'comment-card-header';

        const badge = document.createElement('span');
        badge.className = `comment-tone-badge tone-${item.toneKey}`;
        badge.textContent = item.label;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'comment-copy-btn';
        copyBtn.type = 'button';
        copyBtn.title = `Copy ${item.label} comment`;
        copyBtn.setAttribute('aria-label', `Copy ${item.label} comment`);

        const copyIcon = document.createElement('span');
        copyIcon.className = 'copy-icon';
        copyIcon.textContent = '📋';

        const copyText = document.createElement('span');
        copyText.className = 'copy-text';
        copyText.textContent = 'Copy';

        copyBtn.appendChild(copyIcon);
        copyBtn.appendChild(copyText);

        copyBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const ok = await copyToClipboard(item.content);
          if (ok) {
            copyBtn.classList.add('copied');
            copyIcon.textContent = '✓';
            copyText.textContent = 'Copied!';
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyIcon.textContent = '📋';
              copyText.textContent = 'Copy';
            }, 2000);
          }
        });

        cardHeader.appendChild(badge);
        cardHeader.appendChild(copyBtn);
        card.appendChild(cardHeader);

        const commentBody = document.createElement('p');
        commentBody.className = 'comment-text';
        commentBody.textContent = item.content;
        card.appendChild(commentBody);

        container.appendChild(card);
      }
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
      const response = await fetch('https://linklens-ai-backend.onrender.com/api/chat', {
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
        await saveActiveConversation();
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
      showStatus('Cannot connect to the LinkLens AI backend. Please try again in a moment.', 'error');
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

  // Handle History Button Click
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      if (isResponding) return;
      showHistoryView();
    });
  }

  // Handle Back to Chat Button Click
  if (historyBackBtn) {
    historyBackBtn.addEventListener('click', () => {
      showChatView();
    });
  }

  // Handle Search Input in History
  if (historySearchInput) {
    historySearchInput.addEventListener('input', () => {
      searchQuery = historySearchInput.value;
      if (historySearchClear) {
        historySearchClear.style.display = searchQuery ? 'inline-block' : 'none';
      }
      confirmingDeleteId = null;
      renderHistoryList();
    });
  }

  // Handle Clear Search Button Clicks
  if (historySearchClear) {
    historySearchClear.addEventListener('click', resetSearch);
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', resetSearch);
  }

  // Handle Reset / New Post Button Click: Starts a fresh conversation without deleting history
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (isResponding) return;

      currentConversationId = null;
      conversationHistory = [];
      currentPostText = '';

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ activeConversationId: null });
        checkStorageError('resetActiveConversationId');
      }

      if (chatMessages) {
        chatMessages.replaceChildren();
      }

      if (chatEmptyState) {
        chatEmptyState.style.display = 'flex';
      }

      hideStatus();
      if (chatInput) chatInput.value = '';

      showChatView();
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

  /**
   * Initialize session: restore existing active conversation from storage or extract fresh post
   */
  async function initSession() {
    try {
      const { conversations, activeId } = await loadStoredData();

      if (activeId) {
        const activeConv = conversations.find(c => c.id === activeId);
        if (activeConv) {
          loadConversation(activeConv);
          return;
        }
      }

      // If no conversation is active, start fresh
      currentConversationId = null;
      conversationHistory = [];
      currentPostText = '';

      if (chatEmptyState) {
        chatEmptyState.style.display = 'flex';
      }
    } catch (err) {
      console.warn('[LinkLens AI] Failed to restore session from storage:', err);
    }

    // Default to extracting the active visible post
    await extractPostFromTab();
  }

  // Initial session startup
  initSession();
});
