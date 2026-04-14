import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * JokerCutIn — Persona 5 day-progression cinematic intro.
 *
 * Plays once per session on home page load (hard refresh / first visit).
 * Inspired by the Unity recreation at:
 *   github.com/Jack-Pettigrew/Persona-5-Day-Progression
 *
 * Three phases (~1.6s total):
 *   Phase 1 (0–300ms):   Black angular panels sweep in from both sides
 *   Phase 2 (300–1200ms): Date stamp — bold weekday, month/day, red accents
 *   Phase 3 (1200–1600ms): Panels sweep out, reveal page
 *
 * Respects prefers-reduced-motion. Uses sessionStorage for once-per-session.
 */

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

const WEEKDAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
] as const;

const EASE_SHARP: [number, number, number, number] = [0.76, 0, 0.24, 1];
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Total animation duration in ms */
const TOTAL_MS = 1600;
/** Delay before showing the intro (wait for page-reveal overlay) */
const START_DELAY_MS = 400;

function getDateParts() {
  const now = new Date();
  return {
    month: MONTHS[now.getMonth()],
    day: now.getDate(),
    weekday: WEEKDAYS[now.getDay()],
  };
}

export default function JokerCutIn() {
  const [phase, setPhase] = useState<'idle' | 'cover' | 'stamp' | 'exit' | 'done'>('idle');
  const date = useMemo(getDateParts, []);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Once per session
    if (sessionStorage.getItem('p5IntroSeen')) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: panels sweep in
    timers.push(setTimeout(() => setPhase('cover'), START_DELAY_MS));

    // Phase 2: show date stamp
    timers.push(setTimeout(() => setPhase('stamp'), START_DELAY_MS + 300));

    // Phase 3: sweep out
    timers.push(setTimeout(() => setPhase('exit'), START_DELAY_MS + 1200));

    // Done — unmount
    timers.push(setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('p5IntroSeen', '1');
    }, START_DELAY_MS + TOTAL_MS + 100));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'idle' || phase === 'done') return null;

  const stampVisible = phase === 'stamp';
  const exiting = phase === 'exit';

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
        initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
        animate={
          exiting
            ? { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }
            : { clipPath: 'polygon(0 0, 58% 0, 48% 100%, 0 100%)' }
        }
        transition={{
          duration: exiting ? 0.28 : 0.26,
          ease: EASE_SHARP,
        }}
      />

      {/* ── Right angular panel ── */}
      <motion.div
        className="day-prog__panel day-prog__panel--right"
        initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
        animate={
          exiting
            ? { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }
            : { clipPath: 'polygon(46% 0, 100% 0, 100% 100%, 36% 100%)' }
        }
        transition={{
          duration: exiting ? 0.28 : 0.26,
          ease: EASE_SHARP,
        }}
      />

      {/* ── Red accent slash (between panels) ── */}
      <motion.div
        className="day-prog__slash"
        initial={{ clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
        animate={
          exiting
            ? { clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }
            : { clipPath: 'polygon(46% 0, 58% 0, 48% 100%, 36% 100%)' }
        }
        transition={{
          duration: exiting ? 0.2 : 0.22,
          delay: exiting ? 0 : 0.06,
          ease: EASE_SHARP,
        }}
      />

      {/* ── Date stamp content ── */}
      <AnimatePresence>
        {stampVisible && (
          <motion.div
            className="day-prog__stamp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Weekday — large bold skewed text */}
            <motion.div
              className="day-prog__weekday"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              {date.weekday}
            </motion.div>

            {/* Red accent bar */}
            <motion.div
              className="day-prog__bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2, delay: 0.08, ease: EASE_SHARP }}
            />

            {/* Month + Day */}
            <motion.div
              className="day-prog__date"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.1, ease: EASE_OUT }}
            >
              <span className="day-prog__month">{date.month}</span>
              <span className="day-prog__day">{date.day}</span>
            </motion.div>

            {/* Decorative throwing knife accent */}
            <motion.img
              src="/img/p5-throwing-knife.png"
              alt=""
              className="day-prog__knife"
              initial={{ opacity: 0, x: 60, rotate: -20 }}
              animate={{ opacity: 0.7, x: 0, rotate: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: EASE_OUT }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
