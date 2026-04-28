import { useEffect, useRef } from 'react';

/**
 * StarPatternCanvas
 *
 * Faithful port of BuyMyBeard/StarPattern (github.com/BuyMyBeard/StarPattern)
 * using raw WebGL2 instanced rendering — no PixiJS dependency required.
 *
 * The visual is driven by the exact GLSL fragment shader from the reference:
 *   - Each "star" is a quad rendered via a SDF (Signed Distance Function)
 *   - The SDF draws a 5-pointed star with concentric animated rings
 *   - col1 = black, col2 = red  (the reference's "Red" background type)
 *   - Half of the star instances spin clockwise, half counter-clockwise
 *   - Star count and size scale responsively to viewport area
 *
 * Using instanced rendering (gl.drawElementsInstanced) renders all N stars
 * in a single draw call rather than N separate PixiJS mesh draw calls.
 */

// ---------------------------------------------------------------------------
// Vertex shader — positions each quad instance by center, rotation, scale
// ---------------------------------------------------------------------------
const VERT = `#version 300 es
precision mediump float;

in vec2  aPosition;   // unit quad vertex: [-0.5, 0.5]
in vec2  aUV;         // texture coords:   [0, 1]

// Per-instance data (divisor = 1)
in vec2  iCenter;
in float iRotation;
in float iScale;
in float iSpeed;
in float iOffset;

out vec2  vUvs;
out float vSpeed;
out float vOffset;

uniform vec2 uResolution;

void main() {
    vUvs    = aUV;
    vSpeed  = iSpeed;
    vOffset = iOffset;

    float c = cos(iRotation);
    float s = sin(iRotation);

    // Rotate the quad vertex, then scale to pixel size
    vec2 p = vec2(
        aPosition.x * c - aPosition.y * s,
        aPosition.x * s + aPosition.y * c
    ) * iScale;

    // Translate to instance centre, then map to NDC (y-flipped)
    vec2 world = p + iCenter;
    vec2 ndc   = world / uResolution * 2.0 - 1.0;
    ndc.y     = -ndc.y;

    gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Fragment shader — exact port of StarPattern.frag from BuyMyBeard/StarPattern
// Uses SDF to render an animated pulsing 5-pointed star (concentric rings).
// ---------------------------------------------------------------------------
const FRAG = `#version 300 es
precision mediump float;

#define PI     3.14159
#define N_STAR 5.0
#define RINGS  4

in vec2  vUvs;
in float vSpeed;
in float vOffset;

out vec4 fragColor;

uniform float uTime;

// Red background type from the reference: col1 = black, col2 = dark red
const vec3 COL1 = vec3(0.0,  0.0,  0.0);
const vec3 COL2 = vec3(0.72, 0.0,  0.0);

const float teta        = 1.256637;  // 2*PI / 5
const float cosTeta     = cos(teta);
const float sinTeta     = sin(teta);
const float cosHalfTeta = cos(teta * 0.5);
const float sinHalfTeta = sin(teta * 0.5);

// SDF for a 5-pointed star, adapted from shadertoy.com/view/4fs3zf
float starSDF(vec2 p, float radius, float inset)
{
    mat2 rot = mat2(cosTeta, sinTeta, -sinTeta, cosTeta);
    vec2 p1  = vec2(0.0, radius);
    vec2 p2  = vec2(sinHalfTeta, cosHalfTeta) * radius * inset;

    float tetaP = PI + atan(-p.x, -p.y);
    tetaP = mod(tetaP + PI / N_STAR, 2.0 * PI);

    // Rotate p into the canonical sector (integer loop safe for WebGL2)
    for (int k = 0; k < 80; k++) {
        float fi = float(k + 1) * teta;
        if (fi >= tetaP) break;
        p = rot * p;
    }

    p.x = abs(p.x);

    vec2  ba = p2 - p1;
    vec2  pa = p  - p1;
    float h  = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d  = length(pa - h * ba);
    d       *= sign(dot(p - p1, -vec2(ba.y, -ba.x)));
    return d;
}

// Builds the concentric pulsing ring pattern inside the star
float starPattern(vec2 p, float t)
{
    float colSum = 0.0;
    for (int i = 0; i < RINGS * 2; i++) {
        float fi     = float(i);
        float delta  = fi - (2.0 * fract(t * vSpeed) - 1.0);
        float radius = 1.0 - delta / float(RINGS * 2);
        float ring   = 1.0 - smoothstep(-0.008, -0.001, starSDF(p, radius, 0.6));
        colSum       = (i % 2 == 0) ? colSum + ring : colSum - ring;
    }
    // Inner star that appears as rings start
    float innerDelta  = 2.0 * fract(t * vSpeed) - 1.0;
    float innerRadius = innerDelta / float(RINGS * 2);
    if (innerRadius > 0.0) {
        float inner = 1.0 - smoothstep(-0.008, -0.001, starSDF(p, innerRadius, 0.6));
        colSum += inner;
    }
    return colSum;
}

