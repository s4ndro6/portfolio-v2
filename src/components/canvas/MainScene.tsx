"use client";

import { Environment } from "@react-three/drei";
import { ChoreographedCamera } from "@/components/canvas/primitives/ChoreographedCamera";
import { SpinalAxis } from "@/components/canvas/primitives/SpinalAxis";
import { Particles } from "@/components/canvas/primitives/Particles";
import { OrigamiBird } from "@/components/canvas/primitives/OrigamiBird";
import { HubManifesto } from "@/components/canvas/scenes/HubManifesto";
import { AboutScreen } from "@/components/canvas/scenes/AboutScreen";
import { SkillsRoots } from "@/components/canvas/scenes/SkillsRoots";
import { ProjectScreens } from "@/components/canvas/scenes/ProjectScreens";
import { ContactEnd } from "@/components/canvas/scenes/ContactEnd";
import { MoodController } from "@/components/canvas/MoodController";
import { useAppStore } from "@/store/useAppStore";
import { PERF } from "@/lib/constants";

export function MainScene({ isMobile }: { isMobile: boolean }) {
  const tier = isMobile ? PERF.mobile : PERF.desktop;
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  return (
    <>
      <ChoreographedCamera disabled={reducedMotion} />
      <ambientLight intensity={0.18} color="#9eb1c8" />
      <Environment preset="night" environmentIntensity={0.25} />
      <MoodController />

      <SpinalAxis />
      <Particles trails={tier.trails} dust={tier.dust} motes={tier.motes} />
      {!isMobile && <OrigamiBird />}

      <HubManifesto />
      <AboutScreen />
      <SkillsRoots />
      <ProjectScreens />
      <ContactEnd />
    </>
  );
}
