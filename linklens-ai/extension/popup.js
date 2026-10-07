document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze-btn');
  const statusMessage = document.getElementById('status-message');

  analyzeBtn.addEventListener('click', async () => {
    statusMessage.textContent = 'Extracting post...';
    statusMessage.style.display = 'block';

    try {
      // Query the currently active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Ensure we are on a LinkedIn page
      if (!tab.url.includes("linkedin.com")) {
        statusMessage.textContent = 'Please navigate to a LinkedIn page first.';
        return;
      }

      // Send message to the content script running in the active tab
      chrome.tabs.sendMessage(tab.id, { action: "extractPost" }, (response) => {
        // Handle case where content script cannot be reached (e.g. page needs refresh)
        if (chrome.runtime.lastError) {
          statusMessage.textContent = 'Could not contact the page. Try refreshing the LinkedIn page.';
          return;
        }

        // Display the result
        if (response && response.success) {
          statusMessage.textContent = response.text;
        } else {
          statusMessage.textContent = response ? response.error : 'No suitable post found.';
        }
      });
    } catch (error) {
      statusMessage.textContent = 'An error occurred while accessing the tab.';
    }
  });
});
