// ==========================================================================
// EmeraldQuest — State Management + GitHub Sync + localStorage Cache
// ==========================================================================

// Global state object — holds ALL player data
let AppState = {
  currentPlayer: null,
  players: {}
};

// Default data for a brand new player
function createDefaultPlayerData(name, avatar, question, answer) {
  return {
    name: name,
    avatar: avatar,
    secretQuestion: question,
    secretAnswer: answer.toLowerCase().trim(),
    emeralds: 0,
    character: null,
    characterUnlocked: false,
    equippedItems: { clothes: null, hair: null, ears: null, accessory: null },
    ownedItems: [],
    pets: [{ id: 'dog', name: 'Buddy', emoji: '🐶', rarity: 'common', happiness: 100 }],
    homes: [],
    petsInHomes: {},
    defeatedDemons: [],
    activeDemon: null,
    activeDemonHP: null,
    questMode: 'hunt',
    streak: 0,
    questionsCompleted: 0,
    lastLogin: new Date().toISOString().split('T')[0],
    birthdayBonusClaimed: '',
    chatHistory: []
  };
}

// ── localStorage helpers ─────────────────────────────────────────────
function saveToLocal() {
  try {
    localStorage.setItem('eq_state', JSON.stringify(AppState));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function loadFromLocal() {
  try {
    const data = localStorage.getItem('eq_state');
    if (data) {
      AppState = JSON.parse(data);
      return true;
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return false;
}

function getApiKey() {
  return localStorage.getItem('eq_api_key') || '';
}

function setApiKey(key) {
  localStorage.setItem('eq_api_key', key);
}

function getGitHubToken() {
  return localStorage.getItem('eq_github_token') || '';
}

function setGitHubToken(token) {
  localStorage.setItem('eq_github_token', token);
}

function getGitHubRepo() {
  return localStorage.getItem('eq_github_repo') || CONFIG.GITHUB_REPO;
}

function setGitHubRepo(repo) {
  localStorage.setItem('eq_github_repo', repo);
}

// ── Current player shortcut ──────────────────────────────────────────
function getCurrentPlayer() {
  if (!AppState.currentPlayer || !AppState.players[AppState.currentPlayer]) return null;
  return AppState.players[AppState.currentPlayer];
}

// ── Save state (local + debounced GitHub) ────────────────────────────
let _saveTimeout = null;
function saveState() {
  saveToLocal();
  // Debounce GitHub saves
  clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => saveToGitHub(), CONFIG.SAVE_DEBOUNCE_MS);
}

// ── GitHub API: Load ─────────────────────────────────────────────────
async function loadFromGitHub() {
  const token = getGitHubToken();
  const repo = getGitHubRepo();
  if (!token || !repo) return false;

  try {
    const response = await fetch(
      `${CONFIG.GITHUB_API}/repos/${repo}/contents/${CONFIG.GITHUB_SAVE_FILE}?ref=${CONFIG.GITHUB_BRANCH}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) return false; // File doesn't exist yet
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(atob(data.content));

    // Merge: GitHub data takes priority, but keep local-only fields
    if (content.players) {
      AppState.players = content.players;
      saveToLocal();
      return true;
    }
  } catch (e) {
    console.warn('Failed to load from GitHub:', e);
  }
  return false;
}

// ── GitHub API: Save ─────────────────────────────────────────────────
let _githubSha = null;

async function saveToGitHub() {
  const token = getGitHubToken();
  const repo = getGitHubRepo();
  if (!token || !repo) return;

  try {
    // Get current file SHA (needed for updates)
    if (!_githubSha) {
      const getResp = await fetch(
        `${CONFIG.GITHUB_API}/repos/${repo}/contents/${CONFIG.GITHUB_SAVE_FILE}?ref=${CONFIG.GITHUB_BRANCH}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (getResp.ok) {
        const getData = await getResp.json();
        _githubSha = getData.sha;
      }
    }

    // Prepare save data (exclude chat history to keep file small)
    const saveData = { players: {} };
    for (const [name, player] of Object.entries(AppState.players)) {
      saveData.players[name] = { ...player, chatHistory: [] };
    }

    const body = {
      message: `EmeraldQuest auto-save ${new Date().toISOString()}`,
      content: btoa(JSON.stringify(saveData, null, 2)),
      branch: CONFIG.GITHUB_BRANCH
    };
    if (_githubSha) body.sha = _githubSha;

    const putResp = await fetch(
      `${CONFIG.GITHUB_API}/repos/${repo}/contents/${CONFIG.GITHUB_SAVE_FILE}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (putResp.ok) {
      const putData = await putResp.json();
      _githubSha = putData.content.sha;
    }
  } catch (e) {
    console.warn('Failed to save to GitHub:', e);
  }
}

// ── Daily login bonus check ──────────────────────────────────────────
function checkDailyBonus(player) {
  const today = new Date().toISOString().split('T')[0];
  if (player.lastLogin !== today) {
    player.lastLogin = today;
    return true; // Bonus available
  }
  return false;
}

// ── Birthday check ───────────────────────────────────────────────────
function isBirthday() {
  const now = new Date();
  return now.getMonth() + 1 === CONFIG.BIRTHDAY_MONTH && now.getDate() === CONFIG.BIRTHDAY_DAY;
}

function getBirthdayCountdown() {
  const now = new Date();
  let bday = new Date(now.getFullYear(), CONFIG.BIRTHDAY_MONTH - 1, CONFIG.BIRTHDAY_DAY);
  if (bday < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = Math.ceil((bday - now) / (1000 * 60 * 60 * 24));
  return diff;
}
