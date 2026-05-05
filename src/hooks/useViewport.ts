"use client";

import { useEffect, useState } from "react";

export interface Viewport {
  width: number;
  height: number;
  isMobile: boolean;
  isTouch: boolean;
}

const DEFAULT: Viewport = {
  width: 1920,
  height: 1080,
  isMobile: false,
  isTouch: false,
};

/** Lightweight viewport observer. SSR-safe defaults. */
export function useViewport(): Viewport {
  const [v, setV] = useState<Viewport>(DEFAULT);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setV({
        width,
        height,
        isMobile: width < 768,
        isTouch: window.matchMedia("(pointer: coarse)").matches,
      });
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  return v;
}
