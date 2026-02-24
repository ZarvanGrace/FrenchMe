// Vocab page logic
const ROWS_PER_PAGE = 15;
let vocabPage = 0;
let vocabDir = 'fr-en';
let vocabFiltered = [...VOCAB];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('vocab-total').textContent = VOCAB.length;
  renderVocab();
});

function vocabSearch() {
  const q = document.getElementById('vocab-search').value.toLowerCase();
  if (!q) { 
    vocabFiltered = [...VOCAB]; 
  } else {
    vocabFiltered = VOCAB.filter(w =>
      w.fr.toLowerCase().includes(q) || w.en.toLowerCase().includes(q)
    );
  }
  vocabPage = 0;
  renderVocab();
}

function toggleDir() {
  vocabDir = vocabDir === 'fr-en' ? 'en-fr' : 'fr-en';
  const btn = document.getElementById('toggle-dir-btn');
  btn.textContent = vocabDir === 'fr-en' ? '🇫🇷→🇬🇧' : '🇬🇧→🇫🇷';
  btn.classList.toggle('active-dir', vocabDir === 'en-fr');
  document.getElementById('th-col1').textContent = vocabDir === 'fr-en' ? 'French' : 'English';
  document.getElementById('th-col2').textContent = vocabDir === 'fr-en' ? 'English' : 'French';
  renderVocab();
}

function renderVocab() {
  const total = vocabFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  if (vocabPage >= totalPages) vocabPage = totalPages - 1;
  const start = vocabPage * ROWS_PER_PAGE;
  const page = vocabFiltered.slice(start, start + ROWS_PER_PAGE);

  const tbody = document.getElementById('vocab-tbody');
  tbody.innerHTML = page.map(w => {
    const col1 = vocabDir === 'fr-en' ? w.fr : w.en;
    const col2 = vocabDir === 'fr-en' ? w.en : w.fr;
    const cls1 = vocabDir === 'fr-en' ? 'vocab-col-fr' : 'vocab-col-en';
    const cls2 = vocabDir === 'fr-en' ? 'vocab-col-en' : 'vocab-col-fr';
    
    if (vocabDir === 'fr-en') {
      return `<tr>
        <td class="${cls1}">
          <span>${col1}</span>
          <button class="speak-btn" onclick="speak('${escStr(col1)}')">🔊</button>
        </td>
        <td class="${cls2}">${col2}</td>
      </tr>`;
    } else {
      return `<tr>
        <td class="${cls1}">${col1}</td>
        <td class="${cls2}">
          <span>${col2}</span>
          <button class="speak-btn" onclick="speak('${escStr(col2)}')">🔊</button>
        </td>
      </tr>`;
    }
  }).join('');

  document.getElementById('vocab-page-info').textContent = `Page ${vocabPage + 1} of ${totalPages} (${total} entries)`;
  document.getElementById('vocab-prev').disabled = vocabPage === 0;
  document.getElementById('vocab-next').disabled = vocabPage >= totalPages - 1;
}

function vocabPrev() { 
  if (vocabPage > 0) { 
    vocabPage--; 
    renderVocab(); 
  } 
}

function vocabNext() {
  const totalPages = Math.ceil(vocabFiltered.length / ROWS_PER_PAGE);
  if (vocabPage < totalPages - 1) { 
    vocabPage++; 
    renderVocab(); 
  }
}
