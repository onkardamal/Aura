// Aura.js - Real-time sentiment analysis and UI adaptation with enhanced features

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userInput = document.getElementById('user-input');
    const sentimentValue = document.getElementById('sentiment-value');
    const wpmValue = document.getElementById('wpm-value');
    const accuracyValue = document.getElementById('accuracy-value');
    const resultsContent = document.getElementById('results-content');
    const recommendationsContent = document.getElementById('recommendations-content');
    const body = document.body;
    
    // Mode buttons
    const defaultModeBtn = document.getElementById('default-mode-btn');
    const studyModeBtn = document.getElementById('study-mode-btn');
    const readModeBtn = document.getElementById('read-mode-btn');
    const focusModeBtn = document.getElementById('focus-mode-btn');
    
    // Feature buttons
    const summarizeBtn = document.getElementById('summarize-btn');
    const readabilityBtn = document.getElementById('readability-btn');
    const breathingBtn = document.getElementById('breathing-btn');
    const motivationBtn = document.getElementById('motivation-btn');
    
    // Quote popup
    const quotePopup = document.getElementById('motivational-quote');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const closeQuoteBtn = document.getElementById('close-quote-btn');
    
    // Typing analysis variables
    let typingTimer;
    const doneTypingInterval = 500; // ms
    let typingStartTime;
    let typingEndTime;
    let keyPressCount = 0;
    let mistakeCount = 0;
    let lastLength = 0;
    let frustrationLevel = 0;
    
    // Listen for user input
    userInput.addEventListener('input', (e) => {
        clearTimeout(typingTimer);
        
        // Track typing for analysis
        if (!typingStartTime) {
            typingStartTime = new Date();
        }
        typingEndTime = new Date();
        
        // Count keystrokes and potential mistakes (backspaces)
        keyPressCount++;
        if (e.inputType === 'deleteContentBackward') {
            mistakeCount++;
        }
        
        // Detect rapid typing (potential frustration)
        const currentLength = userInput.value.length;
        if (currentLength < lastLength) {
            // Deletion detected
            mistakeCount++;
        }
        lastLength = currentLength;
        
        // Calculate typing speed (WPM) and accuracy
        calculateTypingMetrics();
        
        // Only analyze if there's text to analyze
        if (userInput.value) {
            typingTimer = setTimeout(() => {
                analyzeSentiment(userInput.value);
                detectFrustration();
            }, doneTypingInterval);
        } else {
            // Reset to default if text area is empty
            updateUI('neutral');
            sentimentValue.textContent = 'Neutral';
            resetTypingMetrics();
        }
    });

    // Function to analyze sentiment
    function analyzeSentiment(text) {
        // For the hackathon MVP, we'll use a simple approach
        // In a real implementation, this would call a sentiment analysis API
        
        // Simple word-based sentiment analysis
        const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'love', 'like', 'enjoy', 'positive', 'amazing', 'awesome', 'fantastic', 'joy', 'pleased', 'delighted'];
        const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'negative', 'angry', 'upset', 'disappointed', 'frustrating', 'annoyed', 'miserable', 'depressed'];
        
        const words = text.toLowerCase().split(/\s+/);
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });
        
        // Determine sentiment
        let sentiment;
        if (positiveCount > negativeCount) {
            sentiment = 'positive';
        } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
        } else {
            sentiment = 'neutral';
        }
        
        // Update UI based on sentiment
        updateUI(sentiment);
        sentimentValue.textContent = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
        
        // Generate recommendations based on sentiment
        updateRecommendations(sentiment);
    }
    
    // Function to update UI based on sentiment
    function updateUI(sentiment) {
        // Remove all mode classes
        body.classList.remove('default-mode', 'calm-mode', 'happy-mode', 'sad-mode', 'study-mode', 'read-mode', 'focus-mode');
        
        // Add appropriate mode class based on active button or sentiment
        const activeButton = document.querySelector('.mode-btn.active');
        
        if (activeButton && activeButton.id !== 'default-mode-btn') {
            // If a non-default mode button is active, use that mode
            if (activeButton.id === 'study-mode-btn') {
                body.classList.add('study-mode');
            } else if (activeButton.id === 'read-mode-btn') {
                body.classList.add('read-mode');
            } else if (activeButton.id === 'focus-mode-btn') {
                body.classList.add('focus-mode');
            }
        } else {
            // Otherwise use sentiment-based mode
            if (sentiment === 'positive') {
                body.classList.add('happy-mode');
            } else if (sentiment === 'negative') {
                body.classList.add('sad-mode');
            } else {
                body.classList.add('default-mode');
            }
        }
    }
    
    // Function to calculate typing metrics
    function calculateTypingMetrics() {
        if (!typingStartTime || !typingEndTime) return;
        
        const timeElapsed = (typingEndTime - typingStartTime) / 1000 / 60; // in minutes
        const wordsTyped = userInput.value.split(/\s+/).length;
        
        // Calculate WPM
        const wpm = Math.round(wordsTyped / timeElapsed) || 0;
        wpmValue.textContent = `${wpm} WPM`;
        
        // Calculate accuracy
        const accuracy = keyPressCount > 0 ? Math.round(((keyPressCount - mistakeCount) / keyPressCount) * 100) : 100;
        accuracyValue.textContent = `${accuracy}%`;
    }
    
    // Function to reset typing metrics
    function resetTypingMetrics() {
        typingStartTime = null;
        typingEndTime = null;
        keyPressCount = 0;
        mistakeCount = 0;
        lastLength = 0;
        frustrationLevel = 0;
        wpmValue.textContent = '0 WPM';
        accuracyValue.textContent = '100%';
    }
    
    // Function to detect frustration based on typing patterns
    function detectFrustration() {
        const wpm = parseInt(wpmValue.textContent);
        const accuracy = parseInt(accuracyValue.textContent);
        
        // Check for signs of frustration
        if (wpm > 80 && accuracy < 90) {
            frustrationLevel++;
        }
        
        if (mistakeCount > 5 && accuracy < 85) {
            frustrationLevel++;
        }
        
        // If frustration detected, show motivational quote
        if (frustrationLevel >= 3) {
            showMotivationalQuote();
            frustrationLevel = 0; // Reset after showing quote
        }
    }
    
    // Function to update recommendations
    function updateRecommendations(sentiment) {
        const recommendations = generateRecommendations(sentiment);
        
        // Clear previous recommendations
        recommendationsContent.innerHTML = '';
        
        if (recommendations.length === 0) {
            recommendationsContent.innerHTML = '<p class="placeholder-text">No recommendations available at this time.</p>';
            return;
        }
        
        // Create recommendation list
        const list = document.createElement('ul');
        list.className = 'recommendations-list';
        
        recommendations.forEach(rec => {
            const item = document.createElement('li');
            item.textContent = rec;
            list.appendChild(item);
        });
        
        recommendationsContent.appendChild(list);
    }
    
    // Function to generate recommendations based on sentiment
    function generateRecommendations(sentiment) {
        const recommendations = [];
        
        if (sentiment === 'positive') {
            recommendations.push(
                'Continue with your positive mindset!',
                'Share your positivity with others.',
                'Try creative activities to channel your positive energy.',
                'Document your positive thoughts in a journal.'
            );
        } else if (sentiment === 'negative') {
            recommendations.push(
                'Take a short break to reset your mind.',
                'Try a quick breathing exercise to calm down.',
                'Listen to soothing music to improve your mood.',
                'Consider talking to someone about how you feel.'
            );
        } else {
            recommendations.push(
                'Explore new topics that interest you.',
                'Set small goals to accomplish today.',
                'Try a new learning technique.',
                'Take regular breaks to maintain focus.'
            );
        }
        
        return recommendations;
    }
    
    // Function to show motivational quote
    function showMotivationalQuote() {
        const quotes = [
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
            { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "It always seems impossible until it's done.", author: "Nelson Mandela" }
        ];
        
        // Select random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        // Update quote content
        quoteText.textContent = `"${randomQuote.text}"`;
        quoteAuthor.textContent = `- ${randomQuote.author}`;
        
        // Show popup
        quotePopup.classList.remove('hidden');
    }
    
    // Function to summarize text
    function summarizeText(text) {
        // Simple summarization - extract important sentences
        // In a real implementation, this would use more sophisticated NLP
        
        if (!text || text.length < 100) {
            return "Text is too short to summarize.";
        }
        
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        
        if (sentences.length <= 3) {
            return text;
        }
        
        // Select ~30% of sentences for summary
        const summaryLength = Math.max(3, Math.floor(sentences.length * 0.3));
        const selectedSentences = [];
        
        // Simple approach: take first sentence, last sentence, and some from the middle
        selectedSentences.push(sentences[0]); // First sentence
        
        // Select sentences with keywords or longer sentences (likely more informative)
        const keywords = ['important', 'significant', 'therefore', 'result', 'conclude', 'summary'];
        
        for (let i = 1; i < sentences.length - 1; i++) {
            const sentence = sentences[i];
            
            // Check if sentence contains keywords
            const containsKeyword = keywords.some(keyword => 
                sentence.toLowerCase().includes(keyword)
            );
            
            // Check if sentence is longer (might contain more information)
            const isLongerSentence = sentence.length > 100;
            
            if (containsKeyword || isLongerSentence) {
                selectedSentences.push(sentence);
            }
            
            // Break if we have enough sentences
            if (selectedSentences.length >= summaryLength - 1) {
                break;
            }
        }
        
        // Add last sentence if we haven't reached our summary length
        if (selectedSentences.length < summaryLength) {
            selectedSentences.push(sentences[sentences.length - 1]);
        }
        
        return selectedSentences.join(' ');
    }
    
    // Function to check readability
    function checkReadability(text) {
        if (!text || text.trim().length === 0) {
            return "No text to analyze.";
        }
        
        // Count words, sentences, and syllables
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        
        if (words.length === 0 || sentences.length === 0) {
            return "Text is too short for readability analysis.";
        }
        
        // Calculate average words per sentence
        const avgWordsPerSentence = words.length / sentences.length;
        
        // Estimate syllables (very simplified)
        let syllableCount = 0;
        words.forEach(word => {
            // Count vowels as a rough syllable estimate
            const vowelMatches = word.toLowerCase().match(/[aeiouy]+/g);
            syllableCount += vowelMatches ? vowelMatches.length : 1;
        });
        
        // Calculate Flesch Reading Ease score (simplified)
        const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (syllableCount / words.length));
        
        // Interpret score
        let readabilityLevel;
        if (fleschScore >= 90) readabilityLevel = "Very Easy";
        else if (fleschScore >= 80) readabilityLevel = "Easy";
        else if (fleschScore >= 70) readabilityLevel = "Fairly Easy";
        else if (fleschScore >= 60) readabilityLevel = "Standard";
        else if (fleschScore >= 50) readabilityLevel = "Fairly Difficult";
        else if (fleschScore >= 30) readabilityLevel = "Difficult";
        else readabilityLevel = "Very Difficult";
        
        return {
            score: Math.round(fleschScore),
            level: readabilityLevel,
            stats: {
                words: words.length,
                sentences: sentences.length,
                avgWordsPerSentence: avgWordsPerSentence.toFixed(1)
            }
        };
    }
    
    // Function to start breathing exercise
    function startBreathingExercise() {
        // Create breathing exercise overlay
        const overlay = document.createElement('div');
        overlay.className = 'breathing-overlay';
        
        const container = document.createElement('div');
        container.className = 'breathing-container';
        
        const circle = document.createElement('div');
        circle.className = 'breathing-circle';
        
        const instructions = document.createElement('div');
        instructions.className = 'breathing-instructions';
        instructions.textContent = 'Breathe in...';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        container.appendChild(circle);
        container.appendChild(instructions);
        container.appendChild(closeBtn);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Start breathing animation
        let phase = 'inhale';
        
        function updateBreathing() {
            if (phase === 'inhale') {
                circle.style.transform = 'scale(1.5)';
                instructions.textContent = 'Breathe in...';
                setTimeout(() => {
                    phase = 'hold';
                    updateBreathing();
                }, 4000);
            } else if (phase === 'hold') {
                instructions.textContent = 'Hold...';
                setTimeout(() => {
                    phase = 'exhale';
                    updateBreathing();
                }, 2000);
            } else if (phase === 'exhale') {
                circle.style.transform = 'scale(1)';
                instructions.textContent = 'Breathe out...';
                setTimeout(() => {
                    phase = 'inhale';
                    updateBreathing();
                }, 4000);
            }
        }
        
        updateBreathing();
    }
    
    // Event listeners for mode buttons
    defaultModeBtn.addEventListener('click', () => {
        setActiveMode(defaultModeBtn);
        body.className = 'default-mode';
    });
    
    studyModeBtn.addEventListener('click', () => {
        setActiveMode(studyModeBtn);
        body.className = 'study-mode';
    });
    
    readModeBtn.addEventListener('click', () => {
        setActiveMode(readModeBtn);
        body.className = 'read-mode';
    });
    
    focusModeBtn.addEventListener('click', () => {
        setActiveMode(focusModeBtn);
        body.className = 'focus-mode';
    });
    
    function setActiveMode(activeButton) {
        // Remove active class from all buttons
        [defaultModeBtn, studyModeBtn, readModeBtn, focusModeBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        activeButton.classList.add('active');
    }
    
    // Event listeners for feature buttons
    summarizeBtn.addEventListener('click', () => {
        const text = userInput.value;
        if (!text) {
            resultsContent.innerHTML = '<p class="placeholder-text">Please enter some text to summarize.</p>';
            return;
        }
        
        const summary = summarizeText(text);
        resultsContent.innerHTML = `
            <h4>Text Summary</h4>
            <div class="summary-result">${summary}</div>
        `;
    });
    
    readabilityBtn.addEventListener('click', () => {
        const text = userInput.value;
        if (!text) {
            resultsContent.innerHTML = '<p class="placeholder-text">Please enter some text to analyze.</p>';
            return;
        }
        
        const readability = checkReadability(text);
        
        if (typeof readability === 'string') {
            resultsContent.innerHTML = `<p>${readability}</p>`;
            return;
        }
        
        resultsContent.innerHTML = `
            <h4>Readability Analysis</h4>
            <div class="readability-result">
                <p><strong>Readability Score:</strong> ${readability.score}/100</p>
                <p><strong>Reading Level:</strong> ${readability.level}</p>
                <p><strong>Word Count:</strong> ${readability.stats.words}</p>
                <p><strong>Sentence Count:</strong> ${readability.stats.sentences}</p>
                <p><strong>Avg. Words Per Sentence:</strong> ${readability.stats.avgWordsPerSentence}</p>
            </div>
        `;
    });
    
    breathingBtn.addEventListener('click', startBreathingExercise);
    
    motivationBtn.addEventListener('click', showMotivationalQuote);
    
    // Close quote popup
    closeQuoteBtn.addEventListener('click', () => {
        quotePopup.classList.add('hidden');
    });
    
    // Initialize with default mode
    body.classList.add('default-mode');
    
    // Set default mode button as active initially
    defaultModeBtn.classList.add('active');
});
