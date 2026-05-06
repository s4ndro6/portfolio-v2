'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import {
  Mesh,
  Group,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
  Color,
  TorusGeometry,
} from 'three';
import { FLOW_CURVE } from '@/data/path';

const endPos = FLOW_CURVE.getPoint(1);

interface BaseProps {
  position: [number, number, number];
  color: string;
  label: string;
  description: string;
  href: string;
}

/* ============= Portail label + description + invitation hover ============= */
function PortalLabel({
  color,
  label,
  description,
  hovered,
}: {
  color: string;
  label: string;
  description: string;
  hovered: boolean;
}) {
  return (
    <Html position={[0, -1.4, 0]} center distanceFactor={4}>
      <div style={{
        textAlign: 'center',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: hovered ? color : 'rgba(232,236,240,0.7)',
          transition: 'color 0.3s ease',
          marginBottom: '6px',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '14px',
          color: 'rgba(232,236,240,0.4)',
          marginBottom: '10px',
        }}>
          {description}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: hovered ? color : 'transparent',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease, color 0.3s ease',
          textShadow: hovered ? `0 0 12px ${color}` : 'none',
        }}>
          Entrer →
        </div>
      </div>
    </Html>
  );
}

/* ============= CONTACT — Vortex amber ============= */
function ContactPortal({ position, color, label, description, href }: BaseProps) {
  const groupRef = useRef<Group>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const ring3Ref = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);
  const particleEjectRef = useRef<Points>(null);
  const [hovered, setHovered] = useState(false);

  // Spirale de particules vers le centre
  const spiralData = useMemo(() => {
    const N = 180;
    const positions = new Float32Array(N * 3);
    const phases: number[] = [];
    const radii: number[] = [];
    for (let i = 0; i < N; i++) {
      phases.push(Math.random() * Math.PI * 2);
      radii.push(0.3 + Math.random() * 1.0);
    }
    return { positions, phases, radii, count: N };
  }, []);

  // Particules d'éjection au hover
  const ejectData = useMemo(() => {
    const N = 60;
    const positions = new Float32Array(N * 3);
    const dirs: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - 0.5) * Math.PI;
      dirs.push({
        x: Math.cos(a) * Math.cos(b),
        y: Math.sin(b),
        z: Math.sin(a) * Math.cos(b),
      });
    }
    return { positions, dirs, count: N };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.12;
    }
    // 3 anneaux à vitesses différentes
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.6;
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.4;
      ring2Ref.current.rotation.x = t * 0.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.9;
      ring3Ref.current.rotation.y = t * 0.3;
    }
    // Spirale de particules
    if (particlesRef.current) {
      const arr = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < spiralData.count; i++) {
        const phase = spiralData.phases[i] + t * 0.8;
        const lifeT = (t * 0.4 + i * 0.013) % 1.0;
        const r = spiralData.radii[i] * (1.0 - lifeT);
        arr[i * 3] = Math.cos(phase) * r;
        arr[i * 3 + 1] = (lifeT - 0.5) * 0.3 * Math.sin(phase * 0.5);
        arr[i * 3 + 2] = Math.sin(phase) * r;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    // Eject animation
    if (particleEjectRef.current) {
      const arr = particleEjectRef.current.geometry.attributes.position.array as Float32Array;
      const ejectPhase = hovered ? Math.min(1, (particleEjectRef.current.userData.phase ?? 0) + 0.04) : 0;
      particleEjectRef.current.userData.phase = ejectPhase;
      for (let i = 0; i < ejectData.count; i++) {
        const d = ejectData.dirs[i];
        const r = ejectPhase * 1.5;
        arr[i * 3] = d.x * r;
        arr[i * 3 + 1] = d.y * r;
        arr[i * 3 + 2] = d.z * r;
      }
      particleEjectRef.current.geometry.attributes.position.needsUpdate = true;
      const mat = particleEjectRef.current.material as import('three').PointsMaterial;
      mat.opacity = ejectPhase * (1 - ejectPhase * 0.7);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* zone de hover/click */}
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => window.open(href, '_blank')}
        visible={false}
      >
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 3 anneaux concentriques */}
      <mesh ref={ring1Ref} geometry={useMemo(() => new TorusGeometry(0.55, 0.025, 8, 64), [])}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3.5 : 2}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={ring2Ref} geometry={useMemo(() => new TorusGeometry(0.78, 0.018, 8, 80), [])}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3 : 1.8}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={ring3Ref} geometry={useMemo(() => new TorusGeometry(1.05, 0.012, 8, 96), [])}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.5 : 1.4}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Particules en spirale qui convergent */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[spiralData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.025}
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Particules d'éjection au hover */}
      <points ref={particleEjectRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[ejectData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.06}
          transparent
          opacity={0}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Cœur central */}
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <pointLight color={color} intensity={hovered ? 5 : 3} distance={6} />

      <PortalLabel color={color} label={label} description={description} hovered={hovered} />
    </group>
  );
}

