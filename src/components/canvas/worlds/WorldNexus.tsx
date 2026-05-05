'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';

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
  void main() {
    float t = u_time * 0.4;
    vec2 uv = vUv;
    float r = length(uv * 2.0 - 1.0);
    float circles = sin(r * 20.0 - t * 2.0) * 0.5 + 0.5;
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    vec3 col = vec3(0.133, 0.827, 0.933) * circles * (fresnel * 3.0 + 0.3);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function WorldNexus() {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.u_time.value = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.004;
      meshRef.current.rotation.y += 0.006;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 2]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={{ u_time: { value: 0 } }}
          wireframe
        />
      </mesh>

      <pointLight color="#22D3EE" intensity={3} distance={20} />

      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * Math.PI * 2;
        const r = 4 + Math.sin(i * 1.7) * 0.5;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, Math.sin(i * 0.5) * 2, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial
              emissive="#22D3EE"
              emissiveIntensity={4}
              color="black"
            />
          </mesh>
        );
      })}
    </group>
  );
}
