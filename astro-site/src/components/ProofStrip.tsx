import { useRef, useEffect, useState } from 'react';
import type { ImpactMetric } from '../data/metrics';

interface Props {
  metrics: ImpactMetric[];
}

export default function ProofStrip({ metrics }: Props) {
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
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  return (
    <section ref={ref} className="proof-strip" aria-label="Impact metrics">
      <div className="proof-strip-inner">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`proof-metric${m.accent ? ' proof-metric--accent' : ''}${visible ? ' proof-metric--visible' : ''}`}
            style={prefersReduced ? undefined : { transitionDelay: `${i * 90}ms` }}
          >
            <span className="proof-value">{m.value}</span>
            <span className="proof-label">{m.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
