// animations.js
(function () {
  const enter = document.getElementById('p5-enter');
  const exit  = document.getElementById('p5-exit');

  // Play the page-enter overlay (it's already in the DOM)
  if (enter) {
    // Force reflow so the CSS animation runs every time
    void enter.offsetWidth;
    // nothing else needed; CSS handles animation
  }

  // Intercept internal nav for a page-exit swoosh
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    // ignore new tab/middle-click/externals/anchors/mailto/tel
    const url = new URL(a.href, window.location.origin);
    const isInternal = url.origin === window.location.origin;
    const sameHash = url.pathname === window.location.pathname && url.hash;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!isInternal || sameHash || a.target === '_blank' || a.href.startsWith('mailto:') || a.href.startsWith('tel:')) return;

    e.preventDefault();
    if (exit) {
      exit.classList.add('p5-exiting');
      // match CSS @keyframes duration (.45s); give a tiny buffer
      setTimeout(() => { window.location.href = a.href; }, 470);
    } else {
      window.location.href = a.href;
    }
  }, true);
})();