void main()
{
    // Map UV [0,1] → signed [-1,1] space (flip Y to match PixiJS convention)
    vec2  uv     = vUvs * 2.0 - 1.0;
    uv.y        *= -1.0;

    float t      = uTime + vOffset;
    float starC  = starPattern(uv, t);

    // Alpha cutout: 1 inside the star outline, 0 outside
    float cutout = starSDF(uv, 1.0, 0.6);
    float alpha  = 1.0 - smoothstep(-0.008, -0.001, cutout);

    fragColor = vec4(mix(COL1, COL2, starC), alpha);
}
`;

// ---------------------------------------------------------------------------
// Helpers matching Generator.ts from the reference
// ---------------------------------------------------------------------------
function remap(val: number, a: number, b: number, c: number, d: number) {
  return c + (d - c) * ((val - a) / (b - a));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function StarPatternCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) return; // graceful fallback — CSS ::before dark bg remains

    // --- Shader compilation -------------------------------------------------
    function compileShader(src: string, type: number): WebGLShader {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[StarPattern] shader error:', gl.getShaderInfoLog(s));
      }
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(VERT, gl.VERTEX_SHADER));
    gl.attachShader(prog, compileShader(FRAG, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[StarPattern] link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // --- Geometry: unit quad centred at origin --------------------------------
    //  vertex layout: [x, y, u, v]  (4 bytes each)
    const quadVerts = new Float32Array([
      -0.5, -0.5,  0.0, 0.0,
       0.5, -0.5,  1.0, 0.0,
       0.5,  0.5,  1.0, 1.0,
      -0.5,  0.5,  0.0, 1.0,
    ]);
    const quadIdx = new Uint16Array([0, 1, 2,  0, 2, 3]);

    const vbuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    const ibuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quadIdx, gl.STATIC_DRAW);

    // --- Instance data matching Generator.ts ---------------------------------
    // Star count and scale use the reference's responsive remap
    const FULL_HD = 1_500_000;
    const PHONE   = 300_000;
    const vol     = W * H;
    const gScale  = remap(vol, FULL_HD, PHONE, 1.0, 0.75);
    const count   = Math.round(remap(vol, FULL_HD, PHONE, 120, 50));

    // Per-instance buffer: [cx, cy, rotation, scale, speed, offset] = 6 floats
    const STRIDE_F = 6;
    const instArr  = new Float32Array(count * STRIDE_F);
    for (let i = 0; i < count; i++) {
      const o    = i * STRIDE_F;
      const sc   = (120 + Math.random() * 240) * gScale; // 120–360 px, wider range for better coverage
      instArr[o    ] = Math.random() * W;          // cx
      instArr[o + 1] = Math.random() * H;          // cy
      instArr[o + 2] = Math.random() * Math.PI * 2; // rotation (rad)
      instArr[o + 3] = sc;                          // scale (px)
      instArr[o + 4] = i < count / 2 ? 0.25 : -0.25; // speed: ½ cw, ½ ccw
      instArr[o + 5] = Math.random() * 100;         // time offset
    }

    const ibufInst = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, ibufInst);
    gl.bufferData(gl.ARRAY_BUFFER, instArr, gl.STATIC_DRAW);

    // --- VAO setup -----------------------------------------------------------
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    // Quad geometry attributes (per-vertex, divisor = 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    const aPos = gl.getAttribLocation(prog, 'aPosition');
    const aUV  = gl.getAttribLocation(prog, 'aUV');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV,  2, gl.FLOAT, false, 16, 8);

    // Instance attributes (per-instance, divisor = 1)
    gl.bindBuffer(gl.ARRAY_BUFFER, ibufInst);
    const STRIDE_B = STRIDE_F * 4; // bytes

    const iCenter   = gl.getAttribLocation(prog, 'iCenter');
    const iRotation = gl.getAttribLocation(prog, 'iRotation');
    const iScale    = gl.getAttribLocation(prog, 'iScale');
    const iSpeed    = gl.getAttribLocation(prog, 'iSpeed');
    const iOffset   = gl.getAttribLocation(prog, 'iOffset');

    gl.enableVertexAttribArray(iCenter);
    gl.vertexAttribPointer(iCenter, 2, gl.FLOAT, false, STRIDE_B, 0);
    gl.vertexAttribDivisor(iCenter, 1);

    gl.enableVertexAttribArray(iRotation);
    gl.vertexAttribPointer(iRotation, 1, gl.FLOAT, false, STRIDE_B, 8);
    gl.vertexAttribDivisor(iRotation, 1);

    gl.enableVertexAttribArray(iScale);
    gl.vertexAttribPointer(iScale, 1, gl.FLOAT, false, STRIDE_B, 12);
    gl.vertexAttribDivisor(iScale, 1);

    gl.enableVertexAttribArray(iSpeed);
    gl.vertexAttribPointer(iSpeed, 1, gl.FLOAT, false, STRIDE_B, 16);
    gl.vertexAttribDivisor(iSpeed, 1);

    gl.enableVertexAttribArray(iOffset);
    gl.vertexAttribPointer(iOffset, 1, gl.FLOAT, false, STRIDE_B, 20);
    gl.vertexAttribDivisor(iOffset, 1);

    // Bind element buffer inside the VAO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bindVertexArray(null);

    // --- Uniforms ------------------------------------------------------------
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uRes  = gl.getUniformLocation(prog, 'uResolution');
    gl.uniform2f(uRes, W, H);

    // Blend equivalent to PixiJS BLEND_MODES.NORMAL_NPM (non-premultiplied alpha)
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,       gl.ONE_MINUS_SRC_ALPHA,
    );

    // --- Render loop (throttled to ~30fps) -----------------------------------
    const t0 = performance.now();
    let rafId: number;
    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 30; // ~33ms per frame

    function render() {
      rafId = requestAnimationFrame(render);
      const now = performance.now();
      if (now - lastFrame < FRAME_INTERVAL) return;
      lastFrame = now;

      const t = (now - t0) / 1000;
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.bindVertexArray(vao);
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, count);
    }

    // Pause rendering when tab is hidden (performance)
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else render();
    };
    document.addEventListener('visibilitychange', onVisibility);

    render();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteProgram(prog);
      gl.deleteBuffer(vbuf);
      gl.deleteBuffer(ibuf);
      gl.deleteBuffer(ibufInst);
      gl.deleteVertexArray(vao);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,        // sits above the dark CSS fallback (z-index: -3)
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}
