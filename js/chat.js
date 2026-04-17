// ==========================================================================
// EmeraldQuest — Chat UI (homework helper + two-phase tutor)
// ==========================================================================

let _hintCount = 0;
let _problemActive = false;
let _problemSolved = false;
let _pendingImage = null;

const ESCALATION_PATTERNS = [
  /i checked/i, /calculator/i,
  /i'm (sure|positive|right|certain)/i,
  /that is (right|correct)/i,
  /no,?\s*(it'?s|that'?s|the answer is)/i,
  /my (teacher|parent|mom|dad) said/i
];

// ── Render home screen ───────────────────────────────────────────────
renderHomeScreen = function() {
  const player = getCurrentPlayer();
  if (!player) return;

  document.getElementById('mode-hunt').classList.toggle('active', player.questMode === 'hunt');
  document.getElementById('mode-chill').classList.toggle('active', player.questMode === 'chill');
};

// ── Add chat welcome message ─────────────────────────────────────────
initChatWelcome = function() {
  const chatArea = document.getElementById('chat-area');
  const player = getCurrentPlayer();
  if (!player || chatArea.children.length > 0) return;

  const greeting = player.questMode === 'hunt' && player.activeDemon
    ? `Hey ${player.name}! Ready to fight ${getDemonById(player.activeDemon)?.name || 'demons'}? Send me a homework question to attack! ⚔️`
    : `Hey ${player.name}! I'm your homework helper! 📚 Type a question or snap a photo of your homework, and I'll help you figure it out! 💪`;

  addChatMessage(greeting, 'tutor');
};

// ── Add a message to the chat ────────────────────────────────────────
function addChatMessage(text, sender, imageUrl = null) {
  const chatArea = document.getElementById('chat-area');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble--${sender}`;

  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'chat-bubble__image';
    img.src = imageUrl;
    img.alt = 'Homework photo';
    bubble.appendChild(img);
  }

  if (text) {
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
  }

  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ── Send message ─────────────────────────────────────────────────────
function showAnswerKey(pageData) {
  if (!pageData || !pageData.problems || pageData.problems.length === 0) return;

  const chatArea = document.getElementById('chat-area');
  const container = document.createElement('div');
  container.className = 'answer-key';

  const toggle = document.createElement('button');
  toggle.className = 'answer-key__toggle';
  toggle.innerHTML = '<span>\uD83D\uDCCB Answer Key (' + pageData.problems.length + ' problem' + (pageData.problems.length !== 1 ? 's' : '') + ' found)</span><span class="answer-key__arrow">\u25B6</span>';
  toggle.addEventListener('click', function() { container.classList.toggle('open'); });

  const body = document.createElement('div');
  body.className = 'answer-key__body';

  if (pageData.pageDescription) {
    const desc = document.createElement('div');
    desc.className = 'answer-key__problem';
    desc.textContent = pageData.pageDescription;
    body.appendChild(desc);
  }

  pageData.problems.forEach(function(p, i) {
    const row = document.createElement('div');
    row.className = 'answer-key__problem';
    const label = p.problemText.length > 60 ? p.problemText.substring(0, 60) + '...' : p.problemText;
    const num = document.createElement('span');
    num.className = 'answer-key__problem-num';
    num.textContent = '#' + (p.id || i + 1) + ' ';
    const ans = document.createElement('span');
    ans.className = 'answer-key__answer';
    ans.textContent = 'Answer: ' + p.answer;
    row.appendChild(num);
    row.appendChild(document.createTextNode(label));
    row.appendChild(document.createElement('br'));
    row.appendChild(ans);
    body.appendChild(row);
  });

  container.appendChild(toggle);
  container.appendChild(body);
  chatArea.appendChild(container);
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function handleSendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text && !_pendingImage) return;

  const hadImage = !!_pendingImage;
  let imageUrl = null;
  if (_pendingImage) {
    imageUrl = `data:image/jpeg;base64,${_pendingImage}`;
  }
  addChatMessage(text || '📸 Help me with this!', 'student', imageUrl);
  input.value = '';

  const typing = document.getElementById('typing-indicator');

  // Phase 1 loading UX for photo uploads
  if (_pendingImage) {
    typing.classList.remove('hidden');
    typing.querySelector?.('.typing-text')?.textContent
      ? (typing.querySelector('.typing-text').textContent = 'Reading your homework page...')
      : null;
  } else {
    typing.classList.remove('hidden');
  }

  // Check for escalation before sending
  const pageData = getCurrentPageData();
  if (pageData && text) {
    const isEscalation = ESCALATION_PATTERNS.some(p => p.test(text));
    if (isEscalation) {
      const count = incrementEscalation();
      if (count >= CONFIG.ESCALATION_THRESHOLD && pageData.problems) {
        const currentProblem = pageData.problems[_currentProblemIndex] || pageData.problems[0];
        if (currentProblem) {
          const result = await escalateToSonnet(currentProblem, text);
          if (result && result.correct) {
            typing.classList.add('hidden');
            addChatMessage(`Wait, let me double-check... You're RIGHT! ${result.explanation || 'Great job!'} 🎉`, 'tutor');
            resetEscalation();
            _problemSolved = true;
            onProblemSolved();
            _pendingImage = null;
            return;
          }
          resetEscalation();
        }
      }
    }
  }

  const response = await sendToClaude(text, _pendingImage);
  _pendingImage = null;

  typing.classList.add('hidden');

  if (hadImage) {
    const extractedData = getCurrentPageData();
    if (extractedData) showAnswerKey(extractedData);
  }

  // Check if the problem was solved
  const solved = checkIfSolved(response);
  if (solved) {
    _problemSolved = true;
  } else if (_problemActive) {
    _hintCount++;
  } else {
    _problemActive = true;
  }

  const cleanText = cleanResponseText(response);
  addChatMessage(cleanText, 'tutor');

  if (_problemSolved) {
    onProblemSolved();
  }
}

