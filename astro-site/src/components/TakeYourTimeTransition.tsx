import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * TakeYourTimeTransition — Video page transition coordinator.
 *
 * Intercepts internal link clicks (capture phase)
 * and randomly selects between three video transition variants:
 *
 * 1. "TAKE YOUR TIME" — full-screen P5-style video with text overlay
 * 2. "P5 CLIP 1" — first half of the chroma-keyed P5 transition (slam)
 * 3. "P5 CLIP 2" — second half of the chroma-keyed P5 transition (grapple)
 *
 * Activation: always intercepts internal navigation.
 * Falls back to instant navigation if videos fail to load.
 */

const TAKE_YOUR_TIME_SRC = '/img/Take Your TIme.webm0001-0167.mp4';
const P5_CLIP1_SRC = '/img/p5-transition-clip1.webm';
const P5_CLIP2_SRC = '/img/p5-transition-clip2.webm';

const EASE_SHARP: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Variant = 'take-your-time' | 'p5-clip1' | 'p5-clip2';
type Phase = 'idle' | 'wipe-in' | 'video' | 'wipe-out';

export default function TakeYourTimeTransition() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [variant, setVariant] = useState<Variant>('take-your-time');
  const tytVideoRef = useRef<HTMLVideoElement>(null);
  const p5Clip1Ref = useRef<HTMLVideoElement>(null);
  const p5Clip2Ref = useRef<HTMLVideoElement>(null);
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

    // Pick variant: ~34% each
    const roll = Math.random();
    const pick: Variant = roll < 0.34 ? 'take-your-time' : roll < 0.67 ? 'p5-clip1' : 'p5-clip2';
    setVariant(pick);
    targetHref.current = href;
    setActive(true);
    setPhase('wipe-in');
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick]);

  const isP5 = variant === 'p5-clip1' || variant === 'p5-clip2';

  // Phase state machine
  useEffect(() => {
    if (phase === 'wipe-in') {
      const delay = variant === 'take-your-time' ? 400 : 300;
      const timer = setTimeout(() => {
        setPhase('video');
        let videoEl: HTMLVideoElement | null = null;
        if (variant === 'take-your-time') videoEl = tytVideoRef.current;
        else if (variant === 'p5-clip1') videoEl = p5Clip1Ref.current;
        else videoEl = p5Clip2Ref.current;

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
      // clip1 ~1s, clip2 ~2.45s, tyt ~1.7s
      const hold = variant === 'take-your-time' ? 1700 : variant === 'p5-clip1' ? 1000 : 2400;
      const timer = setTimeout(() => setPhase('wipe-out'), hold);
      return () => clearTimeout(timer);
    }

    if (phase === 'wipe-out') {
      const timer = setTimeout(() => {
        window.location.href = targetHref.current;
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [phase, variant]);

  const isTYT = variant === 'take-your-time';

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
              {/* Black background wipe */}
              <motion.div
                style={{ position: 'absolute', inset: 0, background: '#000000', zIndex: 1 }}
                initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
                animate={
                  phase === 'wipe-in' || phase === 'video'
                    ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
                    : { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }
                }
                transition={{ duration: 0.35, ease: EASE_SHARP }}
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
                transition={{ duration: 0.3, ease: EASE_SHARP, delay: phase === 'wipe-in' ? 0.1 : 0 }}
              />
              {/* Video layer */}
              <motion.div
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'video' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <video
                  ref={tytVideoRef}
                  src={TAKE_YOUR_TIME_SRC}
                  muted
                  playsInline
                  preload="auto"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(1.1) contrast(1.1)' }}
                />
              </motion.div>
              {/* Text overlay */}
              <motion.div
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'video' ? 1 : 0 }}
                transition={{ duration: 0.4, delay: phase === 'video' ? 0.3 : 0 }}
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

          {/* ── Variants 2 & 3: P5 Animation Clips ── */}
          {isP5 && (
            <>
              {/* Dark red background so Joker's silhouette is visible */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#1a0000',
                  zIndex: 1,
                }}
                initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
                animate={
                  phase === 'wipe-in' || phase === 'video'
                    ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
                    : { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }
                }
                transition={{ duration: 0.3, ease: EASE_SHARP }}
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

              {/* P5 animation video */}
              <motion.div
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={
                  phase === 'video'
                    ? { opacity: 1, scale: 1 }
                    : phase === 'wipe-out'
                      ? { opacity: 0, scale: 0.95 }
                      : { opacity: 0, scale: 1.1 }
                }
                transition={{ duration: 0.35, ease: EASE_SHARP }}
              >
                {variant === 'p5-clip1' && (
                  <video
                    ref={p5Clip1Ref}
                    src={P5_CLIP1_SRC}
                    muted
                    playsInline
                    preload="auto"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                {variant === 'p5-clip2' && (
                  <video
                    ref={p5Clip2Ref}
                    src={P5_CLIP2_SRC}
                    muted
                    playsInline
                    preload="auto"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
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
