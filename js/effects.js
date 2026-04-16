// ==========================================================================
// EmeraldQuest — Visual Effects (star field, confetti, sparkles, shake)
// ==========================================================================

// ── Star Field (canvas) ──────────────────────────────────────────────
let _stars = [];
let _shootingStars = [];
let _starCanvas, _starCtx;

function initStarField() {
  _starCanvas = document.getElementById('star-canvas');
  if (!_starCanvas) return;
  _starCtx = _starCanvas.getContext('2d');

  function resize() {
    _starCanvas.width = window.innerWidth;
    _starCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create stars
  _stars = [];
  const count = Math.min(150, Math.floor(window.innerWidth * window.innerHeight / 5000));
  for (let i = 0; i < count; i++) {
    _stars.push({
      x: Math.random() * _starCanvas.width,
      y: Math.random() * _starCanvas.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      alphaSpeed: Math.random() * 0.02 + 0.005,
      alphaDir: 1
    });
  }

  requestAnimationFrame(animateStars);
}

function animateStars() {
  if (!_starCtx) return;
  _starCtx.clearRect(0, 0, _starCanvas.width, _starCanvas.height);

  // Draw twinkling stars
  _stars.forEach(star => {
    star.alpha += star.alphaSpeed * star.alphaDir;
    if (star.alpha >= 1) { star.alpha = 1; star.alphaDir = -1; }
    if (star.alpha <= 0.2) { star.alpha = 0.2; star.alphaDir = 1; }

    _starCtx.beginPath();
    _starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    _starCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    _starCtx.fill();
  });

  // Randomly spawn shooting stars
  if (Math.random() < 0.003 && _shootingStars.length < 2) {
    _shootingStars.push({
      x: Math.random() * _starCanvas.width * 0.5,
      y: Math.random() * _starCanvas.height * 0.3,
      len: Math.random() * 60 + 40,
      speed: Math.random() * 4 + 3,
      alpha: 1
    });
  }

  // Draw shooting stars
  _shootingStars.forEach((ss, i) => {
    ss.x += ss.speed;
    ss.y += ss.speed * 0.6;
    ss.alpha -= 0.01;

    if (ss.alpha <= 0 || ss.x > _starCanvas.width || ss.y > _starCanvas.height) {
      _shootingStars.splice(i, 1);
      return;
    }

    const gradient = _starCtx.createLinearGradient(
      ss.x, ss.y, ss.x - ss.len, ss.y - ss.len * 0.6
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    _starCtx.beginPath();
    _starCtx.moveTo(ss.x, ss.y);
    _starCtx.lineTo(ss.x - ss.len, ss.y - ss.len * 0.6);
    _starCtx.strokeStyle = gradient;
    _starCtx.lineWidth = 2;
    _starCtx.stroke();
  });

  requestAnimationFrame(animateStars);
}

// ── Confetti ─────────────────────────────────────────────────────────
function createConfetti(count = 60) {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF6B9D', '#50C878', '#FFD700'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = '-10px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (Math.random() * 8 + 6) + 'px';
    piece.style.height = (Math.random() * 8 + 6) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), CONFIG.CONFETTI_DURATION_MS);
  }
}

// ── Sparkles at a point ──────────────────────────────────────────────
function createSparkles(x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.cssText = `
      position: fixed;
      left: ${x + (Math.random() - 0.5) * 40}px;
      top: ${y + (Math.random() - 0.5) * 40}px;
      font-size: ${Math.random() * 12 + 10}px;
      pointer-events: none;
      z-index: var(--z-effects);
      animation: sparkle 0.6s ease-out forwards;
      animation-delay: ${Math.random() * 0.2}s;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
  }
}

// ── Screen shake ─────────────────────────────────────────────────────
function screenShake(duration = 500) {
  document.body.style.animation = `screenShake ${duration}ms ease-out`;
  setTimeout(() => { document.body.style.animation = ''; }, duration);
}

// ── Flash overlay ────────────────────────────────────────────────────
function flashScreen(color = 'white', duration = 200) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; inset: 0;
    background: ${color};
    z-index: 9999;
    pointer-events: none;
    opacity: 0.8;
    transition: opacity ${duration}ms;
  `;
  document.body.appendChild(flash);
  requestAnimationFrame(() => { flash.style.opacity = '0'; });
  setTimeout(() => flash.remove(), duration);
}

// ── Ripple on button click ───────────────────────────────────────────
function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// ── Add ripple to all buttons ────────────────────────────────────────
function initRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) addRipple(e);
  });
}

// ── Toast notification ───────────────────────────────────────────────
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
