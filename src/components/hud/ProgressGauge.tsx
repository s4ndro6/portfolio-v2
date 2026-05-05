"use client";

import { useAppStore } from "@/store/useAppStore";
import { SCENE_ORDER, SCENES } from "@/lib/constants";

/**
 * Vertical progress gauge — shows global scroll progress + 5 scene markers.
 * Markers light amber once their scene becomes active.
 */
export function ProgressGauge() {
  const progress = useAppStore((s) => s.scrollProgress);
  const current = useAppStore((s) => s.currentScene);

  return (
    <div className="relative h-72 w-px bg-text-faint/30 flex flex-col">
      {/* Filled bar */}
      <div
        className="absolute inset-x-0 top-0 bg-amber origin-top transition-transform duration-100"
        style={{ height: "100%", transform: `scaleY(${progress})` }}
      />

      {/* Scene markers */}
      {SCENE_ORDER.map((id, idx) => {
        const isActive = current === id;
        const passed = SCENE_ORDER.indexOf(current) >= idx;
        const top = `${(idx / (SCENE_ORDER.length - 1)) * 100}%`;
        return (
          <div
            key={id}
            className="absolute -left-1 -translate-y-1/2 flex items-center gap-3"
            style={{ top }}
          >
            <span
              className={`block w-2 h-2 transition-colors duration-300 ${
                passed ? "bg-amber" : "bg-text-faint"
              }`}
              style={{ borderRadius: "50%" }}
            />
            <span
              className={`font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                isActive ? "text-amber" : "text-text-faint"
              }`}
            >
              {SCENES[id].label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
