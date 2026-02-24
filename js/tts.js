// Text-to-Speech module for French pronunciation
let ttsEnabled = true;
let currentUtterance = null;

function speak(text) {
  if (!ttsEnabled) return;
  if (currentUtterance) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = 'fr-FR';
  currentUtterance.rate = 0.85;
  window.speechSynthesis.speak(currentUtterance);
}

function toggleMute() {
  ttsEnabled = !ttsEnabled;
  const btn = document.getElementById('mute-btn');
  if (btn) {
    btn.textContent = ttsEnabled ? '🔊' : '🔇';
    btn.classList.toggle('active', !ttsEnabled);
  }
  if (!ttsEnabled && currentUtterance) {
    window.speechSynthesis.cancel();
  }
}

function stopSpeaking() {
  if (currentUtterance) {
    window.speechSynthesis.cancel();
  }
}

// Utility function for escaping strings in onclick attributes
function escStr(s) {
  return s.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Utility shuffle function
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
