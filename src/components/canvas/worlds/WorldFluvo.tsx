'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, ShaderMaterial } from 'three';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLOOR_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float u_time;
  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float t = u_time * 0.3;
    float waves = sin(length(uv) * 8.0 - t * 2.0) * 0.5 + 0.5;
    float ring = smoothstep(0.0, 0.6, waves) * smoothstep(1.0, 0.6, length(uv));
    vec3 col = vec3(0.357, 0.553, 0.933) * ring * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Fluvo — ocean digital. Mirror floor, orbiting data spheres, ripples. */
export default function WorldFluvo() {
  const groupRef = useRef<Group>(null);
  const floorMatRef = useRef<ShaderMaterial>(null);

  const orbiters = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        angle: (i / 8) * Math.PI * 2,
        r: 3.5 + (i % 3) * 0.6,
        y: Math.sin(i * 1.3) * 0.6,
        speed: 0.2 + (i % 4) * 0.05,
        size: 0.18 + (i % 3) * 0.05,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (floorMatRef.current) floorMatRef.current.uniforms.u_time.value = t;
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (i < 1) return; // skip floor
        const o = orbiters[i - 1];
        if (!o) return;
        const a = o.angle + t * o.speed;
        child.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * 0.6 + i) * 0.2, Math.sin(a) * o.r);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Mirror floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[40, 40]} />
        <shaderMaterial
          ref={floorMatRef}
          vertexShader={VERT}
          fragmentShader={FLOOR_FRAG}
          uniforms={{ u_time: { value: 0 } }}
        />
      </mesh>

      {/* Orbiting data spheres */}
      {orbiters.map((o, i) => (
        <mesh key={i}>
          <icosahedronGeometry args={[o.size, 1]} />
          <meshStandardMaterial
            color="#0A0A18"
            emissive="#5B8DEE"
            emissiveIntensity={3.5}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
      ))}

      <pointLight color="#5B8DEE" intensity={3} distance={20} />
      <ambientLight intensity={0.15} color="#5B6AFF" />
    </group>
  );
}
