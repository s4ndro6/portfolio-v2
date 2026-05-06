'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LineSegments,
  Points,
  Vector3,
  CylinderGeometry,
  ShaderMaterial,
  DoubleSide,
} from 'three';
import { FLOW_CURVE, STATION_T } from '@/data/path';
import { PROJECTS } from '@/data/projects';
import { useStore } from '@/store/useStore';

/* ============= Anneaux octogonaux qui défilent ============= */
const RING_COUNT = 26;
const RING_RADIUS = 4.0;

function buildOctagonalRingGeometry() {
  // Cylindre 8 faces, peu de hauteur, on en extrait les arêtes pour wireframe propre
  const cyl = new CylinderGeometry(RING_RADIUS, RING_RADIUS, 0.05, 8, 1, true);
  return new EdgesGeometry(cyl);
}

/* ============= Grille au sol ============= */
const FLOOR_FRAG = `
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_tint;
  uniform float u_tintMix;
  void main(){
    vec2 uv = vUv;
    // Grille uv → coordonnées monde (uv.x [0..1] sur 80 unités, uv.y profondeur 100 unités)
    vec2 g = vec2(uv.x * 40.0, uv.y * 60.0 - u_time * 6.0);
    vec2 grid = abs(fract(g) - 0.5);
    float line = smoothstep(0.49, 0.50, max(grid.x, grid.y));
    // Lignes plus épaisses tous les 5
    vec2 g5 = vec2(uv.x * 8.0, uv.y * 12.0 - u_time * 1.2);
    vec2 grid5 = abs(fract(g5) - 0.5);
    float major = smoothstep(0.485, 0.50, max(grid5.x, grid5.y));
    // Convergence : intensité plus forte au centre horizontal, fade au loin
    float depthFade = smoothstep(1.0, 0.05, uv.y);
    vec3 baseCol = vec3(0.10, 0.10, 0.25); // #1A1A40
    vec3 col = baseCol * (line * 0.6 + major * 1.2);
    // Tint projet
    col = mix(col, col * 0.4 + u_tint * (line * 0.5 + major * 1.0), u_tintMix * 0.6);
    col *= depthFade;
    gl_FragColor = vec4(col, 1.0);
  }
`;
const FLOOR_VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/* ============= Structures lointaines (nuages de points dérivants) ============= */
function buildDistantCloud() {
  const N = 800;
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const palette = ['#22D3EE', '#A78BFA', '#5B8DEE'].map(c => new Color(c));
  for (let i = 0; i < N; i++) {
    // 3 amas le long de la courbe
    const cluster = Math.floor(Math.random() * 5);
    const tCenter = 0.1 + cluster * 0.2;
    const center = FLOW_CURVE.getPoint(tCenter);
    // Amas sphérique
    const r = 4 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = center.x + r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = center.y + r * Math.cos(phi);
    positions[i * 3 + 2] = center.z + r * Math.sin(phi) * Math.sin(theta);
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geo;
}

export default function FlowTunnel() {
  const ringRefs = useRef<(LineSegments | null)[]>([]);
  const ringMatRef = useRef<LineBasicMaterial>(null);
  const floorMatRef = useRef<ShaderMaterial>(null);
  const cloudRef = useRef<Points>(null);
  const cloudMatRef = useRef<import('three').PointsMaterial>(null);
  const guideRef = useRef<Line>(null);

  const ringGeo = useMemo(buildOctagonalRingGeometry, []);
  const cloudGeo = useMemo(buildDistantCloud, []);

  // Position de chaque anneau (T réparti sur la courbe)
  const ringT = useMemo(
    () => Array.from({ length: RING_COUNT }, (_, i) => i / (RING_COUNT - 1)),
    [],
  );

  // Mémo des centres des stations (pour calcul de tint)
  const stationData = useMemo(
    () =>
      PROJECTS.map((p, i) => ({
        t: STATION_T[i],
        color: new Color(p.color),
      })),
    [],
  );

  const tmpVec = useRef(new Vector3());
  const currentTint = useRef(new Color('#22D3EE'));
  const targetTint = useRef(new Color('#22D3EE'));

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    // Couleur cible = projet le plus proche (basé sur scroll → t)
    const scroll = useStore.getState().scroll;
    const tCam = Math.max(0, Math.min(1, (scroll - 0.30) / 0.60));
    let nearest = stationData[0];
    let bestDist = Infinity;
    for (const s of stationData) {
      const d = Math.abs(s.t - tCam);
      if (d < bestDist) {
        bestDist = d;
        nearest = s;
      }
    }
    targetTint.current.copy(nearest.color);
    // Mix : 0 quand on est loin, 1 quand on est proche
    const tintMix = Math.max(0, 1 - bestDist * 8);
    currentTint.current.lerp(targetTint.current, 0.04);

    // Anneaux : suivent la courbe avec petite oscillation Z
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const t = (ringT[i] + time * 0.012) % 1.0;
      FLOW_CURVE.getPoint(t, tmpVec.current);
      ring.position.copy(tmpVec.current);
      // Oriente l'anneau perpendiculaire à la tangente
      FLOW_CURVE.getTangent(t, tmpVec.current);
      ring.lookAt(
        ring.position.x + tmpVec.current.x,
        ring.position.y + tmpVec.current.y,
        ring.position.z + tmpVec.current.z,
      );
      ring.rotation.z = i * 0.21 + time * 0.05; // léger roll par anneau
    });

    // Material des anneaux : tint
    if (ringMatRef.current) {
      const c = ringMatRef.current.color;
      c.copy(new Color('#22D3EE')).lerp(currentTint.current, tintMix * 0.7);
      ringMatRef.current.opacity = 0.08 + tintMix * 0.05;
    }

    // Floor shader uniforms
    if (floorMatRef.current) {
      floorMatRef.current.uniforms.u_time.value = time;
      floorMatRef.current.uniforms.u_tint.value.copy(currentTint.current);
      floorMatRef.current.uniforms.u_tintMix.value = tintMix;
    }

    // Cloud lent dérive
    if (cloudRef.current) {
      cloudRef.current.rotation.y = time * 0.01;
    }
    if (cloudMatRef.current) {
      cloudMatRef.current.opacity = 0.35 + Math.sin(time * 0.4) * 0.05;
    }

    // Guide du tube cyan central — ultra discret, déjà géré par FlowWires
    void guideRef;
  });

  return (
    <group>
      {/* Anneaux octogonaux */}
      {ringT.map((_, i) => (
        <lineSegments
          key={i}
          ref={(m) => { ringRefs.current[i] = m; }}
          geometry={ringGeo}
        >
          <lineBasicMaterial
            ref={i === 0 ? ringMatRef : undefined}
            color="#22D3EE"
            transparent
            opacity={0.08}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      ))}

      {/* Grille au sol — un grand plan le long du flow */}
      <mesh
        position={[0, -2.5, -32]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[80, 100, 1, 1]} />
        <shaderMaterial
          ref={floorMatRef}
          vertexShader={FLOOR_VERT}
          fragmentShader={FLOOR_FRAG}
          transparent
          side={DoubleSide}
          depthWrite={false}
          uniforms={{
            u_time: { value: 0 },
            u_tint: { value: new Color('#22D3EE') },
            u_tintMix: { value: 0 },
          }}
        />
      </mesh>

      {/* Structures lointaines (nuages de points qui dérivent) */}
      <points ref={cloudRef} geometry={cloudGeo}>
        <pointsMaterial
          ref={cloudMatRef}
          size={0.05}
          vertexColors
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
