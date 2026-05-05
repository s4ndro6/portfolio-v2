"use client";

import { useAppStore } from "@/store/useAppStore";

/**
 * Audio toggle — visually present, no-op in v1.
 * Phase 2 wires this to tone.js + howler ambient drone + hover SFX.
 */
export function AudioToggle() {
  const enabled = useAppStore((s) => s.audioEnabled);
  const toggle = useAppStore((s) => s.toggleAudio);

  return (
    <button
      type="button"
      onClick={toggle}
      className="group flex items-center gap-3 cursor-none focus:outline-none"
      aria-pressed={enabled}
      aria-label={enabled ? "Désactiver l'audio" : "Activer l'audio"}
    >
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-faint group-hover:text-amber transition-colors">
        {enabled ? "Sound · ON" : "Sound · OFF"}
      </span>
      <span className="flex gap-[2px] items-end h-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] transition-all duration-300 ${
              enabled ? "bg-amber" : "bg-text-faint group-hover:bg-amber"
            }`}
            style={{
              height: enabled
                ? `${30 + Math.sin(i) * 20 + i * 12}%`
                : `${20 + i * 8}%`,
              animation: enabled
                ? `pulse-bar 1.${i}s ease-in-out infinite alternate`
                : "none",
            }}
          />
        ))}
      </span>
      <style>{`
        @keyframes pulse-bar {
          from { transform: scaleY(0.6); }
          to { transform: scaleY(1.2); }
        }
      `}</style>
    </button>
  );
}
