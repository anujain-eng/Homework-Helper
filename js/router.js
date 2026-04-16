// ==========================================================================
// EmeraldQuest — Router (screen navigation + transitions)
// ==========================================================================

let _currentScreen = 'loading';

// ── Show a screen by name ────────────────────────────────────────────
function showScreen(screenName) {
  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(s => s.classList.remove('active'));

  const target = document.getElementById(`screen-${screenName}`);
  if (target) {
    target.classList.add('active');
    _currentScreen = screenName;

    // Update nav bar active state
    document.querySelectorAll('.nav__item').forEach(item => {
      item.classList.toggle('active', item.dataset.screen === screenName);
    });

    // Trigger screen-specific renders
    switch (screenName) {
      case 'home':
        renderHomeScreen();
        break;
      case 'character':
        renderCharacterScreen();
        break;
      case 'pets':
        renderPetsScreen();
        break;
      case 'shop':
        renderShopScreen();
        break;
      case 'quest':
        renderQuestScreen();
        break;
      case 'world':
        renderWorldScreen();
        break;
      case 'settings':
        renderSettingsScreen();
        break;
    }
  }
}

// ── Get current screen ───────────────────────────────────────────────
function getCurrentScreen() {
  return _currentScreen;
}

// ── Init nav event listeners ─────────────────────────────────────────
function initRouter() {
  // Bottom nav clicks
  document.querySelectorAll('.nav__item').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      if (screen) showScreen(screen);
    });
  });

  // Settings gear
  document.getElementById('btn-settings').addEventListener('click', () => {
    showScreen('settings');
  });

  // Birthday countdown button
  document.getElementById('btn-birthday-countdown').addEventListener('click', () => {
    const days = getBirthdayCountdown();
    if (days === 0) {
      alert('🎂 Today is your birthday! Happy Birthday! 🎉');
    } else {
      alert(`🎂 ${days} days until your birthday!`);
    }
  });
}

// ── Render functions (stubs — implemented in their own files) ────────
// These exist so showScreen() doesn't error before the files load.
// Each file overwrites its own function.
function renderHomeScreen() {}
function renderCharacterScreen() {}
function renderPetsScreen() {}
function renderShopScreen() {}
function renderQuestScreen() {}
function renderWorldScreen() {}
function renderSettingsScreen() {}
function initChatWelcome() {}
