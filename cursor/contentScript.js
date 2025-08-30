/* Aura: Extract text, analyze sentiment with Gemini API, and adapt UI based on emotional state */

// Initialize state
let isAuraEnabled = true;
let lastAnalysisTime = 0;
let currentMode = 'default';
let currentMood = 'neutral';
let typingPatterns = [];
let lastTypingTime = 0;
let typingErrors = 0;
let typingSpeed = 0;
let isReadingMode = false;
let isWarmMode = false;
const ANALYSIS_INTERVAL = 5000; // 5 seconds between analyses

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleAura') {
    isAuraEnabled = message.enabled;
    if (!isAuraEnabled) {
      applyAuraMode('default');
    } else {
      analyzePageSentiment();
    }
    sendResponse({status: 'success', enabled: isAuraEnabled});
  }
  
  if (message.action === 'getCurrentMood') {
    sendResponse({ mood: currentMood });
  }
  
  if (message.action === 'getPageText') {
    const text = extractVisibleText();
    sendResponse({ text });
  }
  
  if (message.action === 'startBreathingExercise') {
    startBreathingExercise();
    sendResponse({ status: 'started' });
  }
  
  if (message.action === 'simplifyContent') {
    simplifyPageContent();
    sendResponse({ status: 'simplified' });
  }
  
  if (message.action === 'toggleReadingMode') {
    toggleReadingMode();
    sendResponse({ status: 'toggled' });
  }
  
  if (message.action === 'enableReadingMode') {
    enableReadingMode();
    sendResponse({ status: 'enabled' });
  }
  
  if (message.action === 'toggleWarmMode') {
    toggleWarmMode();
    sendResponse({ status: 'toggled' });
  }
  
  if (message.action === 'summarizeContent') {
    summarizePageContent();
    sendResponse({ status: 'summarized' });
  }
  
  return true;
});

// Extract visible text from the page
function extractVisibleText(maxChars = 8000) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(parent);
      if (style && (style.visibility === "hidden" || style.display === "none")) return NodeFilter.FILTER_REJECT;
      const text = node.nodeValue.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      if (text.length < 2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let content = "";
  while (walker.nextNode()) {
    const piece = walker.currentNode.nodeValue.replace(/\s+/g, " ").trim();
    if (!piece) continue;
    if (content.length + piece.length + 1 > maxChars) break;
    content += (content ? " " : "") + piece;
  }
  return content;
}

// Enhanced typing pattern analysis with error detection
function analyzeTypingPatterns(event) {
  if (!isAuraEnabled) return;
  
  const now = Date.now();
  const timeSinceLastTyping = now - lastTypingTime;
  
  // Calculate typing speed (words per minute approximation)
  if (timeSinceLastTyping < 1000) { // Typing within 1 second
    typingSpeed = Math.min(150, typingSpeed + 10); // Increase speed
  } else if (timeSinceLastTyping > 5000) { // Pause longer than 5 seconds
    typingSpeed = Math.max(30, typingSpeed - 5); // Decrease speed
  }
  
  // Detect typing errors (backspace, delete, etc.)
  if (event.key === 'Backspace' || event.key === 'Delete') {
    typingErrors++;
  }
  
  // Record typing patterns
  typingPatterns.push({
    type: timeSinceLastTyping < 1000 ? 'fast' : 'normal',
    timestamp: now,
    key: event.key,
    errors: typingErrors
  });
  
  // Keep only recent patterns (last 2 minutes)
  typingPatterns = typingPatterns.filter(p => now - p.timestamp < 120000);
  
  // Analyze patterns for mood indicators
  const fastTypingCount = typingPatterns.filter(p => p.type === 'fast').length;
  const errorRate = typingErrors / Math.max(typingPatterns.length, 1);
  
  // Update mood based on typing patterns
  if (fastTypingCount > 10 && errorRate > 0.3) {
    currentMood = 'frustrated';
  } else if (fastTypingCount > 8 && errorRate > 0.2) {
    currentMood = 'anxious';
  } else if (fastTypingCount > 10 && errorRate < 0.1) {
    currentMood = 'excited';
  } else if (typingSpeed < 60 && errorRate < 0.1) {
    currentMood = 'calm';
  }
  
  lastTypingTime = now;
}

