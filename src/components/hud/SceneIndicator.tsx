"use client";

import { useAppStore } from "@/store/useAppStore";
import { SCENE_ORDER, SCENES } from "@/lib/constants";

export function SceneIndicator() {
  const current = useAppStore((s) => s.currentScene);
  const idx = SCENE_ORDER.indexOf(current) + 1;
  const total = SCENE_ORDER.length;
  const label = SCENES[current].label;

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-[0.2em] text-text-faint uppercase">
        Scène
      </span>
      <span className="font-display text-3xl leading-none">
        {String(idx).padStart(2, "0")}
        <span className="text-text-faint">/{String(total).padStart(2, "0")}</span>
      </span>
      <span className="font-display-italic text-text-dim text-base mt-1">
        {label}
      </span>
    </div>
  );
}
