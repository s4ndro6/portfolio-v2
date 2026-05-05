"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  PlaneGeometry,
  MeshPhysicalMaterial,
  DoubleSide,
  Vector3,
} from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { useAppStore } from "@/store/useAppStore";
import { COLORS } from "@/lib/constants";

const TARGET = new Vector3();

/**
 * Origami bird — 6 triangular planes folded into an abstract bird shape.
 * Glides along the axis with lag, gentle wing flap.
 *
 * The signature element : "complexity folded into something elegant".
 *
 * Implemented as 6 PlaneGeometry triangles (rotated 90deg PlaneGeometry,
 * cut visually via material) arranged like wings + body.
 *
 * Idea: 2 "wings" (large triangles) hinged at center, opening/closing.
 * 2 "tail" planes, 2 small "head" planes.
 */
export function OrigamiBird() {
  const groupRef = useRef<Group>(null);
  const leftWingRef = useRef<Group>(null);
  const rightWingRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);

  const scrollProgress = useAppStore((s) => s.scrollProgress);
  const openProject = useAppStore((s) => s.openProject);

  const planeGeo = useMemo(() => {
    // 1×0.7 plane — non-square so the look is more organic.
    const g = new PlaneGeometry(1, 0.7, 1, 1);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: COLORS.text,
        side: DoubleSide,
        transmission: 0.55,
        roughness: 0.25,
        thickness: 0.1,
        ior: 1.4,
        clearcoat: 0.8,
        clearcoatRoughness: 0.3,
        metalness: 0,
        opacity: 0.85,
        transparent: true,
      }),
    [],
  );

  // Per-frame: glide along curve with lag, flap wings, drift.
  const lerpedT = useRef(0.06);
  const lerpedPos = useRef(new Vector3());
  const flapPhase = useRef(0);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    // Target T = scrollProgress with offset behind camera.
    const targetT = Math.min(0.97, Math.max(0.02, scrollProgress + 0.025));
    lerpedT.current += (targetT - lerpedT.current) * Math.min(1, dt * 0.6);
    AXIS_CURVE.getPointAt(lerpedT.current, TARGET);
    // Offset to bottom-right of camera path
    const targetPos = TARGET.clone();
    targetPos.x += 2.6;
    targetPos.y -= 1.4;
    targetPos.z += 0.8;
    lerpedPos.current.lerp(targetPos, Math.min(1, dt * 1.6));
    groupRef.current.position.copy(lerpedPos.current);

    // Drift away on zoom
    const drift = openProject ? 4 : 0;
    groupRef.current.position.x += drift;

    // Slow rotation around Y, slight bob
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.6 + 0.4;
    groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
    groupRef.current.position.y += Math.sin(t * 0.7) * 0.05;

    // Wing flap
    flapPhase.current += dt * 0.9;
    const flap = Math.sin(flapPhase.current) * 0.35 + 0.25;
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap;
    if (tailRef.current)
      tailRef.current.rotation.x = Math.sin(flapPhase.current * 0.7) * 0.18;
  });

  return (
    <group ref={groupRef} scale={0.4}>
      {/* Body — central diamond */}
      <mesh geometry={planeGeo} material={material} rotation={[0, 0, Math.PI / 4]} scale={[0.6, 0.6, 1]} />

      {/* Left wing — hinged at origin */}
      <group ref={leftWingRef}>
        <mesh
          geometry={planeGeo}
          material={material}
          position={[0.55, 0.05, 0]}
          rotation={[0.2, 0.4, 0.1]}
          scale={[1.2, 0.8, 1]}
        />
        <mesh
          geometry={planeGeo}
          material={material}
          position={[1.2, -0.05, -0.1]}
          rotation={[0.3, 0.7, -0.2]}
          scale={[0.8, 0.5, 1]}
        />
      </group>

      {/* Right wing */}
      <group ref={rightWingRef}>
        <mesh
          geometry={planeGeo}
          material={material}
          position={[-0.55, 0.05, 0]}
          rotation={[0.2, -0.4, -0.1]}
          scale={[1.2, 0.8, 1]}
        />
        <mesh
          geometry={planeGeo}
          material={material}
          position={[-1.2, -0.05, -0.1]}
          rotation={[0.3, -0.7, 0.2]}
          scale={[0.8, 0.5, 1]}
        />
      </group>

      {/* Tail */}
      <group ref={tailRef} position={[0, -0.35, -0.2]}>
        <mesh
          geometry={planeGeo}
          material={material}
          rotation={[Math.PI / 6, 0, Math.PI / 4]}
          scale={[0.5, 0.5, 1]}
        />
      </group>
    </group>
  );
}
