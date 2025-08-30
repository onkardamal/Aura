/* Lightweight text analysis with optional OpenAI augmentation */

const SENTIMENT_LEXICON = {
  positive: [
    "good","great","excellent","amazing","love","happy","satisfied","fast","success","helpful","works","resolved","awesome"
  ],
  negative: [
    "bad","terrible","awful","hate","angry","sad","slow","broken","crash","issue","problem","bug","error","not working","frustrated"
  ]
};

const INTENT_PATTERNS = [
  { intent: "bug_report", patterns: [/bug|error|issue|crash|not working|fail/i] },
  { intent: "feature_request", patterns: [/feature|add|could you|would like|enhancement/i] },
  { intent: "support_request", patterns: [/how do i|help|support|guide|instruction/i] },
  { intent: "feedback", patterns: [/feedback|suggestion|thoughts|i think|improve/i] }
];

const CATEGORY_PATTERNS = [
  { category: "performance", patterns: [/slow|lag|latency|performance|optimi[sz]e/i] },
  { category: "usability", patterns: [/confus|hard to|difficult|ux|ui|user[- ]?friendly/i] },
  { category: "reliability", patterns: [/crash|freeze|hang|unstable|reliab/i] },
  { category: "integration", patterns: [/api|integrat|webhook|oauth|login|auth/i] },
  { category: "billing", patterns: [/bill|pay|invoice|subscription|charge/i] }
];

function scoreSentiment(text) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const word of SENTIMENT_LEXICON.positive) if (lower.includes(word)) score += 1;
  for (const word of SENTIMENT_LEXICON.negative) if (lower.includes(word)) score -= 1;
  const label = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
  return { score, label };
}

function detectIntent(text) {
  for (const item of INTENT_PATTERNS) {
    if (item.patterns.some((re) => re.test(text))) return item.intent;
  }
  return "unknown";
}

function detectCategories(text) {
  const categories = new Set();
  for (const item of CATEGORY_PATTERNS) {
    if (item.patterns.some((re) => re.test(text))) categories.add(item.category);
  }
  return Array.from(categories);
}

function heuristicSuggestions(analysis) {
  const suggestions = [];
  if (analysis.intent === "bug_report") {
    suggestions.push("Reproduce the issue with clear steps and environment details.");
    suggestions.push("Collect logs, screenshots, and error messages.");
    suggestions.push("Provide expected vs actual behavior.");
  }
  if (analysis.intent === "support_request") {
    suggestions.push("Share a minimal example and what you've tried.");
    suggestions.push("Link to relevant docs or FAQs.");
  }
  if (analysis.intent === "feature_request") {
    suggestions.push("Describe the use case, impact, and priority.");
    suggestions.push("Propose acceptance criteria and alternatives considered.");
  }
  if (analysis.categories.includes("performance")) {
    suggestions.push("Measure timings and identify slow operations using profiling tools.");
  }
  if (analysis.categories.includes("integration")) {
    suggestions.push("Validate API keys/scopes and inspect network requests.");
  }
  if (analysis.sentiment.label === "negative") {
    suggestions.push("Acknowledge frustration and set clear next steps.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Clarify the goal and constraints; suggest next concrete action.");
  }
  return suggestions;
}

async function analyzeWithLLM(text, settings) {
  const { apiKey, model } = settings || {};
  if (!apiKey) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that analyzes user-provided text to extract: sentiment (positive/neutral/negative), intent (bug_report/feature_request/support_request/feedback/unknown), categories (performance/usability/reliability/integration/billing), and 3-6 actionable suggestions to resolve the problem. Respond in strict JSON with keys: sentiment,label,score,intent,categories,suggestions."
          },
          { role: "user", content: text }
        ],
        temperature: 0.2
      })
    });
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    try {
      return JSON.parse(content);
    } catch {
      // fallback: attempt to extract JSON
      const match = content.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    }
  } catch {
    return null;
  }
}

async function analyzeText(text, opts = {}) {
  const sentiment = scoreSentiment(text);
  const intent = detectIntent(text);
  const categories = detectCategories(text);
  const heur = { sentiment, intent, categories, suggestions: [] };
  heur.suggestions = heuristicSuggestions(heur);

  if (opts.useLLM) {
    const llm = await analyzeWithLLM(text, opts.settings);
    if (llm && Array.isArray(llm.suggestions)) {
      return {
        sentiment: llm.sentiment?.label ? llm.sentiment : sentiment,
        intent: llm.intent || intent,
        categories: llm.categories?.length ? llm.categories : categories,
        suggestions: llm.suggestions
      };
    }
  }
  return heur;
}

window.TextInsight = { analyzeText };



