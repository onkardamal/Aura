/* Background service worker for Aura: Empathetic Web Experience */

// Initialize state
let currentSentiment = 'neutral';
let isAuraEnabled = true;

// Set up extension when installed
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default settings
  chrome.storage.sync.set({
    auraEnabled: true,
    lastAnalysis: {
      sentiment: 'neutral',
      timestamp: Date.now()
    }
  });
  
  console.log('Aura extension installed successfully');
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle sentiment updates from content script
  if (message.type === 'sentiment_update' || message.action === 'updateSentiment') {
    currentSentiment = message.sentiment;
    
    // Store the latest sentiment analysis
    chrome.storage.sync.set({
      currentSentiment: message.sentiment,
      lastAnalysis: {
        sentiment: message.sentiment,
        timestamp: message.timestamp || Date.now()
      }
    });
    
    // Update badge based on sentiment
    updateBadge(message.sentiment);
    
    // Send update to popup if open
    chrome.runtime.sendMessage({
      type: 'sentiment_update',
      sentiment: message.sentiment
    });
  }
  
  // Handle Gemini API analysis requests
  if (message.type === 'analyze_with_gemini') {
    (async () => {
      try {
        const { text } = message.payload || {};
        const analysis = await analyzeWithGemini(text);
        sendResponse({ success: true, analysis });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // async
  }
  
  // Handle status requests from popup
  if (message.type === 'get_status' || message.action === 'getStatus') {
    sendResponse({
      enabled: isAuraEnabled,
      sentiment: currentSentiment
    });
    return true;
  }
  
  // Handle toggle requests from popup
  if (message.type === 'toggle_aura' || message.action === 'toggleAura') {
    isAuraEnabled = message.enabled;
    
    // Store the setting
    chrome.storage.sync.set({ auraEnabled: isAuraEnabled });
    
    // Update all tabs with the new setting
    updateAllTabs();
    
    sendResponse({ status: 'success', enabled: isAuraEnabled });
    return true;
  }
});

// Analyze text using Google Gemini API
async function analyzeWithGemini(text) {
  const { geminiApiKey } = await getGeminiSettings();
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
    const body = {
      contents: [{
        parts: [{
          text: `Analyze the emotional tone and mood of this text. Respond with ONLY a JSON object containing:
{
  "mood": "positive|negative|neutral|anxious|excited|calm|frustrated|happy|sad|angry|stressed|relaxed",
  "sentiment": "positive|negative|neutral",
  "intensity": "low|medium|high",
  "emotions": ["emotion1", "emotion2"],
  "confidence": 0.95
}

Text to analyze: ${text.slice(0, 4000)}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    try {
      return JSON.parse(content);
    } catch {
      // Fallback: try to extract JSON from response
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('Could not parse Gemini response');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// Get Gemini API settings
async function getGeminiSettings() {
  const { geminiApiKey = "" } = await chrome.storage.sync.get(["geminiApiKey"]);
  return { geminiApiKey };
}

// Update extension badge based on sentiment
function updateBadge(sentiment) {
  let color, text;
  
  switch(sentiment) {
    case 'positive':
      color = '#4CAF50'; // Green
      text = '+';
      break;
    case 'negative':
      color = '#2196F3'; // Blue for calm mode
      text = '-';
      break;
    default:
      color = '#9E9E9E'; // Gray
      text = '•';
  }
  
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
}

// Update all open tabs with current settings
async function updateAllTabs() {
  const tabs = await chrome.tabs.query({});
  
  tabs.forEach(tab => {
    if (tab.url.startsWith('http')) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleAura',
        enabled: isAuraEnabled
      }).catch(() => {
        // Ignore errors for tabs that don't have the content script running
      });
    }
  });
}

// Initialize badge on startup
updateBadge('neutral');

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id) return;
  const text = info.selectionText || (await getSelectedText(tab.id));
  if (text) {
    openPopupWithText(text);
    chrome.action.openPopup().catch(() => {});
  }
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "analyze-selection" || !tab?.id) return;
  const text = await getSelectedText(tab.id);
  if (text) {
    openPopupWithText(text);
    chrome.action.openPopup().catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "get_prefill_text") {
    const storage = getStorageArea();
    storage.get("lastSelectedText").then(({ lastSelectedText }) => {
      sendResponse({ text: lastSelectedText || "" });
    });
    return true; // async
  }
  if (message?.type === "analyze_page_text") {
    (async () => {
      const { text } = message.payload || {};
      const moodResult = await analyzeWithGoogle(text);
      const videos = await fetchYouTubeSuggestions(moodResult?.mood || "neutral");
      sendResponse({ mood: moodResult?.mood || "neutral", videos });
    })();
    return true; // async
  }
});

async function getGoogleSettings() {
  const { googleApiKey = "", ytApiKey = "" } = await chrome.storage.sync.get(["googleApiKey", "ytApiKey"]);
  return { googleApiKey, ytApiKey };
}

async function analyzeWithGoogle(text) {
  const { googleApiKey } = await getGoogleSettings();
  if (!googleApiKey) return { mood: "neutral" };
  try {
    const url = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${encodeURIComponent(googleApiKey)}`;
    const body = {
      document: { type: "PLAIN_TEXT", content: text.slice(0, 20000) },
      encodingType: "UTF8"
    };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    const score = data?.documentSentiment?.score ?? 0;
    let mood = "neutral";
    if (score > 0.2) mood = "positive";
    else if (score < -0.2) mood = "negative";
    return { mood, score };
  } catch {
    return { mood: "neutral" };
  }
}

async function fetchYouTubeSuggestions(mood) {
  const { ytApiKey } = await getGoogleSettings();
  if (!ytApiKey) return [];
  const queries = {
    positive: "motivational music playlist",
    negative: "relaxing meditation music",
    neutral: "focus music playlist",
    stressed: "calming breathing exercises"
  };
  const q = queries[mood] || queries.neutral;
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(q)}&key=${encodeURIComponent(ytApiKey)}`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.items || [];
    return items.map((it) => ({
      title: it.snippet?.title || "Video",
      url: `https://www.youtube.com/watch?v=${it.id?.videoId}`
    }));
  } catch {
    return [];
  }
}
