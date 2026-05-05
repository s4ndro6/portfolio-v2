'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3, TubeGeometry, ShaderMaterial } from 'three';
import { TOWER_CONFIG } from '@/data/tower';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float u_time;
  void main() {
    float t = u_time * 0.5;
    float pulse = sin(vUv.y * 20.0 - t * 3.0) * 0.4 + 0.6;
    vec3 col = vec3(0.357, 0.553, 0.933) * pulse;          // #5B8DEE base
    col += vec3(1.0, 0.706, 0.329) * 0.2 * sin(vUv.y * 8.0 + t); // amber veins
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function TowerAxis() {
  const matRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const halfH = TOWER_CONFIG.totalHeight / 2;
    const curve = new CatmullRomCurve3([
      new Vector3(-0.3, -halfH, 0.2),
      new Vector3(0.2, -halfH * 0.5, -0.1),
      new Vector3(-0.1, 0, 0.15),
      new Vector3(0.25, halfH * 0.5, -0.2),
      new Vector3(-0.15, halfH, 0.1),
    ]);
    return new TubeGeometry(curve, 80, TOWER_CONFIG.axisRadius, 8, false);
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.u_time.value = clock.elapsedTime;
  });

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{ u_time: { value: 0 } }}
      />
    </mesh>
  );
}
