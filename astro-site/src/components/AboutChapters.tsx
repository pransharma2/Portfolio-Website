/* ─────────────────────────────────────────────────────────────
   AboutChapters — Confidant Profile (redesign)

   Ported from deliverable/about-final.jsx (Claude Design) into
   TypeScript. Mounted by src/pages/about.astro as <AboutChapters
   client:load />.

   Real bio content preserved from the previous AboutChapters:
   experience, principles, focus, traits, outside-the-terminal.
   Drop a headshot at /public/img/portrait.jpg to light up the
   portrait slot — otherwise it shows a stylised placeholder.
   ───────────────────────────────────────────────────────────── */

import type { CSSProperties, ReactNode } from 'react';

/* ── Design tokens ── */
const aT = {
  ink:         '#0d0d0d',
  inkSoft:     '#1a1514',
  paper:       '#f2f0ed',
  paperSoft:   '#e8e5e1',
  crimson:     '#d41428',
  crimsonDeep: '#8a0a17',
  gold:        '#ffd700',
  fontDisplay: '"Shippori Mincho B1", "Shippori Mincho", serif',
  fontBody:    '"Arsenal", sans-serif',
} as const;

/* ── Real data (lifted from the old about page) ── */
interface Mission {
  op: string;
  org: string;
  role: string;
  date: string;
  bullets: string[];
}

