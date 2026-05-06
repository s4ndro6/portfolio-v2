'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { FLOW_CURVE } from '@/data/path';

const endPos = FLOW_CURVE.getPoint(1);

interface PortalProps {
  position: [number, number, number];
  color: string;
  label: string;
  href: string;
  shape: 'octa' | 'cube' | 'sphere';
}

function Portal({ position, color, label, href, shape }: PortalProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.x += 0.008;
    meshRef.current.rotation.y += 0.012;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.15;
    const s = hovered ? 1.15 : 1.0;
    meshRef.current.scale.setScalar(meshRef.current.scale.x + (s - meshRef.current.scale.x) * 0.1);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => window.open(href, '_blank')}
      >
        {shape === 'octa' && <octahedronGeometry args={[0.6]} />}
        {shape === 'cube' && <boxGeometry args={[0.85, 0.85, 0.85]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.55, 16, 16]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3.5 : 1.5}
          metalness={0.6}
          roughness={0.2}
          wireframe={shape === 'cube'}
        />
      </mesh>
      <pointLight color={color} intensity={hovered ? 4 : 1.5} distance={5} />
      <Html position={[0, -1.1, 0]} center distanceFactor={4}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: hovered ? color : 'rgba(232,236,240,0.5)',
          whiteSpace: 'nowrap',
          transition: 'color 0.3s ease',
          pointerEvents: 'none',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function ActEnd({ opacity }: { opacity: number }) {
  const z = endPos.z;

  return (
    <group>
      <Html position={[endPos.x, endPos.y + 2.5, z - 2]} center>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '52px',
          color: 'rgba(232,236,240,0.9)',
          textShadow: '0 0 40px rgba(100,160,255,0.3)',
          whiteSpace: 'nowrap',
          opacity,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}>
          Et maintenant ?
        </div>
      </Html>

      <Portal
        position={[endPos.x - 3.5, endPos.y + 0.5, z - 3]}
        color="#FFB454"
        label="Contact"
        href="mailto:alessandroschillaci05@yahoo.com"
        shape="octa"
      />
      <Portal
        position={[endPos.x, endPos.y + 0.5, z - 4]}
        color="#22D3EE"
        label="GitHub"
        href="https://github.com/s4ndro6"
        shape="cube"
      />
      <Portal
        position={[endPos.x + 3.5, endPos.y + 0.5, z - 3]}
        color="#5B8DEE"
        label="Fluvo"
        href="https://fluvo.app"
        shape="sphere"
      />
    </group>
  );
}
