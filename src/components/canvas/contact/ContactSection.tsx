'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group, Mesh, Vector3 } from 'three';
import { useStore } from '@/store/useStore';
import { TOWER_CONFIG } from '@/data/tower';

interface Node {
  id: 'email' | 'github' | 'linkedin';
  label: string;
  href: string;
  position: [number, number, number];
  color: string;
  shape: 'octa' | 'box' | 'sphere';
}

const NODES: Node[] = [
  {
    id: 'email',
    label: 'EMAIL',
    href: 'mailto:alessandroschillaci05@yahoo.com',
    position: [-3.2, 0, 0],
    color: '#FFB454',
    shape: 'octa',
  },
  {
    id: 'github',
    label: 'GITHUB',
    href: 'https://github.com/s4ndro6',
    position: [0, 0.4, 0],
    color: '#22D3EE',
    shape: 'box',
  },
  {
    id: 'linkedin',
    label: 'LINKEDIN',
    href: 'https://linkedin.com/in/sandrosch',
    position: [3.2, 0, 0],
    color: '#5B8DEE',
    shape: 'sphere',
  },
];

const CONTACT_CENTER_Y = -TOWER_CONFIG.totalHeight / 2 - 4;

function ContactNode({ node }: { node: Node }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current || !groupRef.current) return;
    const t = clock.elapsedTime;
    const target = hovered ? 1.35 : 1.0;
    meshRef.current.scale.x += (target - meshRef.current.scale.x) * 0.12;
    meshRef.current.scale.y = meshRef.current.scale.x;
    meshRef.current.scale.z = meshRef.current.scale.x;
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x = Math.sin(t * 0.6) * 0.15;
    groupRef.current.position.y = node.position[1] + Math.sin(t * 0.7 + node.position[0]) * 0.12;
  });

  return (
    <group
      ref={groupRef}
      position={node.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (node.href.startsWith('http')) {
          window.open(node.href, '_blank', 'noreferrer');
        } else {
          window.location.href = node.href;
        }
      }}
    >
      <mesh ref={meshRef}>
        {node.shape === 'octa' && <octahedronGeometry args={[0.7, 0]} />}
        {node.shape === 'box' && <boxGeometry args={[1.0, 1.0, 1.0]} />}
        {node.shape === 'sphere' && <icosahedronGeometry args={[0.7, 1]} />}
        <meshStandardMaterial
          color="black"
          emissive={node.color}
          emissiveIntensity={hovered ? 5 : 3.2}
          roughness={0.3}
          metalness={0.85}
          wireframe={node.shape === 'box'}
        />
      </mesh>
      <pointLight color={node.color} intensity={hovered ? 3 : 1.6} distance={6} />
      <Text
        position={[0, -1.3, 0]}
        fontSize={0.22}
        color={node.color}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Regular.ttf"
      >
        {node.label}
      </Text>
    </group>
  );
}

/** Contact constellation — visible as scroll approaches the floor of the tower. */
export default function ContactSection() {
  const groupRef = useRef<Group>(null);
  const tmp = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = useStore.getState().scrollProgress;
    // appear 0.7..0.85
    const v = Math.min(1, Math.max(0, (p - 0.7) / 0.15));
    groupRef.current.visible = v > 0.001;
    tmp.set(v, v, v);
    groupRef.current.scale.lerp(tmp, 0.1);
  });

  return (
    <group ref={groupRef} position={[0, CONTACT_CENTER_Y, 0]}>
      {NODES.map((n) => (
        <ContactNode key={n.id} node={n} />
      ))}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.5}
        color="#FFB454"
        anchorX="center"
        anchorY="middle"
        font="/fonts/CormorantGaramond-MediumItalic.ttf"
      >
        let&apos;s build something
      </Text>
      <ambientLight intensity={0.1} color="#5B6AFF" />
    </group>
  );
}
