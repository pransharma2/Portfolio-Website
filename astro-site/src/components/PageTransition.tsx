import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * PageTransition — clean angular panel wipe for internal navigation.
 *
 * Intercepts internal link clicks and plays a full-screen angular panel
 * sweep before navigating. No date/day-progression content — that lives
 * in JokerCutIn.tsx as a home-page-only intro.
 *
 * Phase 1 (0–200ms):  Black angular panels sweep in from both sides
 * Phase 2 (200–400ms): Red slash accent appears between panels
 * Phase 3 (400–650ms): Hold, then navigate
 *
 * Respects prefers-reduced-motion: skips animation, navigates instantly.
 */

const EASE_SHARP: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function PageTransition() {
  const [covering, setCovering] = useState(false);

  const handleClick = useCallback((e: MouseEvent) => {
    const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href') ?? '';

    // Only intercept same-origin internal links
    if (!href.startsWith('/')) return;
    // Respect modifier keys (open in new tab, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (anchor.target === '_blank') return;

    // Don't transition to the current page
    const targetPath = new URL(href, location.href).pathname;
    if (targetPath === location.pathname) return;

    // Bail on reduced-motion — just navigate directly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    e.preventDefault();
    setCovering(true);

    // Navigate after the cover animation
    setTimeout(() => {
      window.location.href = href;
    }, 650);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <AnimatePresence>
      {covering && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {/* Left angular panel */}
          <motion.div
            initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
            animate={{ clipPath: 'polygon(0 0, 60% 0, 50% 100%, 0 100%)' }}
            transition={{ duration: 0.2, ease: EASE_SHARP }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0d0d0d',
              zIndex: 1,
            }}
          />

          {/* Right angular panel */}
          <motion.div
            initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
            animate={{ clipPath: 'polygon(48% 0, 100% 0, 100% 100%, 38% 100%)' }}
            transition={{ duration: 0.2, ease: EASE_SHARP }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0d0d0d',
              zIndex: 1,
            }}
          />

          {/* Red accent slash between panels */}
          <motion.div
            initial={{ clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
            animate={{ clipPath: 'polygon(48% 0, 52% 0, 42% 100%, 38% 100%)' }}
            transition={{ duration: 0.18, delay: 0.08, ease: EASE_SHARP }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#cc0000',
              zIndex: 2,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
