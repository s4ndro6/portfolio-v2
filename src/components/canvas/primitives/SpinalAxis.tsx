"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  IcosahedronGeometry,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  InstancedMesh,
  Mesh,
  Object3D,
  Vector3,
  Quaternion,
  TubeGeometry,
  Matrix4,
} from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { COLORS, VERTEBRAE_COUNT } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";

const SCRATCH_OBJ = new Object3D();
const SCRATCH_VEC = new Vector3();
const SCRATCH_TAN = new Vector3();
const SCRATCH_QUAT = new Quaternion();
const UP = new Vector3(0, 1, 0);

/**
 * Spinal axis — the world's backbone.
 * - 24 IcosahedronGeometry segments along the curve (vertebrae)
 * - Each vertebra has an inner amber emissive sphere (visible through transmission)
 * - A thin amber TubeGeometry runs the full length of the curve as the "vein"
 *
 * The vein and core spheres pulse subtly when openProject is set.
 */
export function SpinalAxis() {
  const innerRef = useRef<InstancedMesh>(null);
  const veinRef = useRef<Mesh>(null);
  const openProject = useAppStore((s) => s.openProject);

  // Vein tube geometry — built once.
  const veinGeometry = useMemo(
    () => new TubeGeometry(AXIS_CURVE, 220, 0.045, 6, false),
    [],
  );

  // Outer shell (transmission cristal) — instanced.
  const outerGeometry = useMemo(() => new IcosahedronGeometry(0.18, 0), []);
  const outerMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: COLORS.mid,
        transmission: 0.7,
        roughness: 0.18,
        thickness: 0.45,
        ior: 1.5,
        clearcoat: 0.6,
        clearcoatRoughness: 0.4,
        metalness: 0,
        attenuationColor: COLORS.amberHot,
        attenuationDistance: 1.4,
      }),
    [],
  );

  // Inner emissive amber core — instanced (smaller icos, no transmission).
  const innerGeometry = useMemo(() => new IcosahedronGeometry(0.036, 0), []);
  const innerMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: COLORS.amber,
        toneMapped: false,
      }),
    [],
  );

  // Pre-compute instance transforms once — vertebrae stay still.
  const outerRef = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!outerRef.current || !innerRef.current) return;
    const m = new Matrix4();
    for (let i = 0; i < VERTEBRAE_COUNT; i++) {
      const t = (i + 0.5) / VERTEBRAE_COUNT;
      const p = AXIS_CURVE.getPointAt(t, SCRATCH_VEC.clone());
      const tan = AXIS_CURVE.getTangentAt(t, SCRATCH_TAN.clone()).normalize();
      const q = SCRATCH_QUAT.clone().setFromUnitVectors(UP, tan);
      SCRATCH_OBJ.position.copy(p);
      SCRATCH_OBJ.quaternion.copy(q);
      SCRATCH_OBJ.scale.setScalar(1);
      SCRATCH_OBJ.updateMatrix();
      m.copy(SCRATCH_OBJ.matrix);
      outerRef.current.setMatrixAt(i, m);
      innerRef.current.setMatrixAt(i, m);
    }
    outerRef.current.instanceMatrix.needsUpdate = true;
    innerRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Subtle breathing pulse on the vein + when zoom triggers, a stronger pulse.
  const pulseRef = useRef({ value: 1, target: 1 });

  useFrame((_, dt) => {
    pulseRef.current.target = openProject ? 1.6 : 1;
    pulseRef.current.value += (pulseRef.current.target - pulseRef.current.value) * Math.min(1, dt * 4.5);
    if (veinRef.current) {
      const mat = veinRef.current.material as MeshBasicMaterial;
      const breathe = 1 + Math.sin(performance.now() / 1100) * 0.08;
      // intensity baked via color brightness; toneMapped:false lets bloom catch it
      const k = pulseRef.current.value * breathe;
      mat.color.setRGB(1 * k, 0.706 * k, 0.33 * k);
    }
  });

  return (
    <group renderOrder={1}>
      {/* Vein — emissive amber tube along the curve */}
      <mesh ref={veinRef} geometry={veinGeometry}>
        <meshBasicMaterial color={COLORS.amber} toneMapped={false} />
      </mesh>

      {/* Outer cristal vertebrae */}
      <instancedMesh
        ref={outerRef}
        args={[outerGeometry, outerMaterial, VERTEBRAE_COUNT]}
      />

      {/* Inner amber cores (visible through transmission) */}
      <instancedMesh
        ref={innerRef}
        args={[innerGeometry, innerMaterial, VERTEBRAE_COUNT]}
      />
    </group>
  );
}
