'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

const NAME = 'SANDRO';

export default function IntroText() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsub = useStore.subscribe((s) => {
      setProgress(s.scrollProgress);
    });
    return unsub;
  }, []);

  if (progress >= 0.08) return null;

  // fade out as we approach 0.08
  const fadeOpacity = Math.max(0, 1 - progress / 0.08);

  return (
    <div className="intro-text" style={{ opacity: fadeOpacity }}>
      <h1 aria-label="Sandro">
        {NAME.split('').map((ch, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>
            {ch}
          </span>
        ))}
      </h1>
      <p>solo full-stack · ai systems · lille</p>
    </div>
  );
}
