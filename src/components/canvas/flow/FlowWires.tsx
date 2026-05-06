'use client';
import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, AdditiveBlending } from 'three';
import { FLOW_CURVE, STATION_T, STATION_OFFSET } from '@/data/path';
import { PROJECTS } from '@/data/projects';

export default function FlowWires() {
  const wireGeos = useMemo(() => {
    return PROJECTS.map((project, i) => {
      const t = STATION_T[i];
      const basePos = FLOW_CURVE.getPoint(t);
      const offset = STATION_OFFSET[i];
      const stationPos = [
        basePos.x + offset.x,
        basePos.y + offset.y,
        basePos.z,
      ];
      const pathPos = [basePos.x, basePos.y + 0.5, basePos.z];
      const verts = new Float32Array([
        ...pathPos, ...stationPos,
      ]);
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(verts, 3));
      return { geo: g, color: project.color };
    });
  }, []);

  return (
    <>
      <mesh>
        <tubeGeometry args={[FLOW_CURVE, 200, 0.004, 4, false]} />
        <meshStandardMaterial
          color="#22D3EE"
          emissive="#22D3EE"
          emissiveIntensity={1.0}
          transparent
          opacity={0.12}
        />
      </mesh>

      {wireGeos.map(({ geo, color }, i) => (
        <lineSegments key={i} geometry={geo}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.25}
            blending={AdditiveBlending}
          />
        </lineSegments>
      ))}
    </>
  );
}
