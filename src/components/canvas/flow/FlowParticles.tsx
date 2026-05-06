'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Points,
} from 'three';
import { FLOW_CURVE } from '@/data/path';

const PALETTE = ['#22D3EE', '#A78BFA', '#FFB454'];

export default function FlowParticles({ count = 1200 }: { count?: number }) {
  const ref = useRef<Points>(null);

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new CanvasTexture(canvas);
  }, []);

  // 3 copies per particle (head + 2 trail) → impression de vitesse
  const trailLen = 3;
  const totalCount = count * trailLen;

  const data = useMemo(() => {
    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const speeds: number[] = [];
    const lateralR: number[] = [];
    const lateralA: number[] = [];
    const trailIndex: number[] = [];
    const baseProgress: number[] = [];

    for (let i = 0; i < count; i++) {
      // 75% cyan/violet, 25% amber
      const colorIdx = Math.random() < 0.25 ? 2 : Math.random() < 0.5 ? 0 : 1;
      const c = new Color(PALETTE[colorIdx]);
      // concentré près de l'axe : rayon faible (gaussien-like)
      const r = Math.pow(Math.random(), 1.4) * 1.2;
      const a = Math.random() * Math.PI * 2;
      const sp = 0.005 + Math.random() * 0.008; // FAST
      const start = Math.random();

      for (let j = 0; j < trailLen; j++) {
        const idx = (i * trailLen + j) * 3;
        positions[idx] = 0;
        positions[idx + 1] = 0;
        positions[idx + 2] = 0;
        // Trail s'estompe en luminosité
        const fade = 1 - j * 0.35;
        colors[idx] = c.r * fade;
        colors[idx + 1] = c.g * fade;
        colors[idx + 2] = c.b * fade;
        speeds.push(sp);
        lateralR.push(r);
        lateralA.push(a);
        trailIndex.push(j);
        baseProgress.push(start);
      }
    }
    return { positions, colors, speeds, lateralR, lateralA, trailIndex, baseProgress };
  }, [count, totalCount]);

  const progress = useRef(data.baseProgress.slice());

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < totalCount; i++) {
      // Trails partagent l'avancée du head, juste en arrière
      const baseIdx = Math.floor(i / trailLen) * trailLen;
      if (i === baseIdx) {
        progress.current[i] += data.speeds[i];
        if (progress.current[i] > 1) progress.current[i] = 0;
      }
      const trailOffset = data.trailIndex[i] * data.speeds[i] * 4;
      let p = progress.current[baseIdx] - trailOffset;
      if (p < 0) p += 1;

      const pt = FLOW_CURVE.getPoint(p);
      const r = data.lateralR[i];
      const a = data.lateralA[i];
      arr[i * 3] = pt.x + Math.cos(a) * r;
      arr[i * 3 + 1] = pt.y + Math.sin(a) * r;
      arr[i * 3 + 2] = pt.z;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
    g.setAttribute('color', new Float32BufferAttribute(data.colors, 3));
    return g;
  }, [data.positions, data.colors]);

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        map={circleTexture}
        size={0.02}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
        alphaTest={0.001}
      />
    </points>
  );
}
