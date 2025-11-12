// static/js/animations.js
(() => {
  const enter = document.getElementById('p5-enter');
  const exit  = document.getElementById('p5-exit');

  // Re-trigger the page-enter animation on each load
  if (enter) void enter.offsetWidth; // force reflow so CSS animation runs

  // Intercept internal navigation to play a page-exit swoosh
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const url = new URL(a.href, window.location.origin);
    const isInternal = url.origin === window.location.origin;
    const sameHash   = url.pathname === window.location.pathname && url.hash;

    // Respect modifiers, new tabs, externals, anchors, mailto/tel
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!isInternal || sameHash || a.target === '_blank' ||
        a.href.startsWith('mailto:') || a.href.startsWith('tel:')) return;

    e.preventDefault();
    if (exit) {
      exit.classList.add('p5-exiting');
      setTimeout(() => { window.location.href = a.href; }, 470); // slightly > CSS time
    } else {
      window.location.href = a.href;
    }
  }, true);
})();

// Optional: per-command parallax hotspot (safe if the class exists, no errors if not)
document.querySelectorAll('.command').forEach((cmd) => {
  cmd.style.setProperty('--p5-ox', '50%');
  cmd.style.setProperty('--p5-oy', '50%');

  cmd.addEventListener('mousemove', (e) => {
    const r = cmd.getBoundingClientRect();
    const ox = ((e.clientX - r.left) / r.width) * 100;
    const oy = ((e.clientY - r.top)  / r.height) * 100;
    cmd.style.setProperty('--p5-ox', `${ox}%`);
    cmd.style.setProperty('--p5-oy', `${oy}%`);
  });

  cmd.addEventListener('mouseleave', () => {
    cmd.style.setProperty('--p5-ox', '50%');
    cmd.style.setProperty('--p5-oy', '50%');
  });
});

// static/js/animations.js (replace only this DOMContentLoaded block)
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('p5-intro');
  if (!intro) return;

  // play once per tab session
  if (sessionStorage.getItem('p5IntroSeen')) return;

  // wait for the page-enter curtain to finish (~0.55s). Small buffer added.
  setTimeout(() => {
    intro.hidden = false;
    intro.classList.add('play');
  }, 600);

  intro.addEventListener('animationend', (e) => {
    if (e.animationName === 'introPanelOut') {
      intro.classList.add('done');
      sessionStorage.setItem('p5IntroSeen', '1');
    }
  });
});

