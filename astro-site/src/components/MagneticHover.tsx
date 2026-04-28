import { useRef, useCallback, type ReactNode, type CSSProperties } from 'react';

/**
 * MagneticHover — wraps any element to give it a magnetic pull-toward-cursor effect.
 *
 * On hover the child translates toward the pointer (capped at `strength` px).
 * On leave it springs back to origin. Respects prefers-reduced-motion.
 *
 * Usage:
 *   <MagneticHover strength={12}>
 *     <button className="p5-btn">Click me</button>
 *   </MagneticHover>
 */
interface Props {
  children: ReactNode;
  /** Max translation in px (default 10) */
  strength?: number;
  /** Extra class name on the wrapper */
  className?: string;
  style?: CSSProperties;
  as?: keyof HTMLElementTagNameMap;
}

export default function MagneticHover({
  children,
  strength = 10,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / (rect.width / 2)) * strength;
      const dy = ((e.clientY - cy) / (rect.height / 2)) * strength;
      ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    [strength, prefersReduced],
  );

  const onLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0, 0)';
    }
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transition: 'transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
