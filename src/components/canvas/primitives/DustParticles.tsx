"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D, type InstancedMesh as IM } from "three";

const TMP = new Object3D();
const COLOR = new Color();

export interface DustParticlesProps {
  count?: number;
  /** Domain extents in world units (cube around origin). */
  bounds?: { x: number; y: number; z: number };
  /** Vertical drift speed in world units / sec. */
  driftSpeed?: number;
}

/**
 * Persistent dust field, instanced. Particles drift slowly upwards then wrap.
 * Single InstancedMesh = one draw call regardless of count.
 */
export function DustParticles({
  count = 1500,
  bounds = { x: 80, y: 60, z: 220 },
  driftSpeed = 0.18,
}: DustParticlesProps) {
  const mesh = useRef<IM>(null!);

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * bounds.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * bounds.y;
      positions[i * 3 + 2] = -Math.random() * bounds.z + 18;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 0.8;
    }
    return { positions, phases, speeds };
  }, [count, bounds.x, bounds.y, bounds.z]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Slow vertical drift + tiny lateral wiggle from sine.
      data.positions[idx + 1] += delta * driftSpeed * data.speeds[i];
      data.positions[idx + 0] += Math.sin(t * 0.3 + data.phases[i]) * delta * 0.04;

      if (data.positions[idx + 1] > bounds.y / 2) {
        data.positions[idx + 1] = -bounds.y / 2;
        data.positions[idx + 0] = (Math.random() - 0.5) * bounds.x;
      }

      TMP.position.set(
        data.positions[idx + 0],
        data.positions[idx + 1],
        data.positions[idx + 2]
      );
      const flicker = 0.5 + 0.5 * Math.sin(t * 1.2 + data.phases[i] * 3);
      const s = (0.04 + 0.02 * flicker) * (1 + 0.3 * Math.sin(data.phases[i] * 5));
      TMP.scale.setScalar(s);
      TMP.updateMatrix();
      mesh.current.setMatrixAt(i, TMP.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color={COLOR.set("#cfd8e6")}
        transparent
        opacity={0.55}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
