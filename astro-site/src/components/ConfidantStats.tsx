import { useRef, useEffect, useState } from 'react';

/**
 * ConfidantStats — Persona 5-inspired animated stat bars.
 *
 * Maps professional strengths into a visual stat system with
 * animated fill bars that trigger on scroll. Uses IntersectionObserver.
 * Respects prefers-reduced-motion.
 */

interface Stat {
  label: string;
  value: number; // 0–100
  icon: string;  // single char/emoji used as accent
}

const stats: Stat[] = [
  { label: 'Systems Thinking', value: 90, icon: '\u2699' },    // gear
  { label: 'Teaching',         value: 92, icon: '\u270E' },    // pencil
  { label: 'Communication',    value: 88, icon: '\u2709' },    // envelope
  { label: 'Experimentation',  value: 85, icon: '\u26A1' },    // lightning
  { label: 'Reliability',      value: 91, icon: '\u2714' },    // check
  { label: 'Design Sense',     value: 80, icon: '\u25C6' },    // diamond
];

export default function ConfidantStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  return (
    <div ref={ref} className="confidant-stats">
      {stats.map((stat, i) => (
        <div key={stat.label} className="cs-stat">
          <div className="cs-stat-header">
            <span className="cs-stat-icon" aria-hidden="true">{stat.icon}</span>
            <span className="cs-stat-label">{stat.label}</span>
            <span className="cs-stat-value">{stat.value}</span>
          </div>
          <div className="cs-stat-track">
            <div
              className="cs-stat-fill"
              style={{
                width: visible ? `${stat.value}%` : '0%',
                transitionDelay: prefersReduced ? '0ms' : `${i * 100 + 200}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
