'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';
import { TOWER_CONFIG } from '@/data/tower';
import { PROJECTS } from '@/data/projects';
import { useStore } from '@/store/useStore';
import TowerAxis from './TowerAxis';
import TowerNode from './TowerNode';
import TowerWires from './TowerWires';
import ProjectModule from './ProjectModule';

export default function NeuralTower() {
  const { camera } = useThree();
  const towerRef = useRef<Group>(null);
  const halfH = TOWER_CONFIG.totalHeight / 2;

  // Smoothed scroll progress so the camera doesn't jitter on raw scrollY.
  const smoothP = useRef(0);

  useFrame(() => {
    const { scrollProgress, isInsideProject } = useStore.getState();
    if (isInsideProject) return;

    // ease toward raw progress
    smoothP.current += (scrollProgress - smoothP.current) * 0.08;
    const p = smoothP.current;

    let y: number, angle: number, lookY: number;

    if (p < 0.08) {
      y = TOWER_CONFIG.orbitStartY;
      angle = 0;
      lookY = TOWER_CONFIG.orbitStartY - 3;
    } else if (p < 0.75) {
      const tp = (p - 0.08) / 0.67;
      y = TOWER_CONFIG.orbitStartY + (TOWER_CONFIG.orbitEndY - TOWER_CONFIG.orbitStartY) * tp;
      angle = tp * Math.PI * 2;
      lookY = y - 3;
    } else {
      y = TOWER_CONFIG.orbitEndY;
      angle = Math.PI * 2;
      lookY = TOWER_CONFIG.orbitEndY - 3;
    }

    const dist = TOWER_CONFIG.orbitDistance;
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
