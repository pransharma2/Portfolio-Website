// animations.js — front-end only
document.addEventListener('DOMContentLoaded', () => {
    // Add swoosh transition on nav links
    document.querySelectorAll('.p5-nav a').forEach(a => {
      a.addEventListener('click', (e) => {
        // simple page-out effect for single-page navigation feel
        document.body.classList.add('p5-page-out');
        // let navigation continue naturally
      });
    });
  });
  
  // Optional: Add a class for hover sfx (CSS handles the visuals)
  