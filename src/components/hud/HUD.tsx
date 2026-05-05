"use client";

import { ProgressGauge } from "@/components/hud/ProgressGauge";
import { SceneIndicator } from "@/components/hud/SceneIndicator";
import { AudioToggle } from "@/components/hud/AudioToggle";

export function HUD() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
      aria-hidden="false"
    >
      {/* Top-left — wordmark */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 pointer-events-auto">
        <a
          href="#hub"
          className="font-display text-xl tracking-tight hover:text-amber transition-colors block"
        >
          Sandro<span className="text-amber">.</span>
        </a>
        <span className="block font-mono text-[10px] tracking-[0.2em] text-text-dim mt-1 uppercase">
          Architecture Liquide
        </span>
      </div>

      {/* Top-right — audio toggle */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 pointer-events-auto">
        <AudioToggle />
      </div>

      {/* Right edge — progress gauge */}
      <div className="absolute top-1/2 right-6 md:right-8 -translate-y-1/2 pointer-events-none hidden md:block">
        <ProgressGauge />
      </div>

      {/* Bottom-left — scene indicator */}
      <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 pointer-events-none">
        <SceneIndicator />
      </div>

      {/* Bottom-right — meta */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 hidden md:block pointer-events-none">
        <span className="font-mono text-[10px] tracking-[0.2em] text-text-faint uppercase">
          Lille · 50.6N 3.0E
        </span>
      </div>
    </div>
  );
}
