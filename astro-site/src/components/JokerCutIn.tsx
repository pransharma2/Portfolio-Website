import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * JokerCutIn — Persona 5 cinematic day-progression intro.
 *
 * Homepage-only intro that runs once per session. Timeline:
 *
 *   Phase 0  mount       — angular panels sweep in, clouds visible          (~300ms)
 *   Phase 1  drop        — yesterday's day number FALLS from above,
 *                          bounces, weekday appears below                   (~650ms)
 *   Phase 2  rollback    — numbers scroll BACKWARD to today's date          (~750ms)
 *   Phase 3  lock        — today locks in, month/year stamp in top-right    (~400ms)
 *   Phase 4  impact      — dagger/pointer slams into top-right of date,
 *                          red flash + speed lines + camera shake           (~400ms)
 *   Phase 5  hold        — composition holds briefly                        (~700ms)
 *   Phase 6  exit        — angular wipe out, homepage revealed              (~600ms)
 *
 *  • Respects prefers-reduced-motion (shows a short static fade instead).
 *  • Uses sessionStorage 'p5IntroSeen' for once-per-session behavior.
 *    Clear it via: sessionStorage.removeItem('p5IntroSeen') to replay.
 *  • Clouds: layered procedural painterly canvas layer (scene.pkg nuvola
 *    3D models could not be extracted as sprites — procedural fallback
 *    matches the reference scene's drifting feel).
 *  • Weather detection is optional and non-blocking. API key is read
 *    from import.meta.env.PUBLIC_OWM_API_KEY (no new hardcoded secrets).
 */

/* ── Constants ─────────────────────────────────────────────────── */

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

const MONTHS_LONG = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
] as const;

const WEEKDAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
] as const;

/** P5 signature sharp snap easing */
const EASE_SHARP: [number, number, number, number] = [0.77, 0, 0.175, 1];
/** Snappy overshoot for text entrances */
const EASE_OVERSHOOT: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
/** Aggressive ease-in for exits */
const EASE_IN: [number, number, number, number] = [0.55, 0.085, 0.68, 0.53];

const START_DELAY = 300;

type Phase =
  | 'idle'
  | 'mount'
  | 'drop'
  | 'rollback'
  | 'lock'
  | 'impact'
  | 'hold'
  | 'exit'
  | 'done';

type TimePeriod = 'night' | 'dawn' | 'day' | 'afternoon' | 'evening';
type WeatherMode = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

const TIME_BACKGROUNDS: Record<TimePeriod, string> = {
  night:     '/img/p5-city-night.jpg',
  dawn:      '/img/p5-city-dawn.jpg',
  day:       '/img/p5-city-day.jpg',
  afternoon: '/img/p5-city-afternoon.jpg',
  evening:   '/img/p5-city-sunset.jpg',
};

/* Graceful gradient fallbacks per time period (used if bg image fails) */
const TIME_GRADIENTS: Record<TimePeriod, string> = {
  night:     'linear-gradient(180deg,#0a0f1e 0%,#141c30 55%,#2a1b30 100%)',
  dawn:      'linear-gradient(180deg,#2b1b35 0%,#6a3a4a 55%,#e48a72 100%)',
  day:       'linear-gradient(180deg,#8ec8ea 0%,#c7e2f1 55%,#f2e7c3 100%)',
  afternoon: 'linear-gradient(180deg,#b06a52 0%,#d58e5a 55%,#f1c583 100%)',
  evening:   'linear-gradient(180deg,#2c1e3c 0%,#7a3852 55%,#e66a48 100%)',
};

/* ── Date helpers ──────────────────────────────────────────────── */

interface DateParts {
  todayDay: number;
  todayMonthShort: string;
  todayMonthLong: string;
  todayYear: number;
  todayWeekday: string;
  yesterdayDay: number;
  yesterdayMonthShort: string;
  yesterdayMonthLong: string;
  yesterdayYear: number;
  yesterdayWeekday: string;
  hour: number;
}

