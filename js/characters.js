// ==========================================================================
// EmeraldQuest — K-pop Demon Hunter Characters (selection + dress-up)
// ==========================================================================

// ── Render character screen ──────────────────────────────────────────
renderCharacterScreen = function() {
  const player = getCurrentPlayer();
  if (!player) return;

  const unlockMsg = document.getElementById('character-unlock-msg');
  const selectionDiv = document.getElementById('character-selection');
  const equipDiv = document.getElementById('character-equip');

  if (!player.characterUnlocked && player.emeralds < CONFIG.EMERALDS_UNLOCK_CHARACTER) {
    unlockMsg.classList.remove('hidden');
    selectionDiv.classList.add('hidden');
    equipDiv.classList.add('hidden');
    return;
  }

  if (!player.characterUnlocked && player.emeralds >= CONFIG.EMERALDS_UNLOCK_CHARACTER) {
    unlockMsg.innerHTML = `
      <p>🎉 You have enough emeralds!</p>
      <button class="btn btn--primary" id="btn-unlock-character">Unlock Characters! (2 💎)</button>
    `;
    unlockMsg.classList.remove('hidden');
    selectionDiv.classList.add('hidden');
    equipDiv.classList.add('hidden');

    document.getElementById('btn-unlock-character').addEventListener('click', () => {
      if (spendEmeralds(CONFIG.EMERALDS_UNLOCK_CHARACTER)) {
        player.characterUnlocked = true;
        saveState();
        renderCharacterScreen();
        createConfetti();
        showToast('Characters unlocked! Pick your hero! ⚔️');
      }
    });
    return;
  }

  unlockMsg.classList.add('hidden');
  selectionDiv.classList.remove('hidden');

  const grid = document.getElementById('character-grid');
  grid.innerHTML = '';
  CHARACTERS.forEach(char => {
    const card = document.createElement('div');
    card.className = 'character-card' + (player.character === char.id ? ' selected' : '');
    const preview = document.createElement('div');
    preview.className = 'character-card__preview';
    preview.innerHTML = renderCharacterMini(char.id);
    card.appendChild(preview);
    const name = document.createElement('div');
    name.className = 'character-card__name';
    name.textContent = char.name;
    card.appendChild(name);
    card.addEventListener('click', () => selectCharacter(char.id));
    grid.appendChild(card);
  });

  if (player.character) {
    const char = CHARACTERS.find(c => c.id === player.character);
    if (char) {
      const avatarDiv = document.getElementById('char-avatar');
      avatarDiv.innerHTML = renderCharacterSVG(char.id, player.equippedItems, { size: 'full', animation: 'idle' });

      document.getElementById('char-name').textContent = char.name;

      const equipped = document.getElementById('char-equipped');
      equipped.innerHTML = '';
      const eq = player.equippedItems;
      if (eq.clothes)   equipped.innerHTML += getItemEmoji(eq.clothes);
      if (eq.hair)      equipped.innerHTML += getItemEmoji(eq.hair);
      if (eq.ears)      equipped.innerHTML += getItemEmoji(eq.ears);
      if (eq.accessory) equipped.innerHTML += getItemEmoji(eq.accessory);

      equipDiv.classList.remove('hidden');
      renderEquipSlots(player);

      document.getElementById('header-avatar').textContent = char.emoji;
    }
  } else {
    document.getElementById('char-avatar').innerHTML = '<span style="font-size:4rem">❓</span>';
    document.getElementById('char-name').textContent = 'Pick a character!';
    document.getElementById('char-equipped').innerHTML = '';
    equipDiv.classList.add('hidden');
  }
};

// ── Select a character ───────────────────────────────────────────────
function selectCharacter(charId) {
  const player = getCurrentPlayer();
  if (!player || !player.characterUnlocked) return;

  player.character = charId;
  const char = CHARACTERS.find(c => c.id === charId);
  if (char) {
    document.getElementById('header-avatar').textContent = char.emoji;
  }
  saveState();
  renderCharacterScreen();
  showToast(`You are now ${char?.name}! ⚔️`);
}

// ── Render equip slots ───────────────────────────────────────────────
function renderEquipSlots(player) {
  renderEquipCategory('equip-clothes', 'clothes', player);
  renderEquipCategory('equip-hair', 'hair', player);
  renderEquipCategory('equip-ears', 'ears', player);
  renderEquipCategory('equip-accessories', 'accessory', player);
}

function renderEquipCategory(containerId, category, player) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const ownedIds = player.ownedItems.filter(id => {
    const item = findShopItem(id);
    return item && item.type === category;
  });

  if (ownedIds.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'equip-slot';
    empty.textContent = '➕';
    empty.title = 'Buy from the shop!';
    empty.addEventListener('click', () => showScreen('shop'));
    container.appendChild(empty);
    return;
  }

  const noneSlot = document.createElement('div');
  noneSlot.className = 'equip-slot' + (!player.equippedItems[category] ? ' filled' : '');
  noneSlot.textContent = '❌';
  noneSlot.title = 'Unequip';
  noneSlot.addEventListener('click', () => {
    player.equippedItems[category] = null;
    saveState();
    renderCharacterScreen();
  });
  container.appendChild(noneSlot);

  ownedIds.forEach(id => {
    const item = findShopItem(id);
    if (!item) return;
    const slot = document.createElement('div');
    slot.className = 'equip-slot' + (player.equippedItems[category] === id ? ' filled' : '');
    slot.textContent = item.emoji;
    slot.title = item.name;
    slot.addEventListener('click', () => {
      player.equippedItems[category] = id;
      saveState();
      renderCharacterScreen();
      showToast(`Equipped ${item.name}!`);
    });
    container.appendChild(slot);
  });
}

// ── Helper: find shop item by ID ─────────────────────────────────────
function findShopItem(itemId) {
  const allItems = [
    ...SHOP_ITEMS.fashion,
    ...SHOP_ITEMS.ears,
    ...SHOP_ITEMS.accessories,
    ...SHOP_ITEMS.hair
  ];
  return allItems.find(i => i.id === itemId);
}

// ── Helper: get item emoji by ID ─────────────────────────────────────
function getItemEmoji(itemId) {
  const item = findShopItem(itemId);
  return item ? item.emoji : '';
}
