// ==========================================================================
// EmeraldQuest — App Init (main entry point, events, glue)
// ==========================================================================

// ── Render settings screen ───────────────────────────────────────────
renderSettingsScreen = function() {
  document.getElementById('settings-api-key').value = getApiKey();
  document.getElementById('settings-github-token').value = getGitHubToken();
  document.getElementById('settings-github-repo').value = getGitHubRepo();

  const player = getCurrentPlayer();
  if (player && player.name.toLowerCase() === CONFIG.ADMIN_NAME.toLowerCase()) {
    document.getElementById('admin-section').style.display = '';
    renderAdminPanel();
  }
};

// ── Render world screen ──────────────────────────────────────────────
renderWorldScreen = function() {
  const player = getCurrentPlayer();
  if (!player) return;

  // Stats
  const statsGrid = document.getElementById('stats-grid');
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-card__value">${player.emeralds}</div>
      <div class="stat-card__label">💎 Emeralds</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__value">${player.questionsCompleted}</div>
      <div class="stat-card__label">📝 Questions</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__value">${player.streak}</div>
      <div class="stat-card__label">🔥 Streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__value">${player.pets.length}</div>
      <div class="stat-card__label">🐾 Pets</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__value">${player.defeatedDemons.length}</div>
      <div class="stat-card__label">⚔️ Demons</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__value">${player.homes.length}</div>
      <div class="stat-card__label">🏠 Homes</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__value">${player.ownedItems.length}</div>
      <div class="stat-card__label">👕 Fashion</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__value">${getBirthdayCountdown()}</div>
      <div class="stat-card__label">🎂 Days to Bday</div>
    </div>
  `;

  // Homes
  const homesGrid = document.getElementById('homes-grid');
  const noHomes = document.getElementById('no-homes-msg');

  if (player.homes.length === 0) {
    homesGrid.innerHTML = '';
    noHomes.classList.remove('hidden');
  } else {
    noHomes.classList.add('hidden');
    homesGrid.innerHTML = '';

    player.homes.forEach(homeId => {
      const home = SHOP_ITEMS.homes.find(h => h.id === homeId);
      if (!home) return;

      const petsInHome = (player.petsInHomes[homeId] || [])
        .map(i => player.pets[i])
        .filter(Boolean);

      const card = document.createElement('div');
      card.className = 'home-card';
      card.innerHTML = `
        <div class="home-card__emoji">${home.emoji}</div>
        <div class="home-card__name">${home.name}</div>
        <div class="home-card__pets">
          ${petsInHome.map(p => p.emoji).join(' ') || '<span style="color:var(--text-muted);">Empty</span>'}
        </div>
        <div style="font-size:var(--text-xs); color:var(--text-muted);">
          ${petsInHome.length}/${home.capacity} pets
        </div>
      `;

      // Click to assign a pet
      card.addEventListener('click', () => showAssignPetDialog(homeId, home));
      homesGrid.appendChild(card);
    });
  }
};

// ── Assign pet dialog ────────────────────────────────────────────────
function showAssignPetDialog(homeId, home) {
  const player = getCurrentPlayer();
  if (!player || player.pets.length === 0) return;

  const names = player.pets.map((p, i) => `${i + 1}. ${p.emoji} ${p.name}`).join('\n');
  const choice = prompt(`Which pet should live in ${home.name}?\n\n${names}\n\nEnter the number:`);

  if (choice) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < player.pets.length) {
      assignPetToHome(index, homeId);
      renderWorldScreen();
    }
  }
}

// ── Save settings ────────────────────────────────────────────────────
function saveSettings() {
  setApiKey(document.getElementById('settings-api-key').value.trim());
  setGitHubToken(document.getElementById('settings-github-token').value.trim());
  setGitHubRepo(document.getElementById('settings-github-repo').value.trim());
  showToast('Settings saved! ✅');
}

// ── Sync now button ──────────────────────────────────────────────────
async function syncNow() {
  showToast('Syncing...');
  const loaded = await loadFromGitHub();
  if (loaded) {
    showToast('Synced from GitHub! ✅');
    updateEmeraldDisplay();
  } else {
    await saveToGitHub();
    showToast('Saved to GitHub! ✅');
  }
}

// ── Main initialization ──────────────────────────────────────────────
async function initApp() {
  // Init star field background
  initStarField();
  initRipples();

  // Load state from localStorage
  loadFromLocal();

  // Try loading from GitHub (may have newer data)
  await loadFromGitHub();

  // Init all modules
  initAuth();
  initRouter();
  initChat();
  initEmeralds();
  initPets();
  initShop();
  initBattle();

  // Settings buttons
  document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
  document.getElementById('btn-sync-now').addEventListener('click', syncNow);

  // First-time: create Amyra's account
  if (!AppState.players[CONFIG.ADMIN_NAME]) {
    AppState.players[CONFIG.ADMIN_NAME] = createDefaultPlayerData(
      CONFIG.ADMIN_NAME,
      '🌟',
      CONFIG.ADMIN_QUESTION,
      CONFIG.ADMIN_ANSWER
    );
    saveState();
  }

  // Short delay for loading screen, then show login
  setTimeout(() => {
    // If already logged in, go to home
    if (AppState.currentPlayer && AppState.players[AppState.currentPlayer]) {
      onLoginSuccess();
    } else {
      renderLoginScreen();
      showScreen('login');
    }
  }, 1500);
}

// ── Start the app ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
