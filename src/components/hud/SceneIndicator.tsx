"use client";

import { useAppStore } from "@/store/useAppStore";
import { SCENE_ORDER, SCENES } from "@/lib/constants";

/**
 * Bottom-center wayfinding — vertebra label + mini progress bar.
 */
export function SceneIndicator() {
  const current = useAppStore((s) => s.currentScene);
  const sp = useAppStore((s) => s.scrollProgress);
  const idx = SCENE_ORDER.indexOf(current) + 1;
  const total = SCENE_ORDER.length;
  const label = SCENES[current].label;

  return (
    <div className="scene-indicator">
      <span className="scene-indicator__bar">
        <span
          className="scene-indicator__fill"
          style={{ width: `${Math.min(100, Math.max(0, sp * 100))}%` }}
        />
        <span
          className="scene-indicator__cursor"
          style={{ left: `${Math.min(100, Math.max(0, sp * 100))}%` }}
        />
      </span>
      <span className="scene-indicator__label">
        VERTÈBRE {String(idx).padStart(2, "0")}/{String(total).padStart(2, "0")} ·{" "}
        <span className="scene-indicator__name">{label}</span>
      </span>
    </div>
  );
}
