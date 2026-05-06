'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ShaderMaterial, Group, BoxGeometry } from 'three';
import { Project } from '@/data/projects';
import { useStore } from '@/store/useStore';

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

const SHADERS: Record<string, string> = {
  waves: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    void main() {
      vec2 uv = vUv;
      float t = u_time * 0.35;
      uv.x += sin(uv.y * 6.0 + t) * 0.04;
      uv.y += cos(uv.x * 4.0 - t * 0.7) * 0.03;
      float w1 = sin(uv.x * 8.0 + t * 1.2) * sin(uv.y * 6.0 - t) * 0.5 + 0.5;
      float w2 = sin((uv.x + uv.y) * 5.0 - t * 0.8) * 0.3 + 0.7;
      float combined = w1 * w2;
      float depth = pow(1.0 - uv.y, 1.5) * 0.4;
      vec3 deep = vec3(0.04, 0.08, 0.28);
      vec3 light = vec3(0.22, 0.43, 0.87);
      vec3 highlight = vec3(0.5, 0.75, 1.0);
      vec3 col = mix(deep, light, combined);
      col = mix(col, highlight, pow(combined, 3.0) * 0.6);
      col += depth;
      vec2 c = uv * 2.0 - 1.0;
      float vig = 1.0 - dot(c * 0.45, c * 0.45);
      col *= vig;
      col *= (0.5 + u_hover * 0.6);
      float bx = smoothstep(0.92, 1.0, uv.x) + smoothstep(0.08, 0.0, uv.x);
      float by = smoothstep(0.94, 1.0, uv.y) + smoothstep(0.06, 0.0, uv.y);
      col += vec3(0.22, 0.43, 0.87) * max(bx, by) * u_hover * 2.0;
      gl_FragColor = vec4(col, 1.0);
    }`,
  matrix: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
    void main() {
      vec2 uv = vUv;
      float t = u_time * 0.5;
      vec3 col = vec3(0.0);
      float cols = 20.0;
      for (float i = 0.0; i < cols; i++) {
        float x = i / cols + 0.5 / cols;
        float speed = 0.3 + h(vec2(i, 0.0)) * 0.5;
        float offset = h(vec2(i, 1.0));
        float y = fract(uv.y - t * speed - offset);
        float dist = abs(uv.x - x) * cols;
        float brightness = (1.0 - y) * (1.0 - y) * max(0.0, 1.0 - dist * 1.5);
        col += vec3(0.13, 0.83, 0.50) * brightness * 1.5;
        float head = smoothstep(0.02, 0.0, y);
        col += vec3(0.6, 1.0, 0.8) * head * max(0.0, 1.0 - dist * 2.0) * 2.0;
      }
      vec2 target = vec2(0.5, 0.15);
      float toTarget = 1.0 - length(uv - target) * 1.5;
      col += vec3(0.13, 0.83, 0.50) * max(0.0, toTarget) * 0.8;
      vec2 c = uv * 2.0 - 1.0;
      col *= 1.0 - dot(c * 0.35, c * 0.35);
      col *= (0.4 + u_hover * 0.7);
      gl_FragColor = vec4(col, 1.0);
    }`,
  wireframe: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      float t = u_time * 0.4;
      vec3 col = vec3(0.0);
      for (int i = 0; i < 12; i++) {
        vec2 seed = vec2(float(i) * 0.1734, float(i) * 0.2891);
        vec2 pos = vec2(h(seed) * 2.0 - 1.0, h(seed + 0.5) * 2.0 - 1.0) * 0.85;
        float pulse = sin(t * 1.5 + float(i) * 0.8) * 0.5 + 0.5;
        float d = length(uv - pos);
        col += vec3(0.08, 0.76, 0.93) * 0.015 / (d + 0.02) * pulse;
        col += vec3(0.5, 0.9, 1.0) * smoothstep(0.05, 0.0, d) * pulse * 2.0;
      }
      float r = length(uv);
      float rings = sin(r * 15.0 - t * 3.0) * 0.5 + 0.5;
      rings *= exp(-r * 2.0);
      col += vec3(0.08, 0.76, 0.93) * rings * 0.4;
      col *= (1.0 - dot(uv * 0.3, uv * 0.3));
      col *= (0.4 + u_hover * 0.7);
      gl_FragColor = vec4(col, 1.0);
    }`,
  embers: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float n(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(
        mix(fract(sin(dot(i,vec2(127.1,311.7)))*43758.5),fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5),f.x),
        mix(fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5),fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5),f.x),
      f.y);
    }
    void main() {
      vec2 uv = vUv; float t = u_time * 0.4;
      float rock = n(uv * 4.0) * n(uv * 8.0 + vec2(t*0.1, 0.0));
      vec3 base = mix(vec3(0.06, 0.02, 0.01), vec3(0.15, 0.05, 0.02), rock);
      float lava = n(uv * 3.0 + vec2(0.0, t * 0.08));
      lava = pow(lava, 3.0);
      vec3 lavaCol = mix(vec3(0.8, 0.1, 0.0), vec3(1.0, 0.6, 0.05), lava);
      base = mix(base, lavaCol, lava * 0.7);
      float sparks = 0.0;
      for (float i = 0.0; i < 8.0; i++) {
        float speed = 0.15 + fract(sin(i) * 43758.5) * 0.15;
        float ox = (fract(sin(i * 127.1) * 43758.5) - 0.5) * 0.6;
        vec2 pos = vec2(0.5 + ox, fract(t * speed + fract(sin(i * 311.7) * 43758.5)));
        pos.x += sin(pos.y * 8.0 + t + i) * 0.04;
        float d = length(uv - pos);
        sparks += smoothstep(0.025, 0.0, d) * (1.0 - pos.y);
      }
      base += vec3(1.0, 0.5, 0.1) * sparks * 3.0;
      float light = pow(1.0 - uv.y, 2.0) * 0.5;
      base += vec3(0.6, 0.1, 0.0) * light;
      vec2 c = uv * 2.0 - 1.0;
      base *= 1.0 - dot(c * 0.4, c * 0.4);
      base *= (0.5 + u_hover * 0.6);
      gl_FragColor = vec4(base, 1.0);
    }`,
  orbs: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      float t = u_time * 0.5;
      vec3 col = vec3(0.0);
      vec3 colors[3];
      colors[0] = vec3(0.55, 0.36, 0.97);
      colors[1] = vec3(0.08, 0.78, 0.95);
      colors[2] = vec3(0.20, 0.83, 0.60);
      for (int i = 0; i < 3; i++) {
        float angle = t + float(i) * 2.094;
        float r = 0.45 + sin(t * 0.3 + float(i)) * 0.05;
        vec2 pos = vec2(cos(angle) * r, sin(angle) * r);
        float d = length(uv - pos);
        col += colors[i] * 0.025 / (d * d + 0.008);
        col += colors[i] * smoothstep(0.08, 0.0, d) * 3.0;
        for (float j = 1.0; j < 5.0; j++) {
          float trailAngle = angle - j * 0.15;
          vec2 trailPos = vec2(cos(trailAngle) * r, sin(trailAngle) * r);
          float td = length(uv - trailPos);
          col += colors[i] * smoothstep(0.04, 0.0, td) * (1.0 - j/5.0) * 0.8;
        }
      }
      for (int i = 0; i < 3; i++) {
        for (int j = i+1; j < 3; j++) {
          float ai = t + float(i) * 2.094;
          float aj = t + float(j) * 2.094;
          vec2 pi2 = vec2(cos(ai) * 0.45, sin(ai) * 0.45);
          vec2 pj = vec2(cos(aj) * 0.45, sin(aj) * 0.45);
          vec2 dir = pj - pi2;
          float len = length(dir);
          float proj = dot(uv - pi2, dir / len) / len;
          proj = clamp(proj, 0.0, 1.0);
          vec2 closest = pi2 + proj * dir;
          float lineDist = length(uv - closest);
          float pulse = sin(t * 2.0 + float(i+j)) * 0.5 + 0.5;
          col += vec3(0.4, 0.6, 1.0) * smoothstep(0.015, 0.0, lineDist) * pulse * 0.5;
        }
      }
      float center = exp(-length(uv) * 4.0);
      col += vec3(1.0, 0.71, 0.33) * center * 0.8;
      col *= (1.0 - dot(uv * 0.3, uv * 0.3));
      col *= (0.4 + u_hover * 0.7);
      gl_FragColor = vec4(col, 1.0);
    }`,
  crt: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(float n) { return fract(sin(n) * 43758.5); }
    float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
    void main() {
      vec2 uv = vUv;
      float t = u_time * 0.6;
      vec2 c = uv * 2.0 - 1.0;
      c *= 1.0 + dot(c, c) * 0.05;
      uv = c * 0.5 + 0.5;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return;
      }
      vec3 col = vec3(0.02, 0.08, 0.03);
      float scan = sin(uv.y * 300.0) * 0.04 + 0.96;
      for (float i = 0.0; i < 15.0; i++) {
        float y = i / 15.0 + 0.033;
        float lineLen = 0.3 + h(i + floor(t * 0.2) * 0.1) * 0.6;
        float scroll = fract(t * 0.15 + i * 0.07);
        float lineY = fract(y - scroll);
        if (lineY > 1.0/15.0) continue;
        float inLine = step(0.02, uv.x) * step(uv.x, lineLen) *
                       step(lineY, 0.006) * step(0.001, lineY);
        float chars = step(0.5, h2(vec2(floor(uv.x * 60.0), floor(lineY * 200.0))));
        col += vec3(0.15, 0.85, 0.35) * inLine * chars * 0.9 * scan;
        float cursor = step(lineLen, uv.x) * step(uv.x, lineLen + 0.025) *
                       step(lineY, 0.006) * step(0.001, lineY) *
                       (sin(t * 4.0) * 0.5 + 0.5);
        col += vec3(0.2, 1.0, 0.4) * cursor * 1.5;
      }
      float glitch = step(0.985, h(floor(t * 15.0) + floor(uv.y * 20.0)));
      col.rgb = mix(col.rgb, col.gbr, glitch * 0.5);
      vec2 cv = uv * 2.0 - 1.0;
      float vig = (1.0 - cv.x*cv.x) * (1.0 - cv.y*cv.y);
      col *= pow(vig, 0.25) * scan;
      col *= (0.5 + u_hover * 0.6);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

interface Props {
  project: Project;
  position: [number, number, number];
  rotationY: number;
  stationIndex: number;
}

export default function FlowStation({ project, position, rotationY, stationIndex }: Props) {
  const groupRef = useRef<Group>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const activeProject = useStore(s => s.activeProject);
  const setActive = useStore(s => s.setActive);
  const isActive = activeProject === project.id;

  const edgeGeo = useMemo(() => new BoxGeometry(6.2, 4.0, 0.0), []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = clock.elapsedTime;
      matRef.current.uniforms.u_hover.value +=
        ((hovered || isActive ? 1 : 0) - matRef.current.uniforms.u_hover.value) * 0.08;
    }
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 0.3 + stationIndex) * 0.12;
    }
  });

  const cornerOffsets: [number, number][] = [
    [-3.05, 1.95], [3.05, 1.95], [-3.05, -1.95], [3.05, -1.95],
  ];

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Lueur ambiante derrière l'écran */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[6.7, 4.4]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* L'écran principal */}
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => setActive(isActive ? null : project.id)}
      >
        <planeGeometry args={[6, 3.8]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={SHADERS[project.shaderType]}
          uniforms={{ u_time: { value: 0 }, u_hover: { value: 0 } }}
        />
      </mesh>

      {/* Cadre fin */}
      <lineSegments>
        <edgesGeometry args={[edgeGeo]} />
        <lineBasicMaterial
          color={project.color}
          transparent
          opacity={hovered ? 0.9 : 0.3}
        />
      </lineSegments>

      {/* Coins lumineux */}
      {cornerOffsets.map(([cx, cy], i) => (
        <mesh key={i} position={[cx, cy, 0.02]}>
          <planeGeometry args={[0.18, 0.18]} />
          <meshStandardMaterial
            color={project.color}
            emissive={project.color}
            emissiveIntensity={4}
          />
        </mesh>
      ))}

      <pointLight
        color={project.color}
        intensity={hovered ? 3 : 0.8}
        distance={8}
        decay={2}
        position={[0, 0, 0.5]}
      />

      <Html position={[-2.8, 2.15, 0.1]} transform distanceFactor={5}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '3px',
          color: project.color,
          opacity: 0.7,
        }}>
          0{project.index + 1} /
        </div>
      </Html>

      {hovered && (
        <Html position={[0, -2.3, 0.1]} center transform distanceFactor={5}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '28px',
            color: '#E8ECF0',
            whiteSpace: 'nowrap',
            textShadow: `0 0 25px ${project.color}`,
            pointerEvents: 'none',
          }}>
            {project.name}
          </div>
        </Html>
      )}

      {isActive && (
        <Html position={[0, 0, 0.5]} center distanceFactor={5}>
          <div style={{
            width: '420px',
            background: 'rgba(5,8,20,0.95)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${project.color}55`,
            borderRadius: '16px',
            padding: '36px',
            pointerEvents: 'auto',
            animation: 'fadeUp 0.4s ease forwards',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: project.color,
              marginBottom: '14px',
            }}>
              {String(project.index + 1).padStart(2, '0')} / 06
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '44px',
              lineHeight: '0.95',
              color: '#E8ECF0',
              marginBottom: '12px',
            }}>
              {project.name}
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '17px',
              color: 'rgba(232,236,240,0.6)',
              marginBottom: '18px',
              lineHeight: '1.5',
            }}>
              {project.tagline}
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              lineHeight: '1.75',
              color: 'rgba(232,236,240,0.5)',
              marginBottom: '22px',
            }}>
              {project.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {project.stack.map(s => (
                <span key={s} style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '100px',
                  color: 'rgba(232,236,240,0.45)',
                }}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {project.url && (
                <a href={project.url} target="_blank" rel="noreferrer" style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: project.color,
                  textDecoration: 'none',
                  padding: '10px 22px',
                  border: `1px solid ${project.color}55`,
                  borderRadius: '100px',
                }}>
                  Voir ↗
                </a>
              )}
              <button onClick={() => setActive(null)} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(232,236,240,0.3)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                Fermer
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeUp {
              from { opacity:0; transform:translateY(12px); }
              to   { opacity:1; transform:translateY(0); }
            }
          `}</style>
        </Html>
      )}
    </group>
  );
}
