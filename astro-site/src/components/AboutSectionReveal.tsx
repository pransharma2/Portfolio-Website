import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * AboutSectionReveal — scroll-triggered entrance animation for About page sections.
 *
 * Supports multiple reveal directions inspired by Persona 5's dramatic panel reveals:
 * - "up" (default): slide up + fade
 * - "left": slide from left + fade
 * - "right": slide from right + fade
 * - "scale": scale up from 0.92 + fade
 * - "slash": diagonal slash reveal (skew + translate)
 *
 * Uses IntersectionObserver (no extra deps). Respects prefers-reduced-motion.
 */

type RevealDirection = 'up' | 'left' | 'right' | 'scale' | 'slash';

interface Props {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  threshold?: number;
}

const directionStyles: Record<RevealDirection, CSSProperties> = {
  up: { opacity: 0, transform: 'translateY(3rem)' },
  left: { opacity: 0, transform: 'translateX(-3rem)' },
  right: { opacity: 0, transform: 'translateX(3rem)' },
  scale: { opacity: 0, transform: 'scale(0.92)' },
  slash: { opacity: 0, transform: 'translateX(-2rem) skewX(-4deg)' },
};

const revealedStyle: CSSProperties = {
  opacity: 1,
  transform: 'translateX(0) translateY(0) scale(1) skewX(0deg)',
};

export default function AboutSectionReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  style,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced, threshold]);

  const baseStyle: CSSProperties = prefersReduced
    ? {}
    : revealed
      ? {
          ...revealedStyle,
          transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        }
      : {
          ...directionStyles[direction],
          transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...baseStyle, ...style }}
    >
      {children}
    </div>
  );
}
