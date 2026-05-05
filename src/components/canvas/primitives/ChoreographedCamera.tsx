"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import gsap from "gsap";
import { AXIS_CURVE } from "@/lib/curve";
import { useAppStore } from "@/store/useAppStore";
import { ANCHORS, PARALLAX_DAMP } from "@/lib/constants";
import { PROJECTS } from "@/data/projects";

const SCRATCH = {
  pos: new Vector3(),
  ahead: new Vector3(),
  tan: new Vector3(),
  side: new Vector3(),
  right: new Vector3(),
  zoomTarget: new Vector3(),
  zoomLook: new Vector3(),
};

const UP = new Vector3(0, 1, 0);

interface Props {
  disabled?: boolean;
}

/**
 * Camera rig — slides along the spinal axis curve.
 * Position = curve.getPointAt(t) + side offset (1.6u right, 0.5u up).
 * LookAt   = curve.getPointAt(t + 0.012) — looking forward along the axis.
 *
 * On openProject set: smoothly tweens to the panel position (zoom-in).
 * On close: tweens back to the rail.
 */
export function ChoreographedCamera({ disabled = false }: Props) {
  const camera = useThree((s) => s.camera);
  const renderedT = useRef(0);
  const zoomFactor = useRef({ value: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);

  // Read store imperatively (avoid re-running on every frame)
  useFrame(() => {
    if (disabled) return;
    const { scrollProgress, mouse, openProject } = useAppStore.getState();

    const t = Math.min(0.985, Math.max(0, scrollProgress));
    renderedT.current += (t - renderedT.current) * 0.16;

    AXIS_CURVE.getPointAt(renderedT.current, SCRATCH.pos);
    AXIS_CURVE.getPointAt(
      Math.min(0.999, renderedT.current + 0.012),
      SCRATCH.ahead,
    );
    AXIS_CURVE.getTangentAt(renderedT.current, SCRATCH.tan).normalize();

    SCRATCH.right.copy(SCRATCH.tan).cross(UP).normalize();

    const railX = SCRATCH.pos.x + SCRATCH.right.x * 1.6;
    const railY = SCRATCH.pos.y + 0.5;
    const railZ = SCRATCH.pos.z + SCRATCH.right.z * 1.6;

    const parallaxX = mouse.x * PARALLAX_DAMP * 6;
    const parallaxY = -mouse.y * PARALLAX_DAMP * 4;

    let zx = railX,
      zy = railY,
      zz = railZ;
    let lx = SCRATCH.ahead.x,
      ly = SCRATCH.ahead.y,
      lz = SCRATCH.ahead.z;

    if (openProject) {
      const idx = PROJECTS.findIndex((p) => p.id === openProject);
      if (idx >= 0) {
        const panelT = ANCHORS.projects[idx];
        const side = idx % 2 === 0 ? -1 : 1;
        AXIS_CURVE.getPointAt(panelT, SCRATCH.zoomLook);
        AXIS_CURVE.getTangentAt(panelT, SCRATCH.tan).normalize();
        SCRATCH.right.copy(SCRATCH.tan).cross(UP).normalize();

        SCRATCH.zoomLook.x += SCRATCH.right.x * side * 3.5;
        SCRATCH.zoomLook.z += SCRATCH.right.z * side * 3.5;
        SCRATCH.zoomLook.y += -0.4;

        SCRATCH.zoomTarget.copy(SCRATCH.zoomLook);
        SCRATCH.zoomTarget.x -= SCRATCH.tan.x * 4.5;
        SCRATCH.zoomTarget.y += 0.4;
        SCRATCH.zoomTarget.z -= SCRATCH.tan.z * 4.5;

        const k = zoomFactor.current.value;
        zx = railX * (1 - k) + SCRATCH.zoomTarget.x * k;
        zy = railY * (1 - k) + SCRATCH.zoomTarget.y * k;
        zz = railZ * (1 - k) + SCRATCH.zoomTarget.z * k;
        lx = SCRATCH.ahead.x * (1 - k) + SCRATCH.zoomLook.x * k;
        ly = SCRATCH.ahead.y * (1 - k) + SCRATCH.zoomLook.y * k;
        lz = SCRATCH.ahead.z * (1 - k) + SCRATCH.zoomLook.z * k;
      }
    } else if (zoomFactor.current.value > 0.001) {
      // Closing: blend with last zoom target until factor reaches 0
      const k = zoomFactor.current.value;
      zx = railX * (1 - k) + SCRATCH.zoomTarget.x * k;
      zy = railY * (1 - k) + SCRATCH.zoomTarget.y * k;
      zz = railZ * (1 - k) + SCRATCH.zoomTarget.z * k;
      lx = SCRATCH.ahead.x * (1 - k) + SCRATCH.zoomLook.x * k;
      ly = SCRATCH.ahead.y * (1 - k) + SCRATCH.zoomLook.y * k;
      lz = SCRATCH.ahead.z * (1 - k) + SCRATCH.zoomLook.z * k;
    }

    camera.position.set(zx + parallaxX, zy + parallaxY, zz);
    camera.lookAt(lx, ly, lz);
  });

  // Tween the zoom factor when openProject changes.
  useEffect(() => {
    let lastOpen: string | null = null;
    const unsub = useAppStore.subscribe((state) => {
      if (state.openProject !== lastOpen) {
        lastOpen = state.openProject;
        tween.current?.kill();
        tween.current = gsap.to(zoomFactor.current, {
          value: state.openProject ? 1 : 0,
          duration: state.openProject ? 1.2 : 0.9,
          ease: "expo.out",
        });
      }
    });
    return () => {
      unsub();
      tween.current?.kill();
    };
  }, []);

  return null;
}
