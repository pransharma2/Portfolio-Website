import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function PageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetHref = useRef<string>('');

  useEffect(() => {
    // Listen for sound toggle events
    const handleSoundToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (videoRef.current) {
        videoRef.current.muted = detail.muted;
      }
    };
    window.addEventListener('p5-sound-toggle', handleSoundToggle);

    // Intercept internal link clicks
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor || !anchor.href) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      // Check reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      e.preventDefault();
      targetHref.current = anchor.href;
      setIsTransitioning(true);

      // Navigate after transition covers screen
      setTimeout(() => {
        window.location.href = anchor.href;
      }, 600);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('p5-sound-toggle', handleSoundToggle);
    };
  }, []);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <>
          {/* Black background sweep */}
          <motion.div
            className="p5-transition-bg"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 0.35, ease: [0.7, 0, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              background: '#0d0d0d',
              pointerEvents: 'none',
            }}
          />

          {/* Red diagonal slashes */}
          <motion.div
            className="p5-transition-slashes"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 0.3, ease: [0.7, 0, 0.3, 1], delay: 0.05 }}
            style={{
              position: 'fixed',
              inset: '-20% -30%',
              zIndex: 9999,
              background: `repeating-linear-gradient(
                -26deg,
                #ff0000 0 3.5rem,
                transparent 3.5rem 7rem
              )`,
              pointerEvents: 'none',
            }}
          />

          {/* "Take Your Time" text */}
          <motion.span
            className="p5-transition-text"
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.7, 0, 0.3, 1], delay: 0.1 }}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) skewX(-6deg)',
              zIndex: 10000,
              color: '#fff',
              fontFamily: "'Fjalla One', 'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.8rem)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: '3px 3px 0 #ff0000, -1px -1px 0 rgba(0,0,0,0.6)',
              pointerEvents: 'none',
            }}
          >
            Take Your Time
          </motion.span>

          {/* "Take Your Time" video in bottom-right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            style={{
              position: 'fixed',
              bottom: '1rem',
              right: '1rem',
              zIndex: 10001,
              width: 'min(200px, 30vw)',
              pointerEvents: 'none',
            }}
          >
            <video
              ref={videoRef}
              src="/img/Take Your TIme.webm0001-0167.mp4"
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '4px',
                mixBlendMode: 'screen',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
