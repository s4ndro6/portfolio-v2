'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Points,
} from 'three';
import { FLOW_CURVE } from '@/data/path';

export default function FlowParticles({ count = 1500 }: { count?: number }) {
  const ref = useRef<Points>(null);

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new CanvasTexture(canvas);
  }, []);

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
        map={circleTexture}
        size={0.06}
        color="#7FFFB8"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
        alphaTest={0.001}
      />
    </points>
  );
}
