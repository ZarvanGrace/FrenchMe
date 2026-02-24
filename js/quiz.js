// Quiz page logic
let quizMode = 'mc';
let quizQuestions = [];
let quizIdx = 0;
let quizScore = 0;
let quizXP = 0;
let quizAnswered = false;

// Match mode state
let matchLeft = [];
let matchRight = [];
let matchCorrectMap = {};
let matchMatched = [];
let matchSelected = null;

function startQuiz(mode = 'mc') {
  quizMode = mode;
  quizIdx = 0;
  quizScore = 0;
  quizXP = 0;
  quizAnswered = false;
  quizQuestions = shuffle([...VOCAB]).slice(0, 10);
  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-game').classList.add('visible');
  document.getElementById('quiz-result').classList.remove('visible');
  renderQuestion();
}

function renderQuestion() {
  quizAnswered = false;
  document.getElementById('quiz-progress').textContent = `Question ${quizIdx + 1}/${quizQuestions.length}`;
  document.getElementById('quiz-feedback').className = 'quiz-feedback';
  document.getElementById('quiz-next-btn').style.display = 'none';
  if (quizMode === 'mc') renderMC();
  else if (quizMode === 'fitb') renderFITB();
  else if (quizMode === 'match') renderMatch();
}

function renderMC() {
  document.getElementById('quiz-type-tag').textContent = '🎲 Multiple Choice';
  const q = quizQuestions[quizIdx];
  const qEl = document.getElementById('quiz-question');
  qEl.innerHTML = `"${q.en}" <button class="speak-btn" onclick="speak('${escStr(q.en)}'); event.stopPropagation();">🔊</button>`;
  
  const wrong = shuffle(VOCAB.filter(w => w.fr !== q.fr)).slice(0, 3);
  const opts = shuffle([q, ...wrong]);
  const area = document.getElementById('quiz-answer-area');
  area.innerHTML = opts.map((o, i) => 
    `<div class="quiz-option" onclick="selectMC(${i}, '${escStr(o.fr)}', '${escStr(q.fr)}')">
      ${o.fr} 
      <button class="speak-btn" onclick="speak('${escStr(o.fr)}'); event.stopPropagation();">🔊</button>
    </div>`
  ).join('');
}

function selectMC(idx, selected, correct) {
  if (quizAnswered) return;
  quizAnswered = true;
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach(o => o.classList.add('disabled'));
  if (selected === correct) {
    opts[idx].classList.add('correct');
    showFeedback(true);
  } else {
    opts[idx].classList.add('wrong');
    opts.forEach((o, i) => {
      if (o.textContent.trim().startsWith(correct)) {
        o.classList.add('correct');
      }
    });
    document.getElementById('quiz-card').classList.add('shake');
    setTimeout(() => document.getElementById('quiz-card').classList.remove('shake'), 500);
    showFeedback(false);
  }
  document.getElementById('quiz-next-btn').style.display = 'flex';
}

function renderFITB() {
  document.getElementById('quiz-type-tag').textContent = '✍️ Fill in the Blank';
  const q = quizQuestions[quizIdx];
  const area = document.getElementById('quiz-answer-area');
  area.innerHTML = `
    <div style="margin-bottom:8px;font-family:'Syne',sans-serif;font-size:18px;color:var(--accent3);">
      "${q.en}" 
      <button class="speak-btn" onclick="speak('${escStr(q.en)}')">🔊</button>
    </div>
    <input class="fitb-input" type="text" id="fitb-input" placeholder="Type in French…" autocomplete="off">
    <button class="btn btn-primary" onclick="checkFITB()">Check</button>
  `;
  document.getElementById('fitb-input').onkeydown = e => { if (e.key === 'Enter') checkFITB(); };
  setTimeout(() => { const el = document.getElementById('fitb-input'); if (el) el.focus(); }, 50);
}

