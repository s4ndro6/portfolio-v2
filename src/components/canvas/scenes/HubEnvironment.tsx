"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { GlassPrism } from "@/components/canvas/primitives/GlassPrism";
import { CLUSTER_COLORS } from "@/lib/constants";

/**
 * Hub: 7 prismes en orbite autour d'un anchor central, autour de z=12.
 * The whole orbit rotates slowly. Each prism floats with its own seed.
 */
export function HubEnvironment() {
  const group = useRef<Group>(null!);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.04;
  });

  const colors = CLUSTER_COLORS;

  return (
    <group ref={group} position={[0, 0, 12]}>
      {/* Central anchor — slightly larger, slowly counter-rotating */}
      <GlassPrism
        position={[0, 0, 0]}
        scale={1.4}
        color="#bcd0e8"
        spin={-0.12}
        bob={0.08}
        variant="icosa"
      />

      {/* 7 satellite prismes en orbite */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        const radius = 4.6;
        const yOffset = Math.sin(i * 1.7) * 0.8;
        return (
          <GlassPrism
            key={i}
            position={[
              Math.cos(angle) * radius,
              yOffset,
              Math.sin(angle) * radius - 2,
            ]}
            rotation={[i * 0.3, 0, i * 0.2]}
            scale={0.6 + (i % 3) * 0.15}
            color={colors[i % colors.length]}
            spin={0.2 + i * 0.04}
            bob={0.18}
            variant={i % 2 === 0 ? "octa" : "dodeca"}
          />
        );
      })}
    </group>
  );
}
