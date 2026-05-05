"use client";

import { Environment } from "@react-three/drei";
import { ChoreographedCamera } from "@/components/canvas/primitives/ChoreographedCamera";
import { DustParticles } from "@/components/canvas/primitives/DustParticles";
import { LightLeaks } from "@/components/canvas/primitives/LightLeaks";
import { HubEnvironment } from "@/components/canvas/scenes/HubEnvironment";
import { AboutEnvironment } from "@/components/canvas/scenes/AboutEnvironment";
import { SkillsConstellation } from "@/components/canvas/scenes/SkillsConstellation";
import { ProjectPortals } from "@/components/canvas/scenes/ProjectPortals";
import { OutroEnvironment } from "@/components/canvas/scenes/OutroEnvironment";
import { useAppStore } from "@/store/useAppStore";
import { PERF } from "@/lib/constants";

export function MainScene({ isMobile }: { isMobile: boolean }) {
  const tier = isMobile ? PERF.mobile : PERF.desktop;
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  return (
    <>
      <ChoreographedCamera disabled={isMobile || reducedMotion} />
      <ambientLight intensity={0.18} color="#9eb1c8" />
      <directionalLight position={[10, 14, 6]} intensity={0.55} color="#cfdcef" />
      <Environment preset="night" environmentIntensity={0.3} />

      <LightLeaks />
      <DustParticles count={tier.dust} />

      <HubEnvironment />
      <AboutEnvironment />
      <SkillsConstellation />
      <ProjectPortals />
      <OutroEnvironment />
    </>
  );
}
