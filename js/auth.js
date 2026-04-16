// ==========================================================================
// EmeraldQuest — Authentication (login, secret questions, admin, profiles)
// ==========================================================================

// ── Render login screen profiles ─────────────────────────────────────
function renderLoginScreen() {
  const container = document.getElementById('login-profiles');
  container.innerHTML = '';

  const players = Object.values(AppState.players);

  if (players.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);">No players yet! Create one below.</p>';
  }

  players.forEach(player => {
    const bubble = document.createElement('div');
    bubble.className = 'profile-bubble';
    bubble.innerHTML = `
      <div class="profile-bubble__avatar">${player.avatar}</div>
      <div class="profile-bubble__name">${player.name}</div>
    `;
    bubble.addEventListener('click', () => startLogin(player.name));
    container.appendChild(bubble);
  });
}

// ── Start login (show secret question) ───────────────────────────────
function startLogin(playerName) {
  const player = AppState.players[playerName];
  if (!player) return;

  document.getElementById('secret-avatar').textContent = player.avatar;
  document.getElementById('secret-player-name').textContent = player.name;
  document.getElementById('secret-question-text').textContent = player.secretQuestion;
  document.getElementById('secret-answer-input').value = '';
  document.getElementById('secret-error').style.display = 'none';

  // Store which player is trying to log in
  document.getElementById('screen-secret').dataset.player = playerName;
  showScreen('secret');
}

// ── Verify secret answer ─────────────────────────────────────────────
function verifySecretAnswer() {
  const playerName = document.getElementById('screen-secret').dataset.player;
  const player = AppState.players[playerName];
  const answer = document.getElementById('secret-answer-input').value.toLowerCase().trim();

  if (answer === player.secretAnswer) {
    // Success!
    AppState.currentPlayer = playerName;
    saveState();
    onLoginSuccess();
  } else {
    // Wrong answer
    document.getElementById('secret-error').style.display = 'block';
    document.getElementById('secret-answer-input').value = '';
    document.getElementById('secret-answer-input').focus();
  }
}

// ── After successful login ───────────────────────────────────────────
function onLoginSuccess() {
  const player = getCurrentPlayer();
  if (!player) return;

  // Update header
  document.getElementById('header-avatar').textContent = player.avatar;
  document.getElementById('header-player-name').textContent = player.name;
  document.getElementById('emerald-count').textContent = player.emeralds;

  // Show header and nav
  document.getElementById('app-header').classList.remove('hidden');
  document.getElementById('app-nav').classList.remove('hidden');

  // Check daily bonus
  if (checkDailyBonus(player)) {
    addEmeralds(CONFIG.EMERALDS_DAILY_BONUS, 'Daily login bonus!');
  }

  // Check birthday
  if (isBirthday() && player.birthdayBonusClaimed !== new Date().getFullYear().toString()) {
    player.birthdayBonusClaimed = new Date().getFullYear().toString();
    // Give birthday pet if not owned
    if (!player.pets.find(p => p.id === 'bday_unicorn')) {
      const bdayPet = PETS.find(p => p.id === 'bday_unicorn');
      player.pets.push({ ...bdayPet, name: 'Birthday Unicorn', happiness: 100 });
    }
    addEmeralds(CONFIG.EMERALDS_BIRTHDAY, 'Happy Birthday! 🎂🎉');
    saveState();
    setTimeout(() => showBirthdayOverlay(), 500);
  }

  // Show admin section if Amyra
  if (player.name.toLowerCase() === CONFIG.ADMIN_NAME.toLowerCase()) {
    document.getElementById('admin-section').style.display = 'block';
    document.getElementById('btn-logout-nonadmin').parentElement.style.display = 'none';
    renderAdminPanel();
  } else {
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('btn-logout-nonadmin').parentElement.style.display = '';
  }

  // Navigate to home
  showScreen('home');
  initChatWelcome();
}

// ── Create new player ────────────────────────────────────────────────
function setupNewPlayer() {
  showScreen('setup');

  // Populate avatar options
  const avatarContainer = document.getElementById('setup-avatars');
  avatarContainer.innerHTML = '';
  CONFIG.PROFILE_AVATARS.forEach(emoji => {
    const el = document.createElement('div');
    el.className = 'setup-avatar';
    el.textContent = emoji;
    el.addEventListener('click', () => {
      avatarContainer.querySelectorAll('.setup-avatar').forEach(a => a.classList.remove('selected'));
      el.classList.add('selected');
    });
    avatarContainer.appendChild(el);
  });

  // Populate questions
  const questionSelect = document.getElementById('setup-question');
  questionSelect.innerHTML = '';
  SECRET_QUESTIONS.forEach(q => {
    const opt = document.createElement('option');
    opt.value = q;
    opt.textContent = q;
    questionSelect.appendChild(opt);
  });
}

