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
async function handleSendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text && !_pendingImage) return;

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

  // Parse status signal for deterministic hint counting
  const signal = parseStatusSignal(response);

  if (signal) {
    switch (signal.status) {
      case 'asking':
        _problemActive = true;
        _hintCount = 0;
        if (signal.problem !== undefined) _currentProblemIndex = signal.problem - 1;
        break;
      case 'hinting':
        _problemActive = true;
        _hintCount = signal.hint || (_hintCount + 1);
        break;
      case 'solved':
        _problemSolved = true;
        break;
      case 'navigating':
        _hintCount = 0;
        _problemActive = false;
        break;
    }
  } else {
    // Fallback for text-only mode (no status signals)
    const solved = checkIfSolved(response);
    if (solved) _problemSolved = true;
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

// ── Track current problem index for escalation ───────────────────────
let _currentProblemIndex = 0;

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
