import { useRef, useEffect, useState } from 'react';
import type { Workshop } from '../data/workshops';

interface Props {
  workshops: Workshop[];
}

export default function WorkshopSection({ workshops }: Props) {
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
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  return (
    <section ref={ref} className="workshop-section" aria-label="Workshops">
      <h2 className="workshop-section-title">Workshop Archive</h2>
      <div className="workshop-grid">
        {workshops.map((w, i) => (
          <article
            key={w.title}
            className={`workshop-card${visible ? ' workshop-card--visible' : ''}`}
            style={prefersReduced ? undefined : { transitionDelay: `${i * 100}ms` }}
          >
            <div className="workshop-card-header">
              <h3 className="workshop-card-title">{w.title}</h3>
              <span className="workshop-card-attendance">{w.attendance} attendees</span>
            </div>
            <div className="workshop-card-meta">
              <span className="workshop-card-topic">{w.topic}</span>
              <span className="workshop-card-format">{w.format}</span>
            </div>
            <p className="workshop-card-summary">{w.summary}</p>
            <div className="workshop-card-tools">
              {w.tools.map((t) => (
                <span key={t} className="p5-tag">{t}</span>
              ))}
            </div>
            {w.slidesLink && (
              <a
                href={w.slidesLink}
                className="workshop-card-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Slides &#8599;
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
