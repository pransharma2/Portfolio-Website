import { useRef, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * TextReveal — a single tasteful typography effect.
 *
 * Renders a heading with an outlined (stroked) state that fills in with a
 * diagonal wipe when it scrolls into view. Uses IntersectionObserver so it
 * only fires once. Respects prefers-reduced-motion (shows filled text immediately).
 *
 * Usage:
 *   <TextReveal tag="h2" className="section-title">Impact</TextReveal>
 */
interface Props {
  children: ReactNode;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
  className?: string;
  style?: CSSProperties;
}

export default function TextReveal({ children, tag = 'h2', className = '', style }: Props) {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  const Tag = tag as keyof JSX.IntrinsicElements;

  return (
    <Tag
      ref={ref as any}
      className={`text-reveal ${revealed ? 'text-reveal--filled' : ''} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
