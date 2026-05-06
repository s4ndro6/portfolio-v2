'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import HUD from '@/components/hud/HUD';

const CanvasRoot = dynamic(
  () => import('@/components/canvas/CanvasRoot'),
  { ssr: false }
);

export default function Home() {
  const setMouse = useStore(s => s.setMouse);
  const setScroll = useStore(s => s.setScroll);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse(
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2
      );
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(window.scrollY / Math.max(max, 1));
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [setMouse, setScroll]);

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0
      }}>
        <CanvasRoot />
      </div>
      <HUD />
      <div style={{
        height: '1200vh',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
    </>
  );
}
