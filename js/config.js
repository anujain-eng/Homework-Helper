// ==========================================================================
// EmeraldQuest — Config & Constants
// ==========================================================================

const CONFIG = {
  VERSION: '1.0.0',
  APP_NAME: 'EmeraldQuest',

  // Claude API
  API_URL: 'https://api.anthropic.com/v1/messages',

  // Phase 1: Sonnet + Extended Thinking — reads & solves all problems from photo (once per page)
  API_MODEL_PHASE1: 'claude-sonnet-4-6',
  API_VERSION_PHASE1: '2025-04-15',
  API_THINKING_BUDGET: 8000,
  API_MAX_TOKENS_PHASE1: 16000,

  // Phase 2: Haiku — Socratic tutoring with known answers (every message)
  API_MODEL_PHASE2: 'claude-haiku-4-5-20251001',
  API_MAX_TOKENS_PHASE2: 512,

  // Escalation: Sonnet re-verify when student insists (rare)
  API_MODEL_ESCALATION: 'claude-sonnet-4-6',
  ESCALATION_THRESHOLD: 2,

  // Text-only (no photo): Haiku direct
  API_MODEL_TEXT_ONLY: 'claude-haiku-4-5-20251001',
  API_MAX_TOKENS_TEXT_ONLY: 512,

  // Legacy (kept for fallback)
  API_MODEL: 'claude-sonnet-4-6',
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
