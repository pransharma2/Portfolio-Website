import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * JokerCutIn — Persona 5 day-progression cinematic intro.
 *
 * Ported from Wallpaper Engine scene.pkg (workshop ID 2955378002)
 * by Becco38. Time-of-day logic uses the exact smoothStep hour ranges
 * from the scene's alpha scripts. Weather effects match the scene's
 * particle configurations (rain, snow, clouds).
 *
 * Features:
 *   - 5-period time-of-day backgrounds extracted from scene.pkg textures
 *   - Real weather detection via OpenWeatherMap → 4 weather canvas modes
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

/*
 * Time-of-day periods — ported from scene.pkg alpha scripts.
 * Each layer used WEMath.smoothStep with START_HOUR/END_HOUR ranges:
 *   Evening(0–5), EarlyMorning(5–7), Morning(7–10), Daytime(10–13),
 *   Lunchtime(13–14), AfterSchool(14–15), Afternoon(15–19), Evening(19–24)
 *
 * Simplified to 5 distinct visual periods with matching scene.pkg textures:
 */
type TimePeriod = 'night' | 'dawn' | 'day' | 'afternoon' | 'evening';

/** Map OWM icon code prefix → scene.pkg weather mode */
type WeatherMode = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

const TIME_BACKGROUNDS: Record<TimePeriod, string> = {
  night:     '/img/p5-city-night.jpg',      // Night2.tex  (20:00–5:00)
  dawn:      '/img/p5-city-dawn.jpg',        // dawn 2.tex  (5:00–7:00)
  day:       '/img/p5-city-day.jpg',         // Day2.tex    (7:00–15:00)
  afternoon: '/img/p5-city-afternoon.jpg',   // mid day.tex (15:00–19:00)
  evening:   '/img/p5-city-sunset.jpg',      // mi day 2.tex(19:00–20:00)
};

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

/**
 * Determine the time period from the current hour.
 * Matches the scene.pkg smoothStep hour boundaries.
 */
function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 20 || hour < 5)  return 'night';     // Evening 19–24 + Evening 0–5
  if (hour >= 5 && hour < 7)   return 'dawn';       // EarlyMorning 5–7
  if (hour >= 7 && hour < 15)  return 'day';         // Morning(7–10) + Daytime(10–13) + Lunch(13–14) + AfterSchool(14–15)
  if (hour >= 15 && hour < 19) return 'afternoon';   // Afternoon 15–19
  return 'evening';                                   // Evening 19–20
}

