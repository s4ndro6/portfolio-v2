'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Points } from 'three';
import { FLOW_CURVE } from '@/data/path';

export default function FlowParticles({ count = 1500 }: { count?: number }) {
  const ref = useRef<Points>(null);

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds: number[] = [];
    const offsets: number[] = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const pt = FLOW_CURVE.getPoint(t);
      positions[i * 3] = pt.x + (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = pt.z;
      speeds.push(0.001 + Math.random() * 0.003);
      offsets.push(Math.random());
    }
    return { positions, speeds, offsets };
  }, [count]);

  const progress = useRef(Array.from({ length: count }, (_, i) => offsets[i]));

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      progress.current[i] += speeds[i];
      if (progress.current[i] > 1) progress.current[i] = 0;
      const pt = FLOW_CURVE.getPoint(progress.current[i]);
      arr[i * 3] = pt.x + (offsets[i] - 0.5) * 3.5;
      arr[i * 3 + 1] = pt.y + Math.sin(progress.current[i] * 20 + offsets[i] * 6) * 0.4;
      arr[i * 3 + 2] = pt.z;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.035}
        color="#4ADE80"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
