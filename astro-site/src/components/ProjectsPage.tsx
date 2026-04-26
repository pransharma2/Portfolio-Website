import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { Project } from '../data/projects';
import { CATEGORY_LABELS } from '../data/projects';

/* ─── Design tokens ─── */
const T = {
  ink: '#0d0d0d',
  paper: '#f2f0ed',
  crimson: '#d41428',
  crimsonDeep: '#8a0a17',
  gold: '#ffd700',
  fontDisplay: '"Shippori Mincho B1","Shippori Mincho",serif',
  fontBody: '"Arsenal",sans-serif',
} as const;

function halftoneBg(color = 'rgba(212,20,40,0.25)', size = 8) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<circle cx='${size / 2}' cy='${size / 2}' r='${size / 4}' fill='${color}'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/* ─── Filter categories ─── */
const CATS: [string, string][] = [
  ['all', 'ALL'],
  ['workshops', 'WORKSHOPS'],
  ['teaching', 'TEACHING'],
  ['public-projects', 'PUBLIC'],
  ['professional', 'PROFESSIONAL'],
];

/* ─── Project Card ─── */
function ProjectCard({ p, onOpen }: { p: Project; onOpen: (p: Project) => void }) {
  const [hover, setHover] = useState(false);
  const isPro = p.category === 'professional';
  const showImage = !isPro; // image slot only for non-professional cards
  const thumb = p.images?.[0];
  return (
    <button
      onClick={() => onOpen(p)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left', cursor: 'pointer', position: 'relative',
        background: isPro ? 'rgba(13,13,13,0.82)' : 'rgba(242,240,237,0.97)',
        color: isPro ? T.paper : T.ink,
        // Extra top padding so the top-right status + category stack fits
        // inside the clipPath without being cut off.
        padding: '44px 22px 20px',
        border: p.featured ? `2px solid ${T.crimson}` : `1px solid ${isPro ? 'rgba(242,240,237,0.22)' : 'rgba(13,13,13,0.18)'}`,
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
        boxShadow: hover
          ? `8px 8px 0 ${T.crimson}, inset 0 0 0 1px ${isPro ? T.paper : T.ink}`
          : `4px 4px 0 ${T.crimson}`,
        transform: hover ? 'translate(-3px,-3px)' : 'translate(0,0)',
        transition: 'transform .18s cubic-bezier(.76,0,.24,1), box-shadow .18s',
        fontFamily: T.fontBody,
      }}
    >
      {/* Top-right stack: status badge + category chip.
          Both are positioned INSIDE the card so the clipPath doesn't chop
          the top of the "COMPLETE" / "ONGOING" / "IN PROGRESS" labels. */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        zIndex: 2,
      }}>
        {p.status && (
          <span style={{
            background: p.status === 'completed' ? T.ink : p.status === 'ongoing' ? T.crimson : T.gold,
            color: p.status === 'in-progress' ? T.ink : T.paper,
            padding: '3px 10px', fontFamily: T.fontDisplay, fontSize: 9,
            fontWeight: 800, letterSpacing: 2, whiteSpace: 'nowrap',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.35)',
          }}>
            {p.status === 'in-progress' ? 'IN PROGRESS' : p.status === 'ongoing' ? 'ONGOING' : 'COMPLETE'}
          </span>
        )}
        <span style={{
          background: isPro ? T.paper : T.ink,
          color: isPro ? T.ink : T.paper,
          padding: '4px 9px', fontFamily: T.fontDisplay, fontSize: 10,
          fontWeight: 800, letterSpacing: 2, whiteSpace: 'nowrap',
          transform: 'skewX(-6deg)',
        }}>{CATEGORY_LABELS[p.category] ?? p.category}</span>
      </div>

      {/* Title */}
      <h3 style={{
        margin: 0, fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 800,
        lineHeight: 1.15, letterSpacing: -0.5,
        // Reserve room on the right for the absolute top-right stack
        paddingRight: 'clamp(90px, 28%, 150px)',
      }}>{p.title}</h3>

      {/* Image slot (public / workshops / teaching only) */}
      {showImage && (
        <div style={{
          marginTop: 14,
          width: '100%',
          height: 130,
          position: 'relative',
          background: thumb
            ? `url('${thumb}') center/cover no-repeat`
            : 'linear-gradient(135deg, rgba(13,13,13,0.08) 0%, rgba(212,20,40,0.08) 100%)',
          border: `1px solid ${isPro ? 'rgba(242,240,237,0.18)' : 'rgba(13,13,13,0.18)'}`,
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
          overflow: 'hidden',
        }}>
          {!thumb && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3,
              color: 'rgba(13,13,13,0.35)',
              backgroundImage: halftoneBg('rgba(13,13,13,0.06)', 6),
            }}>▤ IMAGE</div>
          )}
          {/* Subtle inner corner accent to match P5 geometry */}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderBottom: `10px solid ${T.crimson}`,
            transform: 'rotate(180deg)',
            opacity: 0.85,
          }} />
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: 10,
        marginTop: 10, fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        opacity: 0.7,
      }}>
        <span>{p.company}</span>
        <span>{p.date}</span>
      </div>

      {p.role && (
        <div style={{
          marginTop: 8, fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 700,
          letterSpacing: 1.5, color: T.crimson,
        }}>▸ {p.role}</div>
      )}

      <p style={{
        margin: '14px 0 12px', fontFamily: T.fontBody, fontSize: 14, lineHeight: 1.5,
        opacity: 0.88,
      }}>{p.summary}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {p.tags.slice(0, 4).map(t => (
          <span key={t} style={{
            padding: '3px 8px',
            background: isPro ? 'rgba(242,240,237,0.12)' : 'rgba(13,13,13,0.06)',
            border: `1px solid ${isPro ? 'rgba(242,240,237,0.25)' : 'rgba(13,13,13,0.2)'}`,
            fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          }}>{t}</span>
        ))}
        {p.tags.length > 4 && (
          <span style={{
            padding: '3px 8px', color: T.crimson,
            fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
          }}>+{p.tags.length - 4}</span>
        )}
      </div>

      {p.featured && (
        <div style={{
          position: 'absolute', bottom: 8, right: 10, color: T.crimson,
          fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: 2,
        }}>★ FEATURED</div>
      )}
    </button>
  );
}

