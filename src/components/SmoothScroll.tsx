"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SCENE_ORDER, SCENES, type SceneId } from "@/lib/constants";

/**
 * Mounts Lenis once, drives the global scroll progress in the store,
 * and resolves which scene is currently active. ScrollTrigger.update is
 * called from a sibling hook (we only need the progress signal here).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const setScrollProgress = useAppStore((s) => s.setScrollProgress);
  const setCurrentScene = useAppStore((s) => s.setCurrentScene);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      // Native scroll fallback. Drive progress straight from window.
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        setScrollProgress(p);
        setCurrentScene(resolveScene(p));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onScroll = ({ progress }: { progress: number }) => {
      setScrollProgress(progress);
      setCurrentScene(resolveScene(progress));
    };
    lenis.on("scroll", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion, setScrollProgress, setCurrentScene]);

  return <>{children}</>;
}

function resolveScene(progress: number): SceneId {
  for (const id of SCENE_ORDER) {
    const [a, b] = SCENES[id].range;
    if (progress >= a && progress < b) return id;
  }
  return "outro";
}
