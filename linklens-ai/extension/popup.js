document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze-btn');
  const statusMessage = document.getElementById('status-message');
  const operationSelect = document.getElementById('operation-select');
  const resultBox = document.getElementById('result-box');

  let isAnalyzing = false;

  analyzeBtn.addEventListener('click', async () => {
    if (isAnalyzing || analyzeBtn.disabled) return;

    isAnalyzing = true;
    analyzeBtn.disabled = true;
    statusMessage.textContent = 'Extracting post...';
    statusMessage.style.display = 'block';
    resultBox.style.display = 'none';

    try {
      // Query the currently active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Ensure we are on a LinkedIn page
      if (!tab || !tab.url || !tab.url.includes("linkedin.com")) {
        statusMessage.textContent = 'Please navigate to a LinkedIn page first.';
        return;
      }

      // Send message to the content script running in the active tab
      const response = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: "extractPost" }, (res) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: 'Could not contact the page. Try refreshing the LinkedIn page.' });
          } else {
            resolve(res);
          }
        });
      });

      // Handle post extraction failure
      if (!response || !response.success) {
        statusMessage.textContent = response ? response.error : 'No suitable post found.';
        return;
      }

      // Display extracting status and proceed to analyze
      statusMessage.textContent = 'Post extracted. Analyzing with Gemini...';
      const postText = response.text;
      const operation = operationSelect.value;

      try {
        const apiRes = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: postText, operation })
        });

        // Detect HTTP 429 Quota Exceeded response
        if (apiRes.status === 429) {
          statusMessage.textContent = 'Gemini API quota has been reached. Please retry after the quota resets.';
          return;
        }

        const apiData = await apiRes.json().catch(() => null);

        if (apiRes.ok && apiData && apiData.success) {
          statusMessage.textContent = 'Analysis complete!';
          resultBox.textContent = apiData.result;
          resultBox.style.display = 'block';
        } else {
          const errorMsg = apiData && apiData.error ? apiData.error : 'Backend analysis failed.';
          if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.toLowerCase().includes('quota')) {
            statusMessage.textContent = 'Gemini API quota has been reached. Please retry after the quota resets.';
          } else {
            statusMessage.textContent = errorMsg;
          }
        }
      } catch (err) {
        statusMessage.textContent = 'Could not reach backend. Is the server running?';
      }
    } catch (error) {
      statusMessage.textContent = 'An error occurred while accessing the tab.';
    } finally {
      isAnalyzing = false;
      analyzeBtn.disabled = false;
    }
  });
});

