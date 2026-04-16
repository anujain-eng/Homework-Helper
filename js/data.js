// ==========================================================================
// EmeraldQuest — Game Data (characters, pets, demons, shop, homes, questions)
// ==========================================================================

const SECRET_QUESTIONS = [
  'What city does your grandma live in?',
  'What is your dad\'s name?',
  'Where does your mom work?',
  'What is your pet\'s name?',
  'What is your favorite color?',
  'What is your favorite animal?',
  'What is your teacher\'s name?',
  'What is your best friend\'s name?',
  'What is your favorite food?',
  'What is your favorite cartoon or show?',
  'What street do you live on?'
];

// ── K-pop Demon Hunter Characters ────────────────────────────────────
const CHARACTERS = [
  { id: 'blaze',   name: 'Blaze',   emoji: '🔥', color: '#FF4500', desc: 'Fiery red hair, flame armor', weapon: '🗡️' },
  { id: 'luna',    name: 'Luna',    emoji: '🌙', color: '#C0C0FF', desc: 'Silver hair, moonlight robes', weapon: '🪄' },
  { id: 'jinx',    name: 'Jinx',    emoji: '💗', color: '#FF69B4', desc: 'Neon pink streak, streetwear + demon blade', weapon: '🗡️' },
  { id: 'shadow',  name: 'Shadow',  emoji: '🖤', color: '#483D8B', desc: 'All black, dark purple aura, hooded cloak', weapon: '🗡️' },
  { id: 'nova',    name: 'Nova',    emoji: '🌌', color: '#9370DB', desc: 'Galaxy hair, star armor, cosmic staff', weapon: '🪄' },
  { id: 'kai',     name: 'Kai',     emoji: '❄️', color: '#00BFFF', desc: 'Blue highlights, ice demon hunter', weapon: '🏹' },
  { id: 'rose',    name: 'Rosé',    emoji: '🌹', color: '#FFB6C1', desc: 'Pink & gold, elegant K-pop idol look', weapon: '🪄' },
  { id: 'viper',   name: 'Viper',   emoji: '🐍', color: '#32CD32', desc: 'Green snake-themed, dual daggers', weapon: '🗡️' },
  { id: 'storm',   name: 'Storm',   emoji: '⚡', color: '#1E90FF', desc: 'Electric blue, lightning effects', weapon: '🏹' },
  { id: 'sakura',  name: 'Sakura',  emoji: '🌸', color: '#FFB7C5', desc: 'Cherry blossom theme, katana', weapon: '🗡️' },
  { id: 'phoenix', name: 'Phoenix', emoji: '🔥', color: '#FF6347', desc: 'Orange/red, wings of fire', weapon: '🏹' },
  { id: 'frost',   name: 'Frost',   emoji: '🧊', color: '#B0E0E6', desc: 'White/ice blue, crystal weapons', weapon: '🗡️' }
];

// ── Pets ──────────────────────────────────────────────────────────────
const PETS = [
  // Real animals
  { id: 'dog',       name: 'Puppy',          emoji: '🐶', rarity: 'common',    price: 0  },
  { id: 'cat',       name: 'Kitty',          emoji: '🐱', rarity: 'common',    price: 10 },
  { id: 'bunny',     name: 'Bunny',          emoji: '🐰', rarity: 'common',    price: 12 },
  { id: 'panda',     name: 'Panda',          emoji: '🐼', rarity: 'rare',      price: 30 },
  { id: 'fox',       name: 'Fox',            emoji: '🦊', rarity: 'rare',      price: 35 },
  { id: 'koala',     name: 'Koala',          emoji: '🐨', rarity: 'common',    price: 15 },
  { id: 'hamster',   name: 'Hamster',        emoji: '🐹', rarity: 'common',    price: 10 },
  { id: 'parrot',    name: 'Parrot',         emoji: '🦜', rarity: 'rare',      price: 40 },
  // Fantasy creatures
  { id: 'unicorn',   name: 'Unicorn',        emoji: '🦄', rarity: 'epic',      price: 80  },
  { id: 'dragon',    name: 'Dragon',         emoji: '🐉', rarity: 'legendary', price: 150 },
  { id: 'phoenix_p', name: 'Phoenix',        emoji: '🔥', rarity: 'legendary', price: 180 },
  { id: 'starwolf',  name: 'Star Wolf',      emoji: '🐺', rarity: 'epic',      price: 90  },
  { id: 'fairy',     name: 'Fairy',          emoji: '🧚', rarity: 'rare',      price: 45  },
  { id: 'butterfly', name: 'Magic Butterfly', emoji: '🦋', rarity: 'rare',     price: 35  },
  { id: 'tiger',     name: 'Crystal Tiger',  emoji: '🐯', rarity: 'epic',      price: 100 },
  { id: 'cloudkit',  name: 'Cloud Kitten',   emoji: '☁️', rarity: 'epic',      price: 75  },
  // Birthday special
  { id: 'bday_unicorn', name: 'Birthday Unicorn', emoji: '🎂', rarity: 'legendary', price: 0, special: true }
];

