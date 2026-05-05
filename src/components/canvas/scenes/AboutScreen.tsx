"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Vector3, BoxGeometry, MeshBasicMaterial } from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { ANCHORS, COLORS } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";

const ANCHOR = (() => {
  const v = new Vector3();
  AXIS_CURVE.getPointAt(ANCHORS.about, v);
  return v;
})();

const TANGENT = (() => {
  const v = new Vector3();
  AXIS_CURVE.getTangentAt(ANCHORS.about, v).normalize();
  return v;
})();

// Side rib direction (right of tangent, in XZ plane)
const RIB_DIR = new Vector3(-TANGENT.z, 0, TANGENT.x).normalize();

// Panel center: 3.5u to the LEFT of the axis
const PANEL_CENTER = ANCHOR.clone().addScaledVector(RIB_DIR, -3.5);

// Rib geometry pre-computed
const RIB_LEN = 3.5;
const RIB_GEO = new BoxGeometry(RIB_LEN, 0.04, 0.04);
const RIB_MAT = new MeshBasicMaterial({ color: COLORS.amber, toneMapped: false });

/**
 * About screen — first panel descending from the spine.
 * Rib (small box) extends from the axis toward the panel position.
 * Html portal contains the bio + 3 clickable words.
 *
 * Reveal: tied to scroll progress around ANCHORS.about.
 */
export function AboutScreen() {
  const groupRef = useRef<Group>(null);
  const [revealed, setRevealed] = useState(false);

  useFrame(() => {
    if (!groupRef.current) return;
    const sp = useAppStore.getState().scrollProgress;
    // Reveal window: from t=0.13 to t=0.30
    const local = Math.max(0, Math.min(1, (sp - 0.13) / 0.07));
    const fadeOut = Math.max(0, Math.min(1, 1 - (sp - 0.27) / 0.04));
    const k = local * fadeOut;
    groupRef.current.scale.setScalar(0.85 + k * 0.15);
    groupRef.current.visible = k > 0.02;
    if (k > 0.5 && !revealed) setRevealed(true);
    if (k < 0.3 && revealed) setRevealed(false);
  });

  // Rib midpoint between axis and panel center
  const ribMid = ANCHOR.clone().lerp(PANEL_CENTER, 0.5);
  const ribAngle = Math.atan2(RIB_DIR.z, RIB_DIR.x);

  return (
    <group ref={groupRef}>
      {/* Rib */}
      <mesh
        position={[ribMid.x, ribMid.y, ribMid.z]}
        rotation={[0, -ribAngle, 0]}
        geometry={RIB_GEO}
        material={RIB_MAT}
      />

      {/* Panel — Html portal facing camera */}
      <group position={[PANEL_CENTER.x, PANEL_CENTER.y, PANEL_CENTER.z]}>
        <Html
          transform
          occlude={false}
          distanceFactor={5}
          position={[0, 0, 0]}
          rotation={[0, ribAngle - Math.PI / 2, 0]}
          style={{ pointerEvents: revealed ? "auto" : "none" }}
        >
          <div className="about-panel">
            <span className="about-eyebrow">À propos · vertèbre 02</span>
            <h2 className="about-title">
              Solo full-stack <span className="italic">qui ship.</span>
            </h2>
            <p className="about-body">
              20 ans, Lille. Je code en{" "}
              <button className="about-keyword" data-key="solo">
                solo
              </button>{" "}
              parce que la coordination tue la vélocité.
              Je travaille en{" "}
              <button className="about-keyword" data-key="hyperfocus">
                hyperfocus
              </button>{" "}
              — sessions de 6h, jamais 30 minutes.
              J&apos;ai une seule métrique :{" "}
              <button className="about-keyword" data-key="ship">
                ship
              </button>{" "}
              ce qui tourne en prod, pas ce qui tourne en local.
            </p>
            <span className="about-meta">
              SANDRO · 2026 · ARCHITECTURE LIQUIDE
            </span>
          </div>
        </Html>
      </group>
    </group>
  );
}
