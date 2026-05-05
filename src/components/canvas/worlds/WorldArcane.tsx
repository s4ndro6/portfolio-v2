'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Points, BufferGeometry, BufferAttribute, AdditiveBlending } from 'three';

const EMBER_COUNT = 200;

/** Arcane Fury — dark chamber, falling embers, floating blade, low red light. */
export default function WorldArcane() {
  const groupRef = useRef<Group>(null);
  const bladeRef = useRef<Mesh>(null);
  const emberRef = useRef<Points>(null);

  const { geometry, data } = useMemo(() => {
    const positions = new Float32Array(EMBER_COUNT * 3);
    const data: { x: number; y: number; z: number; speed: number; drift: number }[] = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = Math.random() * 10 - 2;
      const z = (Math.random() - 0.5) * 14;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      data.push({
        x,
        y,
        z,
        speed: 0.4 + Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 0.4,
      });
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    return { geometry: g, data };
  }, []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (bladeRef.current) {
      bladeRef.current.rotation.y += dt * 0.4;
      bladeRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
      bladeRef.current.position.y = Math.sin(t * 0.7) * 0.3;
    }
    if (emberRef.current) {
      const pos = emberRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < EMBER_COUNT; i++) {
        const d = data[i];
        d.y -= d.speed * dt;
        d.x += Math.sin(t * 0.5 + i) * d.drift * dt;
        if (d.y < -3) {
          d.y = 8 + Math.random() * 2;
          d.x = (Math.random() - 0.5) * 14;
          d.z = (Math.random() - 0.5) * 14;
        }
        pos[i * 3] = d.x;
        pos[i * 3 + 1] = d.y;
        pos[i * 3 + 2] = d.z;
      }
      emberRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating blade */}
      <mesh ref={bladeRef}>
        <boxGeometry args={[0.18, 4.2, 0.06]} />
        <meshStandardMaterial
          color="#1A0808"
          emissive="#FF6B35"
          emissiveIntensity={3.5}
          roughness={0.2}
          metalness={0.95}
        />
      </mesh>

      {/* Hilt */}
      <mesh position={[0, -2.2, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.18]} />
        <meshStandardMaterial color="#222" emissive="#FF6B35" emissiveIntensity={1.5} />
      </mesh>

      {/* Embers */}
      <points ref={emberRef} geometry={geometry}>
        <pointsMaterial
          color="#FF6B35"
          size={0.08}
          transparent
          opacity={0.85}
          blending={AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Dramatic red bottom light */}
      <pointLight position={[0, -3, 0]} color="#FF3010" intensity={5} distance={14} />
      <ambientLight intensity={0.05} color="#330808" />
    </group>
  );
}
