// ==========================================================================
// EmeraldQuest — Shop (shopkeeper, tabs, purchase, crafting)
// ==========================================================================

let _activeShopTab = 'fashion';
let _pendingPurchase = null;

// Shopkeeper greetings
const SHOPKEEPER_GREETINGS = [
  'Welcome, adventurer! Take a look at my wares!',
  'Ah, a brave demon hunter! What can I get you?',
  'Step right up! I have the finest gear in the land!',
  'Ooh, shiny emeralds! Let me show you something special!',
  'Welcome back, hero! New items just arrived!',
  'Looking fabulous today! Want to look even more fabulous?',
];

// ── Render shop screen ───────────────────────────────────────────────
renderShopScreen = function() {
  const player = getCurrentPlayer();
  if (!player) return;

  const lockedDiv = document.getElementById('shop-locked');
  const openDiv = document.getElementById('shop-open');

  if (player.emeralds < CONFIG.EMERALDS_UNLOCK_SHOP && !player.characterUnlocked) {
    // Not enough to have even entered (first time check)
    lockedDiv.style.display = '';
    openDiv.classList.add('hidden');
    return;
  }

  // Shop is open
  lockedDiv.style.display = 'none';
  openDiv.classList.remove('hidden');

  // Random greeting
  document.getElementById('shopkeeper-msg').textContent =
    SHOPKEEPER_GREETINGS[Math.floor(Math.random() * SHOPKEEPER_GREETINGS.length)];

  // Render active tab
  renderShopTab(_activeShopTab);
};

// ── Render shop items for a tab ──────────────────────────────────────
function renderShopTab(tab) {
  _activeShopTab = tab;
  const container = document.getElementById('shop-items');
  container.innerHTML = '';

  // Update tab active states
  document.querySelectorAll('#shop-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  let items = [];
  switch (tab) {
    case 'fashion':
      items = [...SHOP_ITEMS.fashion, ...SHOP_ITEMS.hair];
      break;
    case 'ears':
      items = SHOP_ITEMS.ears;
      break;
    case 'pets':
      items = PETS.filter(p => p.price > 0 && !p.special);
      break;
    case 'homes':
      items = SHOP_ITEMS.homes;
      break;
    case 'accessories':
      items = SHOP_ITEMS.accessories;
      break;
  }

  const player = getCurrentPlayer();

  items.forEach(item => {
    const owned = tab === 'pets'
      ? ownsPet(item.id)
      : tab === 'homes'
        ? player.homes.includes(item.id)
        : player.ownedItems.includes(item.id);

    const el = document.createElement('div');
    el.className = 'shop-item' + (owned ? ' owned' : '');
    el.innerHTML = `
      <div class="shop-item__emoji">${item.emoji}</div>
      <div class="shop-item__name">${item.name}</div>
      ${item.rarity ? `<span class="badge badge--${item.rarity}">${capitalize(item.rarity)}</span>` : ''}
      <div class="shop-item__price">
        ${owned ? '✅ Owned' : `💎 ${item.price}`}
      </div>
    `;

    if (!owned) {
      el.addEventListener('click', () => startPurchase(item, tab));
    }
    container.appendChild(el);
  });
}

// ── Start purchase flow ──────────────────────────────────────────────
function startPurchase(item, tab) {
  _pendingPurchase = { item, tab };

  document.getElementById('purchase-emoji').textContent = item.emoji;
  document.getElementById('purchase-title').textContent = `Buy ${item.name}?`;
  document.getElementById('purchase-desc').textContent = item.desc || '';
  document.getElementById('purchase-price').textContent = `💎 ${item.price} emeralds`;

  const canBuy = canAfford(item.price);
  const confirmBtn = document.getElementById('btn-purchase-confirm');
  confirmBtn.textContent = canBuy ? 'Buy! 💎' : 'Not enough 💎';
  confirmBtn.classList.toggle('btn--disabled', !canBuy);

  document.getElementById('modal-purchase').classList.add('active');
}

// ── Confirm purchase ─────────────────────────────────────────────────
function confirmPurchase() {
  if (!_pendingPurchase) return;
  const { item, tab } = _pendingPurchase;
  const player = getCurrentPlayer();
  if (!player) return;

  if (!spendEmeralds(item.price)) {
    showToast('Not enough emeralds! Do more homework! 💎');
    document.getElementById('modal-purchase').classList.remove('active');
    return;
  }

  // Add item to inventory
  if (tab === 'pets') {
    addPet(item);
  } else if (tab === 'homes') {
    player.homes.push(item.id);
  } else {
    player.ownedItems.push(item.id);
  }

  saveState();
  document.getElementById('modal-purchase').classList.remove('active');
  renderShopTab(_activeShopTab);
  createSparkles(window.innerWidth / 2, window.innerHeight / 2);
  showToast(`Bought ${item.name}! ${item.emoji}`);
  _pendingPurchase = null;
}

// ── Init shop event listeners ────────────────────────────────────────
function initShop() {
  // Tab clicks
  document.querySelectorAll('#shop-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => renderShopTab(tab.dataset.tab));
  });

  // Purchase modal
  document.getElementById('btn-purchase-confirm').addEventListener('click', confirmPurchase);
  document.getElementById('btn-purchase-cancel').addEventListener('click', () => {
    document.getElementById('modal-purchase').classList.remove('active');
    _pendingPurchase = null;
  });
}
