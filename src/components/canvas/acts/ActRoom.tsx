'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ShaderMaterial, Points } from 'three';

const MONITOR_FRAG = `
varying vec2 vUv; uniform float u_time;
void main() {
  vec2 uv = vUv;
  float t = u_time * 0.3;
  float scan = sin(uv.y * 200.0) * 0.025 + 0.975;
  float glow = exp(-length(uv - 0.5) * 3.0);
  vec3 col = vec3(0.03, 0.08, 0.25) * scan;
  col += vec3(0.15, 0.4, 1.0) * glow * 0.5;
  float bx = smoothstep(0.94,1.0,uv.x)+smoothstep(0.06,0.0,uv.x);
  float by = smoothstep(0.96,1.0,uv.y)+smoothstep(0.04,0.0,uv.y);
  col += vec3(0.2,0.5,1.0)*max(bx,by)*0.8;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

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
      {/* Éclairage de la pièce */}
      <ambientLight intensity={0.03} color="#101030" />
      <pointLight position={[0, 1.2, -1.3]} color="#3366FF" intensity={4} distance={6} decay={2} />
      <pointLight position={[-2, 2.5, 0]} color="#110022" intensity={2} distance={8} />
      <pointLight position={[2, 0.5, 1]} color="#0A0015" intensity={1.5} distance={6} />

      {/* SOL */}
      <mesh position={[0, -0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12, 20, 20]} />
        <meshStandardMaterial color="#0A0A0F" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Reflet sol sous le bureau */}
      <mesh position={[0, 0.001, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#1A2050" roughness={0.1} metalness={0.9} transparent opacity={0.3} />
      </mesh>

      {/* BUREAU */}
      <group position={[0, 0.75, -1.4]}>
        <mesh>
          <boxGeometry args={[2.2, 0.04, 0.9]} />
          <meshStandardMaterial color="#1A1A22" roughness={0.2} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.02, 0.45]}>
          <boxGeometry args={[2.2, 0.04, 0.01]} />
          <meshStandardMaterial color="#2233FF" emissive="#2233FF" emissiveIntensity={0.5} />
        </mesh>
        {[[-0.9, -0.37, 0], [0.9, -0.37, 0]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.06, 0.75, 0.7]} />
            <meshStandardMaterial color="#111118" roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* MONITEUR */}
      <group position={[0, 1.35, -1.7]}>
        <mesh>
          <boxGeometry args={[1.65, 1.0, 0.06]} />
          <meshStandardMaterial color="#0D0D14" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.52, 0.88]} />
          <shaderMaterial
            ref={monitorMatRef}
            vertexShader={VERT}
            fragmentShader={MONITOR_FRAG}
            uniforms={{ u_time: { value: 0 } }}
          />
        </mesh>
        <mesh position={[0, -0.58, 0.1]}>
          <boxGeometry args={[0.08, 0.18, 0.08]} />
          <meshStandardMaterial color="#111118" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, -0.67, 0.18]}>
          <boxGeometry args={[0.35, 0.03, 0.25]} />
          <meshStandardMaterial color="#111118" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* TEXTE "SANDRO" */}
      <Html position={[0, 1.35, -1.66]} center transform distanceFactor={1} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '46px',
          fontWeight: 300,
          color: 'rgba(140, 190, 255, 0.95)',
          textShadow: '0 0 40px rgba(80,140,255,0.9), 0 0 80px rgba(60,100,255,0.4)',
          letterSpacing: '10px',
          whiteSpace: 'nowrap',
          opacity,
        }}>
          SANDRO
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          letterSpacing: '4px',
          color: 'rgba(100,150,255,0.5)',
          textAlign: 'center',
          marginTop: '8px',
          textTransform: 'uppercase',
          opacity,
        }}>
          architecture liquide
        </div>
      </Html>

      {/* CLAVIER */}
      <group position={[0, 0.79, -1.05]} rotation={[-0.05, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.85, 0.025, 0.3]} />
          <meshStandardMaterial color="#0F0F18" roughness={0.4} metalness={0.6} />
        </mesh>
        {Array.from({ length: 14 }, (_, col) =>
          Array.from({ length: 4 }, (_, row) => (
            <mesh key={`${col}-${row}`} position={[
              -0.38 + col * 0.058,
              0.018,
              -0.1 + row * 0.072,
            ]}>
              <boxGeometry args={[0.048, 0.012, 0.062]} />
              <meshStandardMaterial
                color="#1A1A28"
                roughness={0.6}
                metalness={0.4}
                emissive="#1A1A28"
                emissiveIntensity={0.1}
              />
            </mesh>
          )),
        ).flat()}
        <pointLight position={[0, 0.05, 0]} color="#4455FF" intensity={0.3} distance={1} />
      </group>

      {/* SOURIS */}
      <group position={[0.55, 0.79, -1.05]}>
        <mesh>
          <capsuleGeometry args={[0.035, 0.1, 8, 16]} />
          <meshStandardMaterial color="#0F0F18" roughness={0.3} metalness={0.7} />
        </mesh>
        <pointLight position={[0, -0.05, 0]} color="#FF00FF" intensity={0.2} distance={0.5} />
      </group>

      {/* CHAISE */}
      <group position={[0, 0, -0.2]}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.6, 0.07, 0.58]} />
          <meshStandardMaterial color="#0D0D16" roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.85, -0.26]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.58, 0.75, 0.07]} />
          <meshStandardMaterial color="#0D0D16" roughness={0.8} metalness={0.1} />
        </mesh>
        {[-0.32, 0.32].map((x, i) => (
          <mesh key={i} position={[x, 0.6, 0]}>
            <boxGeometry args={[0.05, 0.08, 0.4]} />
            <meshStandardMaterial color="#111118" roughness={0.5} metalness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#111118" roughness={0.2} metalness={0.9} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.3, 0.04, Math.sin(angle) * 0.3]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.55, 0.04, 0.06]} />
              <meshStandardMaterial color="#111118" roughness={0.2} metalness={0.9} />
            </mesh>
          );
        })}
        {Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.28, 0.03, Math.sin(angle) * 0.28]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#0A0A12" roughness={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* MURS */}
      <mesh position={[0, 2.5, -4.5]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#060610" roughness={1} />
      </mesh>
      <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#060610" roughness={1} />
      </mesh>
      <mesh position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#060610" roughness={1} />
      </mesh>

      {/* Poster LED */}
      <mesh position={[-3.5, 2.2, -2]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshStandardMaterial color="#0A0020" emissive="#3300FF" emissiveIntensity={0.15} />
      </mesh>

      {/* Barre LED sous le bureau */}
      <mesh position={[0, 0.56, -0.95]}>
        <boxGeometry args={[2.0, 0.02, 0.02]} />
        <meshStandardMaterial color="#2233FF" emissive="#2233FF" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, 0.5, -0.9]} color="#1133FF" intensity={1} distance={2} decay={2} />

      <RoomDust />
    </group>
  );
}

function RoomDust() {
  const ref = useRef<Points>(null);
  const count = 200;

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph: number[] = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = 0.7 + Math.random() * 1.5;
      pos[i * 3 + 2] = -2.5 + Math.random() * 2;
      ph.push(Math.random() * Math.PI * 2);
    }
    return { positions: pos, phases: ph };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t * 0.15 + phases[i]) * 0.0006;
      arr[i * 3 + 1] += Math.cos(t * 0.1 + phases[i] * 1.3) * 0.0004;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.006} color="#8899FF" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}
