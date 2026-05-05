"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, Vector3 } from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { ANCHORS, COLORS } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";

const FONT_DISPLAY = "/fonts/CormorantGaramond-Bold.ttf";
const FONT_DISPLAY_ITALIC = "/fonts/CormorantGaramond-MediumItalic.ttf";
const FONT_MONO = "/fonts/JetBrainsMono-Regular.ttf";

// Anchor position computed once at module load.
const POS = (() => {
  const v = new Vector3();
  AXIS_CURVE.getPointAt(ANCHORS.hubManifesto, v);
  v.x -= 1.2;
  v.y += 0.4;
  v.z += 0.3;
  return v;
})();

/**
 * Hub manifesto — first thing the visitor sees in 3D.
 * Massive Cormorant Garamond, left-aligned, 3 lines, italic on line 2 (qui pensent).
 * Sub-line in mono amber.
 *
 * Anchored at ANCHORS.hubManifesto on the axis, slightly to the right.
 * Glitch is implemented as small position jitters every 4-6s.
 */
export function HubManifesto() {
  const groupRef = useRef<Group>(null);
  const scrollProgress = useAppStore((s) => s.scrollProgress);

  // Subtle glitch — every ~5s, jitter for 80ms.
  const glitchUntil = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    if (time > glitchUntil.current && Math.random() < 0.005) {
      glitchUntil.current = time + 0.08;
    }
    const isGlitching = time < glitchUntil.current;
    const jx = isGlitching ? (Math.random() - 0.5) * 0.05 : 0;
    const jy = isGlitching ? (Math.random() - 0.5) * 0.02 : 0;
    groupRef.current.position.x = POS.x + jx;
    groupRef.current.position.y = POS.y + jy;

    // Fade out as user scrolls past hub (after t=0.18)
    const fade = Math.max(0, 1 - Math.max(0, scrollProgress - 0.13) / 0.08);
    groupRef.current.visible = fade > 0.02;
    groupRef.current.scale.setScalar(0.95 + fade * 0.05);
  });

  return (
    <group ref={groupRef} position={POS.toArray()}>
      <Text
        font={FONT_DISPLAY}
        fontSize={0.52}
        color={COLORS.text}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.04}
        lineHeight={0.96}
        position={[0, 0, 0]}
        material-toneMapped={false}
      >
        JE CODE
      </Text>
      <Text
        font={FONT_DISPLAY}
        fontSize={0.52}
        color={COLORS.text}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.04}
        lineHeight={0.96}
        position={[0, -0.55, 0]}
        material-toneMapped={false}
      >
        DES SYSTÈMES
      </Text>
      <Text
        font={FONT_DISPLAY_ITALIC}
        fontSize={0.52}
        color={COLORS.textDim}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.04}
        lineHeight={0.96}
        position={[0.05, -1.1, 0]}
        material-toneMapped={false}
      >
        qui pensent
      </Text>
      <Text
        font={FONT_DISPLAY}
        fontSize={0.52}
        color={COLORS.text}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.04}
        lineHeight={0.96}
        position={[0, -1.65, 0]}
        material-toneMapped={false}
      >
        SANS AIDE.
      </Text>

      {/* Sub-line: name + availability */}
      <Text
        font={FONT_MONO}
        fontSize={0.085}
        color={COLORS.textFaint}
        anchorX="left"
        anchorY="top"
        letterSpacing={0.25}
        position={[0.02, -2.35, 0]}
        material-toneMapped={false}
      >
        SANDRO SCHILLACI · LILLE · 2026
      </Text>
      <Text
        font={FONT_MONO}
        fontSize={0.085}
        color={COLORS.amber}
        anchorX="left"
        anchorY="top"
        letterSpacing={0.25}
        position={[0.02, -2.5, 0]}
        material-toneMapped={false}
      >
        ● DISPONIBLE · ALTERNANCE B2 · SEPT 2026
      </Text>
    </group>
  );
}
