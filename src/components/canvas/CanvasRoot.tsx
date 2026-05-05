"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { useAppStore } from "@/store/useAppStore";
import { useViewport } from "@/hooks/useViewport";
import { PERF, COLORS } from "@/lib/constants";
import { MainScene } from "@/components/canvas/MainScene";
import { PostFX } from "@/components/canvas/PostFX";

export function CanvasRoot() {
  const { isMobile } = useViewport();
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const tier = isMobile ? PERF.mobile : PERF.desktop;

  return (
    <div className="canvas-root" aria-hidden="true">
      <Canvas
        dpr={tier.dpr}
        gl={{
          antialias: !isMobile,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 4], fov: 38, near: 0.1, far: 400 }}
        frameloop={reducedMotion ? "demand" : "always"}
        flat={false}
      >
        <color attach="background" args={[COLORS.void]} />
        <fog attach="fog" args={[COLORS.void, 18, 90]} />

        <PerformanceMonitor
          bounds={() => [40, 60]}
          flipflops={3}
          onChange={({ factor }) => {
            void factor;
          }}
        />
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <MainScene isMobile={isMobile} />
          {tier.postFX && !reducedMotion && <PostFX />}
        </Suspense>
      </Canvas>
    </div>
  );
}
