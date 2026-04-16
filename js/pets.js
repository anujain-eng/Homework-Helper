// ==========================================================================
// EmeraldQuest — Pet System (collection, homes, happiness, rename)
// ==========================================================================

// ── Render pets screen ───────────────────────────────────────────────
renderPetsScreen = function() {
  const player = getCurrentPlayer();
  if (!player) return;

  const grid = document.getElementById('pets-grid');
  const noMsg = document.getElementById('no-pets-msg');

  if (player.pets.length === 0) {
    grid.innerHTML = '';
    noMsg.classList.remove('hidden');
    return;
  }

  noMsg.classList.add('hidden');
  grid.innerHTML = '';

  player.pets.forEach((pet, index) => {
    const card = document.createElement('div');
    card.className = 'pet-card';
    const rarityClass = pet.rarity || 'common';

    card.innerHTML = `
      <div class="pet-card__emoji">${pet.emoji}</div>
      <div class="pet-card__name">${pet.name}</div>
      <span class="badge badge--${rarityClass}">${capitalize(rarityClass)}</span>
      <div class="pet-card__happiness">${getHappinessBar(pet.happiness)}</div>
    `;

    card.addEventListener('click', () => openPetMenu(index));
    grid.appendChild(card);
  });
};

// ── Happiness bar display ────────────────────────────────────────────
function getHappinessBar(happiness) {
  const hearts = Math.ceil((happiness || 100) / 20);
  return '❤️'.repeat(Math.min(hearts, 5)) + '🤍'.repeat(Math.max(0, 5 - hearts));
}

// ── Open pet menu (rename option) ────────────────────────────────────
function openPetMenu(petIndex) {
  const player = getCurrentPlayer();
  if (!player || !player.pets[petIndex]) return;

  const pet = player.pets[petIndex];
  document.getElementById('rename-emoji').textContent = pet.emoji;
  document.getElementById('rename-input').value = pet.name;
  document.getElementById('modal-rename').classList.add('active');

  // Store pet index for rename
  document.getElementById('modal-rename').dataset.petIndex = petIndex;
}

// ── Rename pet ───────────────────────────────────────────────────────
function renamePet() {
  const player = getCurrentPlayer();
  if (!player) return;

  const modal = document.getElementById('modal-rename');
  const index = parseInt(modal.dataset.petIndex);
  const newName = document.getElementById('rename-input').value.trim();

  if (newName && player.pets[index]) {
    player.pets[index].name = newName;
    saveState();
    renderPetsScreen();
    showToast(`Renamed to ${newName}! 🎉`);
  }

  modal.classList.remove('active');
}

// ── Add pet to player ────────────────────────────────────────────────
function addPet(petData) {
  const player = getCurrentPlayer();
  if (!player) return;

  const newPet = {
    id: petData.id,
    name: petData.name,
    emoji: petData.emoji,
    rarity: petData.rarity,
    happiness: 100
  };

  player.pets.push(newPet);
  saveState();
  createConfetti();
  showToast(`New pet: ${petData.name} ${petData.emoji}! 🎉`);
}

// ── Increase happiness for all pets (called on homework completion) ──
function increaseAllPetHappiness(amount = 5) {
  const player = getCurrentPlayer();
  if (!player) return;

  player.pets.forEach(pet => {
    pet.happiness = Math.min(100, (pet.happiness || 50) + amount);
  });
  saveState();
}

// ── Check if player owns a specific pet ──────────────────────────────
function ownsPet(petId) {
  const player = getCurrentPlayer();
  return player && player.pets.some(p => p.id === petId);
}

// ── Assign pet to home ───────────────────────────────────────────────
function assignPetToHome(petIndex, homeId) {
  const player = getCurrentPlayer();
  if (!player) return;

  // Remove pet from any existing home
  for (const [hId, pets] of Object.entries(player.petsInHomes)) {
    player.petsInHomes[hId] = pets.filter(i => i !== petIndex);
  }

  // Check home capacity
  const home = SHOP_ITEMS.homes.find(h => h.id === homeId);
  if (!home) return;

  if (!player.petsInHomes[homeId]) player.petsInHomes[homeId] = [];
  if (player.petsInHomes[homeId].length >= home.capacity) {
    showToast('This home is full! 🏠');
    return;
  }

  player.petsInHomes[homeId].push(petIndex);
  saveState();
  showToast(`${player.pets[petIndex]?.name} moved in! 🏠`);
}

// ── Capitalize helper ────────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Init pet event listeners ─────────────────────────────────────────
function initPets() {
  document.getElementById('btn-rename-confirm').addEventListener('click', renamePet);
  document.getElementById('btn-rename-cancel').addEventListener('click', () => {
    document.getElementById('modal-rename').classList.remove('active');
  });
}
