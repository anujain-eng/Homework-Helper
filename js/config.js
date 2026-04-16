// ==========================================================================
// EmeraldQuest — Config & Constants
// ==========================================================================

const CONFIG = {
  VERSION: '1.0.0',
  APP_NAME: 'EmeraldQuest',

  // Claude API
  API_URL: 'https://api.anthropic.com/v1/messages',
  API_MODEL: 'claude-haiku-4-5-20251001',
  API_MAX_TOKENS: 1024,

  // GitHub API (save data)
  GITHUB_API: 'https://api.github.com',
  GITHUB_REPO: 'anujain-eng/Homework-Helper',
  GITHUB_SAVE_FILE: 'save-data.json',
  GITHUB_BRANCH: 'claude/homework-helper-app-jLTSe',

  // Game balance
  EMERALDS_HINT_1: 5,       // Solved with 1 hint
  EMERALDS_HINT_2_3: 3,     // Solved with 2-3 hints
  EMERALDS_HINT_4_PLUS: 1,  // Solved with 4+ hints
  EMERALDS_DAILY_BONUS: 2,
  EMERALDS_BIRTHDAY: 50,
  EMERALDS_STREAK_BONUS: 1, // Extra for 3+ in a row
  EMERALDS_UNLOCK_CHARACTER: 2,
  EMERALDS_UNLOCK_SHOP: 2,

  // Birthday
  BIRTHDAY_MONTH: 4,  // April
  BIRTHDAY_DAY: 25,

  // Admin
  ADMIN_NAME: 'Amyra',
  ADMIN_QUESTION: 'Where does your dad work?',
  ADMIN_ANSWER: 'onlyexit',

  // Timing
  SAVE_DEBOUNCE_MS: 2000,
  BATTLE_ANIM_MS: 2500,
  CONFETTI_DURATION_MS: 3000,

  // Avatars for profile selection
  PROFILE_AVATARS: ['🌟', '🦋', '🌸', '🔥', '❄️', '🌙', '⭐', '🎀', '💜', '🦄', '🐱', '🌈']
};
