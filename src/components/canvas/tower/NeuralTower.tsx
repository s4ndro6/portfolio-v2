'use client';

import { useRef, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOWER_CONFIG } from '@/data/tower';
import { PROJECTS } from '@/data/projects';
import { useStore } from '@/store/useStore';
import TowerAxis from './TowerAxis';
import TowerNode from './TowerNode';
import TowerWires from './TowerWires';
import ProjectModule from './ProjectModule';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function NeuralTower() {
  const { camera } = useThree();
  const towerRef = useRef<Group>(null);
  const halfH = TOWER_CONFIG.totalHeight / 2;

  // Camera state driven by ScrollTrigger.onUpdate, lerped each frame.
  const camState = useRef<{
    angle: number;
    y: number;
    dist: number;
    lookY: number;
  }>({
    angle: 0,
    y: TOWER_CONFIG.orbitStartY,
    dist: TOWER_CONFIG.orbitDistance,
    lookY: TOWER_CONFIG.orbitStartY - 3,
  });

  useLayoutEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate(self) {
        const p = self.progress;
        useStore.getState().setScroll(p);

        // Tower chapter: 0.08 → 0.75
        if (p < 0.08) {
          camState.current.y = TOWER_CONFIG.orbitStartY;
          camState.current.angle = 0;
          camState.current.lookY = TOWER_CONFIG.orbitStartY - 3;
        } else if (p < 0.75) {
          const tp = (p - 0.08) / 0.67;
          camState.current.y = gsap.utils.interpolate(
            TOWER_CONFIG.orbitStartY,
            TOWER_CONFIG.orbitEndY,
            tp,
          );
          camState.current.angle = tp * Math.PI * 2;
          camState.current.lookY = camState.current.y - 3;
        } else {
          // Contact chapter — keep last orbit pose; ContactSection handles the rest at Step N
          camState.current.y = TOWER_CONFIG.orbitEndY;
          camState.current.angle = Math.PI * 2;
          camState.current.lookY = TOWER_CONFIG.orbitEndY - 3;
        }
      },
    });

    // Refresh after mount in case body height changes (fonts, dynamic content).
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      clearTimeout(refreshTimer);
      trigger.kill();
    };
  }, []);

  useFrame(() => {
    const { isInsideProject } = useStore.getState();
    if (isInsideProject) return;

    const { angle, y, dist, lookY } = camState.current;
    const x = Math.sin(angle) * dist;
    const z = Math.cos(angle) * dist;

    camera.position.x += (x - camera.position.x) * 0.06;
    camera.position.y += (y - camera.position.y) * 0.06;
    camera.position.z += (z - camera.position.z) * 0.06;
    camera.lookAt(0, lookY, 0);
  });

  return (
    <group ref={towerRef}>
      <TowerAxis />

      {Array.from({ length: TOWER_CONFIG.nodeCount }, (_, i) => (
        <TowerNode
          key={i}
          index={i}
          position={[0, i * TOWER_CONFIG.nodeSpacing - halfH, 0]}
        />
      ))}

      <TowerWires />

      {PROJECTS.map((p) => (
        <ProjectModule key={p.id} project={p} />
      ))}
    </group>
  );
}