// ── Demons ────────────────────────────────────────────────────────────
const DEMONS = [
  { id: 'shadow_whisper', name: 'Shadow Whisper',   emoji: '👻', hp: 3,  reward: 10, difficulty: 'Easy',   desc: 'Sneaky smoke demon', taunts: ['You can\'t see me!', 'I\'m just smoke and mirrors...'], unlockAfter: null },
  { id: 'pixel_phantom',  name: 'Pixel Phantom',    emoji: '👾', hp: 4,  reward: 15, difficulty: 'Easy',   desc: 'Glitchy ghost that haunts screens', taunts: ['G-g-glitch!', 'Error 404: your victory not found!'], unlockAfter: null },
  { id: 'neon_fang',      name: 'Neon Fang',        emoji: '🧛', hp: 5,  reward: 20, difficulty: 'Medium', desc: 'Glowing vampire with neon teeth', taunts: ['I vant your emeralds!', 'The night is mine!'], unlockAfter: 'shadow_whisper' },
  { id: 'mirror_witch',   name: 'Mirror Witch',     emoji: '🪞', hp: 5,  reward: 20, difficulty: 'Medium', desc: 'Copies your moves', taunts: ['I know what you\'re thinking!', 'Mirror mirror...'], unlockAfter: 'pixel_phantom' },
  { id: 'dark_star_dj',   name: 'Dark Star DJ',     emoji: '🎧', hp: 6,  reward: 25, difficulty: 'Medium', desc: 'Evil DJ who plays cursed beats', taunts: ['Drop the bass... of DOOM!', 'Feel the beat!'], unlockAfter: 'neon_fang' },
  { id: 'venom_idol',     name: 'Venom Idol',       emoji: '💀', hp: 7,  reward: 35, difficulty: 'Hard',   desc: 'Poison-themed K-pop villain', taunts: ['My music is toxic!', 'You\'re getting sleepy...'], unlockAfter: 'dark_star_dj' },
  { id: 'nightmare_chorus', name: 'Nightmare Chorus', emoji: '🎭', hp: 8, reward: 40, difficulty: 'Hard',  desc: 'A group of singing shadow demons', taunts: ['We sing your doom!', 'Our harmony will destroy you!'], unlockAfter: 'venom_idol' },
  { id: 'bass_drop_beast', name: 'Bass Drop Beast', emoji: '🔊', hp: 9,  reward: 45, difficulty: 'Hard',   desc: 'Giant monster made of sound waves', taunts: ['BOOM!', 'Can you handle the bass?!'], unlockAfter: 'nightmare_chorus' },
  { id: 'crimson_empress', name: 'Crimson Empress',  emoji: '👑', hp: 10, reward: 60, difficulty: 'Boss',   desc: 'Rules the demon realm', taunts: ['Bow before me!', 'I am the queen of demons!'], unlockAfter: 'bass_drop_beast' },
  { id: 'glitch_king',    name: 'The Glitch King',   emoji: '🤖', hp: 12, reward: 75, difficulty: 'Boss',   desc: 'Final boss — corrupts everything he touches', taunts: ['Y0U C4N\'T ST0P M3!', 'I am the GLITCH!'], unlockAfter: 'crimson_empress', bonusPet: 'dragon' }
];

