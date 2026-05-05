'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import CustomCursor from './CustomCursor';
import IntroText from './IntroText';
import ProjectOverlay from './ProjectOverlay';

export default function HUD() {
  const [showHint, setShowHint] = useState(true);
  const [insideProject, setInsideProject] = useState(false);

  useEffect(() => {
    const unsub = useStore.subscribe((s) => {
      setShowHint(s.scrollProgress < 0.05);
      setInsideProject(s.isInsideProject || s.isEnteringProject);
    });
    return unsub;
  }, []);

  return (
    <>
      <CustomCursor />

      <div className="hud-identity" style={{ opacity: insideProject ? 0.3 : 1 }}>
        Sandro
        <small>Sandro Systems · Lille</small>
      </div>

      <div className="hud-nav" style={{ opacity: insideProject ? 0.3 : 1 }}>
        <span className="hud-pill">B2 · Sept 2026</span>
        <a href="mailto:alessandroschillaci05@yahoo.com" className="hud-pill">
          Contact
        </a>
      </div>

      {showHint && !insideProject && <div className="scroll-hint">scroll</div>}

      <IntroText />
      <ProjectOverlay />
    </>
  );
}
