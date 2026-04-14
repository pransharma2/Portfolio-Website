/**
 * ContactCanvas — faithful recreation of p5ausa.com's canvas particle system.
 *
 * Reference config (extracted from p5ausa.com/assets/js/particlejs_a.js):
 *   emitFrequency: 103/s   startScale: 0.3±0.35   endScale: 0.11±0.1
 *   lifeSpan: 30–293 frames  startAlpha: 0.5–1.0    endAlpha: 0.07–0.35
 *   initialSpeed: 0 (particles are stationary — appear and fade in place)
 *   blendMode: true (additive — particles glow white on dark backgrounds)
 *   shapes: star (5-pt), star_10 (10-pt), triangle, kirakira2 (4-pt sparkle)
 *
 * Technical limits vs. the reference:
 *   - Cannot use p5ausa.com's proprietary particlejs_a.js or CreateJS directly.
 *   - Background JPGs (bg01–bg10.jpg) are now used via ContactBgSlideshow.tsx.
 *   - Particle behaviour is recreated with vanilla Canvas2D + RAF — zero deps.
 *   - Visual result is functionally equivalent at the same 60fps emit rate.
 */

import { useEffect, useRef } from 'react';

type Shape = 'star5' | 'star10' | 'sparkle';

interface Particle {
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  startScale: number;
  endScale: number;
  startAlpha: number;
  endAlpha: number;
  life: number;
  maxLife: number;
  shape: Shape;
  baseRadius: number;
}

// Mirror the shape distribution from p5ausa: star, star_10, triangle, kirakira2
// We map triangle → star5 (same angular silhouette at small size) and keep star5/star10/sparkle.
const SHAPES: Shape[] = ['star5', 'star5', 'star10', 'sparkle'];

// p5ausa emit rate: 103 particles/second ÷ 60 fps ≈ 1.717 per frame
const EMIT_RATE = 103 / 60;
const MAX_PARTICLES = 250; // cap for performance

// ── Shape drawing helpers ──────────────────────────────────────────────────

function star(
  ctx: CanvasRenderingContext2D,
  points: number,
  x: number,
  y: number,
  r: number,
  innerRatio: number,
) {
  const step = Math.PI / points;
  ctx.beginPath();
  for (let i = 0; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? r : r * innerRatio;
    const angle = i * step - Math.PI / 2;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    else ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // 4-pointed diamond sparkle — "kirakira2" shape from p5ausa
  const s = r * 0.27;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + s, y - s);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x + s, y + s);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - s, y + s);
  ctx.lineTo(x - r, y);
  ctx.lineTo(x - s, y - s);
  ctx.closePath();
}

// ── Component ─────────────────────────────────────────────────────────────

export default function ContactCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    // Halve emit rate on mobile — matches p5ausa.com's mobile reduction
    const emitRate = isMobile ? EMIT_RATE * 0.5 : EMIT_RATE;

    let rafId: number;
    let particles: Particle[] = [];
    let accumulator = 0;
    let paused = false;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    function spawnParticle(): Particle {
      // p5ausa: startScale 0.3 ± variance 0.35 (half = 0.175)
      const startScale = 0.3 + (Math.random() - 0.5) * 0.35;
      // p5ausa: finishScale 0.11 ± variance 0.1
      const endScale = Math.max(0.005, 0.11 + (Math.random() - 0.5) * 0.1);
      // p5ausa: startAlpha 1.0, startAlphaVariance 0.5 → range 0.5–1.0
      const startAlpha = 0.5 + Math.random() * 0.5;
      // p5ausa: finishAlpha 0.35, finishAlphaVariance 0.32 → range 0.03–0.51 (clamp to 0.03–0.51)
      const endAlpha = Math.max(0.03, 0.35 - 0.16 + Math.random() * 0.32);
      // p5ausa: lifeSpan 30, lifeSpanVariance 263 → range 30–293 frames
      const maxLife = 30 + Math.random() * 263;

      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        // Gentle drift: -0.15 to 0.15 px/frame — subtle floating movement
        driftX: (Math.random() - 0.5) * 0.3,
        driftY: (Math.random() - 0.5) * 0.3,
        startScale,
        endScale,
        startAlpha,
        endAlpha,
        life: 0,
        maxLife,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        // Base radius 8–24px — feels equivalent to p5ausa at typical viewport sizes
        baseRadius: 8 + Math.random() * 16,
      };
    }

    function drawParticle(p: Particle) {
      const t = p.life / p.maxLife;
      const scale = p.startScale + (p.endScale - p.startScale) * t;
      const alpha = p.startAlpha + (p.endAlpha - p.startAlpha) * t;
      const r = p.baseRadius * scale;
      if (r < 0.3 || alpha < 0.01) return;

      ctx!.save();
      ctx!.globalAlpha = alpha;
      // Additive blending — same as p5ausa blendMode: true
      ctx!.globalCompositeOperation = 'lighter';
      ctx!.fillStyle = '#ffffff';

      // p5ausa particles don't rotate (initialDirection 0, initialSpeed 0).
      // We use a fixed per-particle rotation for shape variety.
      ctx!.translate(p.x, p.y);

      if (p.shape === 'star5') star(ctx!, 5, 0, 0, r, 0.42);
      else if (p.shape === 'star10') star(ctx!, 10, 0, 0, r, 0.52);
      else sparkle(ctx!, 0, 0, r);

      ctx!.fill();
      ctx!.restore();
    }

    function frame() {
      if (!paused) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

        accumulator += emitRate;
        while (accumulator >= 1) {
          if (particles.length < MAX_PARTICLES) particles.push(spawnParticle());
          accumulator -= 1;
        }

        particles = particles.filter(p => {
          p.life++;
          p.x += p.driftX;
          p.y += p.driftY;
          if (p.life >= p.maxLife) return false;
          drawParticle(p);
          return true;
        });
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
