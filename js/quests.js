// ==========================================================================
// EmeraldQuest — Quest Mode (demon hunt, quest board, progression, chill)
// ==========================================================================

// ── Render quest screen ──────────────────────────────────────────────
renderQuestScreen = function() {
  const player = getCurrentPlayer();
  if (!player) return;

  // Active quest display
  const activeDiv = document.getElementById('active-quest');
  if (player.activeDemon) {
    const demon = getDemonById(player.activeDemon);
    if (demon) {
      activeDiv.classList.remove('hidden');
      document.getElementById('quest-demon-emoji').textContent = demon.emoji;
      document.getElementById('quest-demon-name').textContent = demon.name;

      const currentHP = player.activeDemonHP ?? demon.hp;
      const hpPercent = (currentHP / demon.hp) * 100;
      document.getElementById('quest-hp-bar').style.width = hpPercent + '%';
      document.getElementById('quest-hp-text').textContent = `HP: ${currentHP} / ${demon.hp}`;
    }
  } else {
    activeDiv.classList.add('hidden');
  }

  // Quest board
  const board = document.getElementById('quest-board');
  board.innerHTML = '';

  DEMONS.forEach(demon => {
    const isDefeated = player.defeatedDemons.includes(demon.id);
    const isActive = player.activeDemon === demon.id;
    const isUnlocked = isDemonUnlocked(demon, player);

    const card = document.createElement('div');
    card.className = 'demon-card'
      + (isActive ? ' active' : '')
      + (isDefeated && !isActive ? ' defeated' : '')
      + (!isUnlocked ? ' locked' : '');

    card.innerHTML = `
      <div class="demon-card__emoji">${demon.emoji}</div>
      <div class="demon-card__info">
        <div class="demon-card__name">${isUnlocked ? demon.name : '???'}</div>
        <div class="demon-card__desc">${isUnlocked ? demon.desc : 'Defeat earlier demons to unlock'}</div>
        <div class="demon-card__reward">💎 ${demon.reward} emeralds</div>
        <div class="demon-card__difficulty">
          <span class="badge badge--${getDifficultyBadge(demon.difficulty)}">${demon.difficulty}</span>
          ${isDefeated ? ' <span class="badge badge--emerald">Defeated!</span>' : ''}
        </div>
      </div>
    `;

    if (isUnlocked && !isActive) {
      card.addEventListener('click', () => selectDemon(demon.id));
    }

    board.appendChild(card);
  });
};

// ── Check if demon is unlocked ───────────────────────────────────────
function isDemonUnlocked(demon, player) {
  if (!demon.unlockAfter) return true;
  return player.defeatedDemons.includes(demon.unlockAfter);
}

// ── Difficulty badge color ───────────────────────────────────────────
function getDifficultyBadge(difficulty) {
  switch (difficulty) {
    case 'Easy':   return 'common';
    case 'Medium': return 'rare';
    case 'Hard':   return 'epic';
    case 'Boss':   return 'legendary';
    default:       return 'common';
  }
}

// ── Select a demon to hunt ───────────────────────────────────────────
function selectDemon(demonId) {
  const player = getCurrentPlayer();
  if (!player) return;

  const demon = getDemonById(demonId);
  if (!demon) return;

  player.activeDemon = demonId;
  player.activeDemonHP = demon.hp;
  player.questMode = 'hunt';
  saveState();
  renderQuestScreen();
  showToast(`Targeting ${demon.name}! ${demon.emoji} Do homework to attack!`);
}

// ── Deal damage to active demon ──────────────────────────────────────
function dealDamageToDemon(isCritical = false) {
  const player = getCurrentPlayer();
  if (!player || !player.activeDemon) return null;

  const demon = getDemonById(player.activeDemon);
  if (!demon) return null;

  const damage = isCritical ? 2 : 1;
  player.activeDemonHP = Math.max(0, (player.activeDemonHP ?? demon.hp) - damage);
  saveState();

  if (player.activeDemonHP <= 0) {
    return defeatDemon(demon);
  }

  return { defeated: false, damage, hpLeft: player.activeDemonHP, demon };
}

// ── Defeat a demon ───────────────────────────────────────────────────
function defeatDemon(demon) {
  const player = getCurrentPlayer();
  if (!player) return null;

  // Mark as defeated
  if (!player.defeatedDemons.includes(demon.id)) {
    player.defeatedDemons.push(demon.id);
  }

  const result = {
    defeated: true,
    demon,
    emeralds: demon.reward,
    bonusPet: null
  };

  // Check for bonus pet drop
  if (demon.bonusPet && !ownsPet(demon.bonusPet)) {
    const pet = PETS.find(p => p.id === demon.bonusPet);
    if (pet) {
      result.bonusPet = pet;
      addPet(pet);
    }
  }

  // Clear active demon
  player.activeDemon = null;
  player.activeDemonHP = null;
  saveState();

  return result;
}

// ── Init quest event listeners ───────────────────────────────────────
function initQuests() {
  // Quest screen rendered on navigation
}