// Analyze sentiment using Gemini API
async function analyzeWithGemini(text) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'analyze_with_gemini',
      payload: { text }
    });
    
    if (response.success) {
      return response.analysis;
    } else {
      throw new Error(response.error || 'Gemini analysis failed');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to local analysis
    return analyzeSentimentLocal(text);
  }
}

// Local sentiment analysis as fallback
function analyzeSentimentLocal(text) {
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'love', 'like', 'enjoy', 'positive', 'amazing', 'awesome', 'fantastic', 'joy', 'pleased', 'delighted'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'negative', 'angry', 'upset', 'disappointed', 'frustrating', 'annoyed', 'miserable', 'depressed'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  let mood = 'neutral';
  if (positiveCount > negativeCount) {
    mood = 'positive';
  } else if (negativeCount > positiveCount) {
    mood = 'negative';
  }
  
  return {
    mood,
    sentiment: mood,
    intensity: 'medium',
    emotions: [mood],
    confidence: 0.7
  };
}

// Generate recommendations based on mood
function generateRecommendations(mood) {
  const recommendations = {
    positive: [
      "Continue engaging with this positive content",
      "Share this positive experience with others",
      "Bookmark this page for future reference",
      "Take a moment to appreciate this positive feeling"
    ],
    negative: [
      "Take a deep breath and pause for a moment",
      "Consider a short break from this content",
      "Try our breathing exercise (click the icon)",
      "Focus on something positive in your environment",
      "Remember that it's okay to step away"
    ],
    anxious: [
      "Practice deep breathing exercises",
      "Focus on the present moment",
      "Try progressive muscle relaxation",
      "Take a short walk or stretch break"
    ],
    excited: [
      "Channel your energy productively",
      "Take a moment to ground yourself",
      "Share your enthusiasm with others",
      "Use this energy for focused work"
    ],
    calm: [
      "Enjoy this peaceful state",
      "Maintain your inner balance",
      "Use this calm for focused work",
      "Practice mindfulness to stay present"
    ],
    frustrated: [
      "Take a step back and breathe deeply",
      "Consider what's causing this frustration",
      "Try our breathing exercise to calm down",
      "Remember that mistakes are part of learning"
    ],
    neutral: [
      "A balanced state is perfect for focus",
      "Use this stability for productivity",
      "Maintain your equilibrium",
      "Consider what you'd like to achieve"
    ]
  };
  
  return recommendations[mood] || recommendations.neutral;
}

// Apply Aura mode to the page
function applyAuraMode(mode) {
  if (currentMode === mode) return;
  
  // Remove previous mode classes
  document.documentElement.classList.remove('aura-default-mode', 'aura-calm-mode', 'aura-happy-mode', 'aura-sad-mode');
  
  // Add transition animation
  document.documentElement.classList.add('aura-mode-transition');
  
  // Set appropriate mode
  let sentiment = 'neutral';
  if (mode === 'negative' || mode === 'calm') {
    document.documentElement.classList.add('aura-calm-mode');
    currentMode = 'calm';
    sentiment = 'negative';
  } else if (mode === 'positive') {
    document.documentElement.classList.add('aura-happy-mode');
    currentMode = 'happy';
    sentiment = 'positive';
  } else {
    document.documentElement.classList.add('aura-default-mode');
    currentMode = 'default';
    sentiment = mode === 'positive' ? 'positive' : 'neutral';
  }
  
  // Generate and display recommendations
  const recommendations = generateRecommendations(sentiment);
  updateRecommendations(recommendations, sentiment);
  
  console.log('Aura mode changed to:', currentMode);
}

