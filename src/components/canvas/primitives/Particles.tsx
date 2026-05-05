"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  AdditiveBlending,
  Vector3,
  CatmullRomCurve3,
  TubeGeometry,
  InstancedMesh,
  Object3D,
  MeshBasicMaterial,
} from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { COLORS } from "@/lib/constants";

const SCRATCH_OBJ = new Object3D();
const SCRATCH_VEC = new Vector3();

/**
 * Layer 1 — Light trails.
 * 60-80 thin tube curves, sparse, drift slowly along the axis direction.
 * Each is a static TubeGeometry along a small CatmullRomCurve3
 * placed in random offset from the axis. Emissive silver-blue.
 */
function LightTrails({ count }: { count: number }) {
  const groupRef = useRef<InstancedMesh>(null);

  // Pre-generate one trail geometry — instances reuse it.
  const trailGeometry = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts.push(
        new Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.05,
          (t - 0.5) * 8,
        ),
      );
    }
    const curve = new CatmullRomCurve3(pts);
    return new TubeGeometry(curve, 24, 0.012, 4, false);
  }, []);

  const trailMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: COLORS.trailSilver,
        transparent: true,
        opacity: 0.3,
        toneMapped: false,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  // Position each instance somewhere near the axis with offset.
  const seedsRef = useRef<
    { t: number; offsetX: number; offsetY: number; speed: number }[]
  >([]);
  if (seedsRef.current.length !== count) {
    seedsRef.current = Array.from({ length: count }, () => ({
      t: Math.random(),
      offsetX: (Math.random() - 0.5) * 14,
      offsetY: (Math.random() - 0.5) * 8,
      speed: 0.005 + Math.random() * 0.012,
    }));
  }

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const seeds = seedsRef.current;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      s.t += s.speed * dt;
      if (s.t > 1) s.t -= 1;
      AXIS_CURVE.getPointAt(s.t, SCRATCH_VEC);
      SCRATCH_OBJ.position.set(
        SCRATCH_VEC.x + s.offsetX,
        SCRATCH_VEC.y + s.offsetY,
        SCRATCH_VEC.z,
      );
      SCRATCH_OBJ.rotation.set(0, 0, s.offsetX * 0.1);
      SCRATCH_OBJ.scale.setScalar(0.7 + Math.sin(s.t * 12) * 0.3);
      SCRATCH_OBJ.updateMatrix();
      groupRef.current.setMatrixAt(i, SCRATCH_OBJ.matrix);
    }
    groupRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;
  return <instancedMesh ref={groupRef} args={[trailGeometry, trailMaterial, count]} />;
}

/**
 * Layer 2 — Slate dust field.
 * Many small drifting points filling space, deep slate color, low opacity.
 * Uses Points + PointsMaterial.
 */
function SlateDust({ count }: { count: number }) {
  const pointsRef = useRef<Points>(null);
  const seedsRef = useRef<
    { x: number; y: number; z: number; vx: number; vy: number; vz: number }[]
  >([]);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 200 + 20;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      seeds.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        vz: (Math.random() - 0.5) * 0.04,
      });
    }
    seedsRef.current = seeds;
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new PointsMaterial({
        color: COLORS.slateDeep,
        size: 0.08,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes
      .position as Float32BufferAttribute;
    const arr = pos.array as Float32Array;
    const seeds = seedsRef.current;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.z += s.vz * dt;
      // Wrap when far out
      if (s.z > 30) s.z = -190;
      if (s.z < -200) s.z = 25;
      if (Math.abs(s.x) > 35) s.vx = -s.vx;
      if (Math.abs(s.y) > 22) s.vy = -s.vy;
      arr[i * 3] = s.x;
      arr[i * 3 + 1] = s.y;
      arr[i * 3 + 2] = s.z;
    }
    pos.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/**
 * Layer 3 — Amber motes near the axis.
 * Bioluminescent feel. Constrained to ~3u radius around the axis.
 * Additive blending so they bloom.
 */
function AmberMotes({ count }: { count: number }) {
  const pointsRef = useRef<Points>(null);
  const seedsRef = useRef<
    { t: number; offX: number; offY: number; phase: number; speed: number }[]
  >([]);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = [];
    for (let i = 0; i < count; i++) {
      seeds.push({
        t: Math.random(),
        offX: (Math.random() - 0.5) * 6,
        offY: (Math.random() - 0.5) * 4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.04,
      });
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    seedsRef.current = seeds;
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new PointsMaterial({
        color: COLORS.amber,
        size: 0.16,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useFrame((state, dt) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes
      .position as Float32BufferAttribute;
    const arr = pos.array as Float32Array;
    const seeds = seedsRef.current;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      s.t += s.speed * dt * 0.5;
      if (s.t > 1) s.t -= 1;
      AXIS_CURVE.getPointAt(s.t, SCRATCH_VEC);
      const wob = Math.sin(time * 0.5 + s.phase) * 0.4;
      arr[i * 3] = SCRATCH_VEC.x + s.offX + wob;
      arr[i * 3 + 1] = SCRATCH_VEC.y + s.offY + Math.cos(time * 0.4 + s.phase) * 0.3;
      arr[i * 3 + 2] = SCRATCH_VEC.z + Math.sin(time * 0.3 + s.phase) * 0.6;
    }
    pos.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export function Particles({
  trails,
  dust,
  motes,
}: {
  trails: number;
  dust: number;
  motes: number;
}) {
  return (
    <>
      <LightTrails count={trails} />
      <SlateDust count={dust} />
      <AmberMotes count={motes} />
    </>
  );
}