// ── Shop Items ───────────────────────────────────────────────────────
const SHOP_ITEMS = {
  fashion: [
    { id: 'outfit_armor',   name: 'Demon Armor',      emoji: '🛡️', price: 25, type: 'clothes' },
    { id: 'outfit_stage',   name: 'K-pop Stage Outfit', emoji: '👗', price: 30, type: 'clothes' },
    { id: 'outfit_casual',  name: 'Cool Casual',      emoji: '👕', price: 15, type: 'clothes' },
    { id: 'outfit_school',  name: 'School Uniform',    emoji: '🎒', price: 10, type: 'clothes' },
    { id: 'outfit_royal',   name: 'Royal Robes',      emoji: '👘', price: 50, type: 'clothes' },
    { id: 'outfit_ninja',   name: 'Ninja Suit',       emoji: '🥷', price: 40, type: 'clothes' },
    { id: 'outfit_sparkle', name: 'Sparkle Dress',    emoji: '✨', price: 35, type: 'clothes' },
  ],
  ears: [
    { id: 'ears_bunny',   name: 'Bunny Ears',   emoji: '🐰', price: 8,  type: 'ears' },
    { id: 'ears_cat',     name: 'Cat Ears',      emoji: '🐱', price: 8,  type: 'ears' },
    { id: 'ears_fox',     name: 'Fox Ears',      emoji: '🦊', price: 10, type: 'ears' },
    { id: 'ears_bear',    name: 'Bear Ears',     emoji: '🐻', price: 8,  type: 'ears' },
    { id: 'ears_wolf',    name: 'Wolf Ears',     emoji: '🐺', price: 12, type: 'ears' },
    { id: 'ears_deer',    name: 'Deer Ears',     emoji: '🦌', price: 10, type: 'ears' },
    { id: 'ears_panda',   name: 'Panda Ears',    emoji: '🐼', price: 12, type: 'ears' },
    { id: 'ears_tiger',   name: 'Tiger Ears',    emoji: '🐯', price: 15, type: 'ears' },
    { id: 'ears_unicorn', name: 'Unicorn Horn',  emoji: '🦄', price: 20, type: 'ears' },
  ],
  pets: [], // Filled from PETS array at runtime
  homes: [
    { id: 'home_cottage',  name: 'Cozy Cottage',      emoji: '🏠', price: 25,  capacity: 2 },
    { id: 'home_treehouse', name: 'Tree House',        emoji: '🌳', price: 40,  capacity: 2 },
    { id: 'home_cave',     name: 'Crystal Cave',       emoji: '💎', price: 60,  capacity: 3 },
    { id: 'home_castle',   name: 'Cloud Castle',       emoji: '🏰', price: 100, capacity: 3 },
    { id: 'home_palace',   name: 'Underwater Palace',  emoji: '🧜', price: 120, capacity: 3 },
    { id: 'home_tower',    name: 'Star Tower',         emoji: '⭐', price: 150, capacity: 3 },
  ],
  accessories: [
    { id: 'acc_sunglasses', name: 'Cool Shades',     emoji: '🕶️', price: 5,  type: 'accessory' },
    { id: 'acc_headband',   name: 'Sparkle Headband', emoji: '💫', price: 8,  type: 'accessory' },
    { id: 'acc_earrings',   name: 'Star Earrings',   emoji: '⭐', price: 10, type: 'accessory' },
    { id: 'acc_sword',      name: 'Demon Sword',     emoji: '🗡️', price: 30, type: 'accessory' },
    { id: 'acc_staff',      name: 'Magic Staff',     emoji: '🪄', price: 30, type: 'accessory' },
    { id: 'acc_bow',        name: 'Hunter\'s Bow',   emoji: '🏹', price: 30, type: 'accessory' },
    { id: 'acc_daggers',    name: 'Twin Daggers',    emoji: '🔪', price: 25, type: 'accessory' },
    { id: 'acc_wings',      name: 'Angel Wings',     emoji: '🪽', price: 50, type: 'accessory' },
    { id: 'acc_crown',      name: 'Golden Crown',    emoji: '👑', price: 45, type: 'accessory' },
    { id: 'acc_necklace',   name: 'Emerald Necklace', emoji: '📿', price: 20, type: 'accessory' },
  ],
  hair: [
    { id: 'hair_pink',    name: 'Pink Hair',     emoji: '💗', price: 15, type: 'hair' },
    { id: 'hair_blue',    name: 'Blue Hair',     emoji: '💙', price: 15, type: 'hair' },
    { id: 'hair_silver',  name: 'Silver Hair',   emoji: '🤍', price: 20, type: 'hair' },
    { id: 'hair_rainbow', name: 'Rainbow Hair',  emoji: '🌈', price: 35, type: 'hair' },
    { id: 'hair_galaxy',  name: 'Galaxy Hair',   emoji: '🌌', price: 40, type: 'hair' },
    { id: 'hair_long',    name: 'Long Braids',   emoji: '👧', price: 12, type: 'hair' },
    { id: 'hair_ponytail', name: 'High Ponytail', emoji: '💁', price: 10, type: 'hair' },
    { id: 'hair_short',   name: 'Short & Cool',  emoji: '💇', price: 10, type: 'hair' },
  ]
};

// ── Fallback hints (when no API key is set) ──────────────────────────
const FALLBACK_HINTS = {
  math: [
    'Try breaking the big number into smaller parts!',
    'Can you draw a picture to help you see it?',
    'What if you counted on your fingers first?',
    'Try starting with what you DO know!',
    'What happens if you add/subtract just the ones place first?',
  ],
  reading: [
    'Read the sentence one more time, slowly.',
    'Can you sound out each letter?',
    'What word would make sense in that spot?',
    'Look at the picture — does it give you a clue?',
  ],
  general: [
    'Great question! What do you think the answer might be?',
    'That\'s tricky! Let\'s break it into smaller steps.',
    'You\'re so close! Try one more time!',
    'Hmm, what if we looked at it a different way?',
    'Think about what you already know about this topic.',
  ]
};
