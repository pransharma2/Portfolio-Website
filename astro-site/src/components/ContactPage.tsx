import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import ContactForm from './ContactForm';
import ContactBgSlideshow from './ContactBgSlideshow';

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

/* ─── Sparkle canvas (overlay sparkle particles) ─── */
function SparkleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = cvs.getBoundingClientRect();
      cvs.width = r.width * dpr;
      cvs.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const parts = Array.from({ length: 85 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.2 + 0.6,
      tw: Math.random() * Math.PI * 2,
      sp: 0.5 + Math.random() * 1.4,
      drift: (Math.random() - 0.5) * 0.00015,
    }));

    let raf: number;
    const draw = (t: number) => {
      const el = t * 0.001;
      const rr = cvs.getBoundingClientRect();
      ctx.clearRect(0, 0, rr.width, rr.height);
      for (const p of parts) {
        p.y = (p.y + p.drift + 1) % 1;
        const op = 0.25 + 0.55 * Math.sin(p.tw + el * p.sp);
        ctx.globalAlpha = Math.max(0.08, op);
        const x = p.x * rr.width;
        const y = p.y * rr.height;
        ctx.fillStyle = '#f2f0ed';
        ctx.beginPath();
        ctx.moveTo(x, y - p.r * 2);
        ctx.lineTo(x + p.r * 0.6, y - p.r * 0.6);
        ctx.lineTo(x + p.r * 2, y);
        ctx.lineTo(x + p.r * 0.6, y + p.r * 0.6);
        ctx.lineTo(x, y + p.r * 2);
        ctx.lineTo(x - p.r * 0.6, y + p.r * 0.6);
        ctx.lineTo(x - p.r * 2, y);
        ctx.lineTo(x - p.r * 0.6, y - p.r * 0.6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const onR = () => resize();
    window.addEventListener('resize', onR);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onR);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 1, pointerEvents: 'none',
      }}
    />
  );
}