const MISSIONS: Mission[] = [
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

interface SkillGroup { label: string; tags: string[] }
const SKILL_GROUPS: SkillGroup[] = [
  { label: 'Programming',    tags: ['Python', 'SQL', 'R', 'PySpark', 'JavaScript', 'Java', 'C', 'HTML/CSS', 'Bash', 'Shell Scripting', 'Git', 'ARM Assembly'] },
  { label: 'Data Platforms', tags: ['Power BI', 'Snowflake', 'Azure', 'Azure Data Factory', 'Databricks', 'Tableau', 'MS SQL Server', 'Microsoft Access'] },
  { label: 'Tools',          tags: ['Streamlit', 'ServiceNow', 'Jira', 'Power Apps', 'Excel', 'VS Code'] },
  { label: 'Core Strengths', tags: ['Problem-Solving', 'Analytical Thinking', 'Attention to Detail', 'Collaboration', 'Adaptability'] },
];

interface Principle { n: string; t: string; body: string }
const PRINCIPLES: Principle[] = [
  { n: '01', t: 'Build to Be Used',
    body: "Every tool, dashboard, and pipeline I build is designed for adoption — not just delivery. If the team doesn't use it, it doesn't count." },
  { n: '02', t: 'Measure the Impact',
    body: 'I track outcomes, not output. Hours saved, dollars cut, adoption rates — the numbers tell you whether the work mattered.' },
  { n: '03', t: 'Communicate Clearly',
    body: 'Technical work dies in silence. I document decisions, present findings to stakeholders, and make sure no one has to reverse-engineer my thinking.' },
  { n: '04', t: 'Stay Curious',
    body: 'New frameworks, new patterns, new problems — I learn by building. This portfolio itself is a side project in Astro, React, and motion design.' },
];

const FOCUS_ITEMS: string[] = [
  "Consulting on Suncor's enterprise data warehouse at SDK Tek Services",
  'Completing dual BComm + BSc at the University of Calgary',
  'Running 50+ student workshops as DS&ML Club Workshop Director',
  'Building portfolio projects that merge data engineering with design',
];

interface OutsideItem { label: string; detail: string }
const OUTSIDE_ITEMS: OutsideItem[] = [
  { label: 'Gaming',   detail: 'JRPGs, Persona franchise, competitive FPS — the creative fuel behind this portfolio' },
  { label: 'Fitness',  detail: 'Gym sessions for the discipline transfer — consistency in sets carries into sprints' },
  { label: 'Music',    detail: 'Lo-fi, jazz, and game soundtracks — always coding to a curated playlist' },
  { label: 'Teaching', detail: 'Breaking down complex topics until they click — in workshops, tutorials, or casual conversation' },
];

interface Trait { name: string; rank: number }
const TRAITS: Trait[] = [
  { name: 'Knowledge',   rank: 4 },
  { name: 'Proficiency', rank: 5 },
  { name: 'Charm',       rank: 3 },
  { name: 'Guts',        rank: 4 },
  { name: 'Kindness',    rank: 4 },
];

/* ── SVG pattern helpers ── */
function halftone(color = 'rgba(212,20,40,0.18)', size = 8) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<circle cx='${size / 2}' cy='${size / 2}' r='${size / 4}' fill='${color}'/>` +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
function stripes(color = 'rgba(212,20,40,0.08)', size = 16) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<line x1='0' y1='${size}' x2='${size}' y2='0' stroke='${color}' stroke-width='4'/>` +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/* ── Global keyframes (reveal + ticker). Emitted once. ── */
const GLOBAL_STYLE = `
@keyframes abt-rev-u { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
@keyframes abt-rev-l { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
@keyframes abt-rev-r { from { opacity:0; transform:translateX(30px); }  to { opacity:1; transform:translateX(0); } }
@keyframes abt-rev-s { from { opacity:0; transform:scale(0.92); }       to { opacity:1; transform:scale(1); } }
@keyframes abt-ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  [data-abt-reveal] { animation: none !important; opacity: 1 !important; transform: none !important; }
  [data-abt-ticker] { animation: none !important; }
}
`;

/* ── Reveal: pure-CSS keyframe animation, no state, no IO. ── */
type RevealDir = 'up' | 'left' | 'right' | 'scale';
function Reveal({
  id, dir = 'up', delay = 0, children, style,
}: {
  id: string;
  dir?: RevealDir;
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const animName =
    dir === 'left'  ? 'abt-rev-l' :
    dir === 'right' ? 'abt-rev-r' :
    dir === 'scale' ? 'abt-rev-s' :
                      'abt-rev-u';
  return (
    <div
      data-abt-reveal={id}
      style={{
        animation: `${animName} .7s cubic-bezier(.2,.7,.3,1) ${delay}ms both`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Skewed tag pill ── */
function Tag({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px',
      fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: 1.8,
      background: dark ? aT.ink : aT.paper, color: dark ? aT.paper : aT.ink,
      border: `1px solid ${dark ? aT.paper : aT.ink}`,
      transform: 'skewX(-4deg)',
    }}>{children}</span>
  );
}

/* ── Section header ── */
function SectionHeader({
  kicker, title, dark, id,
}: {
  kicker: string;
  title: string;
  dark?: boolean;
  id: string;
}) {
  return (
    <Reveal id={id} dir="left">
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 18, position: 'relative',
      }}>
        <span style={{
          background: aT.crimson, color: aT.paper,
          padding: '5px 14px',
          fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3,
          transform: 'skewX(-8deg)', whiteSpace: 'nowrap',
        }}>{kicker}</span>
        <h2 style={{
          margin: 0, fontFamily: aT.fontDisplay, fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 800, letterSpacing: -1,
          color: dark ? aT.paper : aT.ink, lineHeight: 1,
        }}>{title}</h2>
        <div style={{ flex: 1, height: 3, background: dark ? aT.paper : aT.ink, opacity: 0.4 }}/>
      </div>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main export
   ══════════════════════════════════════════════════════════════ */
export default function AboutChapters() {
  const portraitSrc = '/img/portrait.jpg'; // drop file here to light up the slot
  const hasPortrait = true; // <img onError> will swap to placeholder if missing

  return (
    <div style={{
      position: 'relative', width: '100%', minHeight: '100vh',
      background: aT.paper, color: aT.ink, fontFamily: aT.fontBody,
      overflowX: 'hidden',
    }}>
      <style>{GLOBAL_STYLE}</style>

      {/* ═══ sticky in-page nav ═══ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(242,240,237,0.94)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${aT.ink}22`,
        padding: '14px clamp(20px, 4vw, 32px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 14, flexWrap: 'wrap',
      }}>
        <a href="/" style={{
          fontFamily: aT.fontDisplay, fontSize: 18, fontWeight: 800,
          color: aT.ink, textDecoration: 'none',
        }}>
          PRANTAP <span style={{ color: aT.crimson }}>SHARMA</span>{' '}
          <span style={{ fontFamily: aT.fontBody, fontSize: 11, fontWeight: 400, letterSpacing: 3, opacity: 0.55 }}>
            / PORTFOLIO
          </span>
        </a>
        <nav style={{
          display: 'flex', gap: 18,
          fontFamily: aT.fontDisplay, fontSize: 12, fontWeight: 700, letterSpacing: 2,
        }}>
          <a href="/" style={{ color: aT.ink, opacity: 0.5, textDecoration: 'none' }}>○ HOME</a>
          <span style={{ color: aT.crimson }}>● ABOUT</span>
          <a href="/projects" style={{ color: aT.ink, opacity: 0.5, textDecoration: 'none' }}>○ PROJECTS</a>
          <a href="/contact" style={{ color: aT.ink, opacity: 0.5, textDecoration: 'none' }}>○ CONTACT</a>
        </nav>
      </div>

      {/* ═══ HERO ═══ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(40px, 6vw, 56px) clamp(20px, 5vw, 56px) clamp(56px, 7vw, 80px)',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: halftone('rgba(212,20,40,0.16)', 9),
          maskImage: 'radial-gradient(ellipse at 80% 30%, black, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 80% 30%, black, transparent 65%)',
        }}/>
        <div aria-hidden style={{
          position: 'absolute', right: -30, top: -20, pointerEvents: 'none',
          fontFamily: aT.fontDisplay, fontWeight: 800,
          fontSize: 'clamp(180px, 26vw, 340px)', lineHeight: 0.8,
          color: 'transparent',
          WebkitTextStroke: `2px rgba(13,13,13,0.12)`,
          letterSpacing: -14,
        }}>P.S.</div>

        <div style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, auto) 1fr',
          gap: 'clamp(24px, 4vw, 48px)',
          alignItems: 'center',
        }}
        className="abt-hero-grid"
        >
          {/* ─── PORTRAIT ─── */}
          <Reveal id="hero-portrait" dir="left">
            <div style={{ position: 'relative' }}>
              <div aria-hidden style={{
                position: 'absolute', inset: '-14px -14px auto auto',
                width: 300, height: 380,
                background: aT.crimson,
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%)',
                zIndex: 0,
              }}/>
              <div style={{
                position: 'relative', zIndex: 1,
                width: 300, height: 380,
                background: aT.ink, color: aT.paperSoft,
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%)',
                overflow: 'hidden',
                border: `3px solid ${aT.ink}`,
                boxShadow: `8px 8px 0 ${aT.crimsonDeep}`,
              }}>
                {hasPortrait ? (
                  <img
                    src={portraitSrc}
                    alt="Prantap Sharma"
                    onError={(e) => {
                      // hide broken img; show placeholder sibling
                      const el = e.currentTarget;
                      el.style.display = 'none';
                      const ph = el.nextElementSibling as HTMLElement | null;
                      if (ph) ph.style.display = 'grid';
                    }}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      filter: 'contrast(1.05) saturate(1.05)',
                      display: 'block',
                    }}
                  />
                ) : null}
                <div style={{
                  display: hasPortrait ? 'none' : 'grid',
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #2a1014 0%, #4a0a14 100%)',
                  placeItems: 'center',
                  fontFamily: aT.fontDisplay, fontSize: 13, fontWeight: 700, letterSpacing: 3,
                  color: aT.paperSoft, textAlign: 'center',
                  position: 'absolute', inset: 0,
                }}>
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>◭</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                      DROP PORTRAIT.JPG<br/>
                      IN /PUBLIC/IMG/
                    </div>
                    <div style={{ marginTop: 12, fontSize: 10, opacity: 0.6 }}>
                      SHOWN FACE-FORWARD<br/>RATIO 3 : 4
                    </div>
                  </div>
                </div>
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  padding: '4px 8px', background: aT.gold, color: aT.ink,
                  fontFamily: aT.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: 2,
                }}>★ FILE No. 04</div>
                <div style={{
                  position: 'absolute', bottom: 12, right: 18,
                  fontFamily: aT.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: 3,
                  color: aT.paper, opacity: 0.85,
                }}>CONFIDANT FILE</div>
              </div>
            </div>
          </Reveal>

          {/* ─── TEXT ─── */}
          <div>
            <Reveal id="hero-kicker" dir="up">
              <div style={{
                display: 'inline-block', padding: '5px 13px',
                background: aT.ink, color: aT.paper,
                fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3,
                transform: 'skewX(-8deg)',
              }}>▶ ABOUT / CONFIDANT FILE</div>
            </Reveal>

            <Reveal id="hero-name" dir="up" delay={120}>
              <h1 style={{
                margin: '14px 0 0', fontFamily: aT.fontDisplay,
                fontSize: 'clamp(56px, 10vw, 108px)',
                fontWeight: 800, lineHeight: 0.92, letterSpacing: -4,
              }}>
                PRANTAP<br/>
                <span style={{ color: aT.crimson }}>SHARMA</span>
                <span style={{ color: aT.crimson }}>.</span>
              </h1>
            </Reveal>

            <Reveal id="hero-title" dir="up" delay={220}>
              <p style={{
                margin: '10px 0 4px', fontFamily: aT.fontDisplay, fontStyle: 'italic',
                fontSize: 'clamp(18px, 2.2vw, 24px)',
                opacity: 0.92, maxWidth: 620, lineHeight: 1.25,
              }}>
                Data Engineer · Workshop Director · Builder.
              </p>
              <p style={{
                margin: 0, fontFamily: aT.fontBody, fontSize: 14, letterSpacing: 2,
                color: aT.crimson, fontWeight: 700,
              }}>
                CALGARY, AB — CANADIAN CITIZEN
              </p>
            </Reveal>

            <Reveal id="hero-edu" dir="up" delay={320}>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 6, marginTop: 18, maxWidth: 560,
              }}>
                {([
                  ['BComm', 'Business Analytics — University of Calgary'],
                  ['BSc',   'Computer Science — University of Calgary'],
                ] as const).map(([b, l]) => (
                  <div key={b} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontFamily: aT.fontDisplay, fontSize: 14,
                  }}>
                    <span style={{
                      padding: '4px 10px', background: aT.crimson, color: aT.paper,
                      fontWeight: 800, fontSize: 11, letterSpacing: 2,
                      transform: 'skewX(-6deg)', minWidth: 60, textAlign: 'center',
                    }}>{b}</span>
                    <span style={{ fontFamily: aT.fontBody, fontSize: 14, opacity: 0.85 }}>{l}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal id="hero-tags" dir="up" delay={420}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20, maxWidth: 600 }}>
                {['Azure', 'Snowflake', 'Power BI', 'Python', 'PySpark', 'ADF', 'Databricks', 'SQL'].map(t => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ CONFIDANT PROFILE (bio) ═══ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(56px, 7vw, 80px) clamp(20px, 5vw, 56px) 60px',
        background: aT.paperSoft,
      }}>
        <SectionHeader id="bio-h" kicker="▤ I · CONFIDANT PROFILE" title="The story behind the resume." />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24, maxWidth: 1280,
        }}>
          {([
            { id: 'bio-1', accent: true, span: 1,
              text: "I'm a dual-degree student at the University of Calgary finishing a BComm in Business Analytics alongside a BSc in Computer Science. Most of my professional time has been spent inside enterprise data platforms — building pipelines, writing automation tools, and standing up monitoring systems that teams actually rely on." },
            { id: 'bio-2', accent: false, span: 1,
              text: "At Suncor Energy, I worked across the full data stack: Azure Data Factory orchestration, Snowflake migration tooling, Power BI observability dashboards, and Python automation that cut per-object build costs by $550 each. One ingestion redesign saved over $300K annually. Now at SDK Tek Services, I'm consulting on the same warehouse — keeping pipelines healthy and pushing operational improvements." },
            { id: 'bio-3', accent: true, span: 2,
              text: "Outside of work, I direct technical workshops for the DS&ML Club at UCalgary — sessions on neural networks, cloud data engineering, SQL for data science, and applied ML. Over 50 students per workshop, 90%+ satisfaction ratings. I care about making complex ideas land clearly, whether that's in a pipeline design doc or a live coding demo." },
          ] as const).map((p, i) => (
            <Reveal
              key={p.id}
              id={p.id}
              dir={i % 2 === 0 ? 'left' : 'right'}
              delay={i * 80}
              style={{ gridColumn: p.span === 2 ? '1 / -1' : 'auto' }}
            >
              <div style={{
                background: aT.paper, color: aT.ink,
                padding: '24px 26px',
                borderLeft: p.accent ? `5px solid ${aT.crimson}` : `5px solid ${aT.ink}`,
                fontFamily: aT.fontBody, fontSize: 16, lineHeight: 1.65,
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                boxShadow: `5px 5px 0 rgba(13,13,13,0.1)`,
              }}>{p.text}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ HOW I WORK (principles) ═══ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(56px, 7vw, 80px) clamp(20px, 5vw, 56px) 70px',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: stripes('rgba(212,20,40,0.06)', 18),
        }}/>
        <SectionHeader id="how-h" kicker="▤ II · HOW I WORK" title="Four operating principles." />
        <div style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}>
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} id={`pr-${p.n}`} dir="up" delay={i * 100}>
              <div style={{
                background: aT.paper, padding: '24px 20px 22px', height: '100%',
                border: `2px solid ${aT.ink}`,
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                position: 'relative',
                boxShadow: `6px 6px 0 ${aT.crimson}`,
              }}>
                <div style={{
                  position: 'absolute', top: -12, left: 18, padding: '3px 10px',
                  background: aT.ink, color: aT.crimson,
                  fontFamily: aT.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing: 1,
                }}>{p.n}</div>
                <h3 style={{
                  margin: '10px 0 8px', fontFamily: aT.fontDisplay, fontSize: 22, fontWeight: 800,
                  letterSpacing: -0.5, lineHeight: 1.1,
                }}>{p.t}</h3>
                <p style={{
                  margin: 0, fontFamily: aT.fontBody, fontSize: 14, lineHeight: 1.55, opacity: 0.88,
                }}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ WHY I BUILD + TEACH (split panel) ═══ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(64px, 8vw, 90px) clamp(20px, 5vw, 56px)',
        background: aT.ink, color: aT.paper,
        clipPath: 'polygon(0 60px, 100% 0, 100% 100%, 0 calc(100% - 60px))',
        marginTop: -30, marginBottom: -30,
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: halftone('rgba(212,20,40,0.18)', 9),
          maskImage: 'radial-gradient(ellipse at 20% 80%, black, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 20% 80%, black, transparent 65%)',
        }}/>
        <div style={{ position: 'relative' }}>
          <SectionHeader id="why-h" kicker="▤ III · MOTIVATION" title="Why I build + teach." dark />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32, marginTop: 6,
          }}>
            <Reveal id="why-build" dir="left">
              <div>
                <div style={{
                  fontFamily: aT.fontDisplay, fontSize: 13, fontWeight: 800, letterSpacing: 3, color: aT.crimson,
                }}>▸ THE BUILDER SIDE</div>
                <h3 style={{
                  margin: '8px 0 14px', fontFamily: aT.fontDisplay, fontSize: 30, fontWeight: 800,
                  letterSpacing: -0.5, lineHeight: 1.1,
                }}>The feedback loop is immediate.</h3>
                <p style={{ fontFamily: aT.fontBody, fontSize: 15.5, lineHeight: 1.7, opacity: 0.92, margin: 0 }}>
                  Data engineering clicked for me because the work is tangible. You build a pipeline, and data flows. You write an automation script, and three hours of manual work vanishes. The feedback loop is immediate and measurable — $550 saved per object, $300K+ in annual savings, 400 tables migrated. I'm drawn to infrastructure that scales quietly and doesn't break when you're not looking.
                </p>
              </div>
            </Reveal>
            <Reveal id="why-teach" dir="right" delay={120}>
              <div>
                <div style={{
                  fontFamily: aT.fontDisplay, fontSize: 13, fontWeight: 800, letterSpacing: 3, color: aT.crimson,
                }}>▸ THE TEACHER SIDE</div>
                <h3 style={{
                  margin: '8px 0 14px', fontFamily: aT.fontDisplay, fontSize: 30, fontWeight: 800,
                  letterSpacing: -0.5, lineHeight: 1.1,
                }}>Take complex ideas, make them land.</h3>
                <p style={{ fontFamily: aT.fontBody, fontSize: 15.5, lineHeight: 1.7, opacity: 0.92, margin: 0 }}>
                  Teaching started at Kumon when I was in high school and never stopped. Now I'm running workshops at the university level — 50+ students, neural network walk-throughs, cloud data engineering deep-dives. The goal is always the same: take something complex and make it land. Not simplified — clarified. I want students to leave the session with working code and real intuition, not just slides they'll forget.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal id="why-bridge" dir="up" delay={220}>
            <div style={{
              marginTop: 34, padding: '18px 24px',
              borderTop: `3px solid ${aT.crimson}`,
              borderBottom: `3px solid ${aT.crimson}`,
              fontFamily: aT.fontDisplay, fontStyle: 'italic', fontSize: 20, lineHeight: 1.4,
              maxWidth: 920,
            }}>
              "Building and teaching reinforce each other. Building makes me a better teacher because I know what actually works in production. Teaching makes me a better builder because explaining a system forces you to truly understand it."
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CURRENT MISSION (focus) ═══ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(64px, 8vw, 90px) clamp(20px, 5vw, 56px) 60px',
      }}>
        <SectionHeader id="cm-h" kicker="▤ IV · CURRENT MISSION" title="What I'm working on right now." />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14, maxWidth: 1280,
        }}>
          {FOCUS_ITEMS.map((text, i) => (
            <Reveal key={i} id={`fo-${i}`} dir="up" delay={i * 80}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '18px 22px',
                background: aT.paper, border: `2px solid ${aT.ink}`,
                boxShadow: `5px 5px 0 ${aT.crimson}`,
              }}>
                <div style={{
                  fontFamily: aT.fontDisplay, fontSize: 30, fontWeight: 800, color: aT.crimson,
                  lineHeight: 1, minWidth: 50,
                }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontFamily: aT.fontBody, fontSize: 15, lineHeight: 1.5 }}>{text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ INFILTRATION LOG (experience) ═══ */}
      <section style={{
        position: 'relative',
        padding: '70px clamp(20px, 5vw, 56px) 60px',
        background: aT.paperSoft,
      }}>
        <SectionHeader id="il-h" kicker="▤ V · INFILTRATION LOG" title="Where I've operated." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1280 }}>
          {MISSIONS.map((m, i) => (
            <Reveal key={m.op} id={`m-${i}`} dir="up" delay={i * 80}>
              <div style={{
                background: aT.paper,
                padding: '24px 28px 22px',
                position: 'relative',
                borderLeft: `6px solid ${aT.crimson}`,
                boxShadow: `5px 5px 0 rgba(13,13,13,0.1)`,
              }}>
                <div style={{
                  position: 'absolute', top: 18, right: 24,
                  background: aT.ink, color: aT.paper,
                  padding: '4px 12px',
                  fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 2,
                }}>{m.date}</div>
                <div style={{
                  fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3, color: aT.crimson,
                  paddingRight: 140,
                }}>▸ {m.op}</div>
                <h3 style={{
                  margin: '4px 0 2px', fontFamily: aT.fontDisplay, fontSize: 24, fontWeight: 800, letterSpacing: -0.5,
                }}>{m.org}</h3>
                <div style={{
                  fontFamily: aT.fontBody, fontStyle: 'italic', fontSize: 14, opacity: 0.7, marginBottom: 12,
                }}>{m.role}</div>
                <ul style={{
                  margin: 0, paddingLeft: 20,
                  fontFamily: aT.fontBody, fontSize: 14, lineHeight: 1.6,
                }}>
                  {m.bullets.map((b, j) => (
                    <li key={j} style={{ marginBottom: 6 }}>{b}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ SOCIAL STATS + ARSENAL ═══ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(56px, 7vw, 80px) clamp(20px, 5vw, 56px) 60px',
      }}>
        <SectionHeader id="ss-h" kicker="▤ VI · SOCIAL STATS" title="Quick traits." />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 14, maxWidth: 1100, marginBottom: 30,
        }}>
          {TRAITS.map((tr, i) => (
            <Reveal key={tr.name} id={`tr-${i}`} dir="scale" delay={i * 60}>
              <div style={{
                background: aT.ink, color: aT.paper,
                padding: '18px 12px', textAlign: 'center',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                border: `2px solid ${aT.crimson}`,
              }}>
                <div style={{
                  fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3,
                  color: aT.crimson, marginBottom: 8,
                }}>RANK {tr.rank}</div>
                <div style={{
                  fontFamily: aT.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1,
                  marginBottom: 8,
                }}>{tr.name}</div>
                <div style={{ fontSize: 14, color: aT.gold, letterSpacing: 2 }}>
                  {'★'.repeat(tr.rank)}
                  <span style={{ opacity: 0.3 }}>{'★'.repeat(5 - tr.rank)}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal id="arsenal-h" dir="left">
          <h3 style={{
            margin: '14px 0 16px', fontFamily: aT.fontDisplay, fontSize: 24, fontWeight: 800, letterSpacing: -0.5,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: aT.crimson }}>▸</span> Arsenal
          </h3>
        </Reveal>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18, maxWidth: 1280,
        }}>
          {SKILL_GROUPS.map((g, i) => (
            <Reveal key={g.label} id={`sg-${i}`} dir="up" delay={i * 60}>
              <div>
                <div style={{
                  fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3,
                  color: aT.crimson, marginBottom: 8,
                }}>▤ {g.label.toUpperCase()}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {g.tags.map(t => <Tag key={t}>{t}</Tag>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ OUTSIDE THE TERMINAL ═══ */}
      <section style={{
        position: 'relative',
        padding: '70px clamp(20px, 5vw, 56px)',
        background: aT.paperSoft,
      }}>
        <SectionHeader id="ot-h" kicker="▤ VII · OUTSIDE THE TERMINAL" title="The rest of the picture." />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14, maxWidth: 1280,
        }}>
          {OUTSIDE_ITEMS.map((it, i) => (
            <Reveal
              key={it.label}
              id={`ot-${i}`}
              dir={i % 2 === 0 ? 'left' : 'right'}
              delay={i * 70}
            >
              <div style={{
                background: aT.paper, padding: '18px 18px 16px', height: '100%',
                border: `2px solid ${aT.ink}`,
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
              }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px',
                  background: aT.crimson, color: aT.paper,
                  fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 2,
                  transform: 'skewX(-6deg)', marginBottom: 10,
                }}>{it.label.toUpperCase()}</div>
                <p style={{ margin: 0, fontFamily: aT.fontBody, fontSize: 14, lineHeight: 1.55 }}>
                  {it.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ RESUME CTA ═══ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(56px, 7vw, 80px) clamp(20px, 5vw, 56px) clamp(64px, 8vw, 90px)',
        background: aT.crimson, color: aT.paper,
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: halftone('rgba(13,13,13,0.25)', 6),
        }}/>
        <Reveal id="cta" dir="up">
          <div style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30,
            maxWidth: 1280, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontFamily: aT.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3,
                opacity: 0.85, marginBottom: 4,
              }}>▤ FILE EXPORT</div>
              <h2 style={{
                margin: '2px 0 6px', fontFamily: aT.fontDisplay,
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                textShadow: `4px 4px 0 ${aT.ink}`,
              }}>Grab the Full Dossier.</h2>
              <p style={{
                margin: 0, fontFamily: aT.fontDisplay, fontStyle: 'italic',
                fontSize: 18, opacity: 0.95, maxWidth: 560,
              }}>
                Everything above, distilled into a clean one-page PDF. ATS-formatted. Designed for humans.
              </p>
            </div>
            <a
              href="/resume/Prantap_Sharma_Resume.pdf"
              download
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                padding: '18px 28px',
                background: aT.ink, color: aT.paper,
                fontFamily: aT.fontDisplay, fontSize: 15, fontWeight: 800, letterSpacing: 3,
                textDecoration: 'none',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
                boxShadow: `6px 6px 0 ${aT.paper}`,
              }}
            >
              <span>DOWNLOAD RESUME</span>
              <span style={{ color: aT.crimson, fontSize: 18 }}>↓</span>
            </a>
          </div>
        </Reveal>
      </section>

      {/* ═══ End ticker ═══ */}
      <div style={{
        background: aT.ink, color: aT.paper,
        padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap',
        fontFamily: aT.fontDisplay, fontSize: 12, fontWeight: 700, letterSpacing: 3,
        borderTop: `2px solid ${aT.crimson}`,
      }}>
        <div
          data-abt-ticker="1"
          style={{
            display: 'inline-block',
            animation: 'abt-ticker 38s linear infinite',
            paddingLeft: '100%',
          }}
        >
          ◆ END OF FILE ◆ PRANTAP SHARMA · CALGARY AB ◆ DATA ENGINEER · WORKSHOP DIRECTOR · BUILDER ◆ OPEN Q2 2026 ◆ S.PRANTAP@GMAIL.COM ◆
        </div>
      </div>
    </div>
  );
}
