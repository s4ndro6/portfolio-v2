"use client";

import { useAppStore } from "@/store/useAppStore";
import { SCENE_ORDER, SCENES } from "@/lib/constants";

/**
 * Vertical mini-axis — replica of the spinal axis, scrubs with scroll.
 * 5 nodes (one per scene), amber dot slides down as user scrolls.
 * Click a node = scroll to that scene's range start.
 */
export function ProgressGauge() {
  const progress = useAppStore((s) => s.scrollProgress);
  const current = useAppStore((s) => s.currentScene);

  const scrollTo = (target: number) => {
    if (typeof window === "undefined") return;
    const max =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * target + 4, behavior: "smooth" });
  };

  return (
    <div className="progress-gauge" aria-label="Progression de navigation">
      <span className="progress-gauge__rail" />
      <span
        className="progress-gauge__fill"
        style={{ height: `${Math.min(100, Math.max(0, progress * 100))}%` }}
      />
      <span
        className="progress-gauge__cursor"
        style={{ top: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        aria-hidden
      />
      {SCENE_ORDER.map((id, idx) => {
        const passed = SCENE_ORDER.indexOf(current) >= idx;
        const isActive = current === id;
        const top = `${(idx / (SCENE_ORDER.length - 1)) * 100}%`;
        const target = SCENES[id].range[0];
        return (
          <button
            key={id}
            type="button"
            className="progress-gauge__node"
            data-passed={passed}
            data-active={isActive}
            style={{ top }}
            onClick={() => scrollTo(target)}
            aria-label={`Aller à ${SCENES[id].label}`}
          >
            <span className="progress-gauge__dot" />
            <span className="progress-gauge__label">{SCENES[id].label}</span>
          </button>
        );
      })}
    </div>
  );
}
