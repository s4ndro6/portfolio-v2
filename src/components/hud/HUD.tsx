"use client";

import { useEffect } from "react";
import { ProgressGauge } from "@/components/hud/ProgressGauge";
import { SceneIndicator } from "@/components/hud/SceneIndicator";
import { NavPill } from "@/components/hud/NavPill";
import { useAppStore } from "@/store/useAppStore";

/**
 * Minimal HUD — nav pill (top-right), progress gauge (right edge),
 * scene indicator (bottom-center). Everything else lives in the 3D scene.
 */
export function HUD() {
  // ESC handler — closes any open project zoom.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useAppStore.getState().setOpenProject(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
      aria-hidden="false"
    >
      {/* Top-right — glassmorphism nav pill */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 pointer-events-auto">
        <NavPill />
      </div>

      {/* Right edge — progress gauge (mini-axis) */}
      <div className="absolute top-1/2 right-6 md:right-8 -translate-y-1/2 pointer-events-auto hidden md:block">
        <ProgressGauge />
      </div>

      {/* Bottom-center — scene indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <SceneIndicator />
      </div>
    </div>
  );
}
