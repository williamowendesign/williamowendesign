document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.wheel-track-wrapper');
  const track   = document.querySelector('.wheel-track');
  const panel   = document.querySelector('.project-panel');
  const dotsContainer = document.querySelector('.wheel-dots');
  const cards   = document.querySelectorAll('.project-card');
  const prevBtn = document.getElementById('wheel-prev');
  const nextBtn = document.getElementById('wheel-next');

  if (!track || !cards.length) return;

  let currentIndex = 0;
  const cardWidth  = 260 + 24; // card width + gap
  let hoverTimeout = null;
  let activeCard   = null;

  // ── DOTS ──
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'wheel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    document.querySelectorAll('.wheel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === currentIndex));
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    updateDots();
  }

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  // ── HORIZONTAL TRACKPAD SWIPE ONLY ──
  // Only fires on genuine left/right scroll (deltaX).
  // Vertical scroll (deltaY) is ignored so the page scrolls normally.
  let wheelCooldown = false;

  wrapper.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) < 5) return; // ignore vertical-only scroll
    e.preventDefault();                  // block page scroll only when swiping horizontally
    if (wheelCooldown) return;

    wheelCooldown = true;
    goTo(e.deltaX > 0 ? currentIndex + 1 : currentIndex - 1);
    setTimeout(() => { wheelCooldown = false; }, 380);
  }, { passive: false });

  // ── DRAG TO SCROLL ──
  let startX    = 0;
  let isDragging = false;

  track.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
  });

  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 40) goTo(delta < 0 ? currentIndex + 1 : currentIndex - 1);
    isDragging = false;
  });

  // ── TOUCH SWIPE ──
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  track.addEventListener('touchend',   e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) goTo(delta < 0 ? currentIndex + 1 : currentIndex - 1);
  });

  // ── HOVER TO EXPAND ──
  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (activeCard === card) return;
        activeCard = card;

        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        populatePanel(card);
        panel.classList.add('visible');
      }, 180);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
    });

    card.addEventListener('click', () => {
      if (panel.classList.contains('visible')) {
        setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    });
  });

  // close button
  document.querySelector('.panel-close')?.addEventListener('click', () => {
    const vid = panel.querySelector('video');
    if (vid) vid.pause();
    panel.classList.remove('visible');
    cards.forEach(c => c.classList.remove('active'));
    activeCard = null;
  });

  // ── POPULATE PANEL ──
  function populatePanel(card) {
    const data = card.dataset;

    document.querySelector('.panel-title').textContent          = data.title       || '';
    document.querySelector('[data-panel-type]').textContent     = data.type        || '—';
    document.querySelector('[data-panel-year]').textContent     = data.year        || '—';
    document.querySelector('[data-panel-role]').textContent     = data.role        || '—';
    document.querySelector('[data-panel-venue]').textContent    = data.venue       || '—';
    document.querySelector('.panel-description').textContent    = data.description || '';
    document.querySelector('.panel-credits').innerHTML          = data.credits     || '';

    const mediaEl = document.querySelector('.panel-media');
    mediaEl.innerHTML = '';

    if (data.video) {
      const v = document.createElement('video');
      v.src = data.video;
      v.controls = true;
      v.autoplay = true;
      v.muted = true;
      v.playsInline = true;
      mediaEl.appendChild(v);
    } else if (data.image) {
      const img = document.createElement('img');
      img.src   = data.image;
      img.alt   = data.title || '';
      mediaEl.appendChild(img);
    } else {
      mediaEl.innerHTML = `<div class="panel-media-placeholder">▷<br>media coming soon</div>`;
    }
  }
});
