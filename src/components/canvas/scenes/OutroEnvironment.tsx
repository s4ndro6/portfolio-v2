"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { GlassPrism } from "@/components/canvas/primitives/GlassPrism";
import { COLORS } from "@/lib/constants";

/**
 * Scene 5 — nef vide, prisme central fracturé.
 * The fracture is suggested by 6 sub-shards placed around a hollow center.
 * Caméra position z ~ -150.
 */
export function OutroEnvironment() {
  const group = useRef<Group>(null!);
  const shards = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return {
        pos: [Math.cos(a) * 1.2, Math.sin(a * 1.4) * 0.8, Math.sin(a) * 1.2] as [number, number, number],
        rot: [a * 0.7, a, a * 0.4] as [number, number, number],
        scale: 0.45 + (i % 3) * 0.08,
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y -= delta * 0.06;
  });

  return (
    <group ref={group} position={[0, 0, -150]}>
      {/* Fractured central prisme — 6 shards on outer shell, no whole core */}
      {shards.map((s, i) => (
        <GlassPrism
          key={i}
          position={s.pos}
          rotation={s.rot}
          scale={s.scale}
          color={i % 2 === 0 ? COLORS.amber : "#aebcd0"}
          spin={0.08}
          bob={0.06}
          variant="dodeca"
        />
      ))}

      {/* Faint outer ring of dust-bigger prismes for depth */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 6.5;
        return (
          <GlassPrism
            key={`ring-${i}`}
            position={[Math.cos(a) * r, Math.sin(a * 0.7) * 1.2, Math.sin(a) * r]}
            scale={0.12}
            color="#6b7d96"
            spin={0.3}
            bob={0.2}
            variant="octa"
          />
        );
      })}
    </group>
  );
}
