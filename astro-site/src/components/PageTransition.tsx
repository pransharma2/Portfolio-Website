import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * PageTransition — intercepts internal link clicks and plays a full-screen
 * cinematic wipe before navigating to the new page.
 *
 * Cover animation (on click):
 *   1. "Take Your TIme" video plays full-screen as the base layer
 *   2. Black diagonal panel sweeps left→right across 100vw×100vh (0.38s)
 *   3. Red diagonal panel follows with a 60ms delay (0.38s)
 *   4. "Take Your Heart" text card appears center-screen (0.18s, at 0.28s)
 *   5. Hard navigation fires at 0.75s (panels hold while new page loads)
 *
 * Reveal animation (on new page load) is handled by #p5-page-reveal in Layout
 * via a CSS keyframe — no JS coordination needed.
 *
 * Respects prefers-reduced-motion: skips animation entirely and navigates instantly.
 */
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

    // Navigate after the cover animation fills the viewport.
    // 500ms video-only window + 380ms wipe + 60ms red trail + ~360ms hold = ~1300ms total.
    setTimeout(() => {
      window.location.href = href;
    }, 1300);
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
          {/* ── Nav bar overlay — keeps navigation readable during the transition ── */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 'var(--nav-height)',
              background: 'rgba(0,0,0,0.88)',
              zIndex: 4,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* ── Transition video — framed in the content area below the nav ── */}
          <video
            autoPlay
            muted
            playsInline
            style={{
              position: 'absolute',
              top: 'var(--nav-height)',
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: 'calc(100% - var(--nav-height))',
              objectFit: 'cover',
              objectPosition: 'center top',
              zIndex: 0,
            }}
          >
            <source src="/img/Take Your TIme.webm0001-0167.mp4" type="video/mp4" />
          </video>

          {/* ── Black wipe — 500ms delay so the video plays visibly first ── */}
          <motion.div
            initial={{ clipPath: 'polygon(0% 0%, 14% 0%, 0% 100%, 0% 100%)' }}
            animate={{ clipPath: 'polygon(0% 0%, 115% 0%, 100% 100%, 0% 100%)' }}
            transition={{ duration: 0.38, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'absolute', inset: 0, background: '#0d0d0d', zIndex: 1 }}
          />

          {/* ── Red wipe — trails black panel by 60ms ── */}
          <motion.div
            initial={{ clipPath: 'polygon(0% 0%, 14% 0%, 0% 100%, 0% 100%)' }}
            animate={{ clipPath: 'polygon(0% 0%, 115% 0%, 100% 100%, 0% 100%)' }}
            transition={{ duration: 0.38, delay: 0.56, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'absolute', inset: 0, background: '#cc0000', zIndex: 2 }}
          />

          {/* ── "Take Your Heart" text card — appears mid-wipe for impact ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.7 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontFamily: "'Fjalla One', 'Bebas Neue', Impact, sans-serif",
                fontSize: 'clamp(1.4rem, 4vw, 3rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: '#fff',
                background: '#000',
                padding: '0.5em 2em',
                border: '3px solid rgba(255,255,255,0.85)',
                transform: 'skewX(-8deg)',
                display: 'inline-block',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.4)',
              }}
            >
              Take Your Heart
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