// Update recommendations display
function updateRecommendations(recommendations, sentiment) {
  // Remove existing recommendations panel if any
  const existingPanel = document.getElementById('aura-recommendations');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // Create recommendations panel
  const panel = document.createElement('div');
  panel.id = 'aura-recommendations';
  panel.className = `aura-recommendations ${sentiment}`;
  
  // Add header
  const header = document.createElement('div');
  header.className = 'aura-rec-header';
  
  const title = document.createElement('h3');
  title.textContent = 'Aura Recommendations';
  header.appendChild(title);
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 'aura-rec-close';
  closeBtn.addEventListener('click', () => panel.remove());
  header.appendChild(closeBtn);
  
  panel.appendChild(header);
  
  // Add recommendations
  const recList = document.createElement('ul');
  recommendations.forEach(rec => {
    const item = document.createElement('li');
    item.textContent = rec;
    recList.appendChild(item);
  });
  panel.appendChild(recList);
  
  // Add breathing exercise button for negative sentiment
  if (sentiment === 'negative' || sentiment === 'anxious' || sentiment === 'frustrated') {
    const breathingBtn = document.createElement('button');
    breathingBtn.textContent = 'Start Breathing Exercise';
    breathingBtn.className = 'aura-breathing-btn';
    breathingBtn.addEventListener('click', startBreathingExercise);
    panel.appendChild(breathingBtn);
  }
  
  // Add to page
  document.body.appendChild(panel);
}

// Enhanced breathing exercise function
function startBreathingExercise() {
  // Create breathing exercise overlay
  const overlay = document.createElement('div');
  overlay.className = 'aura-breathing-overlay';
  
  const container = document.createElement('div');
  container.className = 'aura-breathing-container';
  
  // Add title
  const title = document.createElement('h2');
  title.textContent = 'Breathing Exercise';
  title.className = 'aura-breathing-title';
  container.appendChild(title);
  
  const circle = document.createElement('div');
  circle.className = 'aura-breathing-circle';
  
  const instruction = document.createElement('div');
  instruction.className = 'aura-breathing-instruction';
  instruction.textContent = 'Breathe in...';
  
  // Add counter
  const counter = document.createElement('div');
  counter.className = 'aura-breathing-counter';
  counter.textContent = 'Cycle: 1 of 5';
  
  // Add progress bar
  const progressContainer = document.createElement('div');
  progressContainer.className = 'aura-breathing-progress-container';
  const progressBar = document.createElement('div');
  progressBar.className = 'aura-breathing-progress';
  progressContainer.appendChild(progressBar);
  
  // Add mood improvement text
  const moodText = document.createElement('div');
  moodText.className = 'aura-breathing-mood-text';
  moodText.textContent = 'Taking deep breaths helps reduce stress and anxiety';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'aura-breathing-close';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => overlay.remove());
  
  container.appendChild(circle);
  container.appendChild(instruction);
  container.appendChild(counter);
  container.appendChild(progressContainer);
  container.appendChild(moodText);
  container.appendChild(closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // Start breathing animation
  let phase = 'inhale';
  let count = 0;
  const totalCycles = 5;
  circle.classList.add('inhale');
  progressBar.style.width = '33%';
  
  const breathingCycle = setInterval(() => {
    if (phase === 'inhale') {
      phase = 'hold';
      circle.classList.remove('inhale');
      circle.classList.add('hold');
      instruction.textContent = 'Hold...';
      progressBar.style.width = '66%';
      setTimeout(() => {
        if (!document.contains(overlay)) {
          clearInterval(breathingCycle);
          return;
        }
        phase = 'exhale';
        circle.classList.remove('hold');
        circle.classList.add('exhale');
        instruction.textContent = 'Breathe out...';
        progressBar.style.width = '100%';
      }, 4000); // Hold for 4 seconds
    } else {
      phase = 'inhale';
      circle.classList.remove('exhale');
      circle.classList.add('inhale');
      instruction.textContent = 'Breathe in...';
      progressBar.style.width = '33%';
      
      // Update cycle counter
      count++;
      if (count < totalCycles) {
        counter.textContent = `Cycle: ${count + 1} of ${totalCycles}`;
        
        // Update mood text
        const moodTexts = [
          "Taking deep breaths helps reduce stress and anxiety",
          "Notice how your body feels more relaxed with each breath",
          "Breathing deeply activates your parasympathetic nervous system",
          "Focus on the present moment and let go of worries",
          "You're doing great! Keep breathing mindfully"
        ];
        moodText.textContent = moodTexts[count % moodTexts.length];
      } else {
        clearInterval(breathingCycle);
        instruction.textContent = 'Well done!';
        counter.textContent = 'Complete!';
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
          instruction.textContent = 'Continue when ready or close';
        }, 2000);
      }
    }
  }, 8000); // 8 seconds per full cycle (not including hold)
  
  // Add CSS for breathing exercise
  const style = document.createElement('style');
  style.textContent = `
    .aura-breathing-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .aura-breathing-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .aura-breathing-circle {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background-color: rgba(100, 150, 255, 0.5);
      transition: transform 4s ease-in-out, background-color 4s;
    }
    .aura-breathing-circle.inhale {
      transform: scale(1.5);
      background-color: rgba(100, 150, 255, 0.8);
    }
    .aura-breathing-circle.hold {
      transform: scale(1.5);
      background-color: rgba(100, 200, 255, 0.8);
    }
    .aura-breathing-circle.exhale {
      transform: scale(1);
      background-color: rgba(100, 150, 255, 0.5);
    }
    .aura-breathing-instruction {
      margin-top: 20px;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    .aura-breathing-close {
      position: absolute;
      top: -40px;
      right: -40px;
      background: none;
      border: none;
      color: white;
      font-size: 30px;
      cursor: pointer;
    }
    .aura-recommendations {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 9000;
      padding: 15px;
      transition: all 0.3s ease;
    }
    .aura-recommendations.positive {
      border-left: 5px solid #4CAF50;
    }
    .aura-recommendations.negative {
      border-left: 5px solid #F44336;
    }
    .aura-recommendations.neutral {
      border-left: 5px solid #2196F3;
    }
    .aura-rec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .aura-rec-header h3 {
      margin: 0;
      font-size: 16px;
    }
    .aura-rec-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
    }
    .aura-recommendations ul {
      margin: 0;
      padding: 0 0 0 20px;
    }
    .aura-recommendations li {
      margin-bottom: 8px;
    }
    .aura-breathing-btn {
      display: block;
      width: 100%;
      padding: 8px;
      margin-top: 10px;
      background-color: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .aura-breathing-btn:hover {
      background-color: #0b7dda;
    }
    .aura-mode-transition {
      transition: filter 1s ease, background-color 1s ease;
    }
    .aura-calm-mode {
      filter: saturate(0.8) brightness(0.95);
    }
  `;
  document.head.appendChild(style);
}

