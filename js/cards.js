// Flashcards page logic
let flashDeck = [];
let flashIdx = 0;
let flashFlipped = false;

document.addEventListener('DOMContentLoaded', () => {
  initFlash();
  
  // Show mute button
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.style.display = 'flex';
    muteBtn.onclick = toggleMute;
  }
});

function initFlash() {
  const allDue = VOCAB.length;
  const basicsDue = VOCAB.filter(w => ['bonjour','au revoir','merci','oui','non','pardon'].includes(w.fr)).length;
  const verbsDue = VOCAB.filter(w => w.en.startsWith('to ')).length;
  document.getElementById('pack-due-all').textContent = `${allDue} cards due`;
  document.getElementById('pack-due-basics').textContent = `${basicsDue} cards due`;
  document.getElementById('pack-due-verbs').textContent = `${verbsDue} cards due`;
}

function selectPack(pack) {
  if (pack === 'all') flashDeck = shuffle([...VOCAB]);
  else if (pack === 'basics') flashDeck = shuffle(VOCAB.filter(w => ['bonjour','au revoir','merci','s\'il vous plaît','oui','non','pardon','je ne comprends pas','comment allez-vous?','très bien'].includes(w.fr)));
  else if (pack === 'verbs') flashDeck = shuffle(VOCAB.filter(w => w.en.startsWith('to ')));
  flashIdx = 0;
  document.getElementById('flash-pack-select').style.display = 'none';
  document.getElementById('flash-study').classList.add('visible');
  document.getElementById('flash-result').style.display = 'none';
  loadCard();
}

function loadCard() {
  if (flashIdx >= flashDeck.length) {
    showFlashResult();
    return;
  }
  flashFlipped = false;
  const card = flashDeck[flashIdx];
  document.getElementById('card-front-word').textContent = card.fr;
  document.getElementById('card-back-word').textContent = card.en;
  document.getElementById('flip-container').classList.remove('flipped');
  document.getElementById('flash-progress-text').textContent = `Card ${flashIdx + 1}/${flashDeck.length}`;
  const pct = ((flashIdx + 1) / flashDeck.length) * 100;
  document.getElementById('flash-progress-bar').style.width = pct + '%';
  
  // Auto-play TTS for French word
  speak(card.fr);
}

function flipCard() {
  const container = document.getElementById('flip-container');
  if (!flashFlipped) {
    container.classList.add('flipped');
    flashFlipped = true;
  } else {
    container.classList.remove('flipped');
    flashFlipped = false;
  }
}

function rateCard(rating) {
  flashIdx++;
  loadCard();
}

function showFlashResult() {
  document.getElementById('flash-study').classList.remove('visible');
  const res = document.getElementById('flash-result');
  res.style.display = 'flex';
  document.getElementById('flash-result-msg').textContent = `You reviewed ${flashDeck.length} cards. Great work!`;
  stopSpeaking();
}

function backToPacks() {
  document.getElementById('flash-result').style.display = 'none';
  document.getElementById('flash-pack-select').style.display = 'flex';
  stopSpeaking();
}
