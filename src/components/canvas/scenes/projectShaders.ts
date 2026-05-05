/**
 * 6 unique fragment shaders, one per project.
 * All share the same vertex shader (UV pass + position).
 * Colors come from the brief (override project.accent).
 */

import { ShaderMaterial, Color, AdditiveBlending } from "three";

export type ProjectShaderId =
  | "fluvo"
  | "alternance-hunt"
  | "nexus-agent"
  | "arcane-fury"
  | "lea-hugo-noam"
  | "jarvis";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Soft rounded-rect mask (border radius simulation)
const MASK = /* glsl */ `
  float roundedMask(vec2 uv, float radius) {
    vec2 q = abs(uv - 0.5) - (0.5 - radius);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    return 1.0 - smoothstep(-0.005, 0.005, d);
  }
`;

const NOISE = /* glsl */ `
  // Simplex-ish 2D hash noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }
`;

// 1. Fluvo — liquid waves in blue
const FLUVO = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  ${MASK}
  ${NOISE}
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.4;
    // Layered horizontal waves
    float w1 = sin(uv.x * 6.0 + t) * 0.06;
    float w2 = sin(uv.x * 10.0 + t * 1.3 + 1.5) * 0.04;
    float w3 = noise(uv * 3.0 + vec2(t, 0.0)) * 0.08;
    float band = smoothstep(0.5, 0.45, abs(uv.y - 0.5 + w1 + w2 + w3));
    float lower = smoothstep(0.6, 0.0, uv.y);
    vec3 col = uColor * (band * 0.9 + lower * 0.25);
    col += uColor * 0.06; // ambient glow
    float mask = roundedMask(uv, 0.04);
    gl_FragColor = vec4(col * mask, mask);
  }
`;

// 2. Alternance Hunt — particles converging (radial dots)
const ALT_HUNT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  ${MASK}
  ${NOISE}
  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= 1.6;
    float t = uTime * 0.5;
    float total = 0.0;
    for (int i = 0; i < 24; i++) {
      float fi = float(i);
      float seed = hash(vec2(fi, fi * 1.3));
      float ang = seed * 6.28 + t * 0.2;
      float rad = mix(0.3, 0.05, fract(t * 0.4 + seed));
      vec2 p = vec2(cos(ang), sin(ang)) * rad;
      float d = length(uv - p);
      total += smoothstep(0.025, 0.0, d) * (1.0 - rad / 0.3);
    }
    float core = smoothstep(0.18, 0.0, length(uv)) * 0.6;
    vec3 col = uColor * (total + core);
    float mask = roundedMask(vUv, 0.04);
    gl_FragColor = vec4(col * mask, mask * (0.2 + total + core));
  }
`;

// 3. NEXUS — wireframe icosphere (2D projection)
const NEXUS = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  ${MASK}
  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= 1.6;
    float r = length(uv);
    float t = uTime * 0.5;
    float pulse = 0.7 + sin(t) * 0.15;
    // 6 rotated lines simulating wireframe edges
    float lines = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float ang = fi * 0.523599 + t * 0.15;
      vec2 dir = vec2(cos(ang), sin(ang));
      float d = abs(dot(uv, vec2(-dir.y, dir.x)));
      lines += smoothstep(0.012, 0.0, d) * smoothstep(0.65 * pulse, 0.6 * pulse, r);
    }
    // Concentric rings
    float rings = 0.0;
    for (int i = 1; i <= 3; i++) {
      float radius = float(i) * 0.18 * pulse;
      rings += smoothstep(0.012, 0.0, abs(r - radius));
    }
    float center = smoothstep(0.06, 0.0, r);
    vec3 col = uColor * (lines * 0.8 + rings * 0.6 + center);
    float mask = roundedMask(vUv, 0.04);
    gl_FragColor = vec4(col * mask, mask * (lines * 0.8 + rings * 0.6 + center * 1.2));
  }
