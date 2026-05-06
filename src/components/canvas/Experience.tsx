'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useStore } from '@/store/useStore';
import { FLOW_CURVE } from '@/data/path';
import ActRoom from './acts/ActRoom';
import ActFlow from './acts/ActFlow';
import ActEnd from './acts/ActEnd';
import FlowParticles from './flow/FlowParticles';

const ROOM_CAM_START = new Vector3(0, 1.6, 6);
const ROOM_CAM_END = new Vector3(0, 1.4, 0.3); // hauteur exacte du centre du moniteur

export default function Experience() {
  const { camera } = useThree();
  const scroll = useStore(s => s.scroll);
  const mouseX = useStore(s => s.mouseX);
  const mouseY = useStore(s => s.mouseY);
  const activeProject = useStore(s => s.activeProject);

  const lmx = useRef(0);
  const lmy = useRef(0);
  const camPos = useRef(new Vector3(0, 1.6, 6));
  const camLook = useRef(new Vector3(0, 1.2, 0));
  const flowPosRef = useRef(new Vector3());
  const flowTanRef = useRef(new Vector3());

  useFrame(() => {
    if (activeProject) return;

    lmx.current += (mouseX - lmx.current) * 0.04;
    lmy.current += (mouseY - lmy.current) * 0.04;

    const s = scroll;

    if (s < 0.20) {
      const t = s / 0.20;
      const ease = t * t * (3 - 2 * t);
      camPos.current.lerpVectors(ROOM_CAM_START, ROOM_CAM_END, ease);
      camPos.current.x += lmx.current * 0.15 * (1 - ease * 0.7);
      camPos.current.y += lmy.current * 0.08;
      // regarde le centre du moniteur (Y=1.4)
      camLook.current.set(lmx.current * 0.1, 1.4 + lmy.current * 0.05, -1.7);
    } else if (s < 0.27) {
      // Approche : camera AVANCE sur Z, Y FIGÉ à 1.4 (centre moniteur)
      const t = (s - 0.20) / 0.07;
      const ease = t * t;
      camPos.current.set(
        lmx.current * 0.04 * (1 - ease),
        1.4, // pas de descente
        ROOM_CAM_END.z + (-2.5 - ROOM_CAM_END.z) * ease, // 0.3 → -2.5 (traverse l'écran à -1.7)
      );
      camLook.current.set(0, 1.4, -4); // regarde droit dans l'écran
    } else if (s < 0.30) {
      // Warp : on bascule dans le flow, Y descend rapidement vers la courbe
      const t = (s - 0.27) / 0.03;
      const ease = t * t * (3 - 2 * t);
      const flowStart = FLOW_CURVE.getPoint(0);
      camPos.current.set(
        0 + (flowStart.x - 0) * ease,
        1.4 + (flowStart.y - 1.4) * ease,
        -2.5 + (flowStart.z - -2.5) * ease,
      );
      camLook.current.copy(FLOW_CURVE.getPoint(0.04));
    } else if (s < 0.90) {
      const t = (s - 0.30) / 0.60;
      FLOW_CURVE.getPoint(t, flowPosRef.current);
      FLOW_CURVE.getTangent(t, flowTanRef.current);
      camPos.current.copy(flowPosRef.current);
      camPos.current.x += lmx.current * 0.4;
      camPos.current.y += lmy.current * 0.25 - 0.2;
      const lookT = Math.min(t + 0.06, 1.0);
      FLOW_CURVE.getPoint(lookT, camLook.current);
      camLook.current.x += lmx.current * 0.2;
      camLook.current.y -= 0.4;
    } else {
      const t = (s - 0.90) / 0.10;
      const endPos = FLOW_CURVE.getPoint(1);
      camPos.current.set(
        endPos.x + lmx.current * 0.3,
        endPos.y + 0.5,
        endPos.z + 4 - t * 2,
      );
      camLook.current.set(endPos.x, endPos.y, endPos.z - 5);
    }

    camera.position.lerp(camPos.current, 0.07);
    camera.lookAt(camLook.current);
  });

  const roomOpacity = scroll < 0.20 ? 1 : Math.max(0, 1 - (scroll - 0.20) / 0.10);
  const flowOpacity = scroll < 0.25 ? 0 : Math.min(1, (scroll - 0.25) / 0.10);

  // Fog : serré dans le tunnel (8, 45), large dans la chambre (15, 80)
  const fogTransition = Math.max(0, Math.min(1, (scroll - 0.25) / 0.10));
  const fogColor = fogTransition < 0.5 ? '#02020A' : '#0A0A20';
  const fogNear = 15 + (8 - 15) * fogTransition;
  const fogFar = 80 + (45 - 80) * fogTransition;

  return (
    <>
      <color attach="background" args={['#02020A']} />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <ambientLight intensity={0.04} color="#3050FF" />

      {roomOpacity > 0.01 && (
        <group visible>
          <ActRoom opacity={roomOpacity} />
        </group>
      )}

      {flowOpacity > 0 && <FlowParticles />}
      {flowOpacity > 0 && <ActFlow opacity={flowOpacity} />}

      {scroll > 0.85 && <ActEnd opacity={Math.min(1, (scroll - 0.85) / 0.10)} />}
    </>
  );
}
