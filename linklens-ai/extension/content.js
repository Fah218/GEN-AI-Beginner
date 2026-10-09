// content.js
console.log("LinkLens content.js loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractPost") {
    try {
      const text = extractVisiblePost();
      if (text) {
        sendResponse({ success: true, text: text });
      } else {
        sendResponse({ success: false, error: "Page contacted, but no post found." });
      }
    } catch (error) {
      console.error("[LinkLens AI] Top-level caught error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

function extractVisiblePost() {
  try {
    console.log("--- LinkLens AI: Starting post extraction ---");
    console.log("[LinkLens AI] function entered");
    
    const postSelectors = [
      'div[data-urn^="urn:li:activity"]',
      '.feed-shared-update-v2',
      '[data-view-name="feed-update"]',
      'div[role="article"]'
    ];
    
    let posts = [];
    for (const selector of postSelectors) {
      console.log(`[LinkLens AI] testing selector: '${selector}'`);
      posts = document.querySelectorAll(selector);
      console.log(`[LinkLens AI] Selector '${selector}' found ${posts.length} elements.`);
      if (posts.length > 0) {
        console.log(`[LinkLens AI] Using selector: '${selector}'`);
        break;
      }
    }
    
    console.log(`[LinkLens AI] candidate post count: ${posts.length}`);
    
    if (posts.length === 0) {
      console.log("[LinkLens AI] No candidate post containers were found with standard selectors.");
      console.log("[LinkLens AI] Attempting fallback strategy: searching visible text nodes...");
      
      const elements = document.querySelectorAll('div, span, p, article');
      let bestCandidate = null;
      let maxScore = -1;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const rect = el.getBoundingClientRect();
        
        // Basic visibility check
        const inView = rect.top >= -100 && rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.height > 0 && rect.width > 0;
        if (!inView) continue;

        // Sensible checks to avoid whole page, navigation, or sidebar
        const isTooWide = rect.width > window.innerWidth * 0.85; // Probably a main wrapper
        const isTooNarrow = rect.width < 250; // Probably a sidebar or tiny column
        const isTooTall = rect.height > window.innerHeight * 2; // Probably a whole feed container
        if (isTooWide || isTooNarrow || isTooTall) continue;
        
        const text = el.innerText ? el.innerText.trim() : "";
        if (text.length > 50 && text.length < 5000) {
          if (text.length > maxScore) {
            maxScore = text.length;
            bestCandidate = el;
          }
        }
      }

      if (bestCandidate) {
        console.log(`[LinkLens AI] Fallback strategy succeeded. Found element with text length: ${maxScore}`);
        posts = [bestCandidate];
      } else {
        console.log("[LinkLens AI] Fallback strategy failed to find a plausible post container.");
        console.log("[LinkLens AI] final return value: null");
        return null;
      }
    }
    
    let visiblePost = null;
    let visibleCandidateCount = 0;
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const rect = post.getBoundingClientRect();
      console.log(`[LinkLens AI] Candidate ${i} bounds: top=${rect.top}, bottom=${rect.bottom}, windowHeight=${window.innerHeight}`);
      if (rect.top >= -100 && rect.top <= (window.innerHeight || document.documentElement.clientHeight)) {
        console.log(`[LinkLens AI] Candidate ${i} is considered visible!`);
        visiblePost = post;
        visibleCandidateCount++;
        break;
      } else {
        console.log(`[LinkLens AI] Candidate ${i} is NOT considered visible.`);
      }
    }
    
    console.log(`[LinkLens AI] visible candidate count: ${visibleCandidateCount}`);
    
    if (!visiblePost) {
      console.log("[LinkLens AI] No strictly visible candidate found, falling back to candidate 0.");
      visiblePost = posts[0];
    }
    
    console.log(`[LinkLens AI] selected candidate:`, visiblePost);
    
    console.log("[LinkLens AI] Attempting to extract text from the selected visible post...");
    const textSelectors = [
      '.update-components-text', 
      '.feed-shared-update-v2__description',
      '.feed-shared-text'
    ];
    
    let textContainer = null;
    for (const selector of textSelectors) {
      console.log(`[LinkLens AI] testing text selector: '${selector}'`);
      textContainer = visiblePost.querySelector(selector);
      if (textContainer) {
         console.log(`[LinkLens AI] text selector results: found 1 element using '${selector}'`);
         console.log(`[LinkLens AI] Text length: ${textContainer.innerText ? textContainer.innerText.trim().length : 0}`);
         break;
      } else {
         console.log(`[LinkLens AI] text selector results: found 0 elements using '${selector}'`);
      }
    }
    
    if (textContainer && textContainer.innerText) {
      const extracted = textContainer.innerText.trim();
      console.log(`[LinkLens AI] extracted text length: ${extracted.length} characters.`);
      console.log("[LinkLens AI] final return value:", extracted ? "string of length " + extracted.length : "empty string");
      return extracted;
    }
    
    console.log("[LinkLens AI] Specific text container not found. Trying fallback: spans with dir='ltr' or direct innerText.");
    
    // First try ltr spans (common for LinkedIn post body)
    const textSpans = visiblePost.querySelectorAll('span[dir="ltr"]');
    console.log(`[LinkLens AI] Found ${textSpans.length} spans with dir='ltr' inside the visible post.`);
    
    let longestText = "";
    for (let i = 0; i < textSpans.length; i++) {
      const span = textSpans[i];
      const text = span.innerText ? span.innerText.trim() : "";
      console.log(`[LinkLens AI] Span ${i} text length: ${text.length}`);
      if (text.length > longestText.length) {
        longestText = text;
      }
    }
    
    if (longestText) {
      console.log(`[LinkLens AI] extracted text length: ${longestText.length} characters using fallback span.`);
      console.log("[LinkLens AI] final return value:", "string of length " + longestText.length);
      return longestText;
    }

    // Last resort: just use the visible post's text itself
    if (visiblePost.innerText) {
      const allText = visiblePost.innerText.trim();
      if (allText.length > 50) {
        console.log(`[LinkLens AI] extracted text length: ${allText.length} characters using raw innerText.`);
        console.log("[LinkLens AI] final return value:", "string of length " + allText.length);
        return allText;
      }
    }
    
    console.log("[LinkLens AI] Failed to extract any text from the selected post.");
    console.log("[LinkLens AI] final return value: null");
    return null;
  } catch (error) {
    console.error("[LinkLens AI] caught errors:", error);
    throw error;
  }
}