/** Get today + yesterday parts. Safe for month/year rollover. */
function getDateParts(now: Date = new Date()): DateParts {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return {
    todayDay:        today.getDate(),
    todayMonthShort: MONTHS_SHORT[today.getMonth()],
    todayMonthLong:  MONTHS_LONG[today.getMonth()],
    todayYear:       today.getFullYear(),
    todayWeekday:    WEEKDAYS[today.getDay()],

    yesterdayDay:        yesterday.getDate(),
    yesterdayMonthShort: MONTHS_SHORT[yesterday.getMonth()],
    yesterdayMonthLong:  MONTHS_LONG[yesterday.getMonth()],
    yesterdayYear:       yesterday.getFullYear(),
    yesterdayWeekday:    WEEKDAYS[yesterday.getDay()],

    hour: now.getHours(),
  };
}

function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 20 || hour < 5)  return 'night';
  if (hour >= 5 && hour < 7)   return 'dawn';
  if (hour >= 7 && hour < 15)  return 'day';
  if (hour >= 15 && hour < 19) return 'afternoon';
  return 'evening';
}

function iconToWeather(icon: string): WeatherMode {
  if (icon.startsWith('01')) return 'sunny';
  if (['02', '03', '04'].some(p => icon.startsWith(p))) return 'cloudy';
  if (['09', '10', '11'].some(p => icon.startsWith(p))) return 'rainy';
  if (icon.startsWith('13')) return 'snowy';
  return 'cloudy';
}

/** Build a short backwards roll-through sequence from yesterday → today. */
function buildRollbackSequence(fromDay: number, toDay: number): number[] {
  // Stylized: show a handful of backwards numbers that end on today.
  // Doesn't need to be mathematically accurate — it's a visual flourish.
  const seq: number[] = [fromDay];
  let cur = fromDay;
  // Pick 3–5 ghost numbers rolling backwards
  const ghosts = 4;
  for (let i = 0; i < ghosts; i++) {
    cur = cur > 1 ? cur - 1 : 28 + Math.floor(Math.random() * 3);
    if (cur !== toDay) seq.push(cur);
  }
  // Always land on today
  if (seq[seq.length - 1] !== toDay) seq.push(toDay);
  return seq;
}

/* ── Weather hook (optional, non-blocking) ─────────────────────── */