function checkFITB() {
  if (quizAnswered) return;
  const input = document.getElementById('fitb-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const q = quizQuestions[quizIdx];
  const correct = q.fr.toLowerCase().replace(/[?!.,]/g,'').trim();
  const given = val.toLowerCase().replace(/[?!.,]/g,'').trim();
  quizAnswered = true;
  input.disabled = true;
  if (given === correct) {
    input.classList.add('correct');
    showFeedback(true);
    speak(q.fr);
  } else {
    input.classList.add('wrong');
    document.getElementById('quiz-card').classList.add('shake');
    setTimeout(() => document.getElementById('quiz-card').classList.remove('shake'), 500);
    showFeedback(false, 'Answer: ' + q.fr);
    speak(q.fr);
  }
  document.getElementById('quiz-next-btn').style.display = 'flex';
}

function renderMatch() {
  document.getElementById('quiz-type-tag').textContent = '🔗 Match the Pairs';
  document.getElementById('quiz-question').textContent = 'Match each French word to its English meaning.';

  const pairs = shuffle([...VOCAB]).slice(0, 5);
  matchLeft = pairs.map(p => p.fr);
  matchRight = shuffle(pairs.map(p => p.en));
  matchCorrectMap = {};
  pairs.forEach(p => { matchCorrectMap[p.fr] = p.en; });
  matchMatched = [];
  matchSelected = null;

  renderMatchUI();
}

function renderMatchUI() {
  const area = document.getElementById('quiz-answer-area');
  area.innerHTML = `<div class="match-grid">
    <div class="match-col" id="match-left">
      ${matchLeft.map((w, i) => {
        const done = matchMatched.some(m => m.fr === w);
        const cls = done ? 'match-item matched-correct' : 'match-item';
        return `<div class="${cls}" data-idx="${i}" data-side="left" onclick="matchClick(this)">
          ${w} 
          <button class="speak-btn" onclick="speak('${escStr(w)}'); event.stopPropagation();" style="margin-left:auto;">🔊</button>
        </div>`;
      }).join('')}
    </div>
    <div class="match-col" id="match-right">
      ${matchRight.map((w, i) => {
        const done = matchMatched.some(m => m.en === w);
        const cls = done ? 'match-item matched-correct' : 'match-item';
        return `<div class="${cls}" data-idx="${i}" data-side="right" onclick="matchClick(this)">${w}</div>`;
      }).join('')}
    </div>
  </div>`;
}

function matchClick(el) {
  if (el.classList.contains('matched-correct')) return;
  if (matchSelected === null) {
    matchSelected = el;
    el.classList.add('selected');
    return;
  }
  const first = matchSelected;
  matchSelected = null;
  first.classList.remove('selected');

  let frWord, enWord, frEl, enEl;
  if (first.dataset.side === 'left' && el.dataset.side === 'right') {
    frWord = first.textContent.trim(); 
    enWord = el.textContent.trim(); 
    frEl = first; 
    enEl = el;
  } else if (first.dataset.side === 'right' && el.dataset.side === 'left') {
    frWord = el.textContent.trim(); 
    enWord = first.textContent.trim(); 
    frEl = el; 
    enEl = first;
  } else {
    el.classList.add('selected');
    matchSelected = el;
    return;
  }

  frWord = frWord.split('🔊')[0].trim();
  enWord = enWord.split('🔊')[0].trim();

  if (matchCorrectMap[frWord] === enWord) {
    frEl.classList.add('matched-correct'); 
    enEl.classList.add('matched-correct');
    matchMatched.push({ fr: frWord, en: enWord });
    speak(frWord);
    if (matchMatched.length === matchLeft.length) {
      showFeedback(true, 'All pairs matched! 🎉');
      quizAnswered = true;
      quizScore++;
      quizXP += 15;
      document.getElementById('quiz-xp').textContent = '⚡ ' + quizXP + ' XP';
      document.getElementById('quiz-next-btn').style.display = 'flex';
    }
  } else {
    frEl.classList.add('matched-wrong'); 
    enEl.classList.add('matched-wrong');
    setTimeout(() => { 
      frEl.classList.remove('matched-wrong'); 
      enEl.classList.remove('matched-wrong'); 
    }, 500);
  }
}

function showFeedback(correct, msg) {
  const fb = document.getElementById('quiz-feedback');
  if (correct && quizMode !== 'match') {
    quizScore++;
    quizXP += 10;
    document.getElementById('quiz-xp').textContent = '⚡ ' + quizXP + ' XP';
    fb.textContent = '✅ Correct! +10 XP';
    fb.className = 'quiz-feedback correct';
    document.getElementById('quiz-card').classList.add('pop');
    setTimeout(() => document.getElementById('quiz-card').classList.remove('pop'), 300);
  } else if (!correct) {
    fb.textContent = msg ? '❌ ' + msg : '❌ Wrong!';
    fb.className = 'quiz-feedback wrong';
  } else {
    fb.textContent = msg || '✅ All matched!';
    fb.className = 'quiz-feedback correct';
  }
}

function nextQuestion() {
  quizIdx++;
  if (quizIdx >= quizQuestions.length) {
    showQuizResult();
  } else {
    renderQuestion();
  }
}

function showQuizResult() {
  document.getElementById('quiz-game').classList.remove('visible');
  const res = document.getElementById('quiz-result');
  res.classList.add('visible');
  const pct = Math.round((quizScore / quizQuestions.length) * 100);
  document.getElementById('score-circle').style.setProperty('--pct', pct);
  document.getElementById('score-num').textContent = quizScore + '/' + quizQuestions.length;
  const msgs = [
    [0, 30, "Mon Dieu… that was rough. Flip some cards first?"],
    [31, 60, "Not terrible. Could be worse. Could be better."],
    [61, 80, "Pretty decent! You're getting it."],
    [81, 99, "Très bien! You actually know this stuff!"],
    [100, 100, "Parfait! You absolute legend. 🥐"]
  ];
  const m = msgs.find(([lo, hi]) => pct >= lo && pct <= hi);
  document.getElementById('result-title').textContent = pct >= 80 ? 'Impressive! 🎉' : pct >= 50 ? 'Not bad!' : 'Rough session.';
  document.getElementById('result-msg').textContent = m[2];
}

function restartQuiz() {
  document.getElementById('quiz-result').classList.remove('visible');
  startQuiz(quizMode);
}

function goToStart() {
  document.getElementById('quiz-result').classList.remove('visible');
  document.getElementById('quiz-game').classList.remove('visible');
  document.getElementById('quiz-start').style.display = 'flex';
}
