'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, CanvasTexture, ShaderMaterial } from 'three';

const TERMINAL_LINES = [
  '> JARVIS v3.2.1 // boot',
  '> loading neural cortex...',
  '> mounting /home/sandro',
  '> auth: sandro@local OK',
  '> > scan ports 0-65535',
  '> > 22 tcp open ssh',
  '> > 80 tcp open http',
  '> > 443 tcp open https',
  '> watcher: filesystem hot',
  '> agent.run("audit")',
  '> tasks queued: 14',
  '> exec heuristic_pass()',
  '> diff +127 -42',
  '> commit signed',
  '> push origin main OK',
  '> sleep 3.2s',
  '> tail -f /var/log/jarvis',
  '> route: /api/intel',
  '> 200 OK 14ms',
  '> entropy stable',
  '> ready.',
];

function buildTerminalTexture(scrollOffset: number): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#020A04';
  ctx.fillRect(0, 0, 512, 512);
  ctx.font = '16px ui-monospace, monospace';
  ctx.fillStyle = '#4ADE80';
  ctx.shadowColor = '#4ADE80';
  ctx.shadowBlur = 4;
  const lineHeight = 22;
  const totalLines = Math.floor(512 / lineHeight) + 4;
  for (let i = 0; i < totalLines; i++) {
    const idx = (i + scrollOffset) % TERMINAL_LINES.length;
    const text = TERMINAL_LINES[idx];
    const y = 24 + i * lineHeight;
    ctx.globalAlpha = 0.4 + 0.6 * Math.min(1, i / 4);
    ctx.fillText(text, 16, y);
  }
  ctx.globalAlpha = 1;
  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = 0; y < 512; y += 3) {
    ctx.fillRect(0, y, 512, 1);
  }
  const tex = new CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const SCANLINE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SCANLINE_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float u_time;
  uniform sampler2D u_map;
  void main() {
    vec4 base = texture2D(u_map, vUv);
    float scan = 0.85 + 0.15 * sin(vUv.y * 320.0 + u_time * 6.0);
    float vign = smoothstep(1.2, 0.4, length(vUv - 0.5));
    vec3 col = base.rgb * scan * vign;
    gl_FragColor = vec4(col, 1.0);
  }
`;

interface ScreenSpec {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

const SCREENS: ScreenSpec[] = [
  { position: [0, 0.2, 0], rotation: [0, 0, 0], scale: 1.4 },
  { position: [-3.4, 0.6, -1.2], rotation: [0, 0.5, 0], scale: 1.0 },
  { position: [3.4, -0.4, -1.2], rotation: [0, -0.5, 0], scale: 1.0 },
  { position: [-1.6, -1.6, 1.0], rotation: [0, 0.25, 0], scale: 0.75 },
  { position: [1.8, 1.6, 0.8], rotation: [0, -0.25, 0], scale: 0.75 },
];

/** Jarvis — CRT terminals floating in green scanline ambiance. */
export default function WorldJarvis() {
  const groupRef = useRef<Group>(null);
  const meshRefs = useRef<(Mesh | null)[]>(SCREENS.map(() => null));
  const matRefs = useRef<(ShaderMaterial | null)[]>(SCREENS.map(() => null));
  const scrollRefs = useRef<number[]>(SCREENS.map(() => 0));
  const lastTickRef = useRef(0);

  const screens = useMemo(
    () =>
      SCREENS.map((s, i) => {
        const tex = buildTerminalTexture(i * 3);
        return { ...s, tex };
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    matRefs.current.forEach((m) => {
      if (m) m.uniforms.u_time.value = t;
    });
    // scroll terminal text every 220ms
    if (t - lastTickRef.current > 0.22) {
      lastTickRef.current = t;
      meshRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        scrollRefs.current[i] += 1;
        const newTex = buildTerminalTexture(scrollRefs.current[i]);
        const mat = matRefs.current[i];
        if (mat) {
          const old = mat.uniforms.u_map.value;
          mat.uniforms.u_map.value = newTex;
          if (old && old.dispose) old.dispose();
        }
      });
    }
    // gentle float
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y = SCREENS[i].position[1] + Math.sin(t * 0.6 + i * 1.3) * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {screens.map((s, i) => (
        <mesh
          key={i}
          ref={(r) => { meshRefs.current[i] = r; }}
          position={s.position}
          rotation={s.rotation}
          scale={s.scale}
        >
          <planeGeometry args={[3.2, 3.2]} />
          <shaderMaterial
            ref={(r) => { matRefs.current[i] = r; }}
            vertexShader={SCANLINE_VERT}
            fragmentShader={SCANLINE_FRAG}
            uniforms={{
              u_time: { value: 0 },
              u_map: { value: s.tex },
            }}
          />
        </mesh>
      ))}

      <pointLight color="#4ADE80" intensity={3.5} distance={14} position={[0, 0, 4]} />
      <pointLight color="#4ADE80" intensity={1.5} distance={10} position={[0, -2, -2]} />
      <ambientLight intensity={0.08} color="#0F2A18" />
    </group>
  );
}
