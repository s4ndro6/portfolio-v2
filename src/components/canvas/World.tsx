'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useStore } from '@/store/useStore';
import GlobalParticles from './particles/GlobalParticles';
import CursorLight from './particles/CursorLight';
import NeuralTower from './tower/NeuralTower';
import ProjectWorldSwitch from './worlds/ProjectWorldSwitch';
import ContactSection from './contact/ContactSection';

/**
 * Step B: skeleton — bg, fog, ambient.
 * Children get added in subsequent steps.
 */
export default function World() {
  const groupRef = useRef<Group>(null);
  const lerpedMouse = useRef({ x: 0, y: 0 });

  useFrame(() => {
    const { mouseX, mouseY } = useStore.getState();
    lerpedMouse.current.x += (mouseX - lerpedMouse.current.x) * 0.05;
    lerpedMouse.current.y += (mouseY - lerpedMouse.current.y) * 0.05;
    if (groupRef.current) {
      groupRef.current.rotation.x = lerpedMouse.current.y * 0.04;
      groupRef.current.rotation.y = lerpedMouse.current.x * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <color attach="background" args={['#040408']} />
      <fog attach="fog" args={['#040408', 20, 100]} />
      <ambientLight intensity={0.06} color="#5B6AFF" />

      <CursorLight />
      <GlobalParticles />
      <NeuralTower />
      <ProjectWorldSwitch />
      <ContactSection />
    </group>
  );
}
