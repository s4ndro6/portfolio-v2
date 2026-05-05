"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, Vector3 } from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { ANCHORS, COLORS } from "@/lib/constants";
import { FONT } from "@/lib/fonts";
import { useAppStore } from "@/store/useAppStore";

interface CTA {
  label: string;
  href: string;
  external?: boolean;
}

const CTAS: CTA[] = [
  { label: "Email", href: "mailto:alessandroschillaci05@yahoo.com" },
  { label: "GitHub", href: "https://github.com/s4ndro6", external: true },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/sandrosch",
    external: true,
  },
  { label: "Fluvo.app", href: "https://fluvo.app", external: true },
];

const ANCHOR = (() => {
  const v = new Vector3();
  AXIS_CURVE.getPointAt(ANCHORS.contact, v);
  return v;
})();

interface CtaTextProps {
  cta: CTA;
  position: [number, number, number];
}

function CtaText({ cta, position }: CtaTextProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const target = hovered ? 1.08 : 1;
    ref.current.scale.x += (target - ref.current.scale.x) * 0.18;
    ref.current.scale.y += (target - ref.current.scale.y) * 0.18;
  });

  const open = () => {
    if (cta.external) {
      window.open(cta.href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = cta.href;
    }
  };

  return (
    <group ref={ref} position={position}>
      <Text
        font={FONT.display}
        fontSize={0.6}
        color={hovered ? COLORS.amber : COLORS.text}
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.02}
        material-toneMapped={false}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        {cta.label}
      </Text>
      {/* Underline accent */}
      <mesh position={[0, -0.42, 0]} scale={[hovered ? 1 : 0, 1, 1]}>
        <planeGeometry args={[0.8, 0.02]} />
        <meshBasicMaterial
          color={COLORS.amber}
          toneMapped={false}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

export function ContactEnd() {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const sp = useAppStore.getState().scrollProgress;
    // Reveal from t=0.90 to t=1.0
    const reveal = Math.max(0, Math.min(1, (sp - 0.90) / 0.06));
    groupRef.current.scale.setScalar(0.5 + reveal * 0.5);
    groupRef.current.visible = reveal > 0.02;
  });

  // Position CTAs in 2x2 grid centered around the contact anchor
  const positions: [number, number, number][] = [
    [ANCHOR.x - 1.2, ANCHOR.y + 0.6, ANCHOR.z],
    [ANCHOR.x + 1.2, ANCHOR.y + 0.6, ANCHOR.z],
    [ANCHOR.x - 1.2, ANCHOR.y - 0.4, ANCHOR.z],
    [ANCHOR.x + 1.2, ANCHOR.y - 0.4, ANCHOR.z],
  ];

  return (
    <group ref={groupRef}>
      {/* Eyebrow above */}
      <Text
        font={FONT.mono}
        fontSize={0.1}
        color={COLORS.textFaint}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
        position={[ANCHOR.x, ANCHOR.y + 1.6, ANCHOR.z]}
        material-toneMapped={false}
      >
        FIN DE LIGNE · CONTACT
      </Text>
      <Text
        font={FONT.displayItalic}
        fontSize={0.55}
        color={COLORS.textDim}
        anchorX="center"
        anchorY="middle"
        position={[ANCHOR.x, ANCHOR.y + 1.2, ANCHOR.z]}
        material-toneMapped={false}
      >
        on construit quelque chose ?
      </Text>

      {CTAS.map((cta, i) => (
        <CtaText key={cta.label} cta={cta} position={positions[i]} />
      ))}

      {/* Tail signature */}
      <Text
        font={FONT.mono}
        fontSize={0.075}
        color={COLORS.textFaint}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
        position={[ANCHOR.x, ANCHOR.y - 1.4, ANCHOR.z]}
        material-toneMapped={false}
      >
        © 2026 SANDRO SCHILLACI · LILLE · MICRO-ENTREPRISE IA/AUTOMATION
      </Text>

    </group>
  );
}