/* ============= GITHUB — Réseau de commits ============= */
function GithubPortal({ position, color, label, description, href }: BaseProps) {
  const groupRef = useRef<Group>(null);
  const nodeRefs = useRef<(Mesh | null)[]>([]);
  const linesRef = useRef<import('three').LineSegments>(null);
  const [hovered, setHovered] = useState(false);

  // 12 nœuds répartis en sphère
  const nodeData = useMemo(() => {
    const N = 12;
    const positions: [number, number, number][] = [];
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.7;
      positions.push([
        Math.sin(phi) * Math.cos(theta) * r,
        Math.sin(phi) * Math.sin(theta) * r,
        Math.cos(phi) * r,
      ]);
    }
    return positions;
  }, []);

  // Connexions
  const linkPairs = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < nodeData.length; i++) {
      // Connecte chaque nœud à 2-3 voisins les plus proches
      const dists = nodeData
        .map((p, j) => {
          const dx = p[0] - nodeData[i][0];
          const dy = p[1] - nodeData[i][1];
          const dz = p[2] - nodeData[i][2];
          return { j, d: dx * dx + dy * dy + dz * dz };
        })
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const { j } of dists) {
        if (i < j) pairs.push([i, j]);
      }
    }
    return pairs;
  }, [nodeData]);

  const lineGeo = useMemo(() => {
    const verts = new Float32Array(linkPairs.length * 6);
    for (let i = 0; i < linkPairs.length; i++) {
      const a = nodeData[linkPairs[i][0]];
      const b = nodeData[linkPairs[i][1]];
      verts.set([a[0], a[1], a[2], b[0], b[1], b[2]], i * 6);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(verts, 3));
    return g;
  }, [linkPairs, nodeData]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.12;
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
    // Pulse séquentiel des nœuds
    nodeRefs.current.forEach((n, i) => {
      if (!n) return;
      const pulse = (Math.sin(t * 1.5 + i * 0.7) * 0.5 + 0.5);
      const scale = 1 + pulse * 0.4;
      n.scale.setScalar(scale * (hovered ? 1.15 : 1));
      const mat = n.material as import('three').MeshStandardMaterial;
      mat.emissiveIntensity = (hovered ? 3 : 1.8) + pulse * 1.5;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => window.open(href, '_blank')}
        visible={false}
      >
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Nœuds */}
      {nodeData.map((p, i) => (
        <mesh key={i} ref={(m) => { nodeRefs.current[i] = m; }} position={p}>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Connexions */}
      <lineSegments ref={linesRef} geometry={lineGeo}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.85 : 0.6}
          blending={AdditiveBlending}
        />
      </lineSegments>

      <pointLight color={color} intensity={hovered ? 5 : 2.5} distance={6} />
      <PortalLabel color={color} label={label} description={description} hovered={hovered} />
    </group>
  );
}

