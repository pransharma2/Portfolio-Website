import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * TakeYourTimeTransition — Video page transition coordinator.
 *
 * Intercepts internal link clicks (capture phase) and picks between
 * TWO video transition variants (50/50):
 *
 *   1. "TAKE YOUR TIME" — full-screen P5-style clip with text overlay.
 *      Timing is slower + held longer so the destination page has
 *      time to load before the overlay wipes out.
 *   2. "P5 SUBWAY"      — subway crowd scene, fills the viewport
 *      (objectFit: cover) so it never letterboxes.
 *
 * Falls back to instant navigation if a video fails to play.
 * Respects prefers-reduced-motion (navigates instantly).
 */

const TAKE_YOUR_TIME_SRC = '/img/Take Your TIme.webm0001-0167.mp4';
const P5_SUBWAY_SRC = '/img/p5-transition-subway.webm';

const EASE_SHARP: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Variant = 'take-your-time' | 'p5-subway';
type Phase = 'idle' | 'wipe-in' | 'video' | 'wipe-out';

export default function TakeYourTimeTransition() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [variant, setVariant] = useState<Variant>('take-your-time');
  const tytVideoRef = useRef<HTMLVideoElement>(null);
  const p5SubwayRef = useRef<HTMLVideoElement>(null);
  const targetHref = useRef('');

  const handleClick = useCallback((e: MouseEvent) => {
    const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href') ?? '';
    if (!href.startsWith('/')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (anchor.target === '_blank') return;

    const targetPath = new URL(href, location.href).pathname;
    if (targetPath === location.pathname) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (e.defaultPrevented) return;

    e.preventDefault();
    e.stopPropagation();

    // Pick variant: 50/50 between TYT and subway
    const pick: Variant = Math.random() < 0.5 ? 'take-your-time' : 'p5-subway';
    setVariant(pick);
    targetHref.current = href;
    setActive(true);
    setPhase('wipe-in');
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick]);

  // Phase state machine
  useEffect(() => {
    if (phase === 'wipe-in') {
      // Slower wipe-in for TYT so the text reads; snappier for subway
      const delay = variant === 'take-your-time' ? 550 : 320;
      const timer = setTimeout(() => {
        setPhase('video');
        let videoEl: HTMLVideoElement | null = null;
        if (variant === 'take-your-time') videoEl = tytVideoRef.current;
        else videoEl = p5SubwayRef.current;

        if (videoEl) {
          if (variant === 'take-your-time') videoEl.currentTime = 0.5;
          videoEl.play().catch(() => {
            window.location.href = targetHref.current;
          });
        }
      }, delay);
      return () => clearTimeout(timer);
    }

    if (phase === 'video') {
      // Give the destination page time to load before the wipe-out reveal.
      // TYT extended to 2600ms (was 1700) so the "Take Your Time" beat reads.
      // Subway extended to 3400ms (was 3000) for a better crowd slide.
      const hold = variant === 'take-your-time' ? 2600 : 3400;
      const timer = setTimeout(() => setPhase('wipe-out'), hold);
      return () => clearTimeout(timer);
    }

    if (phase === 'wipe-out') {
      // Slower wipe-out so the new page has time to paint
      const wipeOutMs = variant === 'take-your-time' ? 650 : 550;
      const timer = setTimeout(() => {
        window.location.href = targetHref.current;
      }, wipeOutMs);
      return () => clearTimeout(timer);
    }
  }, [phase, variant]);

  const isTYT = variant === 'take-your-time';
  const isSubway = variant === 'p5-subway';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9600,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {/* ── Variant 1: Take Your Time ── */}
          {isTYT && (
            <>
              {/* Black background wipe — slower for a more confident feel */}
              <motion.div
                style={{ position: 'absolute', inset: 0, background: '#000000', zIndex: 1 }}
                initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
                animate={
                  phase === 'wipe-in' || phase === 'video'
                    ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
                    : { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }
                }
                transition={{
                  duration: phase === 'wipe-out' ? 0.55 : 0.5,
                  ease: EASE_SHARP,
                }}
              />
              {/* Red diagonal accent */}
              <motion.div
                style={{ position: 'absolute', inset: 0, background: '#cc0000', zIndex: 2 }}
                initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
                animate={
                  phase === 'wipe-in'
                    ? { clipPath: 'polygon(0 0, 15% 0, 5% 100%, 0 100%)' }
                    : phase === 'video'
                      ? { clipPath: 'polygon(0 0, 8% 0, 3% 100%, 0 100%)' }
                      : { clipPath: 'polygon(100% 0, 115% 0, 105% 100%, 100% 100%)' }
                }
                transition={{
                  duration: phase === 'wipe-out' ? 0.5 : 0.42,
                  ease: EASE_SHARP,
                  delay: phase === 'wipe-in' ? 0.12 : 0,
                }}
              />
              {/* Video layer */}
              <motion.div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 3,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'video' ? 1 : 0 }}
                transition={{ duration: 0.45, delay: phase === 'video' ? 0.1 : 0 }}
              >
                <video
                  ref={tytVideoRef}
                  src={TAKE_YOUR_TIME_SRC}
                  muted
                  playsInline
                  preload="auto"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'contain',
                    filter: 'brightness(1.1) contrast(1.1)',
                  }}
                />
              </motion.div>
              {/* Text overlay — slower fade so user has time to read */}
              <motion.div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 4,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'video' ? 1 : 0 }}
                transition={{
                  duration: phase === 'video' ? 0.55 : 0.35,
                  delay: phase === 'video' ? 0.45 : 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--p5-font)',
                    fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    color: '#fff',
                    textShadow: '0 0 20px rgba(204, 0, 0, 0.6), 2px 2px 0 #0d0d0d',
                    padding: '0.5rem 2rem',
                    background: 'rgba(204, 0, 0, 0.85)',
                    clipPath: 'polygon(0 0, calc(100% - 1rem) 0, 100% 100%, 1rem 100%)',
                  }}
                >
                  Take Your Time
                </span>
              </motion.div>
            </>
          )}

          {/* ── Variant 2: P5 Subway ── */}
          {isSubway && (
            <>
              {/* Dark backdrop so cover-cropped edges don't flash bright */}
              <motion.div
                style={{ position: 'absolute', inset: 0, background: '#0d0d0d', zIndex: 1 }}
                initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
                animate={
                  phase === 'wipe-in' || phase === 'video'
                    ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
                    : { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }
                }
                transition={{ duration: 0.35, ease: EASE_SHARP }}
              />

              {/* Red angular flash accent */}
              <motion.div
                style={{ position: 'absolute', inset: 0, zIndex: 2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'wipe-in' ? 1 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #cc0000 0%, transparent 40%, transparent 60%, #cc0000 100%)',
                  opacity: 0.6,
                }} />
              </motion.div>

              {/* Subway video — fills the viewport with objectFit: cover so
                  no black bars and edges are cropped rather than letterboxed */}
              <motion.div
                style={{
                  position: 'absolute', inset: 0,
                  zIndex: 3,
                  overflow: 'hidden',
                }}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={
                  phase === 'video'
                    ? { opacity: 1, scale: 1 }
                    : phase === 'wipe-out'
                      ? { opacity: 0, scale: 0.97 }
                      : { opacity: 0, scale: 1.08 }
                }
                transition={{ duration: 0.4, ease: EASE_SHARP }}
              >
                <video
                  ref={p5SubwayRef}
                  src={P5_SUBWAY_SRC}
                  muted
                  playsInline
                  preload="auto"
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </motion.div>

              {/* Diagonal red stripe accents during video */}
              <motion.div
                style={{ position: 'absolute', inset: 0, zIndex: 4, overflow: 'hidden' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'video' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-10%',
                  width: '6px',
                  height: '120%',
                  background: '#cc0000',
                  transform: 'rotate(15deg)',
                  transformOrigin: 'top left',
                  boxShadow: '0 0 15px rgba(204, 0, 0, 0.5)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: '-10%',
                  width: '6px',
                  height: '120%',
                  background: '#cc0000',
                  transform: 'rotate(-15deg)',
                  transformOrigin: 'top right',
                  boxShadow: '0 0 15px rgba(204, 0, 0, 0.5)',
                }} />
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