function useWeather(): WeatherMode {
  const [weather, setWeather] = useState<WeatherMode>('cloudy');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    // Read key from env; never re-introduce a hardcoded secret here.
    const key = (import.meta as unknown as { env?: Record<string, string> })
      .env?.PUBLIC_OWM_API_KEY;
    if (!key) return; // silently skip if no key configured
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`,
        )
          .then(r => r.json())
          .then(data => {
            if (data?.weather?.[0]) setWeather(iconToWeather(data.weather[0].icon));
          })
          .catch(() => { /* stay cloudy */ });
      },
      () => { /* denied — stay cloudy */ },
      { timeout: 5000 },
    );
  }, []);

  return weather;
}

/* ── CloudLayer ────────────────────────────────────────────────── */
/*  Procedural painterly clouds with 3 parallax depth layers. Uses
    blurred multi-ellipse silhouettes with soft gradient fills to give
    a painted rather than flat-ellipse look. Runs entirely in canvas for
    perf. Pauses when tab is hidden.                                    */

interface CloudPuff {
  x: number;
  y: number;
  r: number;
  ox: number; // offset x from cloud center
  oy: number;
  alpha: number;
}

interface CloudMass {
  cx: number;
  cy: number;
  w: number; // overall width, for wrap-around
  speed: number;
  opacity: number;
  depth: number; // 0 far → 1 near
  puffs: CloudPuff[];
}

function makeCloudMass(canvasW: number, canvasH: number, depth: number): CloudMass {
  // depth controls scale, speed, y-position, alpha
  const scale = 0.55 + depth * 1.1;            // far small, near big
  const speed = (0.18 + depth * 0.55) * (0.5 + Math.random() * 0.6);
  const opacity =
    depth < 0.34 ? 0.18 + Math.random() * 0.12
    : depth < 0.67 ? 0.28 + Math.random() * 0.18
    : 0.38 + Math.random() * 0.22;

  const baseW = 260 * scale + Math.random() * 180 * scale;
  const baseH = 70 * scale + Math.random() * 50 * scale;
  const cx = Math.random() * canvasW;
  // Near clouds lower, far clouds higher — broad band across upper 55%
  const bandTop = canvasH * (0.02 + (1 - depth) * 0.08);
  const bandH   = canvasH * (0.25 + depth * 0.25);
  const cy = bandTop + Math.random() * bandH;

  // Build 6–11 overlapping puffs per mass for a painterly silhouette
  const puffCount = 7 + Math.floor(Math.random() * 5);
  const puffs: CloudPuff[] = [];
  for (let i = 0; i < puffCount; i++) {
    const t = i / Math.max(1, puffCount - 1);
    const rx = (t - 0.5) * baseW * (0.85 + Math.random() * 0.25);
    // Slight vertical arc — center of cloud sags a touch
    const arc = Math.sin(t * Math.PI) * baseH * 0.25;
    const ry = (Math.random() - 0.5) * baseH * 0.55 - arc;
    const r = baseH * (0.55 + Math.random() * 0.55) + 10;
    puffs.push({
      x: 0, y: 0,
      ox: rx,
      oy: ry,
      r,
      alpha: 0.65 + Math.random() * 0.35,
    });
  }

  return { cx, cy, w: baseW * 1.3, speed, opacity, depth, puffs };
}

function CloudLayer({
  timePeriod, reduced,
}: { timePeriod: TimePeriod; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const massesRef = useRef<CloudMass[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      canvas.width  = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width  = '100%';
      canvas.style.height = '100%';
      if (ctx) ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // Regenerate masses at new dimensions
      const W = window.innerWidth;
      const H = window.innerHeight;
      const masses: CloudMass[] = [];
      // Far layer: 3 clouds, slow + small + faint
      for (let i = 0; i < 3; i++) masses.push(makeCloudMass(W, H, 0.15 + Math.random() * 0.15));
      // Mid layer: 3 clouds
      for (let i = 0; i < 3; i++) masses.push(makeCloudMass(W, H, 0.45 + Math.random() * 0.15));
      // Near layer: 2 clouds
      for (let i = 0; i < 2; i++) masses.push(makeCloudMass(W, H, 0.78 + Math.random() * 0.2));
      massesRef.current = masses;
    }

    resize();
    window.addEventListener('resize', resize);

    const isNight = timePeriod === 'night' || timePeriod === 'evening';
    // Painterly color ranges — slight warm/cool tint per period
    const coreRGB = (() => {
      switch (timePeriod) {
        case 'night':     return [168, 178, 206];
        case 'dawn':      return [250, 215, 195];
        case 'day':       return [245, 250, 255];
        case 'afternoon': return [250, 230, 205];
        case 'evening':   return [245, 190, 180];
        default:          return [240, 245, 250];
      }
    })();
    const edgeRGB = (() => {
      switch (timePeriod) {
        case 'night':     return [60, 72, 110];
        case 'dawn':      return [150, 95, 110];
        case 'day':       return [180, 205, 225];
        case 'afternoon': return [180, 130, 100];
        case 'evening':   return [110, 55, 80];
        default:          return [170, 185, 205];
      }
    })();

    function drawPuff(
      x: number, y: number, r: number,
      globalAlpha: number, puffAlpha: number,
    ) {
      if (!ctx) return;
      const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, r * 0.05, x, y, r);
      g.addColorStop(0.0, `rgba(${coreRGB[0]},${coreRGB[1]},${coreRGB[2]},${globalAlpha * puffAlpha})`);
      g.addColorStop(0.55, `rgba(${coreRGB[0]},${coreRGB[1]},${coreRGB[2]},${globalAlpha * puffAlpha * 0.55})`);
      g.addColorStop(1.0, `rgba(${edgeRGB[0]},${edgeRGB[1]},${edgeRGB[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    let lastT = performance.now();
    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    function frame(t: number) {
      const dt = Math.min(64, t - lastT); // cap dt
      lastT = t;

      if (!ctx || !canvas) return;
      if (paused) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = window.innerWidth;
      // Subtle mood wash behind clouds, barely there
      ctx.fillStyle = isNight
        ? 'rgba(12,18,36,0.08)'
        : 'rgba(235,235,220,0.04)';
      ctx.fillRect(0, 0, W, window.innerHeight);

      // Animate and draw each cloud mass
      for (const m of massesRef.current) {
        // Move. dt is ms; speed is px/frame-at-60, so scale to dt.
        m.cx += m.speed * (dt / 16.67);
        // Wrap around horizontally
        if (m.cx - m.w > W) m.cx = -m.w * 0.6;

        // Subtle vertical breathing, depth-weighted
        const breathe = Math.sin(t * 0.00025 + m.cy) * (1.5 + m.depth * 2.2);

        ctx.save();
        const time = t * 0.001;
        // Tiny opacity drift so cloud doesn't feel static
        const drift = 0.92 + 0.08 * Math.sin(time * 0.7 + m.cx * 0.01);
        const ga = m.opacity * drift;

        for (const p of m.puffs) {
          drawPuff(m.cx + p.ox, m.cy + p.oy + breathe, p.r, ga, p.alpha);
        }
        ctx.restore();
      }

      if (!reduced) rafRef.current = requestAnimationFrame(frame);
    }

    if (!reduced) rafRef.current = requestAnimationFrame(frame);
    else {
      // Static single paint for reduced-motion
      frame(performance.now());
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [timePeriod, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

/* ── AngularPanels (background black/red cut) ──────────────────── */

function AngularPanels({
  exiting, bgImage, bgGradient, children,
}: {
  exiting: boolean;
  bgImage: string;
  bgGradient: string;
  children?: React.ReactNode;
}) {
  // One big image-filled backdrop with gradient fallback beneath.
  // Angular overlays sit on top to give the P5 shape language.
  return (
    <>
      {/* Backdrop: gradient + bg image (image gracefully hides if missing) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: bgGradient,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          opacity: 0.92,
          mixBlendMode: 'normal',
        }}
      />
      {/* Dark wash for contrast against white date */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(115deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.15) 45%,rgba(0,0,0,0.55) 100%)',
          zIndex: 2,
        }}
      />
      {children}
      {/* Top-left angular black cut */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0a',
          zIndex: 5,
          pointerEvents: 'none',
        }}
        initial={{ clipPath: 'polygon(0 0, 46% 0, 30% 100%, 0 100%)' }}
        animate={
          exiting
            ? { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }
            : { clipPath: 'polygon(0 0, 28% 0, 16% 100%, 0 100%)' }
        }
        transition={{
          duration: exiting ? 0.45 : 0.45,
          ease: exiting ? EASE_IN : EASE_SHARP,
        }}
      />
      {/* Bottom-right angular black cut */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0a',
          zIndex: 5,
          pointerEvents: 'none',
        }}
        initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 50% 100%)' }}
        animate={
          exiting
            ? { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }
            : { clipPath: 'polygon(100% 70%, 100% 0, 100% 100%, 62% 100%)' }
        }
        transition={{
          duration: exiting ? 0.45 : 0.45,
          ease: exiting ? EASE_IN : EASE_SHARP,
        }}
      />
      {/* Angled red accent bars */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-6%',
          left: '20%',
          width: '4vw',
          minWidth: 28,
          height: '120vh',
          background: '#d41428',
          transform: 'rotate(-14deg)',
          transformOrigin: 'top center',
          zIndex: 6,
          boxShadow: '0 0 20px rgba(212,20,40,0.5)',
          pointerEvents: 'none',
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={exiting ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
        transition={{
          duration: exiting ? 0.3 : 0.4,
          delay: exiting ? 0 : 0.1,
          ease: EASE_SHARP,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '-6%',
          right: '18%',
          width: '2vw',
          minWidth: 14,
          height: '120vh',
          background: '#d41428',
          transform: 'rotate(12deg)',
          transformOrigin: 'top center',
          zIndex: 6,
          boxShadow: '0 0 14px rgba(212,20,40,0.45)',
          pointerEvents: 'none',
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={exiting ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
        transition={{
          duration: exiting ? 0.3 : 0.4,
          delay: exiting ? 0 : 0.18,
          ease: EASE_SHARP,
        }}
      />
    </>
  );
}

/* ── MonthYearStamp (top-right) ────────────────────────────────── */

function MonthYearStamp({
  monthLong, year, visible,
}: { monthLong: string; year: number; visible: boolean }) {
  const baseFont = '"Shippori Mincho B1","Shippori Mincho",serif';
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, x: 80, y: -20, skewX: -12 }}
          animate={{ opacity: 1, x: 0, y: 0, skewX: -6 }}
          exit={{ opacity: 0, x: 60, skewX: -12 }}
          transition={{ duration: 0.45, ease: EASE_OVERSHOOT }}
          style={{
            position: 'absolute',
            top: 'clamp(24px,5vw,64px)',
            right: 'clamp(24px,5vw,80px)',
            zIndex: 40,
            textAlign: 'right',
            pointerEvents: 'none',
            fontFamily: baseFont,
            color: '#fff',
            lineHeight: 0.9,
          }}
        >
          <div
            style={{
              fontSize: 'clamp(22px,3.8vw,54px)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textShadow:
                '3px 3px 0 #000, -2px 0 0 #000, 0 2px 0 #000, 3px 3px 0 #d41428',
            }}
          >
            {monthLong}
          </div>
          <div
            style={{
              fontSize: 'clamp(28px,4.4vw,66px)',
              fontWeight: 900,
              letterSpacing: '0.05em',
              marginTop: 'clamp(2px,0.4vw,6px)',
              textShadow:
                '3px 3px 0 #000, -2px 0 0 #000, 0 2px 0 #000',
              color: '#fff',
            }}
          >
            {year}
          </div>
          {/* Red accent slash under the stamp */}
          <div
            style={{
              marginTop: 8,
              height: 'clamp(4px,0.6vw,10px)',
              width: '110%',
              background: '#d41428',
              marginLeft: 'auto',
              transform: 'skewX(-18deg)',
              boxShadow: '2px 2px 0 #000',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── DateDrop (yesterday falls in) ─────────────────────────────── */

function DateDrop({
  day, weekday, active, onLanded,
}: {
  day: number;
  weekday: string;
  active: boolean;
  onLanded: () => void;
}) {
  const called = useRef(false);
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
      initial={{ y: '-110vh', rotate: -14, scale: 0.9 }}
      animate={
        active
          ? { y: 0, rotate: -4, scale: 1 }
          : { y: '-110vh', rotate: -14, scale: 0.9 }
      }
      transition={{
        duration: 0.62,
        ease: [0.2, 0.9, 0.3, 1.25], // overshoot landing
        type: 'tween',
      }}
      onAnimationComplete={() => {
        if (!called.current && active) {
          called.current = true;
          onLanded();
        }
      }}
    >
      <DateBlock day={day} weekday={weekday} shaking />
    </motion.div>
  );
}

/* ── DateBlock (shared date + weekday text block) ──────────────── */

function DateBlock({
  day, weekday, shaking, showUnderline, pinRef,
}: {
  day: number;
  weekday: string;
  shaking?: boolean;
  showUnderline?: boolean;
  pinRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const baseFont = '"Shippori Mincho B1","Shippori Mincho",serif';
  const numberStyle: CSSProperties = {
    fontFamily: baseFont,
    fontSize: 'clamp(180px,26vw,440px)',
    fontWeight: 900,
    lineHeight: 0.9,
    color: '#fff',
    letterSpacing: '-0.03em',
    textShadow: [
      '8px 8px 0 #0a0a0a',
      '-3px 0 0 #0a0a0a',
      '0 -3px 0 #0a0a0a',
      '3px 0 0 #0a0a0a',
      '0 3px 0 #0a0a0a',
      '12px 12px 0 #d41428',
    ].join(','),
    transform: 'skewX(-7deg)',
    position: 'relative',
    display: 'inline-block',
  };
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <motion.div
        ref={pinRef}
        style={{ ...numberStyle, position: 'relative' }}
        animate={shaking
          ? { x: [0, -6, 5, -3, 2, 0], y: [0, 4, -2, 3, -1, 0] }
          : { x: 0, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_SHARP }}
      >
        {day}
        {showUnderline && (
          <motion.div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-4%',
              right: '-4%',
              bottom: '-4%',
              height: 'clamp(8px,1.2vw,20px)',
              background: '#d41428',
              transform: 'skewX(-18deg)',
              boxShadow: '4px 4px 0 #0a0a0a',
              transformOrigin: 'left center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.42, ease: EASE_SHARP, delay: 0.05 }}
          />
        )}
      </motion.div>
      <div
        style={{
          marginTop: 'clamp(12px,2vw,32px)',
          fontFamily: baseFont,
          fontSize: 'clamp(22px,3.2vw,54px)',
          fontWeight: 900,
          letterSpacing: '0.22em',
          color: '#fff',
          textShadow:
            '4px 4px 0 #0a0a0a, -2px 0 0 #0a0a0a, 0 -2px 0 #0a0a0a, 2px 0 0 #0a0a0a, 0 2px 0 #0a0a0a',
          transform: 'skewX(-6deg)',
        }}
      >
        {weekday}
      </div>
    </div>
  );
}

/* ── DateNumberTransition (yesterday → today, backward roll) ───── */

function DateNumberTransition({
  fromDay, toDay, fromWeekday, toWeekday, active, onComplete,
}: {
  fromDay: number;
  toDay: number;
  fromWeekday: string;
  toWeekday: string;
  active: boolean;
  onComplete: () => void;
}) {
  const seq = useMemo(() => buildRollbackSequence(fromDay, toDay), [fromDay, toDay]);
  const [idx, setIdx] = useState(0);
  const called = useRef(false);

  useEffect(() => {
    if (!active) return;
    if (idx >= seq.length - 1) {
      if (!called.current) {
        called.current = true;
        // brief beat to let today land
        setTimeout(onComplete, 120);
      }
      return;
    }
    // Fast early, slowing into today
    const progress = idx / (seq.length - 1);
    const interval = 90 + progress * progress * 160;
    const t = setTimeout(() => setIdx(i => i + 1), interval);
    return () => clearTimeout(t);
  }, [idx, active, seq.length, onComplete]);

  const current = seq[idx];
  const isFinal = idx === seq.length - 1;
  const weekdayShown = isFinal ? toWeekday : fromWeekday;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 20, pointerEvents: 'none',
    }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`roll-${idx}`}
          initial={{ y: -36, opacity: 0, scale: 0.88, rotate: -6 }}
          animate={{ y: 0, opacity: 1, scale: isFinal ? 1 : 0.96, rotate: isFinal ? -4 : -3 }}
          exit={{ y: 36, opacity: 0, scale: 0.85, rotate: 6 }}
          transition={{
            duration: isFinal ? 0.35 : 0.14,
            ease: isFinal ? EASE_OVERSHOOT : 'linear',
          }}
        >
          <DateBlock
            day={current}
            weekday={weekdayShown}
            showUnderline={isFinal}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── DaggerMarker (stylized date-pin) ──────────────────────────── */

function DaggerMarker({ active }: { active: boolean }) {
  // Uses the existing /img/p5-throwing-knife.png asset. Its default orientation
  // has the blade pointing down-left, which naturally reads as "stabbing from
  // upper-right into the top-right of the date." We add a small rotation on
  // rest + a subtle landing wobble + an offset red slash so the composition
  // feels pinned/impacted.
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            // Anchor near the top-right corner of the centered date block
            top: 'clamp(14%,18vh,24%)',
            left: 'calc(50% + clamp(70px,12vw,200px))',
            zIndex: 45,
            width: 'clamp(160px,22vw,320px)',
            height: 'clamp(160px,22vw,320px)',
            pointerEvents: 'none',
            transformOrigin: '30% 30%',
          }}
          initial={{ x: 440, y: -440, rotate: 55, opacity: 0, scale: 1.3 }}
          animate={{
            x: 0, y: 0, rotate: 8, opacity: 1, scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
          transition={{ duration: 0.3, ease: [0.65, 0, 0.25, 1.4] }}
        >
          {/* Red accent slash behind the dagger's landing point for extra pop */}
          <motion.div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '18%',
              left: '-14%',
              width: '70%',
              height: '14%',
              background: '#d41428',
              transform: 'skewX(-22deg) rotate(-14deg)',
              boxShadow: '4px 4px 0 #0a0a0a',
              zIndex: 0,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.9 }}
            transition={{ duration: 0.32, delay: 0.08, ease: EASE_SHARP }}
          />
          {/* The actual dagger PNG — with landing wobble */}
          <motion.img
            src="/img/p5-throwing-knife.png"
            alt=""
            draggable={false}
            animate={{ rotate: [8, 5, 11, 7, 9, 8] }}
            transition={{
              duration: 0.55,
              ease: EASE_SHARP,
              delay: 0.22,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            }}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: [
                'drop-shadow(4px 4px 0 rgba(0,0,0,0.6))',
                'drop-shadow(8px 8px 0 rgba(212,20,40,0.55))',
              ].join(' '),
              zIndex: 1,
              transformOrigin: '30% 30%',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── ImpactFlash + SpeedLines ──────────────────────────────────── */

function ImpactFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 62% 35%,rgba(255,255,255,0.95) 0%,rgba(255,80,80,0.6) 25%,rgba(0,0,0,0) 55%)',
            zIndex: 48,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.3, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, times: [0, 0.15, 0.5, 1], ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}

function SpeedLines({ active }: { active: boolean }) {
  // Simple radial speed lines exploding around impact point
  const lines = useMemo(() => {
    const arr: { angle: number; len: number; thick: number; delay: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * 360 + (Math.random() * 14 - 7);
      arr.push({
        angle,
        len: 180 + Math.random() * 220,
        thick: 2 + Math.random() * 4,
        delay: Math.random() * 0.08,
      });
    }
    return arr;
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 'clamp(22%,28vh,36%)',
            left: 'calc(50% + clamp(60px,12vw,180px))',
            zIndex: 47,
            width: 0, height: 0,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.35, ease: EASE_SHARP }}
        >
          {lines.map((l, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: l.len,
                height: l.thick,
                background: i % 2 === 0 ? '#0a0a0a' : '#fff',
                transform: `rotate(${l.angle}deg) translateX(40px)`,
                transformOrigin: 'left center',
                borderRadius: 2,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 0] }}
              transition={{
                duration: 0.4,
                delay: l.delay,
                ease: EASE_SHARP,
                times: [0, 0.2, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main component ────────────────────────────────────────────── */

export default function JokerCutIn() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [reduced, setReduced] = useState(false);
  const [shake, setShake] = useState(false);

  const date = useMemo(() => getDateParts(), []);
  const timePeriod = useMemo(() => getTimePeriod(date.hour), [date.hour]);
  const weather = useWeather(); // currently visual tint only; reserved for future

  const bgImage = TIME_BACKGROUNDS[timePeriod];
  const bgGradient = TIME_GRADIENTS[timePeriod];

  // Expose weather so TS doesn't complain about unused value
  void weather;

  const rollbackDone = useCallback(() => {
    setPhase('lock');
  }, []);

  const dropLanded = useCallback(() => {
    // drop onAnimationComplete — we transition via timeline below
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reducedMQ);

    // Once per session
    if (sessionStorage.getItem('p5IntroSeen')) {
      setPhase('done');
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (reducedMQ) {
      // Minimal: brief static fade with today's date, then exit
      setPhase('lock');
      timers.push(setTimeout(() => setPhase('exit'), 900));
      timers.push(setTimeout(() => {
        setPhase('done');
        sessionStorage.setItem('p5IntroSeen', '1');
      }, 1500));
      return () => timers.forEach(clearTimeout);
    }

    // Full cinematic timeline
    // t=0 mount
    timers.push(setTimeout(() => setPhase('mount'), START_DELAY));
    // drop
    timers.push(setTimeout(() => setPhase('drop'), START_DELAY + 180));
    // tiny impact shake at landing
    timers.push(setTimeout(() => setShake(true), START_DELAY + 180 + 620));
    timers.push(setTimeout(() => setShake(false), START_DELAY + 180 + 620 + 320));
    // rollback (yesterday → today backward scroll)
    timers.push(setTimeout(() => setPhase('rollback'), START_DELAY + 180 + 820));
    // lock set by rollback.onComplete, but guard with a max timer too
    timers.push(setTimeout(() => {
      setPhase(p => (p === 'rollback' ? 'lock' : p));
    }, START_DELAY + 180 + 820 + 1100));
    // impact (dagger)
    timers.push(setTimeout(() => setPhase('impact'), START_DELAY + 180 + 820 + 1100 + 380));
    // camera shake on impact
    timers.push(setTimeout(() => setShake(true), START_DELAY + 180 + 820 + 1100 + 380 + 60));
    timers.push(setTimeout(() => setShake(false), START_DELAY + 180 + 820 + 1100 + 380 + 60 + 280));
    // hold
    timers.push(setTimeout(() => setPhase('hold'), START_DELAY + 180 + 820 + 1100 + 380 + 420));
    // exit
    timers.push(setTimeout(() => setPhase('exit'), START_DELAY + 180 + 820 + 1100 + 380 + 420 + 700));
    // done
    timers.push(setTimeout(() => {
      setPhase('done');
      try { sessionStorage.setItem('p5IntroSeen', '1'); } catch { /* ignore */ }
    }, START_DELAY + 180 + 820 + 1100 + 380 + 420 + 700 + 600));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'idle' || phase === 'done') return null;

  const exiting = phase === 'exit';

  // Phase gates
  const showDrop =
    phase === 'drop'; // yesterday falling
  const showRollback =
    phase === 'rollback'; // yesterday → today number roll
  const showTodayStatic =
    phase === 'lock' || phase === 'impact' || phase === 'hold' || phase === 'exit';
  const showStamp =
    phase === 'mount' || phase === 'drop' || phase === 'rollback' ||
    phase === 'lock' || phase === 'impact' || phase === 'hold';
  const showDagger =
    phase === 'impact' || phase === 'hold' || phase === 'exit';
  const showFlash =
    phase === 'impact';

  // Reduced-motion early render (no heavy animations)
  if (reduced) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9200, pointerEvents: 'none',
          overflow: 'hidden', background: bgGradient,
          opacity: phase === 'exit' ? 0 : 1,
          transition: 'opacity 400ms ease',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: '"Shippori Mincho B1",serif',
          fontSize: 'clamp(64px,14vw,160px)', fontWeight: 900,
          textShadow: '4px 4px 0 #000, 6px 6px 0 #d41428',
        }}>
          {date.todayDay} · {date.todayWeekday}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="day-prog"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9200,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      animate={shake ? { x: [0, -8, 7, -4, 3, 0], y: [0, 4, -3, 2, -1, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_SHARP }}
    >
      <AngularPanels exiting={exiting} bgImage={bgImage} bgGradient={bgGradient}>
        <CloudLayer timePeriod={timePeriod} reduced={reduced} />
      </AngularPanels>

      <MonthYearStamp
        monthLong={date.todayMonthLong}
        year={date.todayYear}
        visible={showStamp && !exiting}
      />

      {/* Yesterday falling */}
      {showDrop && (
        <DateDrop
          day={date.yesterdayDay}
          weekday={date.yesterdayWeekday}
          active={showDrop}
          onLanded={dropLanded}
        />
      )}

      {/* Backward roll */}
      {showRollback && (
        <DateNumberTransition
          fromDay={date.yesterdayDay}
          toDay={date.todayDay}
          fromWeekday={date.yesterdayWeekday}
          toWeekday={date.todayWeekday}
          active={showRollback}
          onComplete={rollbackDone}
        />
      )}

      {/* Locked today */}
      <AnimatePresence>
        {showTodayStatic && !exiting && (
          <motion.div
            key="today-lock"
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 20, pointerEvents: 'none',
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE_SHARP }}
          >
            <DateBlock
              day={date.todayDay}
              weekday={date.todayWeekday}
              showUnderline
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dagger impact effects */}
      <SpeedLines active={showFlash} />
      <ImpactFlash active={showFlash} />
      <DaggerMarker active={showDagger} />

      {/* Exit wipe overlay (angular slashes) */}
      <AnimatePresence>
        {exiting && (
          <>
            <motion.div
              key="exit-slash-a"
              style={{
                position: 'absolute', inset: 0,
                background: '#0a0a0a', zIndex: 60,
              }}
              initial={{ clipPath: 'polygon(-10% 0,-10% 0,-20% 100%,-20% 100%)' }}
              animate={{ clipPath: 'polygon(-10% 0,120% 0,110% 100%,-20% 100%)' }}
              transition={{ duration: 0.42, ease: EASE_IN }}
            />
            <motion.div
              key="exit-slash-b"
              style={{
                position: 'absolute', inset: 0,
                background: '#d41428', zIndex: 61,
                mixBlendMode: 'normal',
              }}
              initial={{ clipPath: 'polygon(-10% 100%,-10% 100%,-20% 100%,-20% 100%)' }}
              animate={{ clipPath: 'polygon(-10% 82%,120% 64%,110% 100%,-20% 100%)' }}
              transition={{ duration: 0.28, delay: 0.05, ease: EASE_IN }}
            />
            {/* final dissolve */}
            <motion.div
              key="exit-cover"
              style={{ position: 'absolute', inset: 0, background: '#0a0a0a', zIndex: 62 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeInOut' }}
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
