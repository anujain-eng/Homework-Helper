// ==========================================================================
// EmeraldQuest — Emerald System (earn, spend, animations, counter, streak)
// ==========================================================================

// ── Add emeralds with animation ──────────────────────────────────────
function addEmeralds(amount, reason = '') {
  const player = getCurrentPlayer();
  if (!player) return;

  player.emeralds += amount;
  updateEmeraldDisplay();
  saveState();

  // Fly-up animation
  for (let i = 0; i < Math.min(amount, 5); i++) {
    setTimeout(() => {
      const fly = document.createElement('div');
      fly.className = 'emerald-fly';
      fly.textContent = '💎';
      fly.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 80) + 'px';
      fly.style.top = (window.innerHeight / 2 + Math.random() * 60) + 'px';
      document.body.appendChild(fly);
      setTimeout(() => fly.remove(), 1000);
    }, i * 150);
  }

  // Bounce the counter
  const counter = document.getElementById('emerald-count');
  counter.classList.add('animating');
  setTimeout(() => counter.classList.remove('animating'), 500);

  // Show reward modal if there's a reason
  if (reason) {
    setTimeout(() => showRewardModal(amount, reason), 600);
  }
}

// ── Spend emeralds ───────────────────────────────────────────────────
function spendEmeralds(amount) {
  const player = getCurrentPlayer();
  if (!player || player.emeralds < amount) return false;

  player.emeralds -= amount;
  updateEmeraldDisplay();
  saveState();
  return true;
}

// ── Check if player can afford ───────────────────────────────────────
function canAfford(amount) {
  const player = getCurrentPlayer();
  return player && player.emeralds >= amount;
}

// ── Update emerald display ───────────────────────────────────────────
function updateEmeraldDisplay() {
  const player = getCurrentPlayer();
  if (!player) return;
  document.getElementById('emerald-count').textContent = player.emeralds;
}

// ── Show reward modal ────────────────────────────────────────────────
function showRewardModal(amount, reason) {
  document.getElementById('reward-amount').textContent = `+${amount} 💎`;
  document.getElementById('reward-reason').textContent = reason;
  document.getElementById('modal-reward').classList.add('active');
}

// ── Streak management ────────────────────────────────────────────────
function incrementStreak() {
  const player = getCurrentPlayer();
  if (!player) return;

  player.streak++;
  player.questionsCompleted++;

  // Streak bonus at 3+
  if (player.streak >= 3 && player.streak % 3 === 0) {
    addEmeralds(CONFIG.EMERALDS_STREAK_BONUS, `${player.streak} question streak! 🔥`);
  }

  saveState();
}

function resetStreak() {
  const player = getCurrentPlayer();
  if (player) {
    player.streak = 0;
    saveState();
  }
}

// ── Calculate emerald reward based on hint count ─────────────────────
function calculateReward(hintCount) {
  if (hintCount <= 1) return CONFIG.EMERALDS_HINT_1;
  if (hintCount <= 3) return CONFIG.EMERALDS_HINT_2_3;
  return CONFIG.EMERALDS_HINT_4_PLUS;
}

// ── Init emerald event listeners ─────────────────────────────────────
function initEmeralds() {
  document.getElementById('btn-reward-close').addEventListener('click', () => {
    document.getElementById('modal-reward').classList.remove('active');
  });
}
