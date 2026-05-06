'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import HUD from '@/components/hud/HUD';

const CanvasRoot = dynamic(() => import('@/components/canvas/CanvasRoot'), { ssr: false });

export default function Home() {
  const setScroll = useStore(s => s.setScroll);
  const setMouse = useStore(s => s.setMouse);
  const setActive = useStore(s => s.setActive);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(max > 0 ? window.scrollY / max : 0);
    };
    const onMouse = (e: MouseEvent) => {
      setMouse(
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('keydown', onKey);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('keydown', onKey);
    };
  }, [setScroll, setMouse, setActive]);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <CanvasRoot />
      </div>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
        <HUD />
      </div>
      <div style={{ height: '1500vh', position: 'relative', zIndex: 1, pointerEvents: 'none' }} />
    </>
  );
}