`;

// 4. Arcane Fury — embers rising
const ARCANE = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  ${MASK}
  ${NOISE}
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.3;
    float total = 0.0;
    for (int i = 0; i < 30; i++) {
      float fi = float(i);
      float seedX = hash(vec2(fi, 1.0));
      float seedY = fract(t * (0.3 + seedX * 0.4) + hash(vec2(fi, 2.0)));
      float x = seedX + sin(seedY * 6.28 + fi) * 0.04;
      float y = 1.0 - seedY;
      vec2 p = vec2(x, y);
      float d = length((uv - p) * vec2(1.6, 1.0));
      float bright = smoothstep(0.025, 0.0, d) * smoothstep(0.0, 0.3, seedY);
      total += bright;
    }
    // Bottom glow
    float ground = smoothstep(0.4, 0.0, uv.y) * 0.4;
    vec3 col = uColor * (total + ground);
    col += vec3(1.0, 0.5, 0.2) * total * 0.5;
    float mask = roundedMask(uv, 0.04);
    gl_FragColor = vec4(col * mask, mask * (0.2 + total + ground));
  }
`;

// 5. Léa·Hugo·Noam — 3 orbiting points
const LEA = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  ${MASK}
  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= 1.6;
    float t = uTime * 0.6;
    float total = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float ang = t + fi * 2.094;
      float rad = 0.35;
      vec2 p = vec2(cos(ang), sin(ang)) * rad;
      float d = length(uv - p);
      total += smoothstep(0.08, 0.0, d) * 1.2;
      // Connection lines
      float ang2 = t + (fi + 1.0) * 2.094;
      vec2 q = vec2(cos(ang2), sin(ang2)) * rad;
      vec2 mid = (p + q) * 0.5;
      vec2 dir = normalize(q - p);
      float along = dot(uv - p, dir);
      vec2 proj = p + dir * clamp(along, 0.0, length(q - p));
      float lineD = length(uv - proj);
      total += smoothstep(0.012, 0.0, lineD) * 0.4;
    }
    vec3 col = uColor * total;
    float mask = roundedMask(vUv, 0.04);
    gl_FragColor = vec4(col * mask, mask * (0.18 + total));
  }
`;

// 6. Jarvis — terminal text + CRT scanlines
const JARVIS = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  ${MASK}
  ${NOISE}
  void main() {
    vec2 uv = vUv;
    float t = uTime;
    // Vertical scanlines
    float scan = 0.5 + 0.5 * sin(uv.y * 220.0);
    // Horizontal "text" bands
    float row = floor(uv.y * 18.0);
    float rowSeed = hash(vec2(row, floor(t * 0.3)));
    float charLen = mix(0.2, 0.7, rowSeed);
    float band = step(uv.x, charLen) * step(0.4, fract(uv.x * 30.0 + rowSeed * 5.0));
    // Cursor blink
    float cursor = step(charLen - 0.02, uv.x) * step(uv.x, charLen) *
                   step(0.5, sin(t * 4.0));
    float total = (band * 0.6 + cursor * 1.2);
    // Subtle flicker
    total *= 0.85 + 0.15 * noise(vec2(t * 5.0, row));
    vec3 col = uColor * total;
    col *= (0.6 + scan * 0.5); // CRT scanline darken
    float mask = roundedMask(uv, 0.04);
    gl_FragColor = vec4(col * mask, mask * (0.15 + total * 0.9));
  }
`;

const FRAGS: Record<ProjectShaderId, string> = {
  fluvo: FLUVO,
  "alternance-hunt": ALT_HUNT,
  "nexus-agent": NEXUS,
  "arcane-fury": ARCANE,
  "lea-hugo-noam": LEA,
  jarvis: JARVIS,
};

export const SHADER_COLORS: Record<ProjectShaderId, string> = {
  fluvo: "#5B8DEE",
  "alternance-hunt": "#4FD1C5",
  "nexus-agent": "#9F7AEA",
  "arcane-fury": "#FF6B35",
  "lea-hugo-noam": "#FFB454",
  jarvis: "#38B2AC",
};

export function makeProjectMaterial(id: ProjectShaderId): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAGS[id],
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(SHADER_COLORS[id]) },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}