/** Map OWM icon code → weather mode (matches WeatherWidget.tsx pattern + scene.pkg conditions) */
function iconToWeather(icon: string): WeatherMode {
  if (icon.startsWith('01')) return 'sunny';
  if (['02', '03', '04'].some(p => icon.startsWith(p))) return 'cloudy';
  if (['09', '10', '11'].some(p => icon.startsWith(p))) return 'rainy';
  if (icon.startsWith('13')) return 'snowy';
  return 'cloudy';
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

/* ── Weather detection hook ── */

function useWeather(): WeatherMode {
  const [weather, setWeather] = useState<WeatherMode>('cloudy');

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        const key = '32aa9a705e117c99f3cd712e3a521b18';
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`
        )
          .then(r => r.json())
          .then(data => {
            if (data?.weather?.[0]) {
              setWeather(iconToWeather(data.weather[0].icon));
            }
          })
          .catch(() => { /* fall back to cloudy */ });
      },
      () => { /* geolocation denied — stay cloudy */ },
      { timeout: 5000 },
    );
  }, []);

  return weather;
}

/* ── Weather Canvas sub-component ── */
/* Ported from scene.pkg particle configs:
 *   Rain:  particles/presets/rainperspective.json — rate=400, velocity=-3000, alpha=0.3, spritetrail
 *   Snow:  particles/workshop/2795625020/Small_Snowflakes.json — rate=35, maxcount=150, gravity=-100
 *   Cloud: nuvola1/2/3 objects — drifting elliptical layers, color 0.77 0.93 1.0
 */

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  opacity: number;
}

function WeatherCanvas({ weatherMode, timePeriod }: { weatherMode: WeatherMode; timePeriod: TimePeriod }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const dropsRef = useRef<RainDrop[]>([]);
  const flakesRef = useRef<Snowflake[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const lightningRef = useRef<{ timer: number; flash: number }>({ timer: 0, flash: 0 });

  const isNight = timePeriod === 'night' || timePeriod === 'evening';

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

    // ── Initialize particles based on weather mode ──

    // Clouds — present in cloudy, rainy, snowy modes (scene.pkg nuvola objects)
    if (weatherMode === 'cloudy' || weatherMode === 'rainy' || weatherMode === 'snowy') {
      const count = weatherMode === 'cloudy' ? 6 : 4;
      cloudsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width * 1.5 - canvas.width * 0.25,
        y: 10 + Math.random() * (canvas.height * 0.3),
        w: 250 + Math.random() * 350,
        h: 50 + Math.random() * 70,
        speed: 0.3 + Math.random() * 0.6,
        opacity: weatherMode === 'cloudy'
          ? (isNight ? 0.08 + Math.random() * 0.1 : 0.1 + Math.random() * 0.15)
          : 0.06 + Math.random() * 0.08,
      }));
    } else if (weatherMode === 'sunny') {
      // Sunny — thin high clouds drifting slowly (scene.pkg heat shimmer area)
      cloudsRef.current = Array.from({ length: 2 }, () => ({
        x: Math.random() * canvas.width,
        y: 15 + Math.random() * (canvas.height * 0.15),
        w: 300 + Math.random() * 400,
        h: 20 + Math.random() * 30,
        speed: 0.15 + Math.random() * 0.2,
        opacity: 0.04 + Math.random() * 0.05,
      }));
    }

    // Rain — scene.pkg: rate=400, maxcount=512, velocity=3000, alpha=0.3, angle=-0.35rad
    if (weatherMode === 'rainy') {
      const dropCount = Math.min(512, Math.round(400 * 0.6)); // scale for web perf
      dropsRef.current = Array.from({ length: dropCount }, () => ({
        x: Math.random() * (canvas.width + 200) - 100,
        y: Math.random() * canvas.height,
        length: 18 + Math.random() * 30,
        speed: 14 + Math.random() * 10, // ~3000px/s scaled for 60fps
        opacity: 0.1 + Math.random() * 0.2, // scene.pkg alpharandom max=0.3
        width: 1 + Math.random() * 1.2,
      }));
    }

    // Snow — scene.pkg: rate=35, maxcount=150, size 50-150, gravity -100, lifetime 3-5s
    if (weatherMode === 'snowy') {
      flakesRef.current = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 4, // scaled from scene's 50-150
        speed: 0.8 + Math.random() * 1.5, // gravity -100 scaled
        drift: (Math.random() - 0.5) * 1.0, // lateral ±50 scaled
        opacity: 0.3 + Math.random() * 0.5,
        life: Math.random() * 4,
        maxLife: 3 + Math.random() * 2, // scene: lifetime 3-5s
      }));
    }

    // ── Draw helpers ──

    // Cloud color from scene.pkg nuvola: "0.77255 0.93333 1.00000"
    const cloudColor = isNight ? '140, 160, 190' : '197, 238, 255';

    function drawCloud(cloud: Cloud) {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = `rgb(${cloudColor})`;
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.w * 0.5, cloud.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x - cloud.w * 0.25, cloud.y + cloud.h * 0.1, cloud.w * 0.35, cloud.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x + cloud.w * 0.3, cloud.y - cloud.h * 0.05, cloud.w * 0.3, cloud.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── Animation loop ──

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rain overlay — scene.pkg color grading: brightness=-0.2, color temp=-0.15
      if (weatherMode === 'rainy') {
        ctx.fillStyle = 'rgba(0, 10, 30, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Drifting clouds
      for (const cloud of cloudsRef.current) {
        drawCloud(cloud);
        cloud.x += cloud.speed;
        if (cloud.x - cloud.w > canvas.width) {
          cloud.x = -cloud.w;
          cloud.y = 10 + Math.random() * (canvas.height * 0.3);
        }
      }

      // Rain streaks — angled per scene.pkg angles: -0.35 rad
      if (weatherMode === 'rainy') {
        const rainColor = isNight ? '160, 180, 220' : '180, 195, 220';
        for (const drop of dropsRef.current) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rainColor}, ${drop.opacity})`;
          ctx.lineWidth = drop.width;
          ctx.moveTo(drop.x, drop.y);
          // scene.pkg rain angle ≈ -0.35 rad → dx ≈ -0.34 per dy unit
          ctx.lineTo(drop.x - drop.length * 0.34, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= drop.speed * 0.34;

          if (drop.y > canvas.height || drop.x < -50) {
            drop.y = -drop.length - Math.random() * 100;
            drop.x = Math.random() * (canvas.width + 200) - 100;
          }
        }

        // Lightning flashes — scene.pkg "Light Fulmine" object
        const lt = lightningRef.current;
        lt.timer -= 1;
        if (lt.timer <= 0) {
          lt.timer = 300 + Math.random() * 600; // random interval
          lt.flash = 3 + Math.random() * 4;
        }
        if (lt.flash > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${lt.flash * 0.04})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          lt.flash -= 1;
        }
      }

      // Snowflakes — scene.pkg: alphafade + sizechange operators
      if (weatherMode === 'snowy') {
        for (const flake of flakesRef.current) {
          flake.life += 1 / 60;
          const lifeRatio = flake.life / flake.maxLife;
          // scene.pkg alphafade: fade in at start, fade out at end
          const alpha = lifeRatio < 0.15
            ? flake.opacity * (lifeRatio / 0.15)
            : lifeRatio > 0.85
              ? flake.opacity * ((1 - lifeRatio) / 0.15)
              : flake.opacity;
          // scene.pkg sizechange: startvalue=0.15, endvalue=0.5
          const sizeScale = 0.15 + lifeRatio * 0.35;

          ctx.beginPath();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#fff';
          ctx.arc(flake.x, flake.y, flake.size * sizeScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          flake.y += flake.speed;
          flake.x += flake.drift + Math.sin(flake.life * 2) * 0.3;

          // Reset when life expires or goes off screen
          if (flake.life >= flake.maxLife || flake.y > canvas.height + 10) {
            flake.x = Math.random() * canvas.width;
            flake.y = -5;
            flake.life = 0;
            flake.maxLife = 3 + Math.random() * 2;
            flake.size = 2 + Math.random() * 4;
            flake.drift = (Math.random() - 0.5) * 1.0;
          }
        }
      }

      // Sunny — subtle heat shimmer (scene.pkg "heat" object)
      if (weatherMode === 'sunny' && !isNight) {
        const time = performance.now() * 0.001;
        ctx.save();
        ctx.globalAlpha = 0.025;
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 3; i++) {
          const y = canvas.height * (0.3 + i * 0.15);
          const wave = Math.sin(time * 0.8 + i * 2) * 20;
          ctx.fillRect(0, y + wave, canvas.width, 2);
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [weatherMode, timePeriod, isNight]);

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
  const timePeriod = useMemo(() => getTimePeriod(date.hour), [date.hour]);
  const weatherMode = useWeather();

  // Choose background based on time period — scene.pkg texture mapping
  const bgImage = TIME_BACKGROUNDS[timePeriod];

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
        data-time={timePeriod}
        data-weather={weatherMode}
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
        <WeatherCanvas weatherMode={weatherMode} timePeriod={timePeriod} />
      </motion.div>

      {/* ── Right angular panel ── */}
      <motion.div
        className="day-prog__panel day-prog__panel--right"
        data-time={timePeriod}
        data-weather={weatherMode}
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
        <WeatherCanvas weatherMode={weatherMode} timePeriod={timePeriod} />
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
