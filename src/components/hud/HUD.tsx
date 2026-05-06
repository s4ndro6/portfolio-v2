'use client';
import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export default function HUD() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const scroll = useStore(s => s.scroll);
  const activeProject = useStore(s => s.activeProject);
  const setActive = useStore(s => s.setActive);
  const cx = useRef(0);
  const cy = useRef(0);
  const tx = useRef(0);
  const ty = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { tx.current = e.clientX; ty.current = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    let raf: number;
    const loop = () => {
      cx.current += (tx.current - cx.current) * 0.14;
      cy.current += (ty.current - cy.current) * 0.14;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cx.current - 14}px,${cy.current - 14}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  const actLabel =
    scroll < 0.20 ? 'Approche...' :
    scroll < 0.30 ? 'Entrée...' :
    scroll < 0.90 ? `Flow · ${Math.round((scroll - 0.30) / 0.60 * 100)}%` :
    'Destination';

  return (
    <>
      <div ref={cursorRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 28, height: 28,
        border: '1px solid rgba(255,180,84,0.55)',
        borderRadius: '50%',
        pointerEvents: 'none', zIndex: 9999,
        mixBlendMode: 'difference',
      }} />

      <div style={{
        position: 'fixed', top: 28, left: 28,
        pointerEvents: 'none', zIndex: 200,
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic', fontSize: 19,
          color: 'rgba(232,236,240,0.8)',
        }}>
          Sandro Schillaci
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'rgba(232,236,240,0.3)', marginTop: 5,
        }}>
          {actLabel}
        </div>
      </div>

      <div style={{
        position: 'fixed', top: 28, right: 28,
        display: 'flex', gap: 10, zIndex: 200,
        pointerEvents: 'auto',
      }}>
        {activeProject && (
          <button onClick={() => setActive(null)} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#FFB454',
            background: 'rgba(8,12,20,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,180,84,0.3)',
            borderRadius: 100, padding: '9px 20px',
            cursor: 'none',
          }}>
            ← ESC
          </button>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(5,8,20,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 100, padding: '9px 20px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'rgba(232,236,240,0.6)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFB454', boxShadow: '0 0 8px #FFB454' }} />
            B2 · Sept 2026
          </span>
          <span style={{ opacity: 0.2 }}>|</span>
          <a href="mailto:alessandroschillaci05@yahoo.com" style={{ color: 'rgba(232,236,240,0.6)', textDecoration: 'none' }}>
            Contact
          </a>
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 28, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        pointerEvents: 'none', zIndex: 200,
      }}>
        <div style={{ width: 80, height: 1, background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: `${scroll * 100}%`, height: '100%',
            background: '#FFB454', boxShadow: '0 0 6px #FFB454',
          }} />
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(232,236,240,0.25)',
        }}>
          {scroll < 0.05 ? '↓ scroll' : ''}
        </div>
      </div>
    </>
  );
}
