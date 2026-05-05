'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

const CanvasRoot = dynamic(() => import('@/components/canvas/CanvasRoot'), {
  ssr: false,
});

const HUD = dynamic(() => import('@/components/hud/HUD'), {
  ssr: false,
});

export default function Home() {
  const setMouse = useStore((s) => s.setMouse);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse(
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, [setMouse]);

  return (
    <>
      {/* Canvas WebGL — fixed full-screen */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <CanvasRoot />
      </div>

      {/* HUD HTML — overlays Canvas */}
      <HUD />

      {/* Spacer for scroll journey */}
      <div style={{ height: '1200vh', position: 'relative', zIndex: 5 }} />
    </>
  );
}
