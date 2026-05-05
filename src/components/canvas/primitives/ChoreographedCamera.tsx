"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { useAppStore } from "@/store/useAppStore";
import { PARALLAX_DAMP, SCENES } from "@/lib/constants";

const TARGET = new Vector3();
const POS = new Vector3();
const PARALLAX = new Vector3();

/**
 * Master camera choreography.
 * Drives camera.z from scroll progress (z=18 → z=-180), with light parallax
 * driven by mouse position. No GSAP timeline here — Lenis already smooths
 * the scroll, and using a frame-loop interpolator keeps the camera bound to
 * actual paint time, not to ScrollTrigger ticks.
 */
export function ChoreographedCamera({ disabled = false }: { disabled?: boolean }) {
  const { camera } = useThree();
  const targetZ = useRef(18);
  const targetX = useRef(0);
  const targetY = useRef(0);

  useFrame((_, delta) => {
    if (disabled) return;
    const { scrollProgress, mouse, currentScene } = useAppStore.getState();

    // Map progress 0..1 → camera z by interpolating across scenes.
    targetZ.current = zFromProgress(scrollProgress);

    // Subtle lateral drift per scene — gives each section a unique attitude.
    const drift = SCENE_DRIFTS[currentScene];
    targetX.current = drift.x + mouse.x * PARALLAX_DAMP * 6;
    targetY.current = drift.y + -mouse.y * PARALLAX_DAMP * 4;

    POS.copy(camera.position);
    PARALLAX.set(targetX.current, targetY.current, targetZ.current);
    POS.lerp(PARALLAX, Math.min(1, delta * 4));
    camera.position.copy(POS);

    // Slight look-ahead — camera always faces the next scene anchor.
    TARGET.set(targetX.current * 0.4, targetY.current * 0.4, targetZ.current - 8);
    camera.lookAt(TARGET);
  });

  return null;
}

function zFromProgress(p: number): number {
  // Find the active scene segment then linear-interpolate within it.
  const scenes = Object.values(SCENES);
  for (const s of scenes) {
    const [a, b] = s.range;
    if (p <= b) {
      const local = (p - a) / Math.max(0.0001, b - a);
      return s.z[0] + (s.z[1] - s.z[0]) * Math.min(1, Math.max(0, local));
    }
  }
  return scenes[scenes.length - 1].z[1];
}

const SCENE_DRIFTS: Record<string, { x: number; y: number }> = {
  hub: { x: 0, y: 0.5 },
  about: { x: -1.2, y: 0 },
  skills: { x: 0, y: 0.8 },
  projects: { x: 0.8, y: -0.4 },
  outro: { x: 0, y: 0 },
};
