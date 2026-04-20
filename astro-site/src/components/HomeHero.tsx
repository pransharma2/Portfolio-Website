import { useState } from 'react';
import type { CSSProperties } from 'react';
import WeatherWidget from './WeatherWidget';
import SoundToggle from './SoundToggle';
import JokerCutIn from './JokerCutIn';

/* ─── Design tokens (mirror CSS custom props) ─── */
const T = {
  ink: '#0d0d0d',
  paper: '#f2f0ed',
  crimson: '#d41428',
  fontDisplay: '"Shippori Mincho B1", "Shippori Mincho", serif',
  fontBody: '"Arsenal", sans-serif',
} as const;

/* ─── Halftone dot SVG data-uri ─── */
function halftoneBg(color = 'rgba(212,20,40,0.25)', size = 8) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<circle cx='${size / 2}' cy='${size / 2}' r='${size / 4}' fill='${color}'/>` +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/* ─── Nav button data ─── */
const NAV_BUTTONS = [
  { key: 'about', num: 'I',   href: '/about',    img: '/img/about-me.png', imgAlt: 'ABOUT ME', sub: 'who · rituals · origin' },
  { key: 'proj',  num: 'II',  href: '/projects', img: '/img/projects.png', imgAlt: 'PROJECTS', sub: 'case files · experiments' },
  { key: 'cont',  num: 'III', href: '/contact',  img: '/img/contact.png',  imgAlt: 'CONTACT',  sub: 'mail · socials · availability' },
] as const;

/* ─── Social link data (preserved from existing index.astro) ─── */
const SOCIALS = [
  {
    key: 'gh',
    label: 'GITHUB',
    href: 'https://github.com/pransharma2',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.56-.3-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.47.12-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.64 1.6.24 2.77.12 3.06.74.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.68.42.36.78 1.07.78 2.16v3.2c0 .32.2.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
  {
    key: 'li',
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/in/prantap-sharma-2ab1662bb',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.97-1.8-2.97-1.8 0-2.08 1.4-2.08 2.87V21h-4V9z" />
      </svg>
    ),
  },
  {
    key: 'em',
    label: 'EMAIL',
    href: 'mailto:s.prantap@gmail.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <rect x="2.5" y="4.5" width="19" height="15" rx="1" />
        <path d="M3 6l9 7 9-7" />
      </svg>
    ),
  },
];

const TICKER_TEXT = '◆  SHIPPED: p5-day-progression-overhaul  ◆  NOW WRITING: case files  ◆  OPEN TO: full-time eng roles  ◆  SF / NYC / REMOTE  ◆  ';

export default function HomeHero() {
  const [hovered, setHovered] = useState<string | null>(null);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: T.ink,
        overflow: 'hidden',
        color: T.paper,
      }}
    >
      {/* ── Background video ── */}
      {prefersReducedMotion ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/img/p5_wall.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/img/p5_wall.jpg"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source src="/img/home_page_50MBs.mp4" type="video/mp4" />
        </video>
      )}

      {/* ── Tint + vignette over video ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `
            radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(13,13,13,0.6) 100%),
            linear-gradient(180deg, rgba(13,13,13,0.4) 0%, transparent 25%, transparent 60%, rgba(13,13,13,0.75) 100%)
          `,
        }}
      />
      {/* ── Halftone grain overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.35,
          mixBlendMode: 'overlay',
          backgroundImage: halftoneBg('rgba(255,255,255,0.5)', 5),
        }}
      />

      {/* ── TOP NAV BAR ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 32px',
          background: 'linear-gradient(180deg, rgba(13,13,13,0.75) 0%, transparent 100%)',
        }}
      >
        <div style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
          PRAN <span style={{ color: T.crimson }}>SHARMA</span>
          <span
            style={{
              display: 'inline-block',
              marginLeft: 10,
              fontFamily: T.fontBody,
              fontSize: 11,
              letterSpacing: 3,
              opacity: 0.6,
              verticalAlign: 'middle',
            }}
          >
            / PORTFOLIO
          </span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
          <span style={{ color: T.crimson }}>● HOME</span>
          <a href="/about" style={{ opacity: 0.6, color: T.paper, textDecoration: 'none' }}>ABOUT</a>
          <a href="/projects" style={{ opacity: 0.6, color: T.paper, textDecoration: 'none' }}>PROJECTS</a>
          <a href="/contact" style={{ opacity: 0.6, color: T.paper, textDecoration: 'none' }}>CONTACT</a>
        </div>
      </div>

      {/* ── WEATHER WIDGET — top-right under nav ── */}
      <div
        style={{
          position: 'absolute',
          top: 76,
          right: 28,
          zIndex: 8,
          padding: '14px 20px 14px 24px',
          background: 'rgba(13,13,13,0.55)',
          backdropFilter: 'blur(8px)',
          clipPath: 'polygon(0 0, 100% 0, 94% 100%, 0 100%)',
          borderLeft: `4px solid ${T.crimson}`,
        }}
      >
        <WeatherWidget />
      </div>

      {/* ── HERO TEXT — left ── */}
      <div style={{ position: 'absolute', left: 48, top: '26%', zIndex: 5, maxWidth: 620 }}>
        <div
          style={{
            display: 'inline-block',
            fontFamily: T.fontDisplay,
            fontSize: 12,
            fontWeight: 800,
            color: T.paper,
            background: T.crimson,
            padding: '5px 12px',
            letterSpacing: 3,
            transform: 'skewX(-8deg)',
          }}
        >
          ▶ CODE NAME
        </div>
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 150,
            fontWeight: 800,
            lineHeight: 0.85,
            letterSpacing: -6,
            marginTop: 10,
            background: `linear-gradient(180deg, ${T.paper} 0%, ${T.paper} 58%, ${T.crimson} 58%, ${T.crimson} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          JOKER?
        </div>
        <div
          style={{
            fontFamily: T.fontDisplay,
            fontStyle: 'italic',
            fontSize: 26,
            marginTop: -2,
            transform: 'skewX(-6deg)',
            color: T.paper,
            textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
          }}
        >
          — no, just <span style={{ color: T.crimson }}>Pran</span>. software engineer &amp; storyteller.
        </div>
      </div>

      {/* ── Diagonal accent bars (decorative, behind buttons) ── */}
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: '30%',
          right: '-5%',
          width: '58%',
          height: 70,
          background: T.crimson,
          transform: 'rotate(-6deg)',
          opacity: 0.92,
          clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: '58%',
          right: '-5%',
          width: '50%',
          height: 18,
          background: T.ink,
          transform: 'rotate(-6deg)',
        }}
      />

      {/* ── NAV BUTTONS — right column ── */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: '22%',
          bottom: '14%',
          width: 440,
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
          padding: '0 32px 0 20px',
        }}
      >
        {NAV_BUTTONS.map((b, i) => {
          const active = hovered === b.key;
          return (
            <a
              key={b.key}
              href={b.href}
              onMouseEnter={() => setHovered(b.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                height: 110,
                cursor: 'pointer',
                textDecoration: 'none',
                transform: `translateX(${active ? 0 : i * -14}px) ${active ? 'scale(1.03)' : ''}`,
                transition: 'transform .28s cubic-bezier(.7,0,.3,1)',
                display: 'block',
              }}
            >
              {/* slanted backing */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: active ? T.crimson : 'rgba(13,13,13,0.78)',
                  clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
                  backdropFilter: 'blur(6px)',
                  boxShadow: active
                    ? `10px 0 0 ${T.ink}, inset 0 0 0 2px ${T.paper}`
                    : `6px 0 0 ${T.crimson}, inset 0 0 0 1px rgba(242,240,237,0.18)`,
                  transition: 'all .28s cubic-bezier(.7,0,.3,1)',
                }}
              />
              {/* halftone texture */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  opacity: active ? 0.22 : 0.15,
                  backgroundImage: halftoneBg(
                    active ? 'rgba(13,13,13,0.7)' : 'rgba(212,20,40,0.8)',
                    4,
                  ),
                  clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
                }}
              />
              {/* contents */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: '0 28px 0 64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 3,
                    color: active ? T.paper : T.crimson,
                    minWidth: 32,
                  }}
                >
                  {b.num}
                </div>
                <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <img
                    src={b.img}
                    alt={b.imgAlt}
                    style={{
                      height: '70%',
                      width: 'auto',
                      objectFit: 'contain',
                      filter: active
                        ? `drop-shadow(3px 3px 0 ${T.ink})`
                        : `drop-shadow(3px 3px 0 ${T.crimson})`,
                      transition: 'filter .28s',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 30,
                    fontWeight: 800,
                    color: active ? T.paper : T.crimson,
                    transition: 'color .28s',
                  }}
                >
                  →
                </div>
              </div>
              {active && (
                <div
                  style={{
                    position: 'absolute',
                    left: 70,
                    bottom: -18,
                    fontFamily: T.fontBody,
                    fontSize: 12,
                    letterSpacing: 2,
                    color: T.paper,
                    background: T.ink,
                    padding: '3px 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  {b.sub}
                </div>
              )}
            </a>
          );
        })}
      </div>

      {/* ── BOTTOM TICKER ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 34,
          zIndex: 9,
          background: T.crimson,
          color: T.paper,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          fontFamily: T.fontDisplay,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 3,
          whiteSpace: 'nowrap',
          borderTop: `2px solid ${T.ink}`,
        }}
      >
        <div style={{ animation: 'ticker 32s linear infinite', paddingLeft: '100%' }}>
          {TICKER_TEXT}{TICKER_TEXT}
        </div>
      </div>

      {/* ── SOUND TOGGLE (bottom-left) ── */}
      <div style={{ position: 'absolute', bottom: 48, left: 28, zIndex: 11 }}>
        <SoundToggle />
      </div>

      {/* ── SOCIAL BUTTONS (bottom-right, above ticker) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          right: 28,
          zIndex: 11,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            color: T.paper,
            opacity: 0.7,
            marginRight: 4,
          }}
        >
          FIND ME ▸
        </span>
        {SOCIALS.map((s) => (
          <a
            key={s.key}
            href={s.href}
            target={s.key === 'em' ? undefined : '_blank'}
            rel={s.key === 'em' ? undefined : 'noopener noreferrer'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: 'rgba(13,13,13,0.75)',
              color: T.paper,
              border: `1px solid rgba(242,240,237,0.2)`,
              clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
              fontFamily: T.fontDisplay,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = T.crimson;
              (e.currentTarget as HTMLElement).style.borderColor = T.paper;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(13,13,13,0.75)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,240,237,0.2)';
            }}
          >
            {s.icon}
            <span>{s.label}</span>
          </a>
        ))}
      </div>

      {/* Persona 5 day-progression cinematic intro — plays once per session */}
      <JokerCutIn />
    </div>
  );
}
