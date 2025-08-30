/* Aura Popup - Dark Theme with Enhanced Features */

class AuraPopup {
  constructor() {
    this.elements = {};
    this.currentMood = 'neutral';
    this.sentimentScore = 0.00;
    this.typingData = { speed: 0, errors: 0, frustration: 0 };
    this.isAnalyzing = false;
    this.motivationalQuotes = [
      { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Anonymous" },
      { text: "You are stronger than you think. Your potential is limitless.", author: "Aura" },
      { text: "Progress is progress, no matter how small. Keep moving forward.", author: "Aura" },
      { text: "Your mind is a powerful tool. Use it to create the life you want.", author: "Aura" },
      { text: "Challenges are opportunities in disguise. Embrace them with courage.", author: "Aura" },
      { text: "You have the power to change your mood. Start with a deep breath.", author: "Aura" },
      { text: "Success is not final, failure is not fatal. It's the courage to continue that counts.", author: "Winston Churchill" },
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
    ];
    this.init();
  }

  async init() {
    this.cacheElements();
    this.bindEvents();
    await this.loadSettings();
    await this.updateMoodDisplay();
    this.startTypingAnalysis();
    this.loadMotivationalQuote();
    this.detectReadingMode();
  }

  cacheElements() {
    this.elements = {
      moodPill: document.getElementById('moodPill'),
      moodLabel: document.getElementById('moodLabel'),
      sentimentScore: document.getElementById('sentimentScore'),
      empathyText: document.getElementById('empathyText'),
      simplifyBtn: document.getElementById('simplifyBtn'),
      breatheBtn: document.getElementById('breatheBtn'),
      readBtn: document.getElementById('readBtn'),
      warmBtn: document.getElementById('warmBtn'),
      summarizeBtn: document.getElementById('summarizeBtn'),
      readingPrompt: document.getElementById('readingPrompt'),
      enableReadingBtn: document.getElementById('enableReadingBtn'),
      disableReadingBtn: document.getElementById('disableReadingBtn'),
      moodInsights: document.getElementById('moodInsights'),
      typingInsight: document.getElementById('typingInsight'),
      typingAnalysis: document.getElementById('typingAnalysis'),
      contentInsight: document.getElementById('contentInsight'),
      contentMood: document.getElementById('contentMood'),
      videoRecommendations: document.getElementById('videoRecommendations'),
      videoGrid: document.getElementById('videoGrid'),
      quotesSection: document.getElementById('quotesSection'),
      quoteCard: document.getElementById('quoteCard'),
      quoteText: document.getElementById('quoteText'),
      quoteAuthor: document.getElementById('quoteAuthor'),
      refreshQuoteBtn: document.getElementById('refreshQuoteBtn'),
      loadingOverlay: document.getElementById('loadingOverlay')
    };
  }

  bindEvents() {
    this.elements.simplifyBtn.addEventListener('click', () => this.simplifyContent());
    this.elements.breatheBtn.addEventListener('click', () => this.startBreathingExercise());
    this.elements.readBtn.addEventListener('click', () => this.toggleReadingMode());
    this.elements.warmBtn.addEventListener('click', () => this.toggleWarmMode());
    this.elements.summarizeBtn.addEventListener('click', () => this.summarizeContent());
    this.elements.enableReadingBtn.addEventListener('click', () => this.enableReadingMode());
    this.elements.disableReadingBtn.addEventListener('click', () => this.disableReadingMode());
    this.elements.refreshQuoteBtn.addEventListener('click', () => this.loadMotivationalQuote());
  }

  async loadSettings() {
    const { geminiApiKey = "", typingAnalysis = true, breathingExercise = true, autoTheme = true } = 
      await chrome.storage.sync.get(["geminiApiKey", "typingAnalysis", "breathingExercise", "autoTheme"]);
    
    this.settings = { geminiApiKey, typingAnalysis, breathingExercise, autoTheme };
  }

  async updateMoodDisplay() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCurrentMood' });
        if (response?.mood) {
          this.currentMood = response.mood;
          this.updateMoodUI();
        }
      }
    } catch (error) {
      console.log('No content script response, using default mood');
    }
  }

  updateMoodUI() {
    const moodConfig = this.getMoodConfig(this.currentMood);
    
    this.elements.moodLabel.textContent = moodConfig.label;
    this.elements.sentimentScore.textContent = moodConfig.score.toFixed(2);
    this.elements.empathyText.textContent = moodConfig.message;
    
    // Update mood pill styling
    this.elements.moodPill.className = `mood-pill ${this.currentMood}`;
    
    // Update sentiment score color based on mood
    this.elements.sentimentScore.style.color = moodConfig.color;
  }

  getMoodConfig(mood) {
    const configs = {
      positive: {
        label: 'Happy',
        score: 0.85,
        message: 'You\'re radiating positive energy! Keep it up!',
        color: '#10b981'
      },
      negative: {
        label: 'Down',
        score: -0.75,
        message: 'It\'s okay to feel this way. I\'m here to help.',
        color: '#ef4444'
      },
      anxious: {
        label: 'Anxious',
        score: -0.60,
        message: 'Take a deep breath. You\'re safe and supported.',
        color: '#f59e0b'
      },
      excited: {
        label: 'Excited',
        score: 0.90,
        message: 'Your enthusiasm is contagious! Channel this energy!',
        color: '#8b5cf6'
      },
      calm: {
        label: 'Calm',
        score: 0.25,
        message: 'You\'re in a peaceful state. Enjoy this tranquility.',
        color: '#3b82f6'
      },
      frustrated: {
        label: 'Frustrated',
        score: -0.80,
        message: 'I can see you\'re frustrated. Let\'s work through this together.',
        color: '#dc2626'
      },
      neutral: {
        label: 'Neutral',
        score: 0.00,
        message: 'You\'re doing great. I\'m here with you.',
        color: '#6b7280'
      }
    };
    
    return configs[mood] || configs.neutral;
  }

  startTypingAnalysis() {
    // Simulate typing analysis data
    setInterval(() => {
      this.typingData.speed = Math.random() * 100 + 50; // 50-150 WPM
      this.typingData.errors = Math.random() * 10; // 0-10 errors
      this.typingData.frustration = this.calculateFrustration();
      
      this.updateTypingInsight();
    }, 3000);
  }

  calculateFrustration() {
    // Higher frustration if typing fast with many errors
    if (this.typingData.speed > 120 && this.typingData.errors > 5) {
      return 'High - Fast typing with many errors suggests frustration';
    } else if (this.typingData.speed > 100 && this.typingData.errors > 3) {
      return 'Medium - Some signs of stress in typing pattern';
    } else if (this.typingData.speed < 60) {
      return 'Low - Slow, careful typing suggests calmness';
    } else {
      return 'Normal - Balanced typing pattern';
    }
  }

  updateTypingInsight() {
    this.elements.typingAnalysis.textContent = 
      `Speed: ${this.typingData.speed.toFixed(0)} WPM, Errors: ${this.typingData.errors.toFixed(0)}. ${this.typingData.frustration}`;
    
    this.elements.moodInsights.style.display = 'block';
  }

  async analyzeContent() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageText' });
      if (response?.text) {
        this.elements.contentMood.textContent = 'Content analyzed with AI';
        this.elements.contentInsight.style.display = 'block';
      }
    } catch (error) {
      console.error('Content analysis failed:', error);
    }
  }

  simplifyContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'simplifyContent' });
      }
    });
  }

  startBreathingExercise() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'startBreathingExercise' });
      }
    });
  }

  toggleReadingMode() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleReadingMode' });
      }
    });
  }

  toggleWarmMode() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleWarmMode' });
      }
    });
  }

  summarizeContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'summarizeContent' });
      }
    });
  }

  enableReadingMode() {
    this.elements.readingPrompt.style.display = 'none';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'enableReadingMode' });
      }
    });
  }

  disableReadingMode() {
    this.elements.readingPrompt.style.display = 'none';
  }

  detectReadingMode() {
    // Simulate reading mode detection
    setTimeout(() => {
      if (Math.random() > 0.5) {
        this.elements.readingPrompt.style.display = 'block';
      }
    }, 2000);
  }

  loadMotivationalQuote() {
    const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
    this.elements.quoteText.textContent = randomQuote.text;
    this.elements.quoteAuthor.textContent = `- ${randomQuote.author}`;
    this.elements.quotesSection.style.display = 'block';
  }

  async loadVideoRecommendations() {
    const moodVideos = this.getMoodBasedVideos(this.currentMood);
    
    this.elements.videoGrid.innerHTML = '';
    moodVideos.forEach(video => {
      const videoItem = document.createElement('div');
      videoItem.className = 'video-item';
      
      const link = document.createElement('a');
      link.href = video.url;
      link.target = '_blank';
      link.textContent = video.title;
      
      videoItem.appendChild(link);
      this.elements.videoGrid.appendChild(videoItem);
    });
    
    this.elements.videoRecommendations.style.display = 'block';
  }

  getMoodBasedVideos(mood) {
    const videoLibrary = {
      positive: [
        { title: "5-Minute Morning Motivation", url: "https://www.youtube.com/watch?v=ZXsQAXx_ao0" },
        { title: "Success Stories That Will Inspire You", url: "https://www.youtube.com/watch?v=kZITTVTiJX8" },
        { title: "Positive Energy Meditation", url: "https://www.youtube.com/watch?v=1ZYb82aaji4" }
      ],
      negative: [
        { title: "Calming Nature Sounds", url: "https://www.youtube.com/watch?v=BHACKCNDMW8" },
        { title: "Stress Relief Music", url: "https://www.youtube.com/watch?v=lFcSrYw-ARY" },
        { title: "Anxiety Relief Techniques", url: "https://www.youtube.com/watch?v=1nBk9s6s6v4" }
      ],
      anxious: [
        { title: "Breathing Exercises for Anxiety", url: "https://www.youtube.com/watch?v=1nBk9s6s6v4" },
        { title: "Progressive Muscle Relaxation", url: "https://www.youtube.com/watch?v=ClqPtWzozXs" },
        { title: "Mindfulness for Stress", url: "https://www.youtube.com/watch?v=wirV265ZYSw" }
      ],
      frustrated: [
        { title: "Anger Management Techniques", url: "https://www.youtube.com/watch?v=Re2e4Gp6dCk" },
        { title: "Calming Music for Frustration", url: "https://www.youtube.com/watch?v=1ZYb82aaji4" },
        { title: "How to Deal with Frustration", url: "https://www.youtube.com/watch?v=Re2e4Gp6dCk" }
      ],
      excited: [
        { title: "Channel Your Energy Productively", url: "https://www.youtube.com/watch?v=kZITTVTiJX8" },
        { title: "Focus Your Enthusiasm", url: "https://www.youtube.com/watch?v=1ZYb82aaji4" },
        { title: "Productive Energy Management", url: "https://www.youtube.com/watch?v=Re2e4Gp6dCk" }
      ],
      calm: [
        { title: "Maintain Your Inner Peace", url: "https://www.youtube.com/watch?v=1ZYb82aaji4" },
        { title: "Mindfulness for Calmness", url: "https://www.youtube.com/watch?v=wirV265ZYSw" },
        { title: "Peaceful Productivity", url: "https://www.youtube.com/watch?v=Re2e4Gp6dCk" }
      ],
      neutral: [
        { title: "Focus and Productivity Tips", url: "https://www.youtube.com/watch?v=Qit3ALTelOo" },
        { title: "Mindfulness for Beginners", url: "https://www.youtube.com/watch?v=ZToicYcHIOU" },
        { title: "Balanced Living Guide", url: "https://www.youtube.com/watch?v=1ZYb82aaji4" }
      ]
    };
    
    return videoLibrary[mood] || videoLibrary.neutral;
  }

  showLoading(show) {
    this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
  }

  // Auto-update mood and load recommendations
  startAutoUpdate() {
    setInterval(async () => {
      await this.updateMoodDisplay();
      await this.loadVideoRecommendations();
    }, 10000); // Update every 10 seconds
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const popup = new AuraPopup();
  popup.startAutoUpdate();
});
