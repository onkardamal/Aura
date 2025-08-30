# 🌟 Aura: Empathetic Web Experience

An AI-powered Chrome extension that adapts web interfaces based on your emotional state for a safer, more accessible browsing experience. Uses Google Gemini API for advanced mood detection and provides personalized recommendations.

## ✨ Features

### 🤖 AI-Powered Analysis
- **Google Gemini API Integration**: Advanced sentiment analysis using Google's latest AI model
- **Enhanced Typing Pattern Analysis**: Detects mood changes through typing speed, errors, and patterns
- **Frustration Detection**: Identifies when fast typing with many errors indicates frustration
- **Real-time Content Analysis**: Automatically analyzes page content every 5 seconds
- **Fallback Local Analysis**: Works offline with keyword-based sentiment detection

### 🎨 Adaptive UI & Content
- **Mood-Based Themes**: Visual filters and color adjustments based on detected emotions
- **Reading Mode**: Distraction-free reading with optimized typography and layout
- **Warm Mode**: Sepia-tinted warm color scheme for comfort
- **Content Simplification**: Removes visual clutter for focused reading
- **Content Summarization**: AI-powered page summaries for quick understanding
- **Smooth Transitions**: Beautiful animations when switching between mood modes

### 🫁 Wellness Features
- **Guided Breathing Exercise**: Interactive 5-cycle breathing exercise with visual feedback
- **Personalized Recommendations**: Context-aware suggestions based on your current mood
- **Stress Relief Tools**: Built-in calming features for negative emotional states
- **Motivational Quotes**: Daily inspirational quotes to boost your mood

### 🎬 Video Recommendations
- **Mood-Based Videos**: Curated YouTube content based on your emotional state
- **Frustration Relief**: Calming videos when high typing errors are detected
- **Motivational Content**: Inspiring videos for positive moods
- **Stress Management**: Relaxation and breathing exercise videos

### 🔧 Smart Controls
- **Auto-Detection**: Automatically detects and responds to emotional content
- **Manual Override**: Take control with manual analysis and breathing exercises
- **Customizable Settings**: Adjust analysis intervals and feature toggles
- **Reading Mode Detection**: Automatically suggests reading mode for text-heavy pages

## 🚀 Installation

### Developer Mode (Recommended)
1. Open Chrome/Brave → Extensions → Enable Developer mode
2. Click "Load unpacked" and select this folder: `/Users/arshadkasimtraya/Desktop/cursor`
3. Pin the extension to your toolbar
4. Click the Aura icon to open settings and configure your Gemini API key

### API Setup
1. Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open Aura settings (click the extension icon)
3. Paste your API key in the "Google Gemini API Key" field
4. Save settings

## 🎯 How It Works

### Advanced Mood Detection
- **Content Analysis**: Scans visible text on web pages for emotional content
- **Typing Intelligence**: Monitors typing speed, errors, and patterns for mood indicators
- **Frustration Algorithm**: Detects when fast typing + high errors = frustration
- **AI Processing**: Uses Gemini API to analyze text and determine emotional state
- **Real-time Updates**: Continuously monitors and updates your emotional state

### Smart Interface Adaptation
- **Positive Mood**: Brightens colors, increases contrast, speeds up animations
- **Negative/Anxious Mood**: Applies calming filters, slows animations, suggests breathing exercises
- **Frustrated Mood**: Detects typing stress and offers immediate relief options
- **Neutral Mood**: Maintains balanced, focused interface for productivity

### Content Enhancement
- **Reading Mode**: Optimizes page layout for distraction-free reading
- **Warm Mode**: Applies comforting sepia filters for visual comfort
- **Simplified View**: Removes images and clutter for focused content consumption
- **Smart Summaries**: AI-generated page summaries for quick understanding

### Wellness Integration
- **Breathing Exercises**: Guided 4-4-4 breathing pattern with visual feedback
- **Recommendations**: Personalized suggestions based on detected mood
- **Video Therapy**: Curated YouTube content for emotional support
- **Stress Relief**: Automatic calming mode activation for negative content

## 🎨 UI Modes & Features

### Happy Mode 🌟
- Increased brightness and saturation
- Faster animations
- Warm color enhancements
- Motivational content suggestions

