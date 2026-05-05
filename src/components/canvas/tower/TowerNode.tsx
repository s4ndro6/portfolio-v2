'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Vector3 } from 'three';

const VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_pulse;
  uniform vec3 u_color;
  void main() {
    float t = u_time * 0.8;
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    float pulse = sin(t + vUv.y * 10.0) * 0.3 + 0.7;
    vec3 col = u_color * (fresnel * 2.0 + 0.4 * pulse + u_pulse * 1.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const PALETTE = [
  '#5B8DEE',
  '#34D399',
  '#22D3EE',
  '#FF6B35',
  '#A78BFA',
  '#4ADE80',
  '#FFB454',
  '#F472B6',
];

function hexToVec3(hex: string): Vector3 {
  return new Vector3(
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  );
}

interface Props {
  index: number;
  position: [number, number, number];
}

export default function TowerNode({ index, position }: Props) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);

  const color = useMemo(() => hexToVec3(PALETTE[index % PALETTE.length]), [index]);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.u_time.value = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.8, 0]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{
          u_time: { value: 0 },
          u_pulse: { value: 0 },
          u_color: { value: color },
        }}
      />
    </mesh>
  );
}