/* ============= FLUVO — Globe digital ============= */
function FluvoPortal({ position, color, label, description, href }: BaseProps) {
  const groupRef = useRef<Group>(null);
  const sphereRef = useRef<Mesh>(null);
  const continentsRef = useRef<Group>(null);
  const linesRef = useRef<import('three').LineSegments>(null);
  const [hovered, setHovered] = useState(false);

  // Lignes lat/long custom : grid sur sphère
  const wireGeo = useMemo(() => {
    const verts: number[] = [];
    const r = 0.58;
    // Latitudes (cercles horizontaux)
    for (let lat = 1; lat < 8; lat++) {
      const phi = (lat / 8) * Math.PI;
      const y = Math.cos(phi) * r;
      const cr = Math.sin(phi) * r;
      const SEG = 48;
      for (let i = 0; i < SEG; i++) {
        const a1 = (i / SEG) * Math.PI * 2;
        const a2 = ((i + 1) / SEG) * Math.PI * 2;
        verts.push(Math.cos(a1) * cr, y, Math.sin(a1) * cr);
        verts.push(Math.cos(a2) * cr, y, Math.sin(a2) * cr);
      }
    }
    // Longitudes (méridiens)
    const MERIDIANS = 12;
    const SEG = 32;
    for (let m = 0; m < MERIDIANS; m++) {
      const a = (m / MERIDIANS) * Math.PI * 2;
      for (let i = 0; i < SEG; i++) {
        const p1 = (i / SEG) * Math.PI;
        const p2 = ((i + 1) / SEG) * Math.PI;
        verts.push(Math.cos(a) * Math.sin(p1) * r, Math.cos(p1) * r, Math.sin(a) * Math.sin(p1) * r);
        verts.push(Math.cos(a) * Math.sin(p2) * r, Math.cos(p2) * r, Math.sin(a) * Math.sin(p2) * r);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(verts, 3));
    return g;
  }, []);

  // "Continents" = patches lumineux à des positions fixes sur la sphère
  const continentSpots = useMemo(() => {
    const positions: [number, number, number][] = [];
    const seedAngles = [
      [0.4, 1.2], [1.8, 0.7], [3.0, 1.5], [4.5, 2.1], [5.5, 1.0], [2.4, 2.4],
    ];
    for (const [theta, phi] of seedAngles) {
      const r = 0.585;
      positions.push([
        Math.cos(theta) * Math.sin(phi) * r,
        Math.cos(phi) * r,
        Math.sin(theta) * Math.sin(phi) * r,
      ]);
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.12;
    }
    if (sphereRef.current) sphereRef.current.rotation.y = t * 0.15;
    if (continentsRef.current) continentsRef.current.rotation.y = t * 0.15;
    if (linesRef.current) linesRef.current.rotation.y = t * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => window.open(href, '_blank')}
        visible={false}
      >
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Sphère interne sombre */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#050818"
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.25}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Lignes lat/long */}
      <lineSegments ref={linesRef} geometry={wireGeo}>
        <lineBasicMaterial color={color} transparent opacity={hovered ? 0.9 : 0.65} />
      </lineSegments>

      {/* Continents lumineux */}
      <group ref={continentsRef}>
        {continentSpots.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={hovered ? 1 : 0.85} />
          </mesh>
        ))}
      </group>

      <pointLight color={color} intensity={hovered ? 5 : 2.5} distance={6} />
      <PortalLabel color={color} label={label} description={description} hovered={hovered} />
    </group>
  );
}

/* ============= ActEnd ============= */
export default function ActEnd({ opacity }: { opacity: number }) {
  const z = endPos.z;
  // Suppress unused color import warning by referencing it once
  void Color;

  return (
    <group>
      <Html position={[endPos.x, endPos.y + 2.6, z - 2]} center>
        <div style={{
          textAlign: 'center',
          opacity,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '72px',
            color: 'rgba(232,236,240,0.92)',
            textShadow: '0 0 50px rgba(120,170,255,0.4), 0 0 100px rgba(80,140,255,0.2)',
            whiteSpace: 'nowrap',
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
            whiteSpace: 'nowrap',
          }}>
            Choisissez une direction.
          </div>
        </div>
      </Html>

      <ContactPortal
        position={[endPos.x - 3.8, endPos.y + 0.5, z - 3]}
        color="#FFB454"
        label="Contact"
        description="Envoyer un signal"
        href="mailto:alessandroschillaci05@yahoo.com"
      />
      <GithubPortal
        position={[endPos.x, endPos.y + 0.5, z - 4.2]}
        color="#22D3EE"
        label="GitHub"
        description="Code en circulation"
        href="https://github.com/s4ndro6"
      />
      <FluvoPortal
        position={[endPos.x + 3.8, endPos.y + 0.5, z - 3]}
        color="#5B8DEE"
        label="Fluvo"
        description="SaaS en production"
        href="https://fluvo.app"
      />
    </group>
  );
}