// ── Problem solved! ──────────────────────────────────────────────────
function onProblemSolved() {
  const player = getCurrentPlayer();
  if (!player) return;

  const reward = calculateReward(_hintCount);
  incrementStreak();
  createConfetti();

  if (player.questMode === 'hunt' && player.activeDemon) {
    const isCritical = _hintCount <= 1;
    triggerBattleAnimation(isCritical, () => {
      addEmeralds(reward, _hintCount === 0 ? 'Solved it with NO hints! 🎉' : `Solved it with ${_hintCount} hint${_hintCount !== 1 ? 's' : ''}! 🎉`);
    });
  } else {
    addEmeralds(reward, _hintCount === 0 ? 'Solved it with NO hints! 🎉' : `Solved it with ${_hintCount} hint${_hintCount !== 1 ? 's' : ''}! 🎉`);
  }

  _hintCount = 0;
  _problemActive = false;
  _problemSolved = false;
  resetEscalation();
}

// ── Handle image upload ──────────────────────────────────────────────
async function handleImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) return;

  try {
    _pendingImage = await fileToBase64(file);
    showToast('📸 Photo ready! Type a question or hit send.');
  } catch (e) {
    showToast('Oops! Could not load that image. Try again.');
  }
}

// ── Helper to get demon by ID ────────────────────────────────────────
function getDemonById(id) {
  return DEMONS.find(d => d.id === id);
}

// ── Init chat event listeners ────────────────────────────────────────
function initChat() {
  document.getElementById('btn-send').addEventListener('click', handleSendMessage);

  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  document.getElementById('btn-camera').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
      e.target.value = '';
    }
  });

  document.getElementById('mode-hunt').addEventListener('click', () => {
    const player = getCurrentPlayer();
    if (player) { player.questMode = 'hunt'; saveState(); renderHomeScreen(); }
  });
  document.getElementById('mode-chill').addEventListener('click', () => {
    const player = getCurrentPlayer();
    if (player) { player.questMode = 'chill'; saveState(); renderHomeScreen(); }
  });
}
