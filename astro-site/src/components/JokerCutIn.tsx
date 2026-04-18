import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * JokerCutIn — Persona 5 day-progression cinematic intro.
 *
 * Faithfully recreates the P5 day-progression animation from:
 *   github.com/Jack-Pettigrew/Persona-5-Day-Progression
 *
 * Features:
 *   - Time-of-day aware backgrounds (day city 6am–6pm, night city 6pm–6am)
 *   - Dynamic weather effects (rain, drifting clouds) via canvas
 *   - Slot-machine day number cycling
 *   - Angular panel sweep with clip-path animations
 *
 * Respects prefers-reduced-motion. Uses sessionStorage for once-per-session.
 */

/* ── Constants ── */

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

const WEEKDAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
] as const;

/** P5's signature sharp snap easing */
const EASE_SHARP: [number, number, number, number] = [0.77, 0, 0.175, 1];
/** Snappy overshoot ease for text entrances */
const EASE_OVERSHOOT: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
/** Aggressive ease-in for exits */
const EASE_IN: [number, number, number, number] = [0.55, 0.085, 0.68, 0.53];

/** Delay before starting (waits for page-reveal CSS overlay) */
const START_DELAY = 400;

type Phase = 'idle' | 'panels-in' | 'day-scroll' | 'day-hold' | 'panels-out' | 'done';

/* ── Helpers ── */

function getDateParts() {
  const now = new Date();
  return {
    month: MONTHS[now.getMonth()],
    day: now.getDate(),
    weekday: WEEKDAYS[now.getDay()],
    hour: now.getHours(),
  };
}

function isNightTime(hour: number): boolean {
  return hour < 6 || hour >= 18;
}

/** Generate an array of random day numbers for the slot-machine cycling effect */
function generateScrollDays(finalDay: number, count = 8): number[] {
  const days: number[] = [];
  for (let i = 0; i < count; i++) {
    let d: number;
    do {
      d = Math.floor(Math.random() * 28) + 1;
    } while (d === finalDay || (days.length > 0 && d === days[days.length - 1]));
    days.push(d);
  }
  days.push(finalDay);
  return days;
}

/* ── Rain Canvas sub-component ── */

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

