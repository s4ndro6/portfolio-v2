"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Object3D,
  type InstancedMesh,
  type Group,
} from "three";
import { SKILLS, CLUSTER_INDEX, type SkillCluster } from "@/data/skills";
import { CLUSTER_COLORS } from "@/lib/constants";

const TMP = new Object3D();
const COLOR = new Color();

interface NodeData {
  position: [number, number, number];
  scale: number;
  cluster: SkillCluster;
}

/**
 * Scene 3 — constellation de 40 nodes, 5 clusters spatialement séparés.
 * Each cluster gravitates around its own anchor; lines connect intra-cluster
 * neighbors via a single BufferGeometry. The whole group slowly rotates.
 */
export function SkillsConstellation() {
  const group = useRef<Group>(null!);
  const mesh = useRef<InstancedMesh>(null!);

  const nodes = useMemo<NodeData[]>(() => {
    // Cluster anchors arranged in a pentagon around z=-40.
    const anchors: Record<SkillCluster, [number, number, number]> = {
      frontend: [-4.5, 2.4, -40],
      backend: [4.5, 2.4, -40],
      "ai-agents": [0, -3.4, -42],
      infra: [-5.2, -1.4, -38],
      tools: [5.2, -1.4, -38],
    };

    return SKILLS.map((s) => {
      const anchor = anchors[s.cluster];
      const r = 1.4 + Math.random() * 1.6;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      return {
        position: [
          anchor[0] + Math.sin(theta) * Math.cos(phi) * r,
          anchor[1] + Math.sin(theta) * Math.sin(phi) * r,
          anchor[2] + Math.cos(theta) * r,
        ] as [number, number, number],
        scale: 0.07 + s.weight * 0.13,
        cluster: s.cluster,
      };
    });
  }, []);

  // Pre-build line geometry: connect each node to its 2 nearest neighbors in cluster.
  const lineGeo = useMemo(() => {
    const positions: number[] = [];
    const byCluster: Record<string, NodeData[]> = {};
    nodes.forEach((n) => {
      (byCluster[n.cluster] = byCluster[n.cluster] || []).push(n);
    });
    Object.values(byCluster).forEach((cluster) => {
      cluster.forEach((a) => {
        const dists = cluster
          .filter((b) => b !== a)
          .map((b) => ({ b, d: distSq(a.position, b.position) }))
          .sort((x, y) => x.d - y.d)
          .slice(0, 2);
        dists.forEach(({ b }) => {
          positions.push(...a.position, ...b.position);
        });
      });
    });
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes]);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.025;
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    nodes.forEach((n, i) => {
      const flicker = 0.85 + 0.15 * Math.sin(t * 1.4 + i * 1.7);
      TMP.position.set(...n.position);
      TMP.scale.setScalar(n.scale * flicker);
      TMP.updateMatrix();
      mesh.current!.setMatrixAt(i, TMP.matrix);
      mesh.current!.setColorAt(i, COLOR.set(CLUSTER_COLORS[CLUSTER_INDEX[n.cluster]]));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0.95} toneMapped={false} />
      </instancedMesh>

      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color="#5a6c84"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function distSq(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}
