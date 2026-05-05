"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

export interface GlassPrismProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  /** Float frequency (radians/sec on Y). 0 = static. */
  spin?: number;
  /** Vertical bob amplitude. */
  bob?: number;
  /** Octahedron-like prism (default) or dodeca for variety. */
  variant?: "octa" | "dodeca" | "icosa";
}

/**
 * Single material language across the entire experience.
 * MeshTransmissionMaterial is GPU-heavy — we re-use this primitive everywhere
 * and avoid stacking instances inside frustum at the same time.
 */
export function GlassPrism({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = "#a3b8d0",
  spin = 0.18,
  bob = 0.12,
  variant = "octa",
}: GlassPrismProps) {
  const group = useRef<Group>(null!);
  const mesh = useRef<Mesh>(null!);
  const seed = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (spin !== 0) group.current.rotation.y += delta * spin;
    if (bob !== 0) {
      group.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.6 + seed.current) * bob;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <mesh ref={mesh} castShadow={false} receiveShadow={false}>
        {variant === "octa" && <octahedronGeometry args={[1, 0]} />}
        {variant === "dodeca" && <dodecahedronGeometry args={[1, 0]} />}
        {variant === "icosa" && <icosahedronGeometry args={[1, 0]} />}
        <MeshTransmissionMaterial
          color={color}
          thickness={0.55}
          roughness={0.05}
          transmission={1}
          ior={1.45}
          chromaticAberration={0.06}
          backside
          backsideThickness={0.4}
          distortion={0.18}
          distortionScale={0.4}
          temporalDistortion={0.08}
          anisotropicBlur={0.2}
          attenuationDistance={6}
          attenuationColor={color}
        />
      </mesh>
    </group>
  );
}