function WeatherCanvas({ isNight }: { isNight: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<RainDrop[]>([]);
  const animFrameRef = useRef<number>(0);
  const cloudsRef = useRef<{ x: number; y: number; w: number; h: number; speed: number; opacity: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize rain drops
    const dropCount = isNight ? 180 : 80;
    dropsRef.current = Array.from({ length: dropCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: 15 + Math.random() * 25,
      speed: 8 + Math.random() * 12,
      opacity: 0.15 + Math.random() * 0.35,
      width: 1 + Math.random() * 1.5,
    }));

    // Initialize clouds (soft floating shapes)
    const cloudCount = isNight ? 3 : 5;
    cloudsRef.current = Array.from({ length: cloudCount }, () => ({
      x: Math.random() * canvas.width,
      y: 20 + Math.random() * (canvas.height * 0.3),
      w: 200 + Math.random() * 300,
      h: 40 + Math.random() * 60,
      speed: 0.2 + Math.random() * 0.5,
      opacity: isNight ? 0.06 + Math.random() * 0.08 : 0.08 + Math.random() * 0.12,
    }));

    const drawCloud = (cloud: typeof cloudsRef.current[0]) => {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = isNight ? '#8899bb' : '#ffffff';
      ctx.beginPath();
      // Draw cloud as overlapping ellipses for organic shape
      const cx = cloud.x;
      const cy = cloud.y;
      ctx.ellipse(cx, cy, cloud.w * 0.5, cloud.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - cloud.w * 0.25, cy + cloud.h * 0.1, cloud.w * 0.35, cloud.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + cloud.w * 0.3, cy - cloud.h * 0.05, cloud.w * 0.3, cloud.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw drifting clouds
      for (const cloud of cloudsRef.current) {
        drawCloud(cloud);
        cloud.x += cloud.speed;
        if (cloud.x - cloud.w > canvas.width) {
          cloud.x = -cloud.w;
          cloud.y = 20 + Math.random() * (canvas.height * 0.3);
        }
      }

      // Draw rain streaks
      const rainColor = isNight ? '180, 200, 255' : '200, 210, 230';
      for (const drop of dropsRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rainColor}, ${drop.opacity})`;
        ctx.lineWidth = drop.width;
        ctx.moveTo(drop.x, drop.y);
        // Slight angle for wind effect
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.3; // subtle wind drift

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
        if (drop.x < 0) {
          drop.x = canvas.width;
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isNight]);

  return (
    <canvas
      ref={canvasRef}
      className="day-prog__weather-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ── Day Number Scroller sub-component ── */

function DayScroller({ finalDay, onComplete }: { finalDay: number; onComplete: () => void }) {
  const scrollDays = useMemo(() => generateScrollDays(finalDay), [finalDay]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const completeCalled = useRef(false);

  useEffect(() => {
    if (currentIndex >= scrollDays.length - 1) {
      if (!completeCalled.current) {
        completeCalled.current = true;
        onComplete();
      }
      return;
    }

    // Speed up at start, slow down near the end (eased interval)
    const progress = currentIndex / (scrollDays.length - 1);
    // Fast at start (60ms), slowing to ~180ms at end
    const interval = 60 + progress * progress * 140;

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, interval);

    return () => clearTimeout(timer);
  }, [currentIndex, scrollDays.length, onComplete]);

  const isLanding = currentIndex === scrollDays.length - 1;

  return (
    <div className="day-prog__day-scroller">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`day-${currentIndex}`}
          className="day-prog__day-number"
          initial={{ y: 40, opacity: 0, scale: 0.7 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: isLanding ? 1 : 0.95,
          }}
          exit={{ y: -40, opacity: 0, scale: 0.7 }}
          transition={{
            duration: isLanding ? 0.3 : 0.1,
            ease: isLanding ? EASE_OVERSHOOT : 'linear',
          }}
        >
          {scrollDays[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */

export default function JokerCutIn() {
  const [phase, setPhase] = useState<Phase>('idle');
  const date = useMemo(getDateParts, []);
  const [dayLanded, setDayLanded] = useState(false);
  const isNight = useMemo(() => isNightTime(date.hour), [date.hour]);

  // Choose background based on time of day
  const bgImage = isNight ? '/img/persona-night-city.jpg' : '/img/persona-day-city.jpg';

  const handleDayLanded = useCallback(() => {
    setDayLanded(true);
  }, []);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Once per session
    if (sessionStorage.getItem('p5IntroSeen')) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: panels sweep in
    timers.push(setTimeout(() => setPhase('panels-in'), START_DELAY));

    // Phase 2: day scroll + date stamp
    timers.push(setTimeout(() => setPhase('day-scroll'), START_DELAY + 500));

    // Phase 3: hold — let the date linger
    timers.push(setTimeout(() => setPhase('day-hold'), START_DELAY + 2000));

    // Phase 4: panels sweep out
    timers.push(setTimeout(() => setPhase('panels-out'), START_DELAY + 3200));

    // Phase 5: done — unmount
    timers.push(setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('p5IntroSeen', '1');
    }, START_DELAY + 3800));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'idle' || phase === 'done') return null;

  const panelsExiting = phase === 'panels-out';
  const stampVisible = phase === 'day-scroll' || phase === 'day-hold';
  const showScroller = phase === 'day-scroll' || phase === 'day-hold';
  const holdPhase = phase === 'day-hold';

  // Panel background style — both panels use the same time-appropriate image
  const panelBg: React.CSSProperties = {
    backgroundImage: `url('${bgImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div
      className="day-prog"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9200,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Left angular panel ── */}
      <motion.div
        className="day-prog__panel day-prog__panel--left"
        style={panelBg}
        initial={{ clipPath: 'polygon(0 0, 0% 0, 0% 100%, 0 100%)' }}
        animate={
          panelsExiting
            ? { clipPath: 'polygon(0 0, 0% 0, 0% 100%, 0 100%)' }
            : { clipPath: 'polygon(0 0, 58% 0, 48% 100%, 0 100%)' }
        }
        transition={{
          duration: panelsExiting ? 0.35 : 0.4,
          ease: panelsExiting ? EASE_IN : EASE_SHARP,
        }}
      >
        <WeatherCanvas isNight={isNight} />
      </motion.div>

      {/* ── Right angular panel ── */}
      <motion.div
        className="day-prog__panel day-prog__panel--right"
        style={panelBg}
        initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
        animate={
          panelsExiting
            ? { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }
            : { clipPath: 'polygon(46% 0, 100% 0, 100% 100%, 36% 100%)' }
        }
        transition={{
          duration: panelsExiting ? 0.35 : 0.4,
          ease: panelsExiting ? EASE_IN : EASE_SHARP,
        }}
      >
        <WeatherCanvas isNight={isNight} />
      </motion.div>

      {/* ── Red accent slash (between panels) ── */}
      <motion.div
        className="day-prog__slash"
        initial={{ clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
        animate={
          panelsExiting
            ? { clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }
            : { clipPath: 'polygon(46% 0, 58% 0, 48% 100%, 36% 100%)' }
        }
        transition={{
          duration: panelsExiting ? 0.25 : 0.32,
          delay: panelsExiting ? 0 : 0.08,
          ease: EASE_SHARP,
        }}
      />

      {/* ── Date stamp content ── */}
      <AnimatePresence>
        {stampVisible && (
          <motion.div
            className={`day-prog__stamp ${holdPhase ? 'day-prog__stamp--hold' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Weekday — large bold skewed text */}
            <motion.div
              className="day-prog__weekday"
              initial={{ opacity: 0, x: -80, skewX: -15 }}
              animate={{ opacity: 1, x: 0, skewX: 0 }}
              transition={{
                duration: 0.45,
                ease: EASE_OVERSHOOT,
                delay: 0.05,
              }}
            >
              {date.weekday}
            </motion.div>

            {/* Red accent bar — scales in from left */}
            <motion.div
              className="day-prog__bar"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.15,
                ease: EASE_SHARP,
              }}
            />

            {/* Month + Day row */}
            <div className="day-prog__date">
              {/* Month — slides in from right */}
              <motion.span
                className="day-prog__month"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.2,
                  ease: EASE_OVERSHOOT,
                }}
              >
                {date.month}
              </motion.span>

              {/* Day number scroller */}
              {showScroller && (
                <DayScroller finalDay={date.day} onComplete={handleDayLanded} />
              )}
            </div>

            {/* Decorative throwing knife accent — slides in last */}
            <motion.img
              src="/img/p5-throwing-knife.png"
              alt=""
              className="day-prog__knife"
              initial={{ opacity: 0, x: 80, rotate: -25, scale: 0.6 }}
              animate={{
                opacity: dayLanded || holdPhase ? 0.85 : 0,
                x: dayLanded || holdPhase ? 0 : 80,
                rotate: dayLanded || holdPhase ? 0 : -25,
                scale: dayLanded || holdPhase ? 1 : 0.6,
              }}
              transition={{
                duration: 0.5,
                ease: EASE_OVERSHOOT,
                delay: 0.1,
              }}
            />

            {/* Subtle red glow pulse behind stamp during hold */}
            {holdPhase && (
              <motion.div
                className="day-prog__glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
