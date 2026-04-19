// ==========================================================================
// EmeraldQuest — Chat UI (homework helper + two-phase tutor)
// ==========================================================================

let _hintCount = 0;
let _problemActive = false;
let _problemSolved = false;
let _pendingImage = null;
let _isSending = false;

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

  var btn = document.getElementById('btn-answer-key');
  btn.style.display = 'inline-block';

  var content = document.getElementById('answer-key-content');
  content.innerHTML = '';

  function addSection(parent, label, text, color) {
    if (!text) return;
    var row = document.createElement('div');
    row.style.cssText = 'margin:4px 0;';
    row.innerHTML = '<span style="color:' + (color || 'var(--text-muted)') + ';font-weight:bold;font-size:11px;text-transform:uppercase;">' + label + '</span>';
    var val = document.createElement('div');
    val.style.cssText = 'color:var(--text-secondary);margin-left:8px;font-size:13px;';
    val.textContent = text;
    row.appendChild(val);
    parent.appendChild(row);
  }

  if (pageData.pageDescription) {
    addSection(content, 'Page', pageData.pageDescription, 'var(--lavender)');
  }
  if (pageData.pageContext) {
    addSection(content, 'Context', pageData.pageContext, 'var(--lavender)');
  }

  pageData.problems.forEach(function(p, i) {
    var item = document.createElement('div');
    item.style.cssText = 'padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);';

    var header = document.createElement('div');
    header.style.cssText = 'color:var(--emerald);font-weight:bold;font-size:15px;margin-bottom:6px;';
    header.textContent = '#' + (p.id || i + 1) + ' ' + (p.problemType || '');
    item.appendChild(header);

    addSection(item, 'Problem', p.problemText, 'var(--cyan)');
    addSection(item, 'Answer', p.answer, 'var(--gold)');

    if (p.solutionSteps && p.solutionSteps.length) {
      addSection(item, 'Steps', p.solutionSteps.join(' → '), 'var(--emerald)');
    }
    addSection(item, 'Visuals', p.visualContext || p.visualDescription, 'var(--pink)');
    addSection(item, 'Student Work', p.studentWorkVisible, 'var(--coral)');
    addSection(item, 'Concepts', p.conceptsTested ? p.conceptsTested.join(', ') : null, 'var(--lavender)');
    addSection(item, 'How to Present', p.presentationGuide, 'var(--neon-blue)');
    addSection(item, 'Scaffolding', p.scaffoldingStrategy, 'var(--soft-purple)');
    addSection(item, 'Kid Reframe', p.kidFriendlyReframe, 'var(--pink)');
    addSection(item, 'Connects To', p.connectsTo, 'var(--text-muted)');

    if (p.commonMistakes && p.commonMistakes.length) {
      var mistakes = p.commonMistakes.map(function(m) {
        return m.wrong + ' — ' + m.reason;
      }).join('; ');
      addSection(item, 'Common Mistakes', mistakes, 'var(--coral)');
    }

    content.appendChild(item);
  });
}

async function handleSendMessage() {
  if (_isSending) return;

  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text && !_pendingImage) return;

  _isSending = true;
  const sendBtn = document.getElementById('btn-send');
  sendBtn.disabled = true;

  const imageToSend = _pendingImage;
  _pendingImage = null;

  const hadImage = !!imageToSend;
  let imageUrl = null;
  if (imageToSend) {
    imageUrl = `data:image/jpeg;base64,${imageToSend}`;
  }
  addChatMessage(text || '📸 Help me with this!', 'student', imageUrl);
  input.value = '';

  const typing = document.getElementById('typing-indicator');

  if (hadImage) {
    typing.classList.remove('hidden');
    typing.querySelector?.('.typing-text')?.textContent
      ? (typing.querySelector('.typing-text').textContent = 'Reading your homework page...')
      : null;
  } else {
    typing.classList.remove('hidden');
  }

  try {
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
              return;
            }
            resetEscalation();
          }
        }
      }
    }

    let response = await sendToClaude(text, imageToSend);

    // Check for confusion escalation
    if ((response.includes('"confused": true') || response.includes('"confused":true')) && getConfusionCount() < CONFIG.CONFUSION_ESCALATION_MAX) {
      const cleanConfused = cleanResponseText(response);
      addChatMessage(cleanConfused, 'tutor');

      typing.querySelector?.('.typing-text') && (typing.querySelector('.typing-text').textContent = 'Taking another look at your homework...');
      typing.classList.remove('hidden');

      const clarification = await reexamineWithSonnet();
      if (clarification) {
        response = await sendToTutor(text);
      }
    }

    typing.classList.add('hidden');

    if (hadImage) {
      const extractedData = getCurrentPageData();
      if (extractedData) showAnswerKey(extractedData);
    }

    const solved = checkIfSolved(response);
    const hintInfo = parseHintCount(response);

    if (solved) {
      _problemSolved = true;
      if (hintInfo && typeof hintInfo.hints === 'number') {
        _hintCount = hintInfo.hints;
      }
    } else if (hintInfo && typeof hintInfo.hints === 'number') {
      _hintCount = hintInfo.hints;
    } else if (_problemActive) {
      _hintCount++;
    }

    if (!_problemActive) _problemActive = true;

    const cleanText = cleanResponseText(response);
    addChatMessage(cleanText, 'tutor');

    if (_problemSolved) {
      onProblemSolved();
    }
  } finally {
    _isSending = false;
    sendBtn.disabled = false;
  }
}

// ── Parse hint count from Haiku's response signal ────────────────────
function parseHintCount(responseText) {
  const match = responseText.match(/\{\s*"solved"\s*:\s*(true|false)(?:\s*,\s*"hints"\s*:\s*(\d+))?\s*\}/);
  if (match) {
    return {
      solved: match[1] === 'true',
      hints: match[2] ? parseInt(match[2], 10) : null
    };
  }
  return null;
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

  document.getElementById('btn-answer-key').addEventListener('click', () => {
    document.getElementById('modal-answer-key').style.display = 'flex';
  });
  document.getElementById('btn-answer-key-close').addEventListener('click', () => {
    document.getElementById('modal-answer-key').style.display = 'none';
  });
  document.getElementById('modal-answer-key').addEventListener('click', (e) => {
    if (e.target.id === 'modal-answer-key') e.target.style.display = 'none';
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
