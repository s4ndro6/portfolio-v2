'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ShaderMaterial, Points, CatmullRomCurve3, Vector3 } from 'three';

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

const CODE_FRAG = `
varying vec2 vUv; uniform float u_time;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  vec2 uv = vUv;
  float t = u_time * 0.6;
  vec3 col = vec3(0.0, 0.02, 0.0);
  for(float i = 0.0; i < 22.0; i++){
    float row = i / 22.0;
    float scroll = fract(t * (0.4 + hash(vec2(i,1.0)) * 0.6) + row);
    float y = abs(uv.y - scroll);
    if(y < 0.04){
      float seg = floor(uv.x * 18.0 + i * 3.0 + t * 2.0);
      float on = step(0.4, hash(vec2(seg, i)));
      float w = step(0.05, fract(uv.x * 18.0)) * step(fract(uv.x * 18.0), 0.95);
      col += vec3(0.05, 1.0, 0.25) * on * w * smoothstep(0.04, 0.0, y) * 0.9;
    }
  }
  float scan = sin(uv.y * 180.0) * 0.06;
  col -= scan;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

interface Props { opacity: number; }

const RAND_ROT = [0.03, -0.04, 0.02, -0.025, 0.045, -0.015, 0.035];

const CABLE_CURVES = [
  new CatmullRomCurve3([
    new Vector3(-0.7, 0.78, -1.5),
    new Vector3(-0.85, 0.55, -1.7),
    new Vector3(-1.0, 0.2, -1.85),
    new Vector3(-1.2, 0.02, -2.0),
  ]),
  new CatmullRomCurve3([
    new Vector3(0.5, 0.78, -1.55),
    new Vector3(0.75, 0.4, -1.75),
    new Vector3(0.95, 0.1, -1.9),
    new Vector3(1.1, 0.02, -2.0),
  ]),
  new CatmullRomCurve3([
    new Vector3(0.0, 0.78, -1.78),
    new Vector3(0.1, 0.5, -1.9),
    new Vector3(0.2, 0.2, -1.95),
    new Vector3(0.3, 0.02, -2.0),
  ]),
];

export default function ActRoom({ opacity }: Props) {
  const monitorMatRef = useRef<ShaderMaterial>(null);
  const codeMatRef = useRef<ShaderMaterial>(null);
  const steamRefs = useRef<(import('three').Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (monitorMatRef.current) monitorMatRef.current.uniforms.u_time.value = t;
    if (codeMatRef.current) codeMatRef.current.uniforms.u_time.value = t;
    steamRefs.current.forEach((m, i) => {
      if (!m) return;
      const phase = (t * 0.4 + i * 0.6) % 1.0;
      m.position.y = 0.95 + phase * 0.5;
      const op = Math.sin(phase * Math.PI) * 0.35;
      const mat = m.material as import('three').MeshStandardMaterial;
      mat.opacity = op;
    });
  });

  return (
    <group>
      {/* === ÉCLAIRAGE DRAMATIQUE === */}
      <ambientLight intensity={0.025} color="#0A0A20" />
      {/* Bleue intense derrière le moniteur */}
      <pointLight position={[0, 1.4, -1.9]} color="#3366FF" intensity={8} distance={5} decay={2} castShadow />
      {/* Halo mur fond */}
      <spotLight
        position={[0, 3.2, -1.5]}
        target-position={[0, 2.5, -4.5]}
        angle={0.6}
        penumbra={0.8}
        intensity={2.5}
        color="#1133FF"
        distance={7}
      />
      {/* Léger fill côté */}
      <pointLight position={[-2.5, 1.8, 1]} color="#0A0015" intensity={1.2} distance={6} />

      {/* === SOL avec reflet bleu === */}
      <mesh position={[0, -0.01, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#03030A" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* === MURS === */}
      <mesh position={[0, 2.5, -4.5]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#03030A" roughness={1} />
      </mesh>
      <mesh position={[-5.5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#040410" roughness={1} />
      </mesh>
      <mesh position={[5.5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#040410" roughness={1} />
      </mesh>

      {/* === BUREAU (plateau beveled via couches) === */}
      <group position={[0, 0.75, -1.4]}>
        {/* plateau principal */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.05, 0.95]} />
          <meshStandardMaterial color="#12121F" roughness={0.35} metalness={0.55} />
        </mesh>
        {/* couche dessus plus claire (effet bevel low-poly) */}
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[2.36, 0.005, 0.92]} />
          <meshStandardMaterial color="#1A1A2E" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* couche dessous plus sombre */}
        <mesh position={[0, -0.026, 0]}>
          <boxGeometry args={[2.36, 0.005, 0.92]} />
          <meshStandardMaterial color="#08080F" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* tranche avant : ligne LED */}
        <mesh position={[0, 0, 0.476]}>
          <boxGeometry args={[2.4, 0.01, 0.005]} />
          <meshStandardMaterial color="#1133FF" emissive="#1133FF" emissiveIntensity={3} />
        </mesh>
        {/* pieds en L inversé (vertical + horizontal) */}
        {[-1.0, 1.0].map((x, i) => (
          <group key={i} position={[x, -0.39, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.05, 0.78, 0.05]} />
              <meshStandardMaterial color="#0A0A15" roughness={0.25} metalness={0.9} />
            </mesh>
            <mesh position={[0, -0.36, 0.18]} castShadow>
              <boxGeometry args={[0.05, 0.05, 0.5]} />
              <meshStandardMaterial color="#0A0A15" roughness={0.25} metalness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === MONITEUR PRINCIPAL === */}
      <group position={[0, 1.4, -1.7]} rotation={[-0.08, 0, 0]}>
        {/* cadre épais */}
        <mesh castShadow>
          <boxGeometry args={[1.7, 1.05, 0.08]} />
          <meshStandardMaterial color="#0A0A14" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* écran (shader) */}
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[1.55, 0.9]} />
          <shaderMaterial
            ref={monitorMatRef}
            vertexShader={VERT}
            fragmentShader={MONITOR_FRAG}
            uniforms={{ u_time: { value: 0 } }}
          />
        </mesh>
        {/* pied col de cygne : tige courbée + base */}
        <mesh position={[0, -0.62, -0.05]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.018, 0.18, 8]} />
          <meshStandardMaterial color="#111118" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, -0.7, 0.06]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.022, 0.12, 8]} />
          <meshStandardMaterial color="#111118" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, -0.78, 0.16]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.04, 16]} />
          <meshStandardMaterial color="#0A0A14" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* === SANDRO TEXTE === */}
      <Html position={[0, 1.4, -1.65]} center transform distanceFactor={1} style={{ pointerEvents: 'none' }} rotation={[-0.08, 0, 0]}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '46px',
          fontWeight: 300,
          color: 'rgba(140, 190, 255, 0.95)',
          textShadow: '0 0 40px rgba(80,140,255,0.95), 0 0 80px rgba(60,100,255,0.5)',
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
          color: 'rgba(100,150,255,0.55)',
          textAlign: 'center',
          marginTop: '8px',
          textTransform: 'uppercase',
          opacity,
        }}>
          architecture liquide
        </div>
      </Html>

      {/* === SECOND ÉCRAN (gauche, code défilant) === */}
      <group position={[-1.15, 1.25, -1.65]} rotation={[-0.05, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.95, 0.6, 0.06]} />
          <meshStandardMaterial color="#0A0A14" roughness={0.25} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[0.86, 0.52]} />
          <shaderMaterial
            ref={codeMatRef}
            vertexShader={VERT}
            fragmentShader={CODE_FRAG}
            uniforms={{ u_time: { value: 0 } }}
          />
        </mesh>
        <mesh position={[0, -0.4, 0.06]} castShadow>
          <cylinderGeometry args={[0.14, 0.17, 0.03, 12]} />
          <meshStandardMaterial color="#0A0A14" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* === CLAVIER === */}
      <group position={[0.05, 0.79, -1.05]} rotation={[-0.05, RAND_ROT[0], 0]}>
        <mesh castShadow>
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
              <meshStandardMaterial color="#1A1A2E" roughness={0.55} metalness={0.4} emissive="#1A1A2E" emissiveIntensity={0.08} />
            </mesh>
          )),
        ).flat()}
        <pointLight position={[0, 0.05, 0]} color="#1133FF" intensity={0.4} distance={1.2} />
      </group>

      {/* === SOURIS === */}
      <group position={[0.6, 0.79, -1.05]} rotation={[0, RAND_ROT[1], 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.035, 0.1, 8, 16]} />
          <meshStandardMaterial color="#0F0F18" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.04, 0.005, 0.04]} />
          <meshStandardMaterial color="#1133FF" emissive="#1133FF" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* === TASSE + ANSE + VAPEUR === */}
      <group position={[-0.7, 0.79, -1.18]} rotation={[0, RAND_ROT[2], 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.13, 16]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* anse */}
        <mesh position={[0.07, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.035, 0.008, 8, 12, Math.PI]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* liquide */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.005, 16]} />
          <meshStandardMaterial color="#1A0F08" roughness={0.4} emissive="#2A1810" emissiveIntensity={0.3} />
        </mesh>
        {/* vapeur */}
        {[0, 1, 2, 3].map(i => (
          <mesh
            key={i}
            ref={(m) => { steamRefs.current[i] = m; }}
            position={[Math.sin(i * 1.3) * 0.02, 0.95, Math.cos(i * 1.3) * 0.02]}
          >
            <sphereGeometry args={[0.025 + i * 0.005, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* === CASQUE AUDIO + CÂBLE SERPENTANT === */}
      <group position={[0.85, 0.79, -1.55]} rotation={[Math.PI / 2, RAND_ROT[3], 0.4]}>
        {/* arc */}
        <mesh castShadow>
          <torusGeometry args={[0.13, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* écouteurs */}
        <mesh position={[-0.13, 0, 0.02]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0.13, 0, 0.02]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* coussin emissive subtle */}
        <mesh position={[-0.13, 0, 0.04]}>
          <cylinderGeometry args={[0.04, 0.04, 0.005, 16]} />
          <meshStandardMaterial color="#1133FF" emissive="#1133FF" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* === SMARTPHONE (face vers le bas, dépasse du bureau) === */}
      <group position={[0.95, 0.78, -1.0]} rotation={[0, RAND_ROT[4], -0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.075, 0.012, 0.16]} />
          <meshStandardMaterial color="#0A0A12" roughness={0.2} metalness={0.85} />
        </mesh>
      </group>

      {/* === POST-ITS === */}
      {[
        { pos: [-0.95, 0.79, -1.42] as [number, number, number], col: '#FFE566', rot: 0.12 },
        { pos: [-0.85, 0.79, -1.55] as [number, number, number], col: '#FF6B6B', rot: -0.08 },
        { pos: [-0.78, 0.79, -1.32] as [number, number, number], col: '#66FFB2', rot: 0.06 },
      ].map((p, i) => (
        <mesh key={i} position={p.pos} rotation={[-Math.PI / 2, 0, p.rot]} castShadow>
          <planeGeometry args={[0.1, 0.1]} />
          <meshStandardMaterial color={p.col} roughness={0.9} emissive={p.col} emissiveIntensity={0.15} side={2} />
        </mesh>
      ))}

      {/* === CÂBLES (CatmullRom tubes) === */}
      {CABLE_CURVES.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 24, 0.008, 6, false]} />
          <meshStandardMaterial color="#0A0A0F" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}

      {/* === CHAISE GAMER === */}
      <group position={[0, 0, -0.3]} rotation={[0, RAND_ROT[5], 0]}>
        {/* assise */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.58]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.75} metalness={0.15} />
        </mesh>
        {/* lignes coutures bleues sur l'assise */}
        <mesh position={[0, 0.541, 0]}>
          <boxGeometry args={[0.55, 0.002, 0.005]} />
          <meshStandardMaterial color="#1133FF" emissive="#1133FF" emissiveIntensity={1.5} />
        </mesh>
        {/* dossier incliné 0.15 rad */}
        <mesh position={[0, 0.95, -0.27]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.85, 0.08]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.75} metalness={0.15} />
        </mesh>
        {/* couture verticale dossier */}
        <mesh position={[0, 0.95, -0.225]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.005, 0.78, 0.005]} />
          <meshStandardMaterial color="#1133FF" emissive="#1133FF" emissiveIntensity={1.5} />
        </mesh>
        {/* appuie-tête séparé (boxGeometry au-dessus) */}
        <mesh position={[0, 1.42, -0.32]} rotation={[0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.18, 0.1]} />
          <meshStandardMaterial color="#0D0D1A" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* accoudoirs en T (tige verticale + barre horizontale) */}
        {[-0.34, 0.34].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.65, -0.05]} castShadow>
              <boxGeometry args={[0.04, 0.18, 0.04]} />
              <meshStandardMaterial color="#0A0A12" roughness={0.4} metalness={0.7} />
            </mesh>
            <mesh position={[x, 0.74, -0.05]} castShadow>
              <boxGeometry args={[0.07, 0.025, 0.22]} />
              <meshStandardMaterial color="#0D0D1A" roughness={0.6} metalness={0.3} />
            </mesh>
          </group>
        ))}
        {/* piston central */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.5, 12]} />
          <meshStandardMaterial color="#111118" roughness={0.2} metalness={0.95} />
        </mesh>
        {/* base étoile 5 branches */}
        {Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.18, 0.04, Math.sin(angle) * 0.18]}
              rotation={[0, -angle, 0]}
              castShadow
            >
              <boxGeometry args={[0.4, 0.045, 0.06]} />
              <meshStandardMaterial color="#111118" roughness={0.25} metalness={0.9} />
            </mesh>
          );
        })}
        {/* roulettes (sphères plates) */}
        {Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.34, 0.025, Math.sin(angle) * 0.34]}
              castShadow
            >
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color="#08080F" roughness={0.7} metalness={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* === CACTUS + POT === */}
      <group position={[-1.0, 0.79, -1.65]} rotation={[0, RAND_ROT[6], 0]}>
        {/* pot terracotta */}
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.06, 0.1, 16]} />
          <meshStandardMaterial color="#3D1A10" roughness={0.85} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.078, 0.078, 0.005, 16]} />
          <meshStandardMaterial color="#1A0A05" roughness={1} />
        </mesh>
        {/* cactus principal (légèrement conique) */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.22, 10]} />
          <meshStandardMaterial color="#0F2010" roughness={0.7} />
        </mesh>
        {/* branche gauche en arc */}
        <mesh position={[-0.045, 0.18, 0]} rotation={[0, 0, 0.7]} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.1, 8]} />
          <meshStandardMaterial color="#0F2010" roughness={0.7} />
        </mesh>
        <mesh position={[-0.07, 0.23, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.02, 0.06, 8]} />
          <meshStandardMaterial color="#0F2010" roughness={0.7} />
        </mesh>
        {/* branche droite en arc */}
        <mesh position={[0.045, 0.16, 0]} rotation={[0, 0, -0.7]} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.09, 8]} />
          <meshStandardMaterial color="#0F2010" roughness={0.7} />
        </mesh>
        <mesh position={[0.068, 0.21, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.02, 0.05, 8]} />
          <meshStandardMaterial color="#0F2010" roughness={0.7} />
        </mesh>
        {/* épines */}
        {Array.from({ length: 18 }, (_, i) => {
          const ang = (i / 18) * Math.PI * 2 + (i % 3) * 0.4;
          const yo = 0.1 + (i / 18) * 0.18;
          return (
            <mesh key={i} position={[Math.cos(ang) * 0.045, yo, Math.sin(ang) * 0.045]} rotation={[0, -ang, 0]}>
              <boxGeometry args={[0.012, 0.003, 0.003]} />
              <meshStandardMaterial color="#FFE566" emissive="#FFE566" emissiveIntensity={0.2} />
            </mesh>
          );
        })}
      </group>

      {/* === BARRE LED SOUS LE BUREAU === */}
      <mesh position={[0, 0.35, -1.0]}>
        <boxGeometry args={[2.2, 0.025, 0.025]} />
        <meshStandardMaterial color="#1133FF" emissive="#1133FF" emissiveIntensity={4} />
      </mesh>
      <pointLight position={[0, 0.32, -0.95]} color="#1133FF" intensity={2} distance={2.5} decay={2} />

      {/* === POSTER LED MUR === */}
      <mesh position={[-3.8, 2.2, -2]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshStandardMaterial color="#0A0020" emissive="#1133FF" emissiveIntensity={0.4} />
      </mesh>
      {/* cadre du poster */}
      <mesh position={[-3.8, 2.2, -2.005]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[1.26, 1.86]} />
        <meshStandardMaterial color="#08080F" />
      </mesh>

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
