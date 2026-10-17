document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const analyzeBtn = document.getElementById('analyze-btn');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnText = document.getElementById('btn-text');
  const statusMessage = document.getElementById('status-message');
  const operationSelect = document.getElementById('operation-select');
  const segmentBtns = document.querySelectorAll('.segment-btn');
  const resultSection = document.getElementById('result-section');
  const resultBadge = document.getElementById('result-badge');
  const resultBox = document.getElementById('result-box');
  const copyBtn = document.getElementById('copy-btn');
  const copyIcon = document.getElementById('copy-icon');
  const copyText = document.getElementById('copy-text');

  // State
  let isAnalyzing = false;
  let currentResultRawText = '';

  const OPERATION_LABELS = {
    summarize: 'Summary',
    explain: 'Beginner Explanation',
    keyTakeaways: 'Key Takeaways'
  };

  /**
   * Synchronize segmented buttons and the preserved hidden <select>
   */
  function setOperation(op) {
    if (!op) return;

    segmentBtns.forEach((btn) => {
      const isActive = btn.dataset.op === op;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (operationSelect && operationSelect.value !== op) {
      operationSelect.value = op;
    }
  }

  // Handle segmented button clicks
  segmentBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (isAnalyzing) return;
      setOperation(btn.dataset.op);
    });
  });

  // Handle external or programmatic changes to operationSelect
  if (operationSelect) {
    operationSelect.addEventListener('change', () => {
      setOperation(operationSelect.value);
    });
  }

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
   * Set the UI loading state and disable controls to prevent duplicate submissions
   */
  function setLoading(loading, message = '') {
    isAnalyzing = loading;

    if (analyzeBtn) {
      analyzeBtn.disabled = loading;
    }

    segmentBtns.forEach((btn) => {
      btn.disabled = loading;
    });

    if (loading) {
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'Analyzing...';
      if (message) showStatus(message, 'loading');
    } else {
      if (btnSpinner) btnSpinner.style.display = 'none';
      if (btnText) btnText.textContent = 'Analyze Current Post';
    }
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
          currentList.className = 'result-list';
          container.appendChild(currentList);
        }
        const li = document.createElement('li');
        li.className = 'result-list-item';
        appendFormattedInlineText(li, line.replace(/^[\*\-]\s+/, ''));
        currentList.appendChild(li);
      } else {
        currentList = null;
        const p = document.createElement('p');
        p.className = 'result-paragraph';
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
   * Copy text to clipboard with modern API and reliable fallback
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

    // Fallback using temporary textarea
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

  // Copy button handler
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!currentResultRawText) return;

      const success = await copyToClipboard(currentResultRawText);
      if (success) {
        copyBtn.classList.add('copied');
        if (copyText) copyText.textContent = 'Copied!';
        if (copyIcon) copyIcon.textContent = '✓';

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (copyText) copyText.textContent = 'Copy';
          if (copyIcon) copyIcon.textContent = '📋';
        }, 2000);
      } else {
        if (copyText) copyText.textContent = 'Failed';
        setTimeout(() => {
          if (copyText) copyText.textContent = 'Copy';
        }, 2000);
      }
    });
  }

  /**
   * Main Analysis Handler
   */
  analyzeBtn.addEventListener('click', async () => {
    if (isAnalyzing || analyzeBtn.disabled) return;

    // Reset UI state
    hideStatus();
    if (resultSection) resultSection.style.display = 'none';
    resultBox.style.display = 'none';
    setLoading(true, 'Extracting visible LinkedIn post...');

    try {
      // Query the active tab in current window
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Verify page is on LinkedIn
      if (!tab || !tab.url || !tab.url.includes("linkedin.com")) {
        showStatus('Please navigate to an active LinkedIn page first.', 'info');
        return;
      }

      // Send extraction message to content script
      const response = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: "extractPost" }, (res) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              error: 'Could not contact the LinkedIn page. Please refresh the page and try again.'
            });
          } else {
            resolve(res);
          }
        });
      });

      // Handle missing post or extraction failure
      if (!response || !response.success) {
        showStatus(
          (response && response.error) ? response.error : 'No visible LinkedIn post found. Scroll to center a post and try again.',
          'warning'
        );
        return;
      }

      // Proceed with analysis
      setLoading(true, 'Analyzing post with Gemini...');
      const postText = response.text;
      const operation = operationSelect ? operationSelect.value : 'summarize';

      try {
        const apiRes = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: postText, operation })
        });

        // Requirement 4: Handle 429 quota exhaustion separately without inventing reset times
        if (apiRes.status === 429) {
          showStatus('Gemini API quota has been reached. Please retry after the quota resets.', 'error');
          return;
        }

        const apiData = await apiRes.json().catch(() => null);

        if (apiRes.ok && apiData && apiData.success) {
          hideStatus();
          currentResultRawText = apiData.result || '';

          // Update result badge label
          if (resultBadge) {
            resultBadge.textContent = OPERATION_LABELS[operation] || 'Result';
          }

          // Safely render output
          renderSafeOutput(resultBox, currentResultRawText);

          // Display result card
          if (resultSection) resultSection.style.display = 'block';
          resultBox.style.display = 'block';
        } else {
          const errorMsg = (apiData && apiData.error) ? apiData.error : 'Backend analysis failed.';
          if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.toLowerCase().includes('quota')) {
            showStatus('Gemini API quota has been reached. Please retry after the quota resets.', 'error');
          } else {
            showStatus(errorMsg, 'error');
          }
        }
      } catch (networkErr) {
        // Backend connection failure handled separately
        showStatus('Cannot connect to the backend server. Please make sure npm start is running on http://localhost:3000.', 'error');
      }
    } catch (tabErr) {
      showStatus('An error occurred while accessing the active tab.', 'error');
    } finally {
      setLoading(false);
    }
  });
});
