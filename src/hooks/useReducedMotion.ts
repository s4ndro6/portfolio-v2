"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/** Listen to prefers-reduced-motion and sync into the global store. */
export function useReducedMotion() {
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setReducedMotion]);
}