// New feature functions
function simplifyPageContent() {
  // Simplify page by reducing visual clutter
  const style = document.createElement('style');
  style.textContent = `
    .aura-simplified * {
      font-family: 'Arial', sans-serif !important;
      line-height: 1.6 !important;
    }
    .aura-simplified img, .aura-simplified video, .aura-simplified iframe {
      display: none !important;
    }
    .aura-simplified {
      background: #f8f9fa !important;
      color: #212529 !important;
    }
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('aura-simplified');
}

function toggleReadingMode() {
  if (isReadingMode) {
    disableReadingMode();
  } else {
    enableReadingMode();
  }
}

function enableReadingMode() {
  isReadingMode = true;
  const style = document.createElement('style');
  style.textContent = `
    .aura-reading-mode {
      max-width: 800px !important;
      margin: 0 auto !important;
      font-size: 18px !important;
      line-height: 1.8 !important;
      background: #fefefe !important;
      padding: 40px !important;
    }
    .aura-reading-mode * {
      font-family: 'Georgia', serif !important;
    }
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('aura-reading-mode');
}

function disableReadingMode() {
  isReadingMode = false;
  document.documentElement.classList.remove('aura-reading-mode');
}

function toggleWarmMode() {
  isWarmMode = !isWarmMode;
  if (isWarmMode) {
    document.documentElement.style.filter = 'sepia(0.3) hue-rotate(30deg) saturate(1.2)';
  } else {
    document.documentElement.style.filter = '';
  }
}

function summarizePageContent() {
  // Create a summary overlay
  const overlay = document.createElement('div');
  overlay.className = 'aura-summary-overlay';
  overlay.innerHTML = `
    <div class="aura-summary-container">
      <h3>Page Summary</h3>
      <div class="aura-summary-content">
        <p>Generating summary...</p>
      </div>
      <button class="aura-summary-close">Close</button>
    </div>
  `;
  
  overlay.querySelector('.aura-summary-close').addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
  
  // Add summary styles
  const style = document.createElement('style');
  style.textContent = `
    .aura-summary-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .aura-summary-container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .aura-summary-close {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 20px;
    }
  `;
  document.head.appendChild(style);
}

