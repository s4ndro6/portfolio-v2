"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Fog, type Light } from "three";
import { MOOD_STOPS } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";

const SCRATCH_FOG = new Color();
const SCRATCH_AMBIENT = new Color();

/**
 * Reads scroll progress and tweens scene fog + ambient color along a curve
 * defined by MOOD_STOPS. Lives inside the Canvas (uses useThree).
 */
export function MoodController() {
  const scene = useThree((s) => s.scene);
  const ambientRef = useRef<Light | null>(null);

  // Locate the ambient light by traversing on first run
  useFrame(() => {
    if (!ambientRef.current) {
      scene.traverse((obj) => {
        if (
          (obj as Light).isLight &&
          obj.type === "AmbientLight" &&
          !ambientRef.current
        ) {
          ambientRef.current = obj as Light;
        }
      });
    }

    const sp = useAppStore.getState().scrollProgress;
    // Find segment in MOOD_STOPS
    let i = 0;
    for (; i < MOOD_STOPS.length - 1; i++) {
      if (sp <= MOOD_STOPS[i + 1].t) break;
    }
    const a = MOOD_STOPS[Math.min(i, MOOD_STOPS.length - 1)];
    const b = MOOD_STOPS[Math.min(i + 1, MOOD_STOPS.length - 1)];
    const span = Math.max(0.0001, b.t - a.t);
    const local = Math.max(0, Math.min(1, (sp - a.t) / span));

    SCRATCH_FOG.set(a.fog).lerp(new Color(b.fog), local);
    SCRATCH_AMBIENT.set(a.ambient).lerp(new Color(b.ambient), local);
    const intensity = a.intensity + (b.intensity - a.intensity) * local;

    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(SCRATCH_FOG);
    }
    if (scene.background instanceof Color) {
      scene.background.copy(SCRATCH_FOG);
    }
    if (ambientRef.current) {
      ambientRef.current.color.copy(SCRATCH_AMBIENT);
      ambientRef.current.intensity = intensity;
    }
  });

  return null;
}
