document.addEventListener("DOMContentLoaded", async () => {
  const geminiApiKeyEl = document.getElementById("geminiApiKey");
  const typingAnalysisEl = document.getElementById("typingAnalysis");
  const breathingExerciseEl = document.getElementById("breathingExercise");
  const autoThemeEl = document.getElementById("autoTheme");
  const analysisIntervalEl = document.getElementById("analysisInterval");
  const sendTelemetryEl = document.getElementById("sendTelemetry");
  const statusEl = document.getElementById("status");
  const saveBtn = document.getElementById("save");

  const { 
    geminiApiKey = "", 
    typingAnalysis = true, 
    breathingExercise = true, 
    autoTheme = true, 
    analysisInterval = 5, 
    sendTelemetry = false 
  } = await chrome.storage.sync.get([
    "geminiApiKey",
    "typingAnalysis", 
    "breathingExercise", 
    "autoTheme", 
    "analysisInterval", 
    "sendTelemetry"
  ]);

  geminiApiKeyEl.value = geminiApiKey;
  typingAnalysisEl.checked = !!typingAnalysis;
  breathingExerciseEl.checked = !!breathingExercise;
  autoThemeEl.checked = !!autoTheme;
  analysisIntervalEl.value = analysisInterval;
  sendTelemetryEl.checked = !!sendTelemetry;

  saveBtn.addEventListener("click", async () => {
    await chrome.storage.sync.set({
      geminiApiKey: geminiApiKeyEl.value.trim(),
      typingAnalysis: typingAnalysisEl.checked,
      breathingExercise: breathingExerciseEl.checked,
      autoTheme: autoThemeEl.checked,
      analysisInterval: parseInt(analysisIntervalEl.value) || 5,
      sendTelemetry: sendTelemetryEl.checked
    });
    
    statusEl.textContent = "✅ Settings saved!";
    statusEl.className = "success";
    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "muted";
    }, 2000);
  });
});
