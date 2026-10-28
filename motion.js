// VPlanCAD text and media entrances.
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate || !('IntersectionObserver' in window)) return;
  const running = new Map();
  const states = new WeakMap();
  // Animate individual media cards instead of moving a complete model grid.
  const targets = [...document.querySelectorAll(
    '.teaser, main > section h2, main > section > p, main > section > h3, ' +
    'main > section > figure:not(.study), .study > h3, .study > .study-note, ' +
    'main > section .text-content > p, main > section .text-content > pre, .citation-pending, ' +
    '.study .input-tile, .study .method-cell, .study > figcaption'
  )];
  function reveal(element, { delay = 0, distance = 30, duration = 900, fadeOnly = false } = {}) {
    if (preference.matches || running.has(element)) return;
    const from = { opacity: 0 };
    const to = { opacity: 1 };
    if (!fadeOnly) {
      from.transform = `translate3d(0, ${distance}px, 0)`;
      to.transform = 'translate3d(0, 0, 0)';
    }
    const animation = element.animate([from, to], {
      delay, duration, easing: 'cubic-bezier(.22, .61, .36, 1)', fill: 'backwards'
    });
    running.set(element, animation);
    element.dataset.motionState = 'entering';
    animation.finished.then(() => {
      if (running.get(element) !== animation) return;
      running.delete(element);
      element.dataset.motionState = 'visible';
    }).catch(() => {});
  }
  if (window.scrollY < 40) {
    [
      ['.hero .institution-logos', 0, 12, 750],
      ['.hero h1', 100, 24, 900],
      ['.hero .authors', 260, 16, 800],
      ['.hero .affiliations', 360, 12, 750],
      ['.hero .resources', 460, 16, 750]
    ].forEach(([selector, delay, distance, duration]) => {
      const element = document.querySelector(selector);
      if (element) reveal(element, { delay, distance, duration });
    });
    const background = document.querySelector('.hero-background, .hero-gallery');
    if (background && !preference.matches) {
      const opacity = getComputedStyle(background).opacity;
      const animation = background.animate([{ opacity: 0 }, { opacity }], { duration: 1000, easing: 'ease-out' });
      running.set(background, animation);
      animation.finished.then(() => running.delete(background)).catch(() => {});
    }
  }
  const observer = new IntersectionObserver(entries => {
    const now = performance.now();
    entries.forEach(entry => {
      const element = entry.target;
      let state = states.get(element);
      if (!state) {
        state = { inside: false, entered: false, exitedAt: -Infinity };
        states.set(element, state);
      }
      if (!entry.isIntersecting) {
        if (state.inside) state.exitedAt = now;
        state.inside = false;
        // Let an entrance finish normally, even during a quick scroll reversal.
        if (!running.has(element)) element.dataset.motionState = 'outside';
        return;
      }
      if (state.inside) return;
      state.inside = true;
      if (state.entered && (now - state.exitedAt < 450 || running.has(element))) return;
      state.entered = true;
      const card = element.matches('.input-tile, .method-cell');
      const position = card ? [...element.parentElement.children].indexOf(element) : 0;
      reveal(element, {
        delay: card ? Math.min(position, 3) * 60 : 0,
        distance: entry.boundingClientRect.top < 0 ? -30 : 30,
        fadeOnly: element.tagName === 'PRE'
      });
    });
  }, { rootMargin: '0px', threshold: 0 });
  targets.forEach(element => observer.observe(element));
  // Settle a card before its model receives a drag, keeping pointer coordinates stable.
  function finishInteractiveEntrance(event) {
    const card = event.target.closest?.('.method-cell');
    if (card) running.get(card)?.finish();
  }
  document.addEventListener('pointerdown', finishInteractiveEntrance, { capture: true, passive: true });
  document.addEventListener('focusin', finishInteractiveEntrance);
  document.querySelectorAll('.image-frame img').forEach(image => { image.decoding = 'async'; });
  // Rest the decorative marquee while the reader is below the introduction.
  const background = document.querySelector('.hero-background');
  let backgroundVisible = true;
  function updateBackground() {
    if (!background) return;
    background.querySelectorAll('.hero-background-row').forEach(row => {
      row.style.animationPlayState = backgroundVisible && !document.hidden && !preference.matches ? 'running' : 'paused';
    });
  }
  if (background) {
    new IntersectionObserver(entries => {
      backgroundVisible = entries[0].isIntersecting;
      updateBackground();
    }).observe(background);
    document.addEventListener('visibilitychange', updateBackground);
  }
  preference.addEventListener('change', () => {
    updateBackground();
    if (!preference.matches) return;
    running.forEach(animation => animation.cancel());
    running.clear();
    document.querySelectorAll('[data-motion-state]').forEach(element => { element.dataset.motionState = 'visible'; });
  });
  window.addEventListener('pagehide', () => {
    running.forEach(animation => animation.cancel());
    running.clear();
  });
})();
