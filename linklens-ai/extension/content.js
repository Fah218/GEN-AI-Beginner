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
  console.log("--- LinkLens AI: Starting post extraction ---");
  const postSelectors = [
    'div[data-urn^="urn:li:activity"]',
    '.feed-shared-update-v2',
    '[data-view-name="feed-update"]',
    'div[role="article"]'
  ];
  
  let posts = [];
  for (const selector of postSelectors) {
    posts = document.querySelectorAll(selector);
    console.log(`Selector '${selector}' found ${posts.length} elements.`);
    if (posts.length > 0) {
      console.log(`Using selector: '${selector}'`);
      break;
    }
  }
  
  if (posts.length === 0) {
    console.log("No candidate post containers were found with any selector.");
    return null;
  }
  
  console.log(`Found ${posts.length} candidate post containers.`);
  
  let visiblePost = null;
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const rect = post.getBoundingClientRect();
    console.log(`Candidate ${i} bounds: top=${rect.top}, bottom=${rect.bottom}, windowHeight=${window.innerHeight}`);
    if (rect.top >= -100 && rect.top <= (window.innerHeight || document.documentElement.clientHeight)) {
      console.log(`Candidate ${i} is considered visible!`);
      visiblePost = post;
      break;
    } else {
      console.log(`Candidate ${i} is NOT considered visible.`);
    }
  }
  
  if (!visiblePost) {
    console.log("No strictly visible candidate found, falling back to candidate 0.");
    visiblePost = posts[0];
  }
  
  console.log("Attempting to extract text from the selected visible post...");
  const textSelectors = [
    '.update-components-text', 
    '.feed-shared-update-v2__description',
    '.feed-shared-text'
  ];
  
  let textContainer = null;
  for (const selector of textSelectors) {
    textContainer = visiblePost.querySelector(selector);
    if (textContainer) {
       console.log(`Text container found using selector '${selector}'. Text length: ${textContainer.innerText.trim().length}`);
       break;
    } else {
       console.log(`Text container selector '${selector}' found 0 elements inside the visible post.`);
    }
  }
  
  if (textContainer) {
    const extracted = textContainer.innerText.trim();
    console.log(`Successfully extracted ${extracted.length} characters.`);
    return extracted;
  }
  
  console.log("Specific text container not found. Trying fallback: spans with dir='ltr'.");
  const textSpans = visiblePost.querySelectorAll('span[dir="ltr"]');
  console.log(`Found ${textSpans.length} spans with dir='ltr' inside the visible post.`);
  
  let longestText = "";
  for (let i = 0; i < textSpans.length; i++) {
    const span = textSpans[i];
    const text = span.innerText.trim();
    console.log(`Span ${i} text length: ${text.length}`);
    if (text.length > longestText.length) {
      longestText = text;
    }
  }
  
  if (longestText) {
    console.log(`Successfully extracted ${longestText.length} characters using fallback.`);
    return longestText;
  }
  
  console.log("Failed to extract any text from the selected post.");
  return null;
}