/* ─── Modal ─── */
function ProjectModal({ p, onClose }: { p: Project | null; onClose: () => void }) {
  if (!p) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 40,
        background: 'rgba(5,5,6,0.78)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: T.paper, color: T.ink,
        width: 'min(820px, 100%)', maxHeight: '86vh', overflow: 'auto',
        position: 'relative',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%)',
        boxShadow: `12px 12px 0 ${T.crimson}`,
      }}>
        {/* header */}
        <div style={{
          padding: '22px 32px', background: T.ink, color: T.paper,
          display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3, color: T.crimson }}>
              ▤ {CATEGORY_LABELS[p.category]} · {p.date}
            </div>
            <h2 style={{ margin: '6px 0 0', fontFamily: T.fontDisplay, fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>{p.title}</h2>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, opacity: 0.7, marginTop: 4 }}>
              {p.company}{p.role ? ` · ${p.role}` : ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: T.crimson, color: T.paper, border: 'none',
            width: 38, height: 38, fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800,
            cursor: 'pointer', clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)',
          }}>✕</button>
        </div>

        {/* body */}
        <div style={{ padding: '26px 32px 32px' }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 15, lineHeight: 1.65, margin: 0 }}>
            {p.description || p.summary}
          </p>

          {p.outcome && (
            <div style={{
              marginTop: 18, padding: '14px 18px',
              borderLeft: `4px solid ${T.crimson}`,
              background: 'rgba(212,20,40,0.08)',
              fontFamily: T.fontBody, fontSize: 14, lineHeight: 1.55,
            }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3, color: T.crimson, marginBottom: 4 }}>OUTCOME</div>
              {p.outcome}
            </div>
          )}

          {p.covered && p.covered.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3, color: T.crimson, marginBottom: 8 }}>COVERED</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: T.fontBody, fontSize: 14, lineHeight: 1.6 }}>
                {p.covered.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
              </ul>
            </div>
          )}

          {/* tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18 }}>
            {p.tags.map(t => (
              <span key={t} style={{
                padding: '4px 9px',
                background: T.ink, color: T.paper,
                fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700, letterSpacing: 2,
                transform: 'skewX(-4deg)',
              }}>{t}</span>
            ))}
          </div>

          {/* public links */}
          {p.publicLinks && p.publicLinks.length > 0 && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3, color: T.crimson, marginBottom: 2 }}>LINKS</div>
              {p.publicLinks.map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                  color: T.crimson, fontFamily: T.fontBody, fontSize: 14,
                  textDecoration: 'underline',
                }}>
                  {l.label} →
                </a>
              ))}
            </div>
          )}

          {/* audience + format */}
          {(p.audience || p.format) && (
            <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {p.audience && (
                <div style={{ fontFamily: T.fontBody, fontSize: 13, opacity: 0.7 }}>
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: 2, color: T.crimson }}>AUDIENCE </span>
                  {p.audience}
                </div>
              )}
              {p.format && (
                <div style={{ fontFamily: T.fontBody, fontSize: 13, opacity: 0.7 }}>
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: 2, color: T.crimson }}>FORMAT </span>
                  {p.format}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Stats from real data ─── */
