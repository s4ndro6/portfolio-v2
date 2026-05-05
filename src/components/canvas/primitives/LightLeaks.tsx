"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

/**
 * Soft volumetric light columns that slowly drift across the path.
 * Implemented as additive cones with low opacity to keep the mood ambient.
 */
export function LightLeaks() {
  const group = useRef<Group>(null!);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.04) * 0.2;
  });

  const beams: Array<{ pos: [number, number, number]; tint: string }> = [
    { pos: [-12, 8, -30], tint: "#7e9ec7" },
    { pos: [10, 6, -80], tint: "#9b7ec7" },
    { pos: [-6, -4, -130], tint: "#7ec7c0" },
    { pos: [8, 10, -160], tint: "#c79a7e" },
  ];

  return (
    <group ref={group}>
      {beams.map((b, i) => (
        <mesh
          key={i}
          position={b.pos}
          rotation={[Math.PI, 0, i % 2 === 0 ? 0.3 : -0.3]}
        >
          <coneGeometry args={[6, 22, 24, 1, true]} />
          <meshBasicMaterial
            color={b.tint}
            transparent
            opacity={0.04}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
