// ==========================================================================
// EmeraldQuest — Battle Animations (attacks, critical hits, victory)
// ==========================================================================

// ── Trigger battle animation after solving homework ──────────────────
function triggerBattleAnimation(isCritical, onComplete) {
  const player = getCurrentPlayer();
  if (!player || !player.activeDemon) {
    if (onComplete) onComplete();
    return;
  }

  const demon = getDemonById(player.activeDemon);
  if (!demon) {
    if (onComplete) onComplete();
    return;
  }

  const char = CHARACTERS.find(c => c.id === player.character);

  // Show battle screen
  const battleScreen = document.getElementById('screen-battle');
  battleScreen.classList.remove('hidden');
  battleScreen.classList.add('active');

  // Set up battle display
  const playerAvatarEl = document.getElementById('battle-player-avatar');
  if (char && typeof renderCharacterSVG === 'function') {
    playerAvatarEl.innerHTML = renderCharacterSVG(char.id, player.equippedItems, { size: 'battle', animation: 'idle' });
  } else {
    playerAvatarEl.textContent = char?.emoji || '⚔️';
  }
  document.getElementById('battle-player-name').textContent = char?.name || player.name;
  document.getElementById('battle-demon-avatar').textContent = demon.emoji;
  document.getElementById('battle-demon-name').textContent = demon.name;
  document.getElementById('battle-title').textContent = 'Attack!';

  // Set HP bar to current state before damage
  const hpBefore = player.activeDemonHP ?? demon.hp;
  const hpPercentBefore = (hpBefore / demon.hp) * 100;
  document.getElementById('battle-hp-bar').style.width = hpPercentBefore + '%';

  // Animation sequence
  const actionText = document.getElementById('battle-action-text');

  // Phase 1: Charge up (0-600ms)
  actionText.textContent = 'Charging up...';
  const playerAvatar = document.getElementById('battle-player-avatar');
  playerAvatar.style.animation = 'powerUp 0.6s ease-in-out';

  setTimeout(() => {
    // Phase 2: Attack! (600ms)
    actionText.textContent = isCritical ? '💥 CRITICAL HIT!' : `${char?.weapon || '⚔️'} SLASH!`;
    playerAvatar.style.animation = 'attackSlash 0.5s ease-out';

    if (isCritical) {
      screenShake(400);
      flashScreen('gold', 150);
    }

    // Demon flinches
    const demonAvatar = document.getElementById('battle-demon-avatar');
    demonAvatar.style.animation = 'demonFlinch 0.5s ease-out';

    // Deal damage
    const result = dealDamageToDemon(isCritical);

    // Drop HP bar
    setTimeout(() => {
      if (result) {
        const hpPercent = result.defeated ? 0 : (result.hpLeft / demon.hp) * 100;
        document.getElementById('battle-hp-bar').style.width = hpPercent + '%';
      }
    }, 200);

    // Phase 3: Taunt or defeat (1200ms)
    setTimeout(() => {
      if (result && result.defeated) {
        triggerDefeatSequence(result, onComplete);
      } else {
        // Demon taunts
        const taunt = demon.taunts[Math.floor(Math.random() * demon.taunts.length)];
        actionText.textContent = `"${taunt}"`;

        // Close battle screen after taunt
        setTimeout(() => {
          closeBattleScreen();
          if (onComplete) onComplete();
        }, 1200);
      }
    }, 800);

  }, 600);
}

// ── Epic defeat sequence ─────────────────────────────────────────────
function triggerDefeatSequence(result, onComplete) {
  const actionText = document.getElementById('battle-action-text');
  const demonAvatar = document.getElementById('battle-demon-avatar');

  // Phase: Power up pose
  actionText.textContent = 'FINAL BLOW!';
  document.getElementById('battle-player-avatar').style.animation = 'powerUp 0.5s ease-in-out';

  setTimeout(() => {
    // Demon shatters
    demonAvatar.style.animation = 'demonShatter 1s ease-out forwards';
    flashScreen('white', 300);
    screenShake(600);
    createConfetti(80);

    actionText.textContent = '';
  }, 500);

  setTimeout(() => {
    // Close battle screen
    closeBattleScreen();

    // Show victory modal
    showVictoryModal(result);

    // Award emeralds
    addEmeralds(result.emeralds, `Defeated ${result.demon.name}! ⚔️`);
    increaseAllPetHappiness(10);

    if (onComplete) onComplete();
  }, 2000);
}

// ── Show victory modal ───────────────────────────────────────────────
function showVictoryModal(result) {
  const player = getCurrentPlayer();
  const char = player ? CHARACTERS.find(c => c.id === player.character) : null;

  const victoryCharEl = document.getElementById('victory-char');
  if (char && typeof renderCharacterSVG === 'function') {
    victoryCharEl.innerHTML = renderCharacterSVG(char.id, player.equippedItems, { size: 'battle', animation: 'celebrate' });
  } else {
    victoryCharEl.textContent = char?.emoji || '⚔️';
  }
  document.getElementById('victory-demon-name').textContent = `${result.demon.name} defeated!`;
  document.getElementById('victory-emeralds').textContent = `+${result.emeralds} 💎`;

  // Loot display
  const lootDiv = document.getElementById('victory-loot');
  lootDiv.innerHTML = '💎'.repeat(Math.min(result.emeralds / 5, 5));
  if (result.bonusPet) {
    lootDiv.innerHTML += ` ${result.bonusPet.emoji}`;
  }

  document.getElementById('modal-victory').classList.add('active');
  createConfetti(100);
}

// ── Close battle screen ──────────────────────────────────────────────
function closeBattleScreen() {
  const battleScreen = document.getElementById('screen-battle');
  battleScreen.classList.remove('active');
  battleScreen.classList.add('hidden');

  // Reset animations
  document.getElementById('battle-player-avatar').style.animation = '';
  document.getElementById('battle-demon-avatar').style.animation = '';
  document.getElementById('battle-action-text').textContent = '';
}

// ── Init battle event listeners ──────────────────────────────────────
function initBattle() {
  document.getElementById('btn-victory-close').addEventListener('click', () => {
    document.getElementById('modal-victory').classList.remove('active');
    // Re-render quest screen
    if (getCurrentScreen() === 'quest' || getCurrentScreen() === 'home') {
      renderQuestScreen();
    }
  });
}
