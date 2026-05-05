'use client';

import { ComponentType } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '@/store/useStore';
import WorldNexus from './WorldNexus';
import WorldFluvo from './WorldFluvo';
import WorldHunt from './WorldHunt';
import WorldArcane from './WorldArcane';
import WorldAgents from './WorldAgents';
import WorldJarvis from './WorldJarvis';

const WORLDS: Record<string, ComponentType> = {
  fluvo: WorldFluvo,
  hunt: WorldHunt,
  nexus: WorldNexus,
  arcane: WorldArcane,
  agents: WorldAgents,
  jarvis: WorldJarvis,
};

export default function ProjectWorldSwitch() {
  const activeProject = useStore((s) => s.activeProject);
  const isInsideProject = useStore((s) => s.isInsideProject);
  const isEntering = useStore((s) => s.isEnteringProject);
  const { camera } = useThree();

  // While inside a project: lerp camera to a fixed world-view pose.
  useFrame(() => {
    if (!isInsideProject && !isEntering) return;
    camera.position.x += (0 - camera.position.x) * 0.06;
    camera.position.y += (0 - camera.position.y) * 0.06;
    camera.position.z += (8 - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  if (!activeProject || !isInsideProject) return null;
  const Component = WORLDS[activeProject];
  return Component ? <Component /> : null;
}
