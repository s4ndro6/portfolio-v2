"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { GlassPrism } from "@/components/canvas/primitives/GlassPrism";
import { COLORS } from "@/lib/constants";

/**
 * About: cellule cristalline. Un large prisme central qu'on traverse en
 * caméra continue (z ~ -8), entouré de fragments plus petits évoquant
 * l'éclatement d'une matière.
 */
export function AboutEnvironment() {
  const group = useRef<Group>(null!);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.015;
  });

  return (
    <group ref={group} position={[0, 0, -8]}>
      {/* Prisme central traversé */}
      <GlassPrism
        position={[0, 0, -2]}
        scale={2.4}
        color={COLORS.indigo}
        spin={0.06}
        bob={0.04}
        variant="dodeca"
      />

      {/* Halo de fragments */}
      {Array.from({ length: 14 }).map((_, i) => {
        const r = 3.6 + (i % 3) * 0.8;
        const a = (i / 14) * Math.PI * 2;
        return (
          <GlassPrism
            key={i}
            position={[
              Math.cos(a) * r,
              Math.sin(a * 1.3) * 1.2,
              Math.sin(a) * r - 1,
            ]}
            scale={0.18 + (i % 4) * 0.06}
            color={i % 3 === 0 ? COLORS.violet : "#8da4c2"}
            spin={0.4 + (i % 5) * 0.1}
            bob={0.1}
            variant={i % 2 === 0 ? "octa" : "icosa"}
          />
        );
      })}
    </group>
  );
}
