'use client';
import { PROJECTS } from '@/data/projects';
import { STATION_T, STATION_OFFSET, FLOW_CURVE } from '@/data/path';
import FlowStation from '../flow/FlowStation';
import FlowWires from '../flow/FlowWires';

interface Props { opacity: number; }

export default function ActFlow({ opacity }: Props) {
  return (
    <group>
      <FlowWires />

      {PROJECTS.map((project, i) => {
        const t = STATION_T[i];
        const basePos = FLOW_CURVE.getPoint(t);
        const offset = STATION_OFFSET[i];
        const pos: [number, number, number] = [
          basePos.x + offset.x,
          basePos.y + offset.y,
          basePos.z,
        ];
        const rotY = offset.x > 0 ? -Math.PI / 6 : Math.PI / 6;
        return (
          <FlowStation
            key={project.id}
            project={project}
            position={pos}
            rotationY={rotY}
            stationIndex={i}
          />
        );
      })}
    </group>
  );
}
