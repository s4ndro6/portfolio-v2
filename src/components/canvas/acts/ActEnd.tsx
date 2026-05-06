'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh, Group, WireframeGeometry, EdgesGeometry, BoxGeometry, SphereGeometry } from 'three';
import { FLOW_CURVE } from '@/data/path';

const endPos = FLOW_CURVE.getPoint(1);

interface BasePortalProps {
  position: [number, number, number];
  color: string;
  label: string;
  href: string;
}

/* CONTACT (amber) — diamant détail 2 + 6 sphères orbitales avec traînées */
function ContactPortal({ position, color, label, href }: BasePortalProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const orbitRefs = useRef<(Mesh | null)[]>([]);
  const trailRefs = useRef<(Mesh | null)[][]>([[], [], [], [], [], []]);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.rotation.x += 0.008;
    meshRef.current.rotation.y += 0.012;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.15;
    const s = hovered ? 1.15 : 1.0;
    meshRef.current.scale.setScalar(meshRef.current.scale.x + (s - meshRef.current.scale.x) * 0.1);

    for (let i = 0; i < 6; i++) {
      const phase = t * 0.8 + (i / 6) * Math.PI * 2;
      const tilt = (i / 6) * Math.PI * 2;
      const r = 1.0;
      const x = Math.cos(phase) * r;
      const y = Math.sin(phase) * Math.sin(tilt) * 0.6;
      const z = Math.sin(phase) * Math.cos(tilt) * r;
      const orb = orbitRefs.current[i];
      if (orb) orb.position.set(x, y, z);
      // traînées : 3 segments en retard
      for (let j = 0; j < 3; j++) {
        const tp = t * 0.8 - 0.08 * (j + 1) + (i / 6) * Math.PI * 2;
        const trail = trailRefs.current[i][j];
        if (trail) {
          trail.position.set(
            Math.cos(tp) * r,
            Math.sin(tp) * Math.sin(tilt) * 0.6,
            Math.sin(tp) * Math.cos(tilt) * r,
          );
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => window.open(href, '_blank')}
      >
        <octahedronGeometry args={[0.6, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3.5 : 1.8}
          metalness={0.7}
          roughness={0.15}
        />
      </mesh>
      {/* 6 orbites */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i}>
          <mesh ref={(m) => { orbitRefs.current[i] = m; }}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
          </mesh>
          {[0, 1, 2].map((j) => (
            <mesh key={j} ref={(m) => { trailRefs.current[i][j] = m; }}>
              <sphereGeometry args={[0.04 - j * 0.008, 8, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2 - j * 0.5}
                transparent
                opacity={0.6 - j * 0.18}
              />
            </mesh>
          ))}
        </group>
      ))}
      <pointLight color={color} intensity={hovered ? 4 : 2} distance={5} />
      <Html position={[0, -1.2, 0]} center distanceFactor={4}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: hovered ? color : 'rgba(232,236,240,0.55)',
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

/* GITHUB (cyan) — cube solid + wireframe pulsant */
function GithubPortal({ position, color, label, href }: BasePortalProps) {
  const groupRef = useRef<Group>(null);
  const solidRef = useRef<Mesh>(null);
  const wireRef = useRef<Mesh>(null);
  const wireMatRef = useRef<import('three').LineBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const wireGeo = useMemo(() => new EdgesGeometry(new BoxGeometry(0.95, 0.95, 0.95)), []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !solidRef.current) return;
    const t = clock.elapsedTime;
    solidRef.current.rotation.x += 0.008;
    solidRef.current.rotation.y += 0.012;
    if (wireRef.current) {
      wireRef.current.rotation.x = solidRef.current.rotation.x;
      wireRef.current.rotation.y = solidRef.current.rotation.y;
    }
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.15;
    const s = hovered ? 1.15 : 1.0;
    solidRef.current.scale.setScalar(solidRef.current.scale.x + (s - solidRef.current.scale.x) * 0.1);
    if (wireMatRef.current) {
      wireMatRef.current.opacity = 0.4 + Math.sin(t * 2.4) * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={solidRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => window.open(href, '_blank')}
      >
        <boxGeometry args={[0.85, 0.85, 0.85]} />
        <meshStandardMaterial
          color="#0A0A14"
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* wireframe pulsant superposé */}
      <lineSegments ref={wireRef as unknown as React.Ref<import('three').LineSegments>} geometry={wireGeo}>
        <lineBasicMaterial
          ref={wireMatRef}
          color={color}
          transparent
          opacity={0.7}
        />
      </lineSegments>
      <pointLight color={color} intensity={hovered ? 4 : 1.8} distance={5} />
      <Html position={[0, -1.2, 0]} center distanceFactor={4}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: hovered ? color : 'rgba(232,236,240,0.55)',
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

/* FLUVO (bleu) — sphère lat/long visibles */
function FluvoPortal({ position, color, label, href }: BasePortalProps) {
  const groupRef = useRef<Group>(null);
  const solidRef = useRef<Mesh>(null);
  const wireRef = useRef<import('three').LineSegments>(null);
  const [hovered, setHovered] = useState(false);

  const wireGeo = useMemo(() => new WireframeGeometry(new SphereGeometry(0.56, 14, 10)), []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !solidRef.current) return;
    const t = clock.elapsedTime;
    solidRef.current.rotation.y += 0.012;
    if (wireRef.current) {
      wireRef.current.rotation.y = solidRef.current.rotation.y;
      wireRef.current.rotation.x = solidRef.current.rotation.x;
    }
    solidRef.current.rotation.x += 0.005;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.15;
    const s = hovered ? 1.15 : 1.0;
    solidRef.current.scale.setScalar(solidRef.current.scale.x + (s - solidRef.current.scale.x) * 0.1);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={solidRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => window.open(href, '_blank')}
      >
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial
          color="#0A0A20"
          emissive={color}
          emissiveIntensity={hovered ? 0.9 : 0.35}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      <lineSegments ref={wireRef} geometry={wireGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.85} />
      </lineSegments>
      <pointLight color={color} intensity={hovered ? 4 : 1.8} distance={5} />
      <Html position={[0, -1.2, 0]} center distanceFactor={4}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: hovered ? color : 'rgba(232,236,240,0.55)',
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
      <Html position={[endPos.x, endPos.y + 2.6, z - 2]} center>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '72px',
          color: 'rgba(232,236,240,0.92)',
          textShadow: '0 0 50px rgba(120,170,255,0.4), 0 0 100px rgba(80,140,255,0.2)',
          whiteSpace: 'nowrap',
          opacity,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          Et maintenant ?
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(232,236,240,0.45)',
          marginTop: '20px',
          textAlign: 'center',
          opacity,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          Choisissez une direction.
        </div>
      </Html>

      <ContactPortal
        position={[endPos.x - 3.5, endPos.y + 0.5, z - 3]}
        color="#FFB454"
        label="Contact"
        href="mailto:alessandroschillaci05@yahoo.com"
      />
      <GithubPortal
        position={[endPos.x, endPos.y + 0.5, z - 4]}
        color="#22D3EE"
        label="GitHub"
        href="https://github.com/s4ndro6"
      />
      <FluvoPortal
        position={[endPos.x + 3.5, endPos.y + 0.5, z - 3]}
        color="#5B8DEE"
        label="Fluvo"
        href="https://fluvo.app"
      />
    </group>
  );
}
