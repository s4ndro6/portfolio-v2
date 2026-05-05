"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Sections } from "@/components/sections/Sections";
import { HUD } from "@/components/hud/HUD";
import { CustomCursor } from "@/components/CustomCursor";
import { Loader } from "@/components/Loader";
import { ProjectModal } from "@/components/ProjectModal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAppStore } from "@/store/useAppStore";

// Canvas dynamically imported — three.js touches window on first render.
const CanvasRoot = dynamic(
  () => import("@/components/canvas/CanvasRoot").then((m) => m.CanvasRoot),
  { ssr: false }
);

export function Experience() {
  useReducedMotion();
  const setMouse = useAppStore((s) => s.setMouse);
  const setIsLoading = useAppStore((s) => s.setIsLoading);

  // Mouse tracker — drives camera parallax in Hub scene.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse(x, y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [setMouse]);

  // Boot transition — fade out loader once mounted (canvas suspense handles paint).
  useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 1400);
    return () => window.clearTimeout(t);
  }, [setIsLoading]);

  return (
    <SmoothScroll>
      <CanvasRoot />
      <Sections />
      <HUD />
      <ProjectModal />
      <CustomCursor />
      <Loader />
    </SmoothScroll>
  );
}
