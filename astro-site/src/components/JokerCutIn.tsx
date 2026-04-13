import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * JokerCutIn — plays once per session on the home page.
 * Full-screen red overlay with Joker slide-in + "Take Your Heart" text.
 * Mirrors the original p5-intro animation from the Flask version.
 * Skipped entirely when prefers-reduced-motion is set.
 */
export default function JokerCutIn() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Show only once per browser session
    if (sessionStorage.getItem('p5IntroSeen')) return;

    // Delay start until page-reveal overlay has finished sweeping off (~650ms)
    const showTimer = setTimeout(() => setActive(true), 680);
    // Auto-dismiss after the full animation sequence completes (~2.5s after show)
    const hideTimer = setTimeout(() => {
      setActive(false);
      sessionStorage.setItem('p5IntroSeen', '1');
    }, 3200);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="p5-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          {/* White inset border frame */}
          <div className="p5-intro-frame" />

          {/* Joker character cut-in */}
          <motion.img
            src="/img/joker-cutin.png"
            className="p5-intro-joker"
            alt=""
            initial={{ opacity: 0, x: '-12%', y: '4%', rotate: -3 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            exit={{ opacity: 0, x: '12%', y: '-4%', rotate: 3 }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          />

          {/* Cyan swoosh streak */}
          <motion.div
            className="p5-intro-swoosh"
            style={{ top: '47%' }}
            initial={{ opacity: 0, x: '-6%' }}
            animate={{ opacity: 1, x: '8%' }}
            exit={{ opacity: 0, x: '28%' }}
            transition={{ duration: 0.28, delay: 0.25 }}
          >
            <svg viewBox="0 0 800 24" preserveAspectRatio="none">
              <rect width="800" height="24" fill="rgba(0,200,255,0.75)" />
            </svg>
          </motion.div>

          {/* Red swoosh streak */}
          <motion.div
            className="p5-intro-swoosh"
            style={{ top: '53%' }}
            initial={{ opacity: 0, x: '-6%' }}
            animate={{ opacity: 1, x: '8%' }}
            exit={{ opacity: 0, x: '28%' }}
            transition={{ duration: 0.28, delay: 0.32 }}
          >
            <svg viewBox="0 0 800 24" preserveAspectRatio="none">
              <rect width="800" height="24" fill="rgba(255,20,0,0.85)" />
            </svg>
          </motion.div>

          {/* "Take Your Heart" title card */}
          <motion.div
            className="p5-intro-text"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, delay: 0.45 }}
          >
            <span>Take Your Heart</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
