'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointLight } from 'three';
import { useStore } from '@/store/useStore';

export default function CursorLight() {
  const ref = useRef<PointLight>(null);
  const target = useRef({ x: 0, y: 0, z: 6 });

  useFrame(({ camera }) => {
    if (!ref.current) return;
    const { mouseX, mouseY } = useStore.getState();
    target.current.x = mouseX * 8;
    target.current.y = mouseY * 5 + camera.position.y;
    target.current.z = camera.position.z - 4;

    ref.current.position.x += (target.current.x - ref.current.position.x) * 0.08;
    ref.current.position.y += (target.current.y - ref.current.position.y) * 0.08;
    ref.current.position.z += (target.current.z - ref.current.position.z) * 0.08;
  });

  return <pointLight ref={ref} color="#FFB454" intensity={1.5} distance={12} decay={2} />;
}
