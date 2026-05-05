"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import {
  Vector3,
  CatmullRomCurve3,
  TubeGeometry,
  MeshBasicMaterial,
  Color,
  Mesh,
  IcosahedronGeometry,
  InstancedMesh,
  Object3D,
  Group,
} from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { ANCHORS, CLUSTER_COLORS, COLORS } from "@/lib/constants";
import { FONT } from "@/lib/fonts";
import { SKILLS, CLUSTER_LABELS, CLUSTER_INDEX, type Skill } from "@/data/skills";
import { useAppStore } from "@/store/useAppStore";

const SCRATCH_OBJ = new Object3D();

const NODE_GEO = new IcosahedronGeometry(0.13, 0);

interface NerveProps {
  cluster: keyof typeof CLUSTER_LABELS;
  anchorT: number;
  angle: number; // radians around the axis tangent (Z mostly)
  index: number;
}

/**
 * One nerve = a Bézier-like curve sprouting from the axis.
 * Carries 8 instanced nodes + a label at the tip.
 */
function Nerve({ cluster, anchorT, angle, index }: NerveProps) {
  const groupRef = useRef<Group>(null);
  const tubeRef = useRef<Mesh>(null);
  const nodesRef = useRef<InstancedMesh>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const skills = useMemo<Skill[]>(
    () => SKILLS.filter((s) => s.cluster === cluster).slice(0, 8),
    [cluster],
  );

  const color = useMemo(
    () => CLUSTER_COLORS[CLUSTER_INDEX[cluster]],
    [cluster],
  );

  // Pre-compute the nerve curve in local space (we'll position group at axis anchor).
  const { tubeGeo, nodePositions, tipPos } = useMemo(() => {
    // Direction perpendicular to axis tangent at anchor, rotated by angle.
    const axisPoint = new Vector3();
    AXIS_CURVE.getPointAt(anchorT, axisPoint);
    const tan = new Vector3();
    AXIS_CURVE.getTangentAt(anchorT, tan).normalize();
    // Right vector
    const right = new Vector3(-tan.z, 0, tan.x).normalize();
    const up = new Vector3(0, 1, 0);
    // Direction of nerve = right rotated by `angle` around tan.
    const dir = right.clone().multiplyScalar(Math.cos(angle))
      .addScaledVector(up, Math.sin(angle))
      .normalize();

    // 4 control points: start at axis, arc out, curl back.
    const len = 5.5;
    const start = new Vector3(0, 0, 0); // local origin; group placed at axisPoint
    const c1 = dir.clone().multiplyScalar(len * 0.35);
    const c2 = dir.clone().multiplyScalar(len * 0.75).addScaledVector(up, 0.3);
    const c3 = dir.clone().multiplyScalar(len).addScaledVector(up, 0.5);

    const curve = new CatmullRomCurve3([start, c1, c2, c3]);
    const tubeGeo = new TubeGeometry(curve, 32, 0.022, 5, false);

    const nodePositions = skills.map((_, i) => {
      const t = 0.15 + (i / (skills.length - 1)) * 0.78;
      return curve.getPointAt(t).clone();
    });

    const tipPos = curve.getPointAt(1).clone();

    return { tubeGeo, nodePositions, tipPos };
  }, [anchorT, angle, skills]);

  const tubeMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity: 0.55,
        toneMapped: false,
      }),
    [color],
  );

  const nodeMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(color),
        toneMapped: false,
      }),
    [color],
  );

  // Place instances once.
  useLayoutEffect(() => {
    if (!nodesRef.current) return;
    nodePositions.forEach((p, i) => {
      SCRATCH_OBJ.position.copy(p);
      SCRATCH_OBJ.scale.setScalar(0.6 + skills[i].weight * 0.6);
      SCRATCH_OBJ.updateMatrix();
      nodesRef.current!.setMatrixAt(i, SCRATCH_OBJ.matrix);
    });
    nodesRef.current.instanceMatrix.needsUpdate = true;
  }, [nodePositions, skills]);

  // Anchor group at axis point on every frame? No — anchor is static; compute once.
  const anchorPos = useMemo(() => {
    const v = new Vector3();
    AXIS_CURVE.getPointAt(anchorT, v);
    return v;
  }, [anchorT]);

  // Reveal animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const sp = useAppStore.getState().scrollProgress;
    // Reveal centered on anchorT, ±0.06 window
    const dist = Math.abs(sp - anchorT);
    const reveal = Math.max(0, 1 - dist / 0.10);
    groupRef.current.scale.setScalar(0.4 + reveal * 0.6);
    groupRef.current.visible = reveal > 0.02;

    // Pulse the tube emissive on time
    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.12;
    tubeMat.opacity = pulse * (0.4 + reveal * 0.6);
  });

  return (
    <group ref={groupRef} position={anchorPos.toArray()}>
      <mesh ref={tubeRef} geometry={tubeGeo} material={tubeMat} />
      <instancedMesh
        ref={nodesRef}
        args={[NODE_GEO, nodeMat, skills.length]}
      />
      {/* Cluster label at the tip */}
      <Text
        font={FONT.displayItalic}
        fontSize={0.32}
        color={color}
        anchorX="center"
        anchorY="middle"
        position={[tipPos.x, tipPos.y + 0.4, tipPos.z]}
        material-toneMapped={false}
      >
        {CLUSTER_LABELS[cluster]}
      </Text>
      {/* Skill name labels - smaller, tucked next to each node */}
      {skills.map((s, i) => (
        <Text
          key={s.name}
          font={FONT.mono}
          fontSize={0.085}
          color={COLORS.textDim}
          anchorX="left"
          anchorY="middle"
          position={[
            nodePositions[i].x + 0.2,
            nodePositions[i].y,
            nodePositions[i].z,
          ]}
          material-toneMapped={false}
          letterSpacing={0.1}
        >
          {s.name}
        </Text>
      ))}
    </group>
  );
}

/**
 * 5 nerves emerging from 5 successive vertebrae.
 * Each nerve sprouts in a different angular direction around the axis
 * (0°, 72°, 144°, 216°, 288°) so they don't occlude each other.
 */
export function SkillsRoots() {
  const clusters = ["frontend", "backend", "ai-agents", "infra", "tools"] as const;

  return (
    <group>
      {clusters.map((c, i) => (
        <Nerve
          key={c}
          cluster={c}
          anchorT={ANCHORS.skills[i]}
          angle={(i / 5) * Math.PI * 2 + 0.6}
          index={i}
        />
      ))}
    </group>
  );
}
