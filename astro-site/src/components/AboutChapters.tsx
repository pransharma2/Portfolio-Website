import { useRef, useState, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/* ─── Design tokens ─── */
const T = {
  ink: '#0d0d0d',
  paper: '#f2f0ed',
  paperSoft: '#e8e5e1',
  crimson: '#d41428',
  crimsonDeep: '#8a0a17',
  fontDisplay: '"Shippori Mincho B1", "Shippori Mincho", serif',
  fontBody: '"Arsenal", sans-serif',
} as const;

/* ─── Helpers ─── */
function halftoneBg(color = 'rgba(212,20,40,0.25)', size = 8) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<circle cx='${size / 2}' cy='${size / 2}' r='${size / 4}' fill='${color}'/>` +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function stripesBg(color = 'rgba(13,13,13,0.08)', gap = 10) {
  return `repeating-linear-gradient(-45deg, transparent 0 ${gap}px, ${color} ${gap}px ${gap + 1}px)`;
}

function range(a: number, b: number, t: number) {
  return Math.max(0, Math.min(1, (t - a) / (b - a)));
}

/* ─── Scroll-activated Asset ─── */
function Asset({
  children,
  style,
  appearAt,
  from = 'right',
  y,
}: {
  children: ReactNode;
  style?: CSSProperties;
  appearAt: number;
  from?: 'right' | 'left' | 'bottom';
  y: number;
}) {
  const p = range(appearAt - 250, appearAt + 50, y);
  const tx = from === 'right' ? (1 - p) * 80 : from === 'left' ? -(1 - p) * 80 : 0;
  const ty = from === 'bottom' ? (1 - p) * 60 : 0;
  const existingTransform = (style?.transform as string) || '';
  const rot = existingTransform.includes('rotate') ? '' : `rotate(${(1 - p) * -4}deg)`;
  return (
    <div
      style={{
        position: 'absolute',
        transition: 'none',
        opacity: p,
        transform: `translate(${tx}px, ${ty}px) ${rot} ${existingTransform}`.trim(),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Content data (preserved from about.astro) ─── */

const MISSIONS = [
  {
    op: 'Operation: Platform Guardian',
    org: 'SDK Tek Services Ltd',
    role: 'Data Analytics Consultant Intern',
    date: 'Jan 2026 — Present',
    bullets: [
      "Sustaining Suncor's enterprise data warehouse — triaging Azure pipeline failures, raising ServiceNow incident tickets, and troubleshooting to maintain SLA uptime.",
      'Handling requested item tickets from Suncor: access requests, Power BI report updates, and platform change requests.',
      'Built PBI reports consolidating pipeline failures across multiple data factories via Log Analytics Workspaces, then automated incident ticket generation — shifting team focus entirely from triaging to troubleshooting.',
    ],
  },
  {
    op: 'Operation: Pipeline Vanguard',
    org: 'Suncor Energy',
    role: 'Data Engineering Intern',
    date: 'Sep 2024 — Aug 2025',
    bullets: [
      'Built a Power BI monitoring app covering the full orchestration stack — pipeline statuses, Iceberg table refreshes, triggers, Snowflake query history — pulling from Log Analytics Workspaces across source-to-bronze, bronze-to-silver, and silver-to-gold layers.',
      'Developed Dim/Fact automation scripts (Python, migrated to Streamlit app) reusable by any project team in the Snowflake migration, saving $550 per object and ~3 hours per build.',
      'Drove 300K+ in annual savings by shifting ingestion of 400 SAP tables from SLT to Datasphere through an orchestration tool upgrade.',
      'Designed Azure Data Factory pipelines for Otodata and DXFleet source systems (IoT fuel tank tracking + fleet vehicle data) with dynamic pagination and daily/hourly batching logic.',
      'Upgraded the main orchestration tool to handle SQL change-tracking ingestion for tables with hundreds of millions of rows, improving pipeline scalability and reliability.',
    ],
  },
  {
    op: 'Operation: Phantom Curriculum',
    org: 'DS&ML Club — UCalgary',
    role: 'Workshop Director',
    date: 'Jul 2024 — Present',
    bullets: [
      'Developing and delivering interactive workshops consistently attended by 50+ University of Calgary students per session — topics include neural networks, data engineering, and cloud-based analytics.',
      'Sustained 90%+ satisfaction and relevance ratings, with attendee feedback highlighting clarity, effective theory-to-practice delivery, and engaging activities.',
      'Implemented incentive-based engagement programs (certificates, tournaments) to drive repeat attendance and foster long-term skill development.',
    ],
  },
  {
    op: 'Operation: Foundations',
    org: 'Kumon Math & Reading',
    role: 'Tutor',
    date: 'Dec 2019 — Sep 2024',
    bullets: [
      "Taught foundational math and reading skills across multiple grade levels, adapting content to each student's learning style.",
      'Provided individualized guidance to ensure students progressed at their own pace and consistently hit their targets.',
    ],
  },
];

const SKILL_TAGS = [
  'PYTHON', 'SQL', 'PYSPARK', 'JAVASCRIPT', 'POWER BI', 'SNOWFLAKE',
  'AZURE', 'ADF', 'DATABRICKS', 'STREAMLIT', 'GIT', 'REACT',
];

const TIMELINE = [
  { year: '2019', label: 'KUMON / TUTOR' },
  { year: '2024', label: 'SUNCOR — DATA ENG' },
  { year: '2025', label: 'WORKSHOP DIRECTOR' },
  { year: '2026', label: 'SDK TEK / CONSULTANT' },
];

/* ─── Main Component ─── */
export default function AboutChapters() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setY(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'auto',
        overflowX: 'hidden',
        background: T.paper,
        color: T.ink,
        fontFamily: T.fontBody,
        scrollBehavior: 'smooth',
      }}
    >
      {/* ── Sticky top nav ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(242,240,237,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid rgba(13,13,13,0.13)`,
          padding: '14px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800 }}>
          PRAN <span style={{ color: T.crimson }}>SHARMA</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
          <a href="/" style={{ opacity: 0.5, color: T.ink, textDecoration: 'none' }}>HOME</a>
          <span style={{ color: T.crimson }}>● ABOUT</span>
          <a href="/projects" style={{ opacity: 0.5, color: T.ink, textDecoration: 'none' }}>PROJECTS</a>
          <a href="/contact" style={{ opacity: 0.5, color: T.ink, textDecoration: 'none' }}>CONTACT</a>
        </div>
      </div>

      {/* ══════════════════════════════════════
         COVER SECTION
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '80px 48px 140px', overflow: 'hidden', minHeight: 720 }}>
        {/* halftone backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: halftoneBg('rgba(212,20,40,0.16)', 10),
            maskImage: 'radial-gradient(ellipse at 70% 30%, black, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 70% 30%, black, transparent 70%)',
          }}
        />
        {/* giant stencil numeral */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: 40,
            fontFamily: T.fontDisplay,
            fontWeight: 800,
            fontSize: 420,
            lineHeight: 0.8,
            color: 'transparent',
            WebkitTextStroke: `3px rgba(13,13,13,0.13)`,
            letterSpacing: -20,
            pointerEvents: 'none',
          }}
        >
          01
        </div>

        <div
          style={{
            display: 'inline-block',
            background: T.ink,
            color: T.paper,
            padding: '6px 14px',
            fontFamily: T.fontDisplay,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 3,
            transform: 'skewX(-8deg)',
          }}
        >
          ▶ ABOUT / DOSSIER
        </div>
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 150,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: -6,
            marginTop: 18,
          }}
        >
          PRAN<span style={{ color: T.crimson }}>.</span>
        </div>
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontStyle: 'italic',
            fontSize: 34,
            maxWidth: 700,
            marginTop: 6,
            lineHeight: 1.15,
          }}
        >
          Data engineer. Builder of tools. Five chapters, open dossier.
        </div>

        {/* dossier tags */}
        <div style={{ display: 'flex', gap: 10, marginTop: 30, flexWrap: 'wrap' }}>
          {([
            ['LOCATION', 'CALGARY ↔ REMOTE'],
            ['STATUS', 'OPEN 2026'],
            ['FIELD', 'DATA ENGINEERING'],
            ['DEGREES', 'BCOMM + BSC'],
          ] as const).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                fontFamily: T.fontDisplay,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                border: `1.5px solid ${T.ink}`,
              }}
            >
              <span style={{ background: T.ink, color: T.paper, padding: '6px 10px' }}>{k}</span>
              <span style={{ padding: '6px 12px' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* scroll cue */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 48,
            fontFamily: T.fontDisplay,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 3,
            color: T.crimson,
            animation: 'bob 2s ease-in-out infinite',
          }}
        >
          SCROLL ▼ TO DOSSIER
        </div>
      </section>

      {/* ══════════════════════════════════════
         CHAPTER 01 · PROLOGUE — Bio (from Confidant Profile)
      ══════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          background: T.ink,
          color: T.paper,
          padding: '120px 48px',
          clipPath: 'polygon(0 60px, 100% 0, 100% 100%, 0 calc(100% - 60px))',
          marginTop: -60,
          minHeight: 720,
        }}
      >
        <div style={{ maxWidth: 900 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 800, letterSpacing: 3, color: T.crimson }}>
            ▤ CHAPTER 01 · PROLOGUE
          </div>
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 220,
              fontWeight: 800,
              color: T.crimson,
              letterSpacing: -8,
              lineHeight: 0.8,
              marginTop: -10,
              textShadow: `8px 8px 0 rgba(242,240,237,0.13)`,
            }}
          >
            01
          </div>
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontWeight: 800,
              fontSize: 54,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 780,
              marginTop: 14,
            }}
          >
            I build things that feel like{' '}
            <span style={{ color: T.crimson, fontStyle: 'italic' }}>getting away with something</span>.
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 18, lineHeight: 1.65, maxWidth: 640, marginTop: 22, opacity: 0.88 }}>
            Dual-degree student at the University of Calgary finishing a BComm in Business Analytics alongside a BSc in Computer Science. Most of my professional time has been spent inside enterprise data platforms — building pipelines, writing automation tools, and standing up monitoring systems that teams actually rely on.
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 18, lineHeight: 1.65, maxWidth: 640, marginTop: 16, opacity: 0.88 }}>
            At Suncor Energy, I worked across the full data stack: Azure Data Factory orchestration, Snowflake migration tooling, Power BI observability dashboards, and Python automation that cut per-object build costs by $550 each. One ingestion redesign saved over $300K annually.
          </div>
        </div>

        {/* scroll-activated assets */}
        <Asset appearAt={500} from="right" y={y} style={{ top: 120, right: 60 }}>
          <div
            style={{
              width: 220,
              height: 140,
              background: T.crimson,
              clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: T.fontDisplay,
              fontSize: 66,
              fontWeight: 800,
              color: T.paper,
              letterSpacing: -2,
              boxShadow: `8px 8px 0 ${T.paper}`,
            }}
          >
            GO!
          </div>
        </Asset>
        <Asset appearAt={680} from="right" y={y} style={{ top: 290, right: 120 }}>
          <div
            style={{
              padding: '10px 18px',
              background: T.paper,
              color: T.ink,
              fontFamily: T.fontDisplay,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 3,
              transform: 'rotate(-4deg)',
              boxShadow: `4px 4px 0 ${T.crimson}`,
            }}
          >
            EST. 2019 / STILL SHIPPING
          </div>
        </Asset>
        <Asset appearAt={820} from="bottom" y={y} style={{ bottom: 80, right: 240 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {[0, 45, 90, 135].map((a) => (
              <rect key={a} x="85" y="10" width="10" height="160" fill={T.crimson} transform={`rotate(${a} 90 90)`} />
            ))}
            <circle cx="90" cy="90" r="28" fill={T.paper} />
            <circle cx="90" cy="90" r="14" fill={T.crimson} />
          </svg>
        </Asset>
      </section>

      {/* ══════════════════════════════════════
         CHAPTER 02 · ORIGIN — Timeline (from experience data)
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '120px 48px', minHeight: 700 }}>
        {/* background diagonal stripes */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: stripesBg('rgba(212,20,40,0.08)', 20),
          }}
        />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 56, alignItems: 'start' }}>
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 260,
              fontWeight: 800,
              color: T.ink,
              letterSpacing: -10,
              lineHeight: 0.8,
              textShadow: `10px 10px 0 ${T.crimson}`,
            }}
          >
            02
          </div>
          <div style={{ paddingTop: 30 }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 800, letterSpacing: 3, color: T.crimson }}>
              ▤ CHAPTER 02 · ORIGIN
            </div>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontSize: 54,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                maxWidth: 740,
                marginTop: 12,
              }}
            >
              CS + Business at UCalgary — data engineering from{' '}
              <span style={{ color: T.crimson }}>day one</span>.
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 17, lineHeight: 1.65, maxWidth: 600, marginTop: 20, opacity: 0.88 }}>
              Started with Kumon, moved into climate-tech internships, then enterprise data at Suncor. Now consulting on the same warehouse at SDK Tek Services while directing 50+ student workshops at UCalgary's DS&ML Club.
            </div>

            {/* timeline */}
            <div style={{ marginTop: 34, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, maxWidth: 760 }}>
              {TIMELINE.map((t) => (
                <div key={t.year} style={{ borderTop: `3px solid ${T.crimson}`, paddingTop: 10 }}>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{t.year}</div>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: 0.7 }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Asset appearAt={1350} from="left" y={y} style={{ top: 220, right: 60 }}>
          <div
            style={{
              width: 200,
              height: 200,
              border: `4px solid ${T.ink}`,
              background: T.paper,
              transform: 'rotate(8deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: T.fontDisplay,
              fontSize: 70,
              fontWeight: 800,
              color: T.crimson,
              boxShadow: `6px 6px 0 ${T.crimson}`,
            }}
          >
            06<span style={{ fontSize: 18, color: T.ink, marginLeft: 4 }}>YRS</span>
          </div>
        </Asset>
        <Asset appearAt={1520} from="right" y={y} style={{ bottom: 60, right: 210 }}>
          <div
            style={{
              padding: '8px 14px',
              fontFamily: T.fontDisplay,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              background: T.ink,
              color: T.paper,
              transform: 'rotate(3deg)',
            }}
          >
            ★ $300K+ ANNUAL SAVINGS — SUNCOR
          </div>
        </Asset>
      </section>

      {/* ══════════════════════════════════════
         CHAPTER 03 · RITUALS — Skills (from skill groups)
      ══════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          background: T.crimson,
          color: T.paper,
          padding: '120px 48px',
          clipPath: 'polygon(0 60px, 100% 0, 100% 100%, 0 calc(100% - 60px))',
          marginTop: -60,
          minHeight: 700,
          overflow: 'hidden',
        }}
      >
        {/* halftone backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            backgroundImage: halftoneBg('rgba(13,13,13,0.6)', 5),
          }}
        />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 800, letterSpacing: 3 }}>
            ▤ CHAPTER 03 · RITUALS
          </div>
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 280,
              fontWeight: 800,
              lineHeight: 0.8,
              letterSpacing: -10,
              color: T.ink,
              textShadow: `10px 10px 0 ${T.paper}`,
              marginTop: -6,
            }}
          >
            03
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 54, letterSpacing: -1.5, maxWidth: 780, marginTop: 10 }}>
            Python. SQL. Azure when the pipeline demands it.
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 17, lineHeight: 1.65, maxWidth: 600, marginTop: 18, opacity: 0.92 }}>
            Snowflake, Power BI, Databricks on the serious days; Streamlit and React on the playful ones. Opinionated about clean pipelines, testing, and naming. The answer is always automation.
          </div>

          {/* skill grid */}
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, maxWidth: 900 }}>
            {SKILL_TAGS.map((s) => (
              <div
                key={s}
                style={{
                  padding: '10px 8px',
                  background: T.ink,
                  color: T.paper,
                  fontFamily: T.fontDisplay,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textAlign: 'center',
                  border: `2px solid ${T.paper}`,
                  transform: 'skewX(-4deg)',
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <Asset appearAt={2100} from="right" y={y} style={{ top: 120, right: 60 }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <polygon points="80,10 150,80 80,150 10,80" fill={T.ink} />
            <polygon points="80,30 130,80 80,130 30,80" fill={T.paper} />
            <text x="80" y="92" textAnchor="middle" fontFamily={T.fontDisplay} fontWeight="800" fontSize="30" fill={T.crimson}>
              MAX
            </text>
          </svg>
        </Asset>
      </section>

      {/* ══════════════════════════════════════
         CHAPTER 04 · TASTE — Influences & Working Principles
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '120px 48px', minHeight: 680 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 800, letterSpacing: 3, color: T.crimson }}>
          ▤ CHAPTER 04 · TASTE
        </div>
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 220,
            fontWeight: 800,
            letterSpacing: -8,
            lineHeight: 0.8,
            marginTop: -4,
            WebkitTextStroke: `2px ${T.ink}`,
            color: 'transparent',
          }}
        >
          04
        </div>
        <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 54, letterSpacing: -1.5, maxWidth: 780, marginTop: 6 }}>
          Build to be used. Measure the{' '}
          <span style={{ color: T.crimson }}>impact</span>.
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 17, lineHeight: 1.65, maxWidth: 600, marginTop: 18, opacity: 0.85 }}>
          Every tool, dashboard, and pipeline I build is designed for adoption — not just delivery. I track outcomes, not output. Hours saved, dollars cut, adoption rates — the numbers tell you whether the work mattered.
        </div>

        {/* principle cards as polaroid-style grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 30, maxWidth: 900 }}>
          {([
            ['BUILD TO BE USED', 'adoption over delivery'],
            ['MEASURE IMPACT', '$550/obj · $300K annual'],
            ['COMMUNICATE CLEARLY', 'docs, demos, decisions'],
            ['STAY CURIOUS', 'Astro, React, Motion'],
          ] as const).map(([t, s], i) => (
            <div
              key={t}
              style={{
                aspectRatio: '3/4',
                background: T.paper,
                border: `1px solid rgba(13,13,13,0.13)`,
                padding: 10,
                boxShadow: `4px 4px 0 rgba(13,13,13,0.07)`,
                transform: `rotate(${[-2, 1.5, -1, 2][i]}deg)`,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '76%',
                  background:
                    i === 0
                      ? `linear-gradient(135deg, ${T.ink} 0%, ${T.crimson} 100%)`
                      : i === 1
                        ? `${stripesBg(T.ink, 6)}, ${T.crimson}`
                        : i === 2
                          ? `radial-gradient(circle at 30% 30%, ${T.paper}, ${T.ink})`
                          : `linear-gradient(90deg, ${T.crimson} 50%, ${T.ink} 50%)`,
                  backgroundColor: T.crimson,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: T.fontDisplay,
                  fontWeight: 800,
                  fontSize: 18,
                  color: T.paper,
                  letterSpacing: 1,
                  padding: 10,
                  textAlign: 'center',
                }}
              >
                {`0${i + 1}`}
              </div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 800, marginTop: 6, letterSpacing: 1 }}>{t}</div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700, letterSpacing: 2, opacity: 0.6 }}>{s}</div>
            </div>
          ))}
        </div>

        <Asset appearAt={2850} from="right" y={y} style={{ top: 80, right: 60 }}>
          <div
            style={{
              padding: '10px 20px',
              background: T.ink,
              color: T.paper,
              transform: 'rotate(-4deg)',
              fontFamily: T.fontDisplay,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 3,
              boxShadow: `6px 6px 0 ${T.crimson}`,
            }}
          >
            ★ 400 TABLES MIGRATED
          </div>
        </Asset>
      </section>

      {/* ══════════════════════════════════════
         CHAPTER 05 · WHAT NEXT — CTA
      ══════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          background: T.ink,
          color: T.paper,
          padding: '120px 48px 100px',
          clipPath: 'polygon(0 60px, 100% 0, 100% 100%, 0 100%)',
          marginTop: -60,
          minHeight: 600,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -80,
            top: 60,
            fontFamily: T.fontDisplay,
            fontWeight: 800,
            fontSize: 460,
            lineHeight: 0.8,
            letterSpacing: -22,
            color: T.crimson,
            opacity: 0.25,
          }}
        >
          05
        </div>
        <div style={{ position: 'relative', maxWidth: 780 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 800, letterSpacing: 3, color: T.crimson }}>
            ▤ CHAPTER 05 · WHAT NEXT
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 60, fontWeight: 800, lineHeight: 1, letterSpacing: -2, marginTop: 14 }}>
            Looking for a team that treats craft as the{' '}
            <span style={{ color: T.crimson, fontStyle: 'italic' }}>job</span>, not a bonus.
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 18, lineHeight: 1.65, marginTop: 20, opacity: 0.88, maxWidth: 620 }}>
            Especially interested in data engineering, dev tools, and platform work. Say hi — I reply to every message, even the weird ones. Especially the weird ones.
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
            <a
              href="/contact"
              style={{
                background: T.crimson,
                color: T.paper,
                padding: '16px 26px',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                fontFamily: T.fontDisplay,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 2,
                border: 'none',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              SEND A MESSAGE →
            </a>
            <a
              href="/resume/Prantap_Sharma_Resume.pdf"
              download
              style={{
                background: 'transparent',
                color: T.paper,
                padding: '16px 26px',
                border: `2px solid ${T.paper}`,
                fontFamily: T.fontDisplay,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 2,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              RESUME.PDF ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── Colophon ── */}
      <div
        style={{
          padding: '30px 48px',
          background: T.paper,
          color: T.ink,
          borderTop: `2px solid ${T.ink}`,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: T.fontDisplay,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
        }}
      >
        <span>END OF DOSSIER · © PRAN SHARMA 2026</span>
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none',
            border: 'none',
            color: T.ink,
            fontFamily: T.fontDisplay,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            cursor: 'pointer',
          }}
        >
          ↑ BACK TO TOP
        </button>
      </div>
    </div>
  );
}