// Main function to analyze page sentiment
async function analyzePageSentiment() {
  if (!isAuraEnabled) return;
  
  const now = Date.now();
  if (now - lastAnalysisTime < ANALYSIS_INTERVAL) return;
  lastAnalysisTime = now;
  
  const pageText = extractVisibleText();
  if (!pageText) return;
  
  try {
    // Try Gemini API first
    const analysis = await analyzeWithGemini(pageText);
    currentMood = analysis.mood;
    
    // Apply appropriate mode based on sentiment
    if (analysis.mood === 'negative' || analysis.mood === 'anxious') {
      applyAuraMode('calm');
    } else if (analysis.mood === 'positive' || analysis.mood === 'excited') {
      applyAuraMode('happy');
    } else {
      applyAuraMode('default');
    }
    
    // Send sentiment data to background script for popup display
    chrome.runtime.sendMessage({
      action: 'updateSentiment',
      sentiment: analysis.mood,
      timestamp: now
    });
    
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    // Fallback to local analysis
    const sentiment = analyzeSentimentLocal(pageText);
    currentMood = sentiment.mood;
    applyAuraMode(sentiment.mood === 'negative' ? 'calm' : 'default');
  }
}

// Initialize and set up periodic analysis
function initialize() {
  // Initial analysis
  setTimeout(analyzePageSentiment, 1000);
  
  // Set up periodic analysis
  setInterval(analyzePageSentiment, ANALYSIS_INTERVAL);
  
  // Listen for content changes
  const observer = new MutationObserver(() => {
    // Debounce analysis on content change
    clearTimeout(window.auraAnalysisTimer);
    window.auraAnalysisTimer = setTimeout(analyzePageSentiment, 1000);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // Listen for typing events
  document.addEventListener('keydown', analyzeTypingPatterns);
  document.addEventListener('input', analyzeTypingPatterns);
}

// New feature functions
function simplifyPageContent() {
  // Simplify page by reducing visual clutter
  const style = document.createElement('style');
  style.textContent = `
    .aura-simplified * {
      font-family: 'Arial', sans-serif !important;
      line-height: 1.6 !important;
    }
    .aura-simplified img, .aura-simplified video, .aura-simplified iframe {
      display: none !important;
    }
    .aura-simplified {
      background: #f8f9fa !important;
      color: #212529 !important;
    }
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('aura-simplified');
}

function toggleReadingMode() {
  if (isReadingMode) {
    disableReadingMode();
  } else {
    enableReadingMode();
  }
}

function enableReadingMode() {
  isReadingMode = true;
  const style = document.createElement('style');
  style.textContent = `
    .aura-reading-mode {
      max-width: 800px !important;
      margin: 0 auto !important;
      font-size: 18px !important;
      line-height: 1.8 !important;
      background: #fefefe !important;
      padding: 40px !important;
    }
    .aura-reading-mode * {
      font-family: 'Georgia', serif !important;
    }
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('aura-reading-mode');
}

function disableReadingMode() {
  isReadingMode = false;
  document.documentElement.classList.remove('aura-reading-mode');
}

function toggleWarmMode() {
  isWarmMode = !isWarmMode;
  if (isWarmMode) {
    document.documentElement.style.filter = 'sepia(0.3) hue-rotate(30deg) saturate(1.2)';
  } else {
    document.documentElement.style.filter = '';
  }
}

function summarizePageContent() {
  // Create a summary overlay
  const overlay = document.createElement('div');
  overlay.className = 'aura-summary-overlay';
  overlay.innerHTML = `
    <div class="aura-summary-container">
      <h3>Page Summary</h3>
      <div class="aura-summary-content">
        <p>Generating summary...</p>
      </div>
      <button class="aura-summary-close">Close</button>
    </div>
  `;
  
  overlay.querySelector('.aura-summary-close').addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
  
  // Add summary styles
  const style = document.createElement('style');
  style.textContent = `
    .aura-summary-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .aura-summary-container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .aura-summary-close {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 20px;
    }
  `;
  document.head.appendChild(style);
}

// Start the extension
initialize();