### Calm Mode 😌
- Reduced brightness and saturation
- Slower, more peaceful animations
- Blue-tinted calming filters
- Relaxation video recommendations

### Frustrated Mode 😤
- **Auto-detected** from typing patterns
- Immediate breathing exercise suggestions
- Calming video recommendations
- Stress relief tools

### Reading Mode 📖
- Distraction-free layout
- Optimized typography (Georgia font)
- Centered content (800px max-width)
- Clean, focused reading experience

### Warm Mode 🔥
- Sepia-tinted color scheme
- Comforting visual filters
- Reduced eye strain
- Cozy browsing experience

## ⚙️ Configuration

### Feature Toggles
- **Typing Analysis**: Enable/disable typing pattern detection
- **Breathing Exercise**: Show/hide breathing exercise button
- **Auto Theme**: Enable/disable automatic theme changes
- **Reading Mode**: Auto-detect and suggest reading mode

### Analysis Settings
- **Interval**: Adjust how often content is analyzed (3-30 seconds)
- **API Key**: Configure your Gemini API key for advanced analysis
- **Telemetry**: Optional anonymous usage metrics (stored locally)

## 🔒 Privacy & Security

- **Local Processing**: All typing patterns and basic analysis happen locally
- **API Security**: Gemini API calls only when explicitly configured
- **No Data Collection**: No personal data is stored or transmitted
- **Chrome Sync**: Settings are stored using Chrome's secure sync storage

## 🛠️ Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Content Scripts**: Runs on all web pages for real-time analysis
- **Background Service Worker**: Handles API calls and message routing
- **Popup Interface**: Modern, animated UI for settings and controls

### APIs Used
- **Google Gemini**: Advanced text analysis and mood detection
- **Chrome Extensions**: Storage, messaging, and tab management
- **Web APIs**: DOM manipulation, event handling, and animations

### Performance
- **Debounced Analysis**: Prevents excessive API calls and processing
- **Efficient DOM**: Minimal impact on page performance
- **Smart Caching**: Reduces redundant analysis of unchanged content
- **Typing Intelligence**: Real-time mood detection without performance impact

## 🎯 Use Cases

### Productivity
- **Focus Enhancement**: Reading mode for distraction-free work
- **Stress Management**: Automatic calming when reading negative content
- **Mood Awareness**: Real-time feedback on your emotional state
- **Content Optimization**: Simplified views for better focus

### Accessibility
- **Visual Comfort**: Adaptive themes for different lighting conditions
- **Emotional Support**: Gentle guidance for stressful content
- **Wellness Integration**: Built-in tools for mental health support
- **Reading Support**: Optimized layouts for better comprehension

### Learning
- **Content Adaptation**: Interface adjusts to learning materials
- **Emotional Context**: Better understanding of content tone
- **Personalized Experience**: Tailored recommendations for your needs
- **Focus Enhancement**: Reading mode for study materials

## 🚀 Future Features

- **Voice Analysis**: Detect mood through microphone input
- **Biometric Integration**: Heart rate and stress level monitoring
- **Social Features**: Share mood insights with trusted contacts
- **Advanced AI**: Multi-modal emotion detection (text + images)
- **Smart Notifications**: Proactive wellness reminders

## 📱 Browser Support

- **Chrome**: Full support (recommended)
- **Brave**: Full support with minor compatibility notes
- **Edge**: Full support (Chromium-based)
- **Other Chromium**: Limited testing, may work

## 🆘 Troubleshooting

### Common Issues
1. **Extension not working**: Ensure Developer mode is enabled
2. **API errors**: Check your Gemini API key in settings
3. **No mood detection**: Verify content script permissions
4. **Performance issues**: Adjust analysis interval in settings

### Brave Browser Notes
- May require re-loading after enabling Developer mode
- Use toolbar icon to open popup (context menu may be limited)
- Check `brave://extensions` for error messages

## 🤝 Contributing

This extension is designed for personal use and wellness. Feel free to:
- Report bugs or issues
- Suggest new features
- Share your experience
- Fork and customize for your needs

## 📄 License

Personal use only. Not for commercial distribution.

---

**Made with ❤️ for better web experiences and emotional wellness**