function computeStats(projects: Project[]) {
  const workshops = projects.filter(p => p.category === 'workshops').length;
  return [
    [String(workshops).padStart(2, '0'), 'WORKSHOPS'],
    ['50+', 'STUDENTS / SESSION'],
    ['$300K', 'IN SAVINGS'],
    ['400', 'TABLES MIGRATED'],
  ] as const;
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function ProjectsPage({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    return filter === 'all' ? [...projects] : projects.filter(p => p.category === filter);
  }, [filter, projects]);

  const mainList = filtered.filter(p => p.category !== 'professional');
  const proList = filtered.filter(p => p.category === 'professional');
  const showPro = (filter === 'all' || filter === 'professional') && proList.length > 0;
  const stats = useMemo(() => computeStats(projects), [projects]);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh', overflow: 'hidden',
      background: T.ink, color: T.paper, fontFamily: T.fontBody,
    }}>
      {/* Crimson halftone overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: halftoneBg('rgba(212,20,40,0.12)', 7),
        maskImage: 'radial-gradient(ellipse at 80% 20%, black, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 80% 20%, black, transparent 70%)',
        mixBlendMode: 'screen',
      }} />

      {/* SCROLLABLE CONTENT */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'auto', overflowX: 'hidden', zIndex: 2 }}>
        {/* Top nav */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          padding: '18px 32px',
          background: 'linear-gradient(180deg, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.55) 100%)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(242,240,237,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800 }}>
            PRAN <span style={{ color: T.crimson }}>SHARMA</span>{' '}
            <span style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 400, letterSpacing: 3, opacity: 0.55 }}>/ PORTFOLIO</span>
          </div>
          <div style={{ display: 'flex', gap: 18, fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
            <a href="/" style={{ opacity: 0.55, color: T.paper, textDecoration: 'none' }}>HOME</a>
            <a href="/about" style={{ opacity: 0.55, color: T.paper, textDecoration: 'none' }}>ABOUT</a>
            <span style={{ color: T.crimson }}>● PROJECTS</span>
            <a href="/contact" style={{ opacity: 0.55, color: T.paper, textDecoration: 'none' }}>CONTACT</a>
          </div>
        </div>

        {/* HERO */}
        <section style={{ position: 'relative', padding: '56px 48px 30px' }}>
          <div style={{
            position: 'absolute', right: -30, top: -30, pointerEvents: 'none',
            fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 360, lineHeight: 0.8,
            letterSpacing: -16, color: 'transparent',
            WebkitTextStroke: '2px rgba(212,20,40,0.25)',
          }}>P.C.</div>

          <div style={{
            display: 'inline-block', padding: '6px 14px',
            background: T.crimson, color: T.paper,
            fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 800, letterSpacing: 3,
            transform: 'skewX(-8deg)',
          }}>▶ PROJECTS / COMPENDIUM</div>

          <h1 style={{
            margin: '14px 0 4px',
            fontFamily: T.fontDisplay, fontSize: 96, fontWeight: 800, lineHeight: 0.95,
            letterSpacing: -3,
          }}>
            PERSONA <span style={{ color: T.crimson }}>COMPENDIUM</span><span style={{ color: T.crimson }}>.</span>
          </h1>
          <p style={{
            margin: 0, fontFamily: T.fontDisplay, fontStyle: 'italic', fontSize: 22, opacity: 0.88,
            maxWidth: 780,
          }}>
            Workshops taught, pipelines shipped, tools built. Tap a card to open the file.
          </p>

          {/* quick stats */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {stats.map(([k, v]) => (
              <div key={v} style={{
                display: 'flex', alignItems: 'baseline', gap: 10,
                padding: '10px 16px',
                background: 'rgba(13,13,13,0.6)',
                border: '1px solid rgba(242,240,237,0.14)',
                clipPath: 'polygon(6% 0, 100% 0, 94% 100%, 0 100%)',
              }}>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 800, color: T.crimson, letterSpacing: -1 }}>{k}</span>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700, letterSpacing: 2, opacity: 0.65 }}>{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FILTER BAR */}
        <div style={{ padding: '12px 48px 0' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATS.map(([k, label]) => {
              const active = filter === k;
              return (
                <button key={k} onClick={() => setFilter(k)} style={{
                  padding: '9px 16px',
                  background: active ? T.crimson : 'transparent',
                  color: T.paper,
                  border: active ? `2px solid ${T.crimson}` : '1.5px solid rgba(242,240,237,0.28)',
                  fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 2,
                  cursor: 'pointer', clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
                  transition: 'all .15s',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN GRID */}
        {mainList.length > 0 && (
          <section style={{
            padding: '24px 48px 16px',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          }}>
            {mainList.map(p => <ProjectCard key={p.id} p={p} onOpen={setSelected} />)}
          </section>
        )}

        {/* PROFESSIONAL HIGHLIGHTS */}
        {showPro && (
          <section style={{
            margin: '20px 0 0', padding: '40px 48px 30px',
            position: 'relative',
            background: 'rgba(13,13,13,0.55)',
            borderTop: `2px solid ${T.crimson}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 4 }}>
              <span style={{
                fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 3, color: T.crimson,
              }}>▤ DOSSIER</span>
              <h2 style={{
                margin: 0, fontFamily: T.fontDisplay, fontSize: 34, fontWeight: 800, letterSpacing: -1,
              }}>Professional Highlights</h2>
            </div>
            <p style={{
              margin: '0 0 20px', fontFamily: T.fontBody, fontSize: 14, opacity: 0.65, maxWidth: 620,
            }}>
              Selected impact from employer-owned work — details kept concise to respect confidentiality.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {proList.map(p => <ProjectCard key={p.id} p={p} onOpen={setSelected} />)}
            </div>
          </section>
        )}

        {/* Colophon */}
        <div style={{
          padding: '20px 48px 30px',
          display: 'flex', justifyContent: 'space-between',
          fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700, letterSpacing: 3, opacity: 0.55,
        }}>
          <span>END OF COMPENDIUM · © PRAN SHARMA 2026</span>
          <span>DATA SOURCE · src/data/projects.ts</span>
        </div>
      </div>

      <ProjectModal p={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
