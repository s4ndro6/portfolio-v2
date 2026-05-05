'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, BufferAttribute, AdditiveBlending } from 'three';

const COUNT = 1200;

export default function GlobalParticles() {
  const ref = useRef<Points>(null);

  const { geometry, data } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const data: { vx: number; vy: number; phase: number }[] = [];
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = -Math.random() * 80;
      data.push({
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.001,
        phase: Math.random() * Math.PI * 2,
      });
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    return { geometry: g, data };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const d = data[i];
      pos[i * 3] += Math.sin(t * 0.3 + d.phase) * 0.003 + d.vx;
      pos[i * 3 + 1] += Math.cos(t * 0.25 + d.phase * 1.3) * 0.002 + d.vy;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#FFB454"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
