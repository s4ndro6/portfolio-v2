"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color,
  type Group,
  type Mesh,
  type ShaderMaterial,
  Vector2,
} from "three";
import { PROJECTS } from "@/data/projects";

/**
 * Scene 4 — couloir vertical avec 6 portails.
 * Chaque portail = un plan vertical avec un shader unique (procédural noise
 * teinté par accent du projet). On les dispose le long de l'axe z entre
 * z=-58 et z=-122, en alternant gauche/droite légèrement.
 */
export function ProjectPortals() {
  const group = useRef<Group>(null!);

  const slots = useMemo(() => {
    const start = -58;
    const end = -122;
    return PROJECTS.map((p, i) => {
      const t = i / (PROJECTS.length - 1);
      const z = start + (end - start) * t;
      const x = i % 2 === 0 ? -2.6 : 2.6;
      return { project: p, position: [x, 0, z] as [number, number, number] };
    });
  }, []);

  return (
    <group ref={group}>
      {slots.map(({ project, position }) => (
        <Portal
          key={project.id}
          position={position}
          accent={project.accent}
        />
      ))}
    </group>
  );
}

function Portal({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  const mesh = useRef<Mesh>(null!);
  const mat = useRef<ShaderMaterial>(null!);
  const { size } = useThree();
  const seed = useRef(Math.random() * 100);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new Color(accent) },
      uSeed: { value: seed.current },
      uResolution: { value: new Vector2(size.width, size.height) },
    }),
    [accent, size.width, size.height]
  );

  useFrame((state) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + seed.current) * 0.08;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[3.4, 5.2, 1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uAccent;
  uniform float uSeed;
  varying vec2 vUv;

  // Cheap hash + value noise — keeps fragment cost low.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.18 + uSeed;

    // Two layers of moving noise, different scales.
    float n1 = noise(uv * 4.0 + vec2(t, t * 0.6));
    float n2 = noise(uv * 9.0 - vec2(t * 0.4, t * 0.8));
    float field = mix(n1, n2, 0.55);

    // Vertical gradient — darker top + bottom, brighter mid.
    float band = smoothstep(0.05, 0.45, uv.y) * smoothstep(0.05, 0.45, 1.0 - uv.y);

    // Edge glow — frame the portal.
    float edge = smoothstep(0.0, 0.04, uv.x) *
                 smoothstep(0.0, 0.04, 1.0 - uv.x) *
                 smoothstep(0.0, 0.06, uv.y) *
                 smoothstep(0.0, 0.06, 1.0 - uv.y);

    vec3 base = mix(vec3(0.02, 0.03, 0.05), uAccent * 0.95, field * band);
    base += uAccent * 0.18 * (1.0 - edge);

    float alpha = (band * 0.7 + (1.0 - edge) * 0.35) * (0.55 + 0.45 * field);
    gl_FragColor = vec4(base, clamp(alpha, 0.0, 0.92));
  }
`;
