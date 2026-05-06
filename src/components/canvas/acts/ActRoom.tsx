'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ShaderMaterial, Points } from 'three';

const MONITOR_FRAG = `
varying vec2 vUv;
uniform float u_time;
void main() {
  vec2 uv = vUv;
  float t = u_time * 0.3;
  float scan = sin(uv.y * 120.0) * 0.03 + 0.97;
  float dist = length(uv - 0.5);
  float glow = 1.0 - smoothstep(0.0, 0.7, dist);
  vec3 col = vec3(0.05, 0.12, 0.35) * scan;
  col += vec3(0.2, 0.5, 1.0) * glow * 0.4;
  float border = max(
    max(step(0.95, uv.x), step(0.95, 1.0 - uv.x)),
    max(step(0.97, uv.y), step(0.97, 1.0 - uv.y))
  );
  col += vec3(0.3, 0.6, 1.0) * border;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

interface Props { opacity: number; }

export default function ActRoom({ opacity }: Props) {
  const monitorMatRef = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (monitorMatRef.current) {
      monitorMatRef.current.uniforms.u_time.value = clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* Sol */}
      <mesh position={[0, -0.01, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial color="#0A0A12" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Mur du fond */}
      <mesh position={[0, 3, -4]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#080810" roughness={1} />
      </mesh>

      {/* Mur gauche */}
      <mesh position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#080812" roughness={1} />
      </mesh>

      {/* Mur droit */}
      <mesh position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#080812" roughness={1} />
      </mesh>

      {/* Bureau */}
      <mesh position={[0, 0.4, -1.2]}>
        <boxGeometry args={[2.4, 0.06, 1.0]} />
        <meshStandardMaterial color="#111118" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Pied de bureau */}
      <mesh position={[0, 0.2, -1.2]}>
        <boxGeometry args={[0.06, 0.4, 0.8]} />
        <meshStandardMaterial color="#0D0D16" roughness={0.8} />
      </mesh>

      {/* Moniteur — écran */}
      <mesh position={[0, 1.15, -1.5]}>
        <planeGeometry args={[1.6, 0.95]} />
        <shaderMaterial
          ref={monitorMatRef}
          vertexShader={VERT}
          fragmentShader={MONITOR_FRAG}
          uniforms={{ u_time: { value: 0 } }}
        />
      </mesh>

      {/* Moniteur — cadre */}
      <mesh position={[0, 1.15, -1.51]}>
        <boxGeometry args={[1.72, 1.06, 0.04]} />
        <meshStandardMaterial color="#111118" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Texte "SANDRO" */}
      <Html
        position={[0, 1.15, -1.48]}
        center
        transform
        distanceFactor={1}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '52px',
          fontWeight: 300,
          color: 'rgba(150, 200, 255, 0.9)',
          textShadow: '0 0 30px rgba(100, 160, 255, 0.8), 0 0 60px rgba(100, 160, 255, 0.4)',
          whiteSpace: 'nowrap',
          letterSpacing: '8px',
          opacity,
        }}>
          SANDRO
        </div>
      </Html>

      {/* Lumière du moniteur */}
      <pointLight position={[0, 1.2, -1.3]} color="#4480FF" intensity={2.5} distance={8} decay={2} />

      {/* Lumière ambiante faible */}
      <pointLight position={[-3, 3, 1]} color="#200030" intensity={1.5} distance={10} />

      {/* Chaise */}
      <mesh position={[0, 0.45, -0.3]}>
        <boxGeometry args={[0.7, 0.06, 0.7]} />
        <meshStandardMaterial color="#0D0D16" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, -0.65]}>
        <boxGeometry args={[0.7, 0.7, 0.06]} />
        <meshStandardMaterial color="#0D0D16" roughness={0.9} />
      </mesh>

      <DustParticles />
    </group>
  );
}

function DustParticles() {
  const ref = useRef<Points>(null);
  const count = 150;
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, (_, i) => {
        const mod = i % 3;
        if (mod === 0) return (Math.random() - 0.5) * 2;
        if (mod === 1) return 0.8 + Math.random() * 1.2;
        return -1.8 + Math.random() * 1.2;
      }),
    ),
  );
  const phases = useRef(Array.from({ length: count }, () => Math.random() * Math.PI * 2));

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t * 0.2 + phases.current[i]) * 0.0008;
      arr[i * 3 + 1] += Math.cos(t * 0.15 + phases.current[i] * 1.3) * 0.0005;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.008} color="#8AAFFF" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}