function submitNewPlayer() {
  const name = document.getElementById('setup-name').value.trim();
  const selectedAvatar = document.querySelector('.setup-avatar.selected');
  const question = document.getElementById('setup-question').value;
  const answer = document.getElementById('setup-answer').value.trim();
  const errorEl = document.getElementById('setup-error');

  // Validation
  if (!name) { errorEl.textContent = 'Please enter your name!'; errorEl.style.display = 'block'; return; }
  if (name.length < 2) { errorEl.textContent = 'Name must be at least 2 characters!'; errorEl.style.display = 'block'; return; }
  if (AppState.players[name]) { errorEl.textContent = 'That name is taken! Pick another.'; errorEl.style.display = 'block'; return; }
  if (!selectedAvatar) { errorEl.textContent = 'Pick an avatar!'; errorEl.style.display = 'block'; return; }
  if (!answer) { errorEl.textContent = 'Please enter a secret answer!'; errorEl.style.display = 'block'; return; }

  errorEl.style.display = 'none';
  const avatar = selectedAvatar.textContent;

  // Create player
  AppState.players[name] = createDefaultPlayerData(name, avatar, question, answer);
  AppState.currentPlayer = name;
  saveState();
  onLoginSuccess();
}

// ── Logout ───────────────────────────────────────────────────────────
function logout() {
  AppState.currentPlayer = null;
  saveToLocal();

  // Hide header and nav
  document.getElementById('app-header').classList.add('hidden');
  document.getElementById('app-nav').classList.add('hidden');

  renderLoginScreen();
  showScreen('login');
}

// ── Admin panel (for Amyra) ──────────────────────────────────────────
function renderAdminPanel() {
  const container = document.getElementById('admin-player-list');
  container.innerHTML = '';

  Object.values(AppState.players).forEach(player => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--glass-border);';
    row.innerHTML = `
      <div>
        <span>${player.avatar}</span>
        <strong>${player.name}</strong>
        <span style="color:var(--text-muted); font-size:var(--text-xs);"> (${player.emeralds} 💎)</span>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="btn btn--ghost btn--small" data-admin-reset="${player.name}" title="View secret answer">🔑</button>
        ${player.name.toLowerCase() !== CONFIG.ADMIN_NAME.toLowerCase() ?
          `<button class="btn btn--danger btn--small" data-admin-delete="${player.name}" title="Delete player">🗑️</button>` : ''}
      </div>
    `;
    container.appendChild(row);
  });

  // Event delegation for admin buttons
  container.addEventListener('click', (e) => {
    const resetBtn = e.target.closest('[data-admin-reset]');
    const deleteBtn = e.target.closest('[data-admin-delete]');

    if (resetBtn) {
      const pName = resetBtn.dataset.adminReset;
      const p = AppState.players[pName];
      if (p) alert(`${p.name}'s answer to "${p.secretQuestion}" is: "${p.secretAnswer}"`);
    }
    if (deleteBtn) {
      const pName = deleteBtn.dataset.adminDelete;
      if (confirm(`Delete ${pName}'s entire profile? This can't be undone!`)) {
        delete AppState.players[pName];
        saveState();
        renderAdminPanel();
      }
    }
  });
}

// ── Birthday overlay ─────────────────────────────────────────────────
function showBirthdayOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'birthday-overlay';
  overlay.innerHTML = `
    <div class="birthday-overlay__cake">🎂</div>
    <h1>Happy Birthday!</h1>
    <p style="font-size:var(--text-lg);">You got <strong style="color:var(--emerald);">50 💎</strong> and a <strong>Birthday Unicorn!</strong> 🦄</p>
    <button class="btn btn--gold btn--large" id="btn-close-birthday">Thank You! 🎉</button>
  `;
  document.body.appendChild(overlay);
  createConfetti();

  document.getElementById('btn-close-birthday').addEventListener('click', () => {
    overlay.remove();
  });
}

// ── Init auth event listeners ────────────────────────────────────────
function initAuth() {
  document.getElementById('btn-add-player').addEventListener('click', setupNewPlayer);
  document.getElementById('btn-setup-done').addEventListener('click', submitNewPlayer);
  document.getElementById('btn-secret-submit').addEventListener('click', verifySecretAnswer);

  // Enter key on secret answer
  document.getElementById('secret-answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifySecretAnswer();
  });

  // Enter key on setup name
  document.getElementById('setup-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('setup-answer').focus();
  });

  // Logout buttons
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('btn-logout-nonadmin').addEventListener('click', logout);
}
