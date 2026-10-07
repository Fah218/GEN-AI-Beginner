// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractPost") {
    try {
      const text = extractVisiblePost();
      if (text) {
        sendResponse({ success: true, text: text });
      } else {
        sendResponse({ success: false, error: "No post text could be found on the screen." });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
});

function extractVisiblePost() {
  // DOM-selection strategy:
  // 1. Post Containers: We avoid fragile generated classes. We look for 'data-urn' containing 'urn:li:activity'
  //    which is LinkedIn's standard structural identifier for a post, or semantic roles like role="article".
  // 2. Visible Post: We check which of the found posts is currently visible within the viewport to get what the user is looking at.
  // 3. Text Body: Inside the post, we target the body text container. We try known static-ish classes first.
  //    As a fallback, we extract the longest text from spans with dir="ltr", as LinkedIn usually wraps user text this way.

  const postSelectors = [
    'div[data-urn^="urn:li:activity"]', // Most reliable: Data attribute for post activity
    '.feed-shared-update-v2',            // Common static class
    '[data-view-name="feed-update"]',    // View name attribute
    'div[role="article"]'                // Semantic role fallback
  ];
  
  let posts = [];
  for (const selector of postSelectors) {
    posts = document.querySelectorAll(selector);
    if (posts.length > 0) break;
  }
  
  if (posts.length === 0) {
    return null;
  }
  
  // Find the first post that is visible in the viewport
  let visiblePost = null;
  for (const post of posts) {
    const rect = post.getBoundingClientRect();
    // Consider it visible if its top is near or within the screen, and bottom is also reasonably in view
    if (rect.top >= -100 && rect.top <= (window.innerHeight || document.documentElement.clientHeight)) {
      visiblePost = post;
      break;
    }
  }
  
  // Fallback to the first post if none meet the strict viewport criteria
  if (!visiblePost) {
    visiblePost = posts[0];
  }
  
  // Extracting the text from the post
  const textSelectors = [
    '.update-components-text', 
    '.feed-shared-update-v2__description',
    '.feed-shared-text'
  ];
  
  let textContainer = null;
  for (const selector of textSelectors) {
    textContainer = visiblePost.querySelector(selector);
    if (textContainer) break;
  }
  
  if (textContainer) {
    return textContainer.innerText.trim();
  }
  
  // Ultimate Fallback: look for the longest text block in ltr spans
  const textSpans = visiblePost.querySelectorAll('span[dir="ltr"]');
  let longestText = "";
  for (const span of textSpans) {
    const text = span.innerText.trim();
    if (text.length > longestText.length) {
      longestText = text;
    }
  }
  
  if (longestText) {
    return longestText;
  }
  
  return null;
}
