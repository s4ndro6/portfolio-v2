'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, BufferAttribute, AdditiveBlending } from 'three';

const COUNT = 800;
const FUNNEL_HEIGHT = 6;
const FUNNEL_TOP_R = 4.5;

/** Alternance Hunt — green matrix raining into a funnel. */
export default function WorldHunt() {
  const ref = useRef<Points>(null);

  const { geometry, data } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const data: { y: number; speed: number; phase: number; baseR: number; angle: number }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const baseR = Math.random() * FUNNEL_TOP_R;
      const y = Math.random() * FUNNEL_HEIGHT - FUNNEL_HEIGHT / 2;
      positions[i * 3] = Math.cos(angle) * baseR;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * baseR;
      data.push({
        y,
        speed: 0.3 + Math.random() * 0.6,
        phase: Math.random(),
        baseR,
        angle,
      });
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    return { geometry: g, data };
  }, []);

  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const d = data[i];
      d.y -= d.speed * dt;
      if (d.y < -FUNNEL_HEIGHT / 2) {
        d.y = FUNNEL_HEIGHT / 2;
        d.angle = Math.random() * Math.PI * 2;
        d.baseR = Math.random() * FUNNEL_TOP_R;
      }
      // Funnel: radius shrinks as y descends
      const yNorm = (d.y + FUNNEL_HEIGHT / 2) / FUNNEL_HEIGHT; // 1 top, 0 bottom
      const r = d.baseR * yNorm + 0.05;
      const wobble = Math.sin(t * 2 + d.phase * 6) * 0.05;
      pos[i * 3] = Math.cos(d.angle) * r + wobble;
      pos[i * 3 + 1] = d.y;
      pos[i * 3 + 2] = Math.sin(d.angle) * r + wobble;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <points ref={ref} geometry={geometry}>
        <pointsMaterial
          color="#34D399"
          size={0.08}
          transparent
          opacity={0.9}
          blending={AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Funnel core glow */}
      <mesh position={[0, -FUNNEL_HEIGHT / 2, 0]}>
        <icosahedronGeometry args={[0.4, 2]} />
        <meshStandardMaterial emissive="#34D399" emissiveIntensity={6} color="black" />
      </mesh>

      <pointLight position={[0, -2, 0]} color="#34D399" intensity={4} distance={10} />
    </group>
  );
}
