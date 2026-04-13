import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * PageTransition — Persona 5 "day progression" style transition.
 *
 * Intercepts internal link clicks and plays a full-screen angular panel
 * animation with a date stamp before navigating.
 *
 * Phase 1 (0–200ms):  Black angular panels sweep in from both sides
 * Phase 2 (200–600ms): Date card appears center-screen with red accent bar
 * Phase 3 (600–800ms): Panels wipe out, navigation fires
 *
 * Total: ~800ms — faster than the previous 1300ms video wipe.
 * Respects prefers-reduced-motion: skips animation, navigates instantly.
 */

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDateStamp(): { weekday: string; date: string } {
  const now = new Date();
  return {
    weekday: WEEKDAYS[now.getDay()],
    date: `${MONTHS[now.getMonth()]} ${now.getDate()}`,
  };
}

const EASE_SHARP: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function PageTransition() {
  const [covering, setCovering] = useState(false);
  const [dateStamp, setDateStamp] = useState({ weekday: '', date: '' });

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
    setDateStamp(getDateStamp());
    setCovering(true);

    // Navigate after the cover animation (800ms total)
    setTimeout(() => {
      window.location.href = href;
    }, 800);
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
          {/* ── Left angular panel — sweeps in from left ── */}
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

          {/* ── Right angular panel — sweeps in from right ── */}
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

          {/* ── Red accent slash — diagonal bar between panels ── */}
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

          {/* ── Date card — appears center-screen ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            {/* Weekday */}
            <motion.span
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.22, delay: 0.25, ease: EASE_SHARP }}
              style={{
                fontFamily: "'Fjalla One', 'Bebas Neue', Impact, sans-serif",
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#fff',
                lineHeight: 1,
                transform: 'skewX(-6deg)',
                textShadow: '3px 3px 0 rgba(0,0,0,0.5)',
              }}
            >
              {dateStamp.weekday}
            </motion.span>

            {/* Red accent bar under weekday */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2, delay: 0.3, ease: EASE_SHARP }}
              style={{
                width: 'clamp(120px, 30vw, 300px)',
                height: '4px',
                background: '#ff0000',
                margin: '0.4rem 0',
                transformOrigin: 'left center',
              }}
            />

            {/* Date (month + day) */}
            <motion.span
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.22, delay: 0.32, ease: EASE_SHARP }}
              style={{
                fontFamily: "'Fjalla One', 'Bebas Neue', Impact, sans-serif",
                fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.7)',
                transform: 'skewX(-6deg)',
              }}
            >
              {dateStamp.date}
            </motion.span>
          </motion.div>

          {/* ── Corner frame accents (angular brackets) ── */}
          {/* Top-left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.15, delay: 0.25 }}
            style={{
              position: 'absolute',
              top: '12%',
              left: '8%',
              width: '40px',
              height: '40px',
              borderTop: '3px solid #ff0000',
              borderLeft: '3px solid #ff0000',
              zIndex: 3,
            }}
          />
          {/* Bottom-right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.15, delay: 0.25 }}
            style={{
              position: 'absolute',
              bottom: '12%',
              right: '8%',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid #ff0000',
              borderRight: '3px solid #ff0000',
              zIndex: 3,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