/* ─── Static decorative stars (gold SVG) ─── */
function StaticStars() {
  const stars = [
    { x: '8%', y: '14%', s: 22, r: -12 },
    { x: '92%', y: '22%', s: 34, r: 18 },
    { x: '14%', y: '78%', s: 18, r: 8 },
    { x: '84%', y: '74%', s: 26, r: -22 },
    { x: '48%', y: '6%', s: 14, r: 3 },
    { x: '72%', y: '48%', s: 12, r: -6 },
    { x: '22%', y: '44%', s: 16, r: 14 },
    { x: '4%', y: '52%', s: 10, r: 0 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <svg
          key={i} width={s.s} height={s.s} viewBox="0 0 40 40"
          style={{
            position: 'absolute', left: s.x, top: s.y,
            transform: `rotate(${s.r}deg)`,
            filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.35))',
          }}
        >
          <polygon fill="#ffd700" points="20,2 24,16 38,18 27,27 31,40 20,32 9,40 13,27 2,18 16,16" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Chat bubble ─── */
function Bubble({ side = 'received', children }: { side?: 'received' | 'sent'; children: React.ReactNode }) {
  const isRec = side === 'received';
  return (
    <div style={{ display: 'flex', justifyContent: isRec ? 'flex-start' : 'flex-end', marginBottom: 8 }}>
      <div style={{
        maxWidth: '80%', padding: '10px 14px',
        background: isRec ? 'rgba(242,240,237,0.95)' : T.crimson,
        color: isRec ? T.ink : T.paper,
        fontFamily: T.fontBody, fontSize: 13.5, lineHeight: 1.45,
        borderRadius: isRec ? '2px 16px 16px 16px' : '16px 2px 16px 16px',
        boxShadow: isRec ? '3px 3px 0 rgba(13,13,13,0.18)' : '3px 3px 0 rgba(138,10,23,0.5)',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Info chips data ─── */
const INFO_CHIPS: [string, string][] = [
  ['LOCATION', 'CALGARY, AB'],
  ['STATUS', 'OPEN Q2 2026'],
  ['RESPONSE', '< 24 HRS'],
  ['PREFER', 'EMAIL / LINKEDIN'],
];

/* ─── Social links ─── */
const SOCIALS = [
  {
    label: 'GITHUB',
    href: 'https://github.com/pransharma',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.56-.3-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.47.12-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.64 1.6.24 2.77.12 3.06.74.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.68.42.36.78 1.07.78 2.16v3.2c0 .32.2.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: 'LINKEDIN',
    href: 'https://linkedin.com/in/pransharma',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.97-1.8-2.97-1.8 0-2.08 1.4-2.08 2.87V21h-4V9z" />
      </svg>
    ),
  },
  {
    label: 'EMAIL',
    href: 'mailto:s.prantap@gmail.com',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2.5" y="4.5" width="19" height="15" rx="1" />
        <path d="M3 6l9 7 9-7" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════
   MAIN CONTACT PAGE COMPONENT
   ═══════════════════════════════════════════ */
export default function ContactPage() {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh', overflow: 'hidden',
      color: T.paper, fontFamily: T.fontBody,
    }}>
      {/* Image slideshow sits behind via position:fixed z:-1 */}
      <ContactBgSlideshow />
      <SparkleCanvas />
      <StaticStars />

      {/* Red slash accent bar */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '38%', left: '-6%', width: '46%', height: 54,
        background: T.crimson,
        transform: 'rotate(-5deg)', zIndex: 3, opacity: 0.92,
        clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
      }} />

      {/* TOP NAV */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '18px 32px',
        background: 'linear-gradient(180deg, rgba(10,5,8,0.85) 0%, transparent 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800 }}>
          PRAN <span style={{ color: T.crimson }}>SHARMA</span>{' '}
          <span style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 400, letterSpacing: 3, opacity: 0.55 }}>/ PORTFOLIO</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
          <a href="/" style={{ opacity: 0.55, color: T.paper, textDecoration: 'none' }}>HOME</a>
          <a href="/about" style={{ opacity: 0.55, color: T.paper, textDecoration: 'none' }}>ABOUT</a>
          <a href="/projects" style={{ opacity: 0.55, color: T.paper, textDecoration: 'none' }}>PROJECTS</a>
          <span style={{ color: T.crimson }}>● CONTACT</span>
        </div>
      </div>

      {/* PAGE LAYOUT — two columns */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 60,
        padding: '40px 64px 40px', alignItems: 'center',
        minHeight: 'calc(100vh - 114px)',
      }}>
        {/* LEFT — title column */}
        <div style={{ position: 'relative' }}>
          {/* giant stencil watermark */}
          <div style={{
            position: 'absolute', left: -18, top: -40, pointerEvents: 'none',
            fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 240, lineHeight: 0.8,
            letterSpacing: -10, color: 'transparent',
            WebkitTextStroke: '2px rgba(242,240,237,0.09)',
          } as CSSProperties}>04</div>

          <div style={{
            display: 'inline-block', padding: '6px 14px',
            background: T.crimson, color: T.paper,
            fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 800, letterSpacing: 3,
            transform: 'skewX(-8deg)', position: 'relative',
          }}>▶ CONTACT / CALLING CARD</div>

          <h1 style={{
            margin: '14px 0 6px', position: 'relative',
            fontFamily: T.fontDisplay, fontSize: 108, fontWeight: 800, lineHeight: 0.95,
            letterSpacing: -4,
            textShadow: '4px 4px 0 rgba(138,10,23,0.55)',
          }}>
            CALLING<br />
            <span style={{ color: T.crimson }}>CARD</span><span style={{ color: T.crimson }}>.</span>
          </h1>

          <p style={{
            margin: '10px 0 24px', position: 'relative',
            fontFamily: T.fontDisplay, fontStyle: 'italic', fontSize: 22, opacity: 0.92,
            maxWidth: 560,
          }}>
            Got something on your mind? Let's connect.
          </p>

          {/* Info chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: 10, position: 'relative' }}>
            {INFO_CHIPS.map(([k, v]) => (
              <div key={k} style={{
                display: 'flex',
                border: '1.5px solid rgba(242,240,237,0.35)',
                fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: 2,
              }}>
                <span style={{ background: T.paper, color: T.ink, padding: '5px 10px' }}>{k}</span>
                <span style={{ padding: '5px 12px' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Social row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 26, alignItems: 'center', position: 'relative' }}>
            <span style={{
              fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: 3, opacity: 0.65,
            }}>OR REACH OUT ▸</span>
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px',
                background: 'rgba(13,13,13,0.75)', color: T.paper,
                border: '1px solid rgba(242,240,237,0.22)',
                clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
                fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 800, letterSpacing: 2,
                textDecoration: 'none',
              }}>
                {s.icon}<span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* RIGHT — phone / chat card */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {/* backdrop diamond glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', width: 360, height: 360,
            background: 'rgba(212,20,40,0.18)',
            transform: 'rotate(45deg)',
            filter: 'blur(30px)',
          }} />

          {/* Phone frame with chat + real form */}
          <div style={{
            width: 380, background: T.ink, color: T.paper,
            border: `2px solid ${T.crimson}`,
            padding: 16,
            boxShadow: `10px 10px 0 ${T.crimson}, 0 30px 60px rgba(0,0,0,0.55)`,
            fontFamily: T.fontBody, position: 'relative',
          }}>
            {/* Chat header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px 12px',
              borderBottom: '1px solid rgba(242,240,237,0.18)',
            }}>
              <div style={{
                width: 36, height: 36, background: T.crimson, color: T.paper,
                display: 'grid', placeItems: 'center',
                fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18,
                clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)',
              }}>P</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>PHANTOM DEV</div>
                <div style={{ fontSize: 11, opacity: 0.65 }}>● online</div>
              </div>
              <div style={{
                padding: '2px 8px', background: T.crimson, color: T.paper,
                fontFamily: T.fontDisplay, fontSize: 9, fontWeight: 800, letterSpacing: 2,
              }}>LIVE</div>
            </div>

            {/* Chat messages */}
            <div style={{ padding: '14px 2px 10px', minHeight: 110 }}>
              <Bubble side="received">Hey there! Welcome to the hideout.</Bubble>
              <Bubble side="received">Got something on your mind? Send a calling card below.</Bubble>
            </div>

            {/* Real Web3Forms contact form */}
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, zIndex: 10,
        background: T.crimson, color: T.paper,
        borderTop: `2px solid ${T.ink}`,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 700, letterSpacing: 3, whiteSpace: 'nowrap',
      }}>
        <div style={{ animation: 'cticker 32s linear infinite', paddingLeft: '100%' }}>
          ◆ SEND A CALLING CARD ◆ RESPONSE &lt; 24 HRS ◆ S.PRANTAP@GMAIL.COM ◆ OPEN Q2 2026 ◆ CALGARY / REMOTE ◆
          ◆ SEND A CALLING CARD ◆ RESPONSE &lt; 24 HRS ◆ S.PRANTAP@GMAIL.COM ◆ OPEN Q2 2026 ◆ CALGARY / REMOTE ◆
        </div>
        <style>{`@keyframes cticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>
    </div>
  );
}
