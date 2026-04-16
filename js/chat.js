// ==========================================================================
// EmeraldQuest — Chat UI (homework helper + Socratic logic)
// ==========================================================================

let _hintCount = 0;
let _problemActive = false;
let _problemSolved = false;
let _pendingImage = null;

// ── Render home screen ───────────────────────────────────────────────
renderHomeScreen = function() {
  const player = getCurrentPlayer();
  if (!player) return;

  // Update mode chips
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

  // Show student message
  let imageUrl = null;
  if (_pendingImage) {
    imageUrl = `data:image/jpeg;base64,${_pendingImage}`;
  }
  addChatMessage(text || '📸 Help me with this!', 'student', imageUrl);
  input.value = '';

  // Show typing indicator
  const typing = document.getElementById('typing-indicator');
  typing.classList.remove('hidden');

  // Send to Claude
  const response = await sendToClaude(text, _pendingImage);
  _pendingImage = null;

  // Only count hints when the student gives a WRONG answer and gets a hint.
  // Don't count: navigation, problem selection, first correct answer, post-solve chat.
  const isNavigation = /^\s*\d\s*$/.test(text)
    || /^(problem|question|number)\s*\d/i.test(text)
    || /^(let'?s|can we|go to|next|move on|start|try|do|yes|ok|sure|ready|yeah|no|help|please|what|how|why|huh)/i.test(text);
  const isPhotoOnly = !text || text === '📸 Help me with this!';
  const solved = checkIfSolved(response);

  if (!isNavigation && !isPhotoOnly && !_problemSolved && !solved) {
    if (_problemActive) {
      _hintCount++;
    } else {
      _problemActive = true;
    }
  }

  // Hide typing indicator
  typing.classList.add('hidden');

  const cleanText = cleanResponseText(response);

  // Show tutor response
  addChatMessage(cleanText, 'tutor');

  if (solved) {
    _problemSolved = true;
    onProblemSolved();
  }
}

// ── Problem solved! ──────────────────────────────────────────────────
function onProblemSolved() {
  const player = getCurrentPlayer();
  if (!player) return;

  const reward = calculateReward(_hintCount);
  incrementStreak();

  // Celebration effects
  createConfetti();

  // Check if in demon hunt mode
  if (player.questMode === 'hunt' && player.activeDemon) {
    const isCritical = _hintCount <= 1;
    triggerBattleAnimation(isCritical, () => {
      addEmeralds(reward, _hintCount === 0 ? 'Solved it with NO hints! 🎉' : `Solved it with ${_hintCount} hint${_hintCount !== 1 ? 's' : ''}! 🎉`);
    });
  } else {
    addEmeralds(reward, _hintCount === 0 ? 'Solved it with NO hints! 🎉' : `Solved it with ${_hintCount} hint${_hintCount !== 1 ? 's' : ''}! 🎉`);
  }

  // Reset for next problem
  _hintCount = 0;
  _problemActive = false;
  _problemSolved = false;
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
  // Send button
  document.getElementById('btn-send').addEventListener('click', handleSendMessage);

  // Enter key
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Camera button
  document.getElementById('btn-camera').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  // File input
  document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
      e.target.value = '';
    }
  });

  // Mode chips
  document.getElementById('mode-hunt').addEventListener('click', () => {
    const player = getCurrentPlayer();
    if (player) { player.questMode = 'hunt'; saveState(); renderHomeScreen(); }
  });
  document.getElementById('mode-chill').addEventListener('click', () => {
    const player = getCurrentPlayer();
    if (player) { player.questMode = 'chill'; saveState(); renderHomeScreen(); }
  });
}
