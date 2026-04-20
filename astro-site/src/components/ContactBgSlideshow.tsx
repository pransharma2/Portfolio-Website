/**
 * ContactBgSlideshow — cycles through Persona 5 location backgrounds
 * with a crossfade transition, recreating p5ausa.com's rotating bg effect.
 *
 * Images: 10 backgrounds (bg01–bg10.jpg) in /images/contact-bg/
 * Timing: 6s per image, 1.2s crossfade — matches p5ausa.com's setInterval(6000)
 * Respects prefers-reduced-motion (shows static first image only).
 */

import { useEffect, useRef, useState } from 'react';

const IMAGES = Array.from({ length: 10 }, (_, i) =>
  `/images/contact-bg/bg${String(i + 1).padStart(2, '0')}.jpg`
);

const INTERVAL = 6000;   // ms between transitions
const FADE_MS  = 1200;   // crossfade duration

export default function ContactBgSlideshow() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) return;

    // Preload all images
    IMAGES.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Start random like p5ausa: Math.floor(Math.random()*9) + 1
    const startIdx = Math.floor(Math.random() * IMAGES.length);
    setCurrent(startIdx);
    setNext((startIdx + 1) % IMAGES.length);

    timerRef.current = setInterval(() => {
      setFading(true);
      // After fade completes, swap layers
      setTimeout(() => {
        setCurrent(prev => {
          const nextIdx = (prev + 1) % IMAGES.length;
          setNext((nextIdx + 1) % IMAGES.length);
          return nextIdx;
        });
        setFading(false);
      }, FADE_MS);
    }, INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Bottom layer — current image */}
      <div
        style={{
          ...baseStyle,
          backgroundImage: `url(${IMAGES[current]})`,
          zIndex: 0,
        }}
      />
      {/* Top layer — next image, fades in */}
      <div
        style={{
          ...baseStyle,
          backgroundImage: `url(${IMAGES[next]})`,
          zIndex: 1,
          opacity: fading ? 1 : 0,
          transition: fading ? `opacity ${FADE_MS}ms ease-in-out` : 'none',
        }}
      />
      {/* Dark scrim — keeps text readable over the photos */}
      <div
        style={{
          ...baseStyle,
          zIndex: 2,
          background: `
            linear-gradient(rgba(4, 0, 0, 0.72), rgba(4, 0, 0, 0.72)),
            repeating-linear-gradient(
              -38deg,
              transparent 0px, transparent 44px,
              rgba(180, 0, 0, 0.05) 44px, rgba(180, 0, 0, 0.05) 46px
            ),
            radial-gradient(ellipse 80% 55% at 50% 115%, rgba(160, 0, 0, 0.45) 0%, transparent 65%)
          `,
        }}
      />
    </div>
  );
}
