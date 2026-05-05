'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, BufferGeometry, BufferAttribute } from 'three';

const ENTITIES = [
  { name: 'Lea', color: '#A78BFA', shape: 'icosa' as const, base: new Vector3(3.2, 0.5, 0) },
  { name: 'Hugo', color: '#22D3EE', shape: 'box' as const, base: new Vector3(-2.6, -0.4, 1.4) },
  { name: 'Noam', color: '#FFB454', shape: 'octa' as const, base: new Vector3(-0.4, 0.9, -3.0) },
];

/** Léa · Hugo · Noam — 3 entities orbit, sequential light bridges. */
export default function WorldAgents() {
  const refs = useRef<(Group | null)[]>([null, null, null]);
  const wireRef = useRef<{ positions: Float32Array; geo: BufferGeometry } | null>(null);

  const wireGeo = useMemo(() => {
    // 3 connection segments — entity[i] → entity[(i+1)%3]
    const positions = new Float32Array(3 * 2 * 3);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setDrawRange(0, 0);
    wireRef.current = { positions, geo: g };
    return g;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((r, i) => {
      if (!r) return;
      const e = ENTITIES[i];
      const phase = (i * Math.PI * 2) / 3 + t * 0.4;
      r.position.x = e.base.x + Math.cos(phase) * 0.6;
      r.position.y = e.base.y + Math.sin(phase * 1.3) * 0.4;
      r.position.z = e.base.z + Math.sin(phase) * 0.6;
      r.rotation.y += 0.01;
      r.rotation.x += 0.005;
    });

    // Sequential bridges: brighten one segment per beat (every 1.3s)
    const beat = Math.floor(t / 1.3) % 3;
    if (wireRef.current) {
      const pos = wireRef.current.positions;
      const a = refs.current[beat];
      const b = refs.current[(beat + 1) % 3];
      if (a && b) {
        pos[0] = a.position.x;
        pos[1] = a.position.y;
        pos[2] = a.position.z;
        pos[3] = b.position.x;
        pos[4] = b.position.y;
        pos[5] = b.position.z;
        wireRef.current.geo.attributes.position.needsUpdate = true;
        wireRef.current.geo.setDrawRange(0, 2);
      }
    }
  });

  return (
    <group>
      {ENTITIES.map((e, i) => (
        <group key={e.name} ref={(r) => { refs.current[i] = r; }}>
          {e.shape === 'icosa' && (
            <mesh>
              <icosahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial
                color="black"
                emissive={e.color}
                emissiveIntensity={3.5}
                roughness={0.3}
                metalness={0.8}
              />
            </mesh>
          )}
          {e.shape === 'box' && (
            <mesh>
              <boxGeometry args={[1.0, 1.0, 1.0]} />
              <meshStandardMaterial
                color="black"
                emissive={e.color}
                emissiveIntensity={3.5}
                roughness={0.4}
                metalness={0.8}
                wireframe
              />
            </mesh>
          )}
          {e.shape === 'octa' && (
            <mesh>
              <octahedronGeometry args={[0.8, 0]} />
              <meshStandardMaterial
                color="black"
                emissive={e.color}
                emissiveIntensity={3.5}
                roughness={0.3}
                metalness={0.8}
              />
            </mesh>
          )}
          <pointLight color={e.color} intensity={1.6} distance={6} />
        </group>
      ))}

      {/* Active bridge */}
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </lineSegments>

      <ambientLight intensity={0.15} color="#FFFFFF" />
    </group>
  );
}
