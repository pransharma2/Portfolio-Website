import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * JokerCutIn — Persona 5 day-progression cinematic intro.
 *
 * Faithfully recreates the P5 day-progression animation from:
 *   github.com/Jack-Pettigrew/Persona-5-Day-Progression
 *
 * Six phases (~4s total):
 *   Phase 1 — panels-in   (0–500ms):    Black hatched panels sweep in from both sides
 *   Phase 2 — day-scroll   (500–2000ms): Day numbers cycle rapidly, weekday slides in
 *   Phase 3 — day-hold     (2000–3200ms): Date stamp holds, knife accent slides in
 *   Phase 4 — panels-out   (3200–3700ms): Panels sweep back out
 *   Phase 5 — done         (3800ms):      Unmount
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
  };
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

  const panelsVisible = phase !== 'idle' && phase !== 'done';
  const panelsExiting = phase === 'panels-out';
  const stampVisible = phase === 'day-scroll' || phase === 'day-hold';
  const showScroller = phase === 'day-scroll' || phase === 'day-hold';
  const holdPhase = phase === 'day-hold';

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
      {/* ── Diagonal hatching overlay (across entire viewport during panels) ── */}
      <motion.div
        className="day-prog__hatch-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: panelsExiting ? 0 : 0.06 }}
        transition={{ duration: panelsExiting ? 0.2 : 0.4 }}
      />

      {/* ── Left angular panel ── */}
      <motion.div
        className="day-prog__panel day-prog__panel--left"
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
      />

      {/* ── Right angular panel ── */}
      <motion.div
        className="day-prog__panel day-prog__panel--right"
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
      />

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

      {/* ── Red edge lines (subtle accent on panel edges) ── */}
      {panelsVisible && !panelsExiting && (
        <>
          <motion.div
            className="day-prog__edge-line day-prog__edge-line--left"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.15, ease: EASE_SHARP }}
          />
          <motion.div
            className="day-prog__edge-line day-prog__edge-line--right"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.15, ease: EASE_SHARP }}
          />
        </>
      )}

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
