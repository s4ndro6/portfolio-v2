'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ShaderMaterial, Group } from 'three';
import { Project } from '@/data/projects';
import { useStore } from '@/store/useStore';

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

const SHADERS: Record<string, string> = {
  // FLUVO — réseau de nœuds connectés
  waves: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
    void main(){
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= 1.5;
      float t = u_time * 0.4;
      vec3 col = vec3(0.02, 0.04, 0.12);

      // 8 nœuds fixes
      vec2 nodes[8];
      nodes[0]=vec2(-1.0, 0.4); nodes[1]=vec2(-0.4, 0.7); nodes[2]=vec2(0.3, 0.5);
      nodes[3]=vec2(1.0,-0.1); nodes[4]=vec2(-0.7,-0.3); nodes[5]=vec2(0.0,-0.6);
      nodes[6]=vec2(0.7,-0.5); nodes[7]=vec2(-0.2, 0.0);

      // Connexions (paires)
      int conns[20];
      conns[0]=0; conns[1]=1;  conns[2]=1; conns[3]=2;
      conns[4]=2; conns[5]=3;  conns[6]=4; conns[7]=7;
      conns[8]=7; conns[9]=2;  conns[10]=5; conns[11]=7;
      conns[12]=5; conns[13]=6; conns[14]=6; conns[15]=3;
      conns[16]=4; conns[17]=5; conns[18]=0; conns[19]=7;

      // Lignes
      for(int i=0; i<10; i++){
        vec2 a = nodes[conns[i*2]];
        vec2 b = nodes[conns[i*2+1]];
        vec2 d = b - a;
        float len = length(d);
        float proj = clamp(dot(uv-a, d/len)/len, 0.0, 1.0);
        vec2 p = a + d * proj;
        float dist = length(uv - p);
        float pulse = sin(t * 1.5 + float(i) * 0.7) * 0.5 + 0.5;
        col += vec3(0.36, 0.55, 0.93) * smoothstep(0.025, 0.0, dist) * (0.4 + pulse * 0.6);
      }

      // Nœuds (cercles pulsants)
      for(int i=0; i<8; i++){
        float pulse = sin(t * 1.2 + float(i) * 0.9) * 0.5 + 0.5;
        float d = length(uv - nodes[i]);
        col += vec3(0.55, 0.75, 1.0) * smoothstep(0.08, 0.0, d) * (0.6 + pulse * 0.5) * 2.0;
        col += vec3(0.36, 0.55, 0.93) * smoothstep(0.18, 0.04, d) * pulse * 0.6;
      }

      vec2 vc = uv * 0.4;
      col *= 1.0 - dot(vc, vc);
      col *= (0.5 + u_hover * 0.6);
      gl_FragColor = vec4(col, 1.0);
    }`,

  // HUNT — entonnoir de données
  matrix: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
    void main(){
      vec2 uv = vUv;
      float t = u_time * 0.6;
      vec3 col = vec3(0.0);

      // Entonnoir : convergence vers (0.5, 0.1)
      vec2 target = vec2(0.5, 0.10);
      // Particules tombantes
      for(float i=0.0; i<60.0; i++){
        vec2 seed = vec2(i*0.137, i*0.291);
        float startX = h(seed);
        // Trajectoire courbée vers le centre
        float speed = 0.15 + h(seed+0.5)*0.5;
        float life = fract(t*speed + h(seed+1.0));
        // Position : interpolation startX→target.x avec acceleration vers le bas
        float yPos = 1.0 - life;
        float curve = pow(life, 2.0); // accélère vers la cible
        float xPos = mix(startX, target.x, curve);
        vec2 pos = vec2(xPos, yPos);
        float d = length(uv - pos);
        float speed01 = pow(life, 1.5);
        // Plus c'est près de la cible, plus c'est brillant
        col += vec3(0.13, 0.83, 0.50) * smoothstep(0.012, 0.0, d) * (0.5 + speed01);
        // Traînée
        for(float k=1.0; k<4.0; k++){
          vec2 prev = mix(vec2(startX, yPos+k*0.04), pos, 1.0-k*0.2);
          float dt = length(uv - prev);
          col += vec3(0.13, 0.83, 0.50) * smoothstep(0.008, 0.0, dt) * (0.4 - k*0.08);
        }
      }

      // Halo cible
      float toTarget = length(uv - target);
      float pulse = sin(t * 2.0) * 0.5 + 0.5;
      col += vec3(0.13, 0.83, 0.50) * smoothstep(0.18, 0.0, toTarget) * (0.4 + pulse * 0.5);
      col += vec3(0.6, 1.0, 0.85) * smoothstep(0.04, 0.0, toTarget) * 2.0;

      // Ligne du sol cible
      float floorLine = smoothstep(0.005, 0.0, abs(uv.y - target.y)) * smoothstep(0.0, 0.4, abs(uv.x-0.5));
      col += vec3(0.13, 0.83, 0.50) * floorLine * 0.3;

      vec2 c = uv*2.0-1.0;
      col *= 1.0 - dot(c*0.35, c*0.35);
      col *= (0.45 + u_hover * 0.65);
      gl_FragColor = vec4(col, 1.0);
    }`,

  // NEXUS — cerveau / réseau neuronal
  wireframe: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
    void main(){
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= 1.5;
      float t = u_time * 0.5;
      vec3 col = vec3(0.0);

      // Structure centrale (icosphère projetée — approximation 2D : cercle + losanges)
      float r = length(uv);
      // Anneaux concentriques
      float ring1 = smoothstep(0.005, 0.0, abs(r - 0.35));
      float ring2 = smoothstep(0.004, 0.0, abs(r - 0.55));
      col += vec3(0.08, 0.76, 0.93) * ring1 * (0.4 + sin(t*2.0)*0.3);
      col += vec3(0.08, 0.76, 0.93) * ring2 * 0.3;

      // Arêtes intérieures (icosphère style)
      float angle = atan(uv.y, uv.x);
      for(float i=0.0; i<6.0; i++){
        float a = i * 1.0472;
        vec2 dir = vec2(cos(a), sin(a));
        // Distance à la ligne
        float proj = dot(uv, dir);
        vec2 perp = uv - dir * proj;
        float dline = length(perp);
        float maskRadial = smoothstep(0.55, 0.0, abs(proj)) * step(abs(proj), 0.55);
        col += vec3(0.08, 0.76, 0.93) * smoothstep(0.006, 0.0, dline) * maskRadial * 0.4;
      }

      // Synapses : 12 points qui s'allument séquentiellement
      for(int i=0; i<12; i++){
        float a = float(i) * 0.5236; // 2π/12
        float rd = 0.7 + sin(float(i) * 0.7) * 0.15;
        vec2 pos = vec2(cos(a), sin(a)) * rd;
        // Activation séquentielle
        float phase = mod(t * 1.5 + float(i) * 0.4, 6.28);
        float fire = smoothstep(0.3, 0.0, abs(phase - 1.5));
        float d = length(uv - pos);
        col += vec3(0.08, 0.76, 0.93) * smoothstep(0.04, 0.0, d) * (0.3 + fire * 3.0);
        // Impulsion qui voyage vers le centre
        vec2 imp = pos * (1.0 - fire);
        float di = length(uv - imp);
        col += vec3(0.5, 0.95, 1.0) * smoothstep(0.025, 0.0, di) * fire * 1.5;
      }

      // Cœur central pulsant
      float core = sin(t * 3.0) * 0.5 + 0.5;
      col += vec3(0.5, 0.9, 1.0) * smoothstep(0.05, 0.0, r) * (0.5 + core * 1.5);

      vec2 vc = uv * 0.35;
      col *= 1.0 - dot(vc, vc);
      col *= (0.45 + u_hover * 0.65);
      gl_FragColor = vec4(col, 1.0);
    }`,

  // ARCANE — forge + lame
  embers: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float n(vec2 p){
      vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(
        mix(fract(sin(dot(i,vec2(127.1,311.7)))*43758.5), fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5), f.x),
        mix(fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5), fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5), f.x),
      f.y);
    }
    void main(){
      vec2 uv = vUv;
      float t = u_time * 0.4;

      // Sol braises (bas du plan)
      float floorMask = smoothstep(0.45, 0.0, uv.y);
      float ember = pow(n(uv * 8.0 + vec2(t*0.2, 0.0)), 2.0);
      vec3 emberCol = mix(vec3(0.4, 0.04, 0.0), vec3(1.0, 0.5, 0.1), ember);
      vec3 col = emberCol * floorMask * 1.5;

      // Étincelles qui montent
      for(float i=0.0; i<14.0; i++){
        float seed = i * 1.137;
        float speed = 0.3 + fract(sin(seed)*43758.5) * 0.4;
        float ox = (fract(sin(i*127.1)*43758.5) - 0.5) * 0.85;
        float life = fract(t * speed + fract(sin(seed*1.7)*43758.5));
        vec2 pos = vec2(0.5 + ox + sin(life*5.0+i)*0.05, life * 1.1);
        float d = length(uv - pos);
        float bright = (1.0 - life) * (1.0 - life);
        col += vec3(1.0, 0.55, 0.15) * smoothstep(0.02, 0.0, d) * bright * 3.0;
      }

      // Lame au centre, verticale, pulse
      vec2 bladeUv = vec2(uv.x - 0.5, uv.y - 0.55);
      float bladeShape = smoothstep(0.012, 0.0, abs(bladeUv.x)) * smoothstep(0.35, 0.0, abs(bladeUv.y));
      // Pointe en bas
      float tipMask = smoothstep(0.0, 0.05, uv.y - 0.18);
      bladeShape *= tipMask;
      // Tranchant lumineux
      float edge = smoothstep(0.018, 0.012, abs(bladeUv.x)) * smoothstep(0.34, 0.0, abs(bladeUv.y)) * tipMask;
      float pulse = sin(t * 2.5) * 0.5 + 0.5;
      col += vec3(1.0, 0.4, 0.1) * bladeShape * 0.6;
      col += vec3(1.0, 0.85, 0.55) * edge * (0.7 + pulse);

      // Garde de la lame
      float guard = smoothstep(0.005, 0.0, abs(uv.y - 0.18)) * smoothstep(0.07, 0.0, abs(uv.x - 0.5));
      col += vec3(0.3, 0.15, 0.05) * guard;
      col += vec3(1.0, 0.5, 0.1) * guard * pulse * 0.8;

      // Lumière dramatique depuis le bas
      float light = pow(1.0 - uv.y, 2.5) * 0.7;
      col += vec3(0.6, 0.1, 0.0) * light;

      vec2 c = uv*2.0-1.0;
      col *= 1.0 - dot(c*0.4, c*0.4);
      col *= (0.5 + u_hover * 0.6);
      gl_FragColor = vec4(col, 1.0);
    }`,

  // AGENTS — 3 entités + connexions
  orbs: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    void main(){
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= 1.5;
      float t = u_time * 0.45;
      vec3 col = vec3(0.0);

      vec3 colors[3];
      colors[0] = vec3(0.65, 0.55, 0.98); // violet
      colors[1] = vec3(0.13, 0.83, 0.95); // cyan
      colors[2] = vec3(0.20, 0.85, 0.55); // émeraude

      vec2 pos[3];
      for(int i=0; i<3; i++){
        float a = t + float(i) * 2.094;
        float r = 0.6 + sin(t*0.4 + float(i)*1.3) * 0.1;
        pos[i] = vec2(cos(a) * r, sin(a) * r * 0.7);
      }

      // Connexions entre entités quand proches
      for(int i=0; i<3; i++){
        for(int j=i+1; j<3; j++){
          vec2 a = pos[i], b = pos[j];
          float dist = length(b - a);
          float proximity = smoothstep(1.5, 0.5, dist);
          vec2 d = b - a;
          float len = length(d);
          float proj = clamp(dot(uv - a, d/len)/len, 0.0, 1.0);
          vec2 p = a + d * proj;
          float lineDist = length(uv - p);
          float pulse = sin(t * 3.0 + float(i+j)) * 0.5 + 0.5;
          vec3 lineCol = (colors[i] + colors[j]) * 0.5;
          col += lineCol * smoothstep(0.012, 0.0, lineDist) * proximity * (0.5 + pulse) * 0.7;
        }
      }

      // Orbes + traînées
      for(int i=0; i<3; i++){
        // Cœur lumineux
        float d = length(uv - pos[i]);
        col += colors[i] * smoothstep(0.1, 0.0, d) * 3.5;
        col += colors[i] * 0.04 / (d * d + 0.015);
        // Traîne
        for(float k=1.0; k<6.0; k++){
          float a = t - k * 0.15 + float(i) * 2.094;
          float r = 0.6 + sin(t*0.4 + float(i)*1.3 - k*0.15) * 0.1;
          vec2 trail = vec2(cos(a) * r, sin(a) * r * 0.7);
          float td = length(uv - trail);
          col += colors[i] * smoothstep(0.045, 0.0, td) * (1.0 - k/6.0) * 1.0;
        }
      }

      // Centre amber discret
      float center = exp(-length(uv) * 5.0);
      col += vec3(1.0, 0.71, 0.33) * center * 0.4;

      vec2 vc = uv * 0.32;
      col *= 1.0 - dot(vc, vc);
      col *= (0.45 + u_hover * 0.65);
      gl_FragColor = vec4(col, 1.0);
    }`,

  // JARVIS — CRT terminal
  crt: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(float n){ return fract(sin(n)*43758.5); }
    float h2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
    void main(){
      vec2 uv = vUv;
      float t = u_time * 0.7;
      // Barrel distortion
      vec2 c = uv * 2.0 - 1.0;
      c *= 1.0 + dot(c, c) * 0.08;
      uv = c * 0.5 + 0.5;
      if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0){
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return;
      }

      vec3 col = vec3(0.015, 0.06, 0.025);
      float scan = sin(uv.y * 280.0) * 0.05 + 0.95;

      // Lignes de "code"
      for(float i=0.0; i<18.0; i++){
        float y = i / 18.0 + 0.027;
        float lineLen = 0.25 + h(i + floor(t*0.18) * 0.1) * 0.65;
        // Vitesse de scroll variable : rapide puis ralentit
        float scrollSpeed = 0.15 + h(i*0.7) * 0.15;
        float scroll = fract(t * scrollSpeed + i * 0.07);
        float lineY = fract(y - scroll);
        if(lineY > 1.0/18.0) continue;
        float inLine = step(0.025, uv.x) * step(uv.x, lineLen) *
                       step(lineY, 0.005) * step(0.0008, lineY);
        // Caractères pixelisés
        float chars = step(0.5, h2(vec2(floor(uv.x * 70.0), floor(lineY * 220.0) + i * 7.0)));
        col += vec3(0.18, 0.92, 0.4) * inLine * chars * scan;
        // Curseur
        float cursor = step(lineLen, uv.x) * step(uv.x, lineLen + 0.025) *
                       step(lineY, 0.005) * step(0.0008, lineY) *
                       (sin(t * 5.0) * 0.5 + 0.5);
        col += vec3(0.3, 1.0, 0.5) * cursor * 1.8;
      }

      // Glitch toutes les 3-4s
      float glitchTime = floor(t * 0.3);
      float glitchActive = step(0.85, h(glitchTime));
      float glitchY = h(glitchTime * 1.7);
      float glitchBand = smoothstep(0.04, 0.0, abs(uv.y - glitchY)) * glitchActive;
      col.rgb = mix(col.rgb, col.gbr * 1.3, glitchBand);
      // Décalage horizontal pendant glitch
      if(glitchBand > 0.1){
        float shift = (h(t*30.0) - 0.5) * 0.04 * glitchBand;
        col += vec3(0.1, 0.5, 0.2) * smoothstep(0.001, 0.0, abs(uv.x - 0.5 - shift)) * 0.5;
      }

      // Vignette CRT
      vec2 cv = uv * 2.0 - 1.0;
      float vig = (1.0 - cv.x*cv.x*0.9) * (1.0 - cv.y*cv.y*0.9);
      col *= pow(vig, 0.3) * scan;
      col *= (0.5 + u_hover * 0.6);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

interface Props {
  project: Project;
  position: [number, number, number];
  rotationY: number;
  stationIndex: number;
}

const SCREEN_W = 6;
const SCREEN_H = 3.8;
const FRAME_T = 0.06;
const FRAME_D = 0.12;

export default function FlowStation({ project, position, rotationY, stationIndex }: Props) {
  const groupRef = useRef<Group>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const activeProject = useStore(s => s.activeProject);
  const setActive = useStore(s => s.setActive);
  const isActive = activeProject === project.id;

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = clock.elapsedTime;
      matRef.current.uniforms.u_hover.value +=
        ((hovered || isActive ? 1 : 0) - matRef.current.uniforms.u_hover.value) * 0.08;
    }
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 0.3 + stationIndex) * 0.12;
    }
  });

  const cornerOffsets: [number, number][] = [
    [-SCREEN_W / 2, SCREEN_H / 2],
    [SCREEN_W / 2, SCREEN_H / 2],
    [-SCREEN_W / 2, -SCREEN_H / 2],
    [SCREEN_W / 2, -SCREEN_H / 2],
  ];

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Halo volumétrique large derrière l'écran (brume colorée) */}
      <mesh position={[0, 0, -0.4]}>
        <planeGeometry args={[SCREEN_W * 2.2, SCREEN_H * 2.4]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={hovered ? 0.18 : 0.10}
          depthWrite={false}
          blending={2 /* AdditiveBlending */}
        />
      </mesh>

      {/* Halo intermédiaire plus serré */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[SCREEN_W * 1.4, SCREEN_H * 1.6]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={hovered ? 0.22 : 0.13}
          depthWrite={false}
          blending={2}
        />
      </mesh>

      {/* Fond en retrait — légère emissive du projet */}
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[SCREEN_W + 0.4, SCREEN_H + 0.4]} />
        <meshStandardMaterial
          color="#040408"
          emissive={project.color}
          emissiveIntensity={hovered ? 0.18 : 0.06}
        />
      </mesh>

      {/* Reflet au sol (tache de couleur sur la grille en dessous) */}
      <mesh
        position={[0, -SCREEN_H / 2 - 1.0, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[SCREEN_W * 1.4, 5]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={hovered ? 0.22 : 0.12}
          depthWrite={false}
          blending={2}
        />
      </mesh>

      {/* L'écran principal */}
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => setActive(isActive ? null : project.id)}
      >
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={SHADERS[project.shaderType]}
          uniforms={{ u_time: { value: 0 }, u_hover: { value: 0 } }}
        />
      </mesh>

      {/* Cadre — 4 barres séparées avec épaisseur Z */}
      {/* haut */}
      <mesh position={[0, SCREEN_H / 2 + FRAME_T / 2, FRAME_D / 2]}>
        <boxGeometry args={[SCREEN_W + FRAME_T * 2, FRAME_T, FRAME_D]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 2.2 : 1.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* bas */}
      <mesh position={[0, -SCREEN_H / 2 - FRAME_T / 2, FRAME_D / 2]}>
        <boxGeometry args={[SCREEN_W + FRAME_T * 2, FRAME_T, FRAME_D]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 2.2 : 1.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* gauche */}
      <mesh position={[-SCREEN_W / 2 - FRAME_T / 2, 0, FRAME_D / 2]}>
        <boxGeometry args={[FRAME_T, SCREEN_H, FRAME_D]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 2.2 : 1.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* droite */}
      <mesh position={[SCREEN_W / 2 + FRAME_T / 2, 0, FRAME_D / 2]}>
        <boxGeometry args={[FRAME_T, SCREEN_H, FRAME_D]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 2.2 : 1.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Coins LED — petites sphères très emissive */}
      {cornerOffsets.map(([cx, cy], i) => (
        <mesh key={i} position={[cx, cy, FRAME_D / 2 + 0.02]} scale={0.06}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color={project.color}
            emissive={project.color}
            emissiveIntensity={4}
          />
        </mesh>
      ))}

      <pointLight
        color={project.color}
        intensity={hovered ? 3 : 2}
        distance={6}
        decay={2}
        position={[0, 0, 0.5]}
      />

      {/* RectAreaLight pour teinter les particules autour */}
      <rectAreaLight
        color={project.color}
        intensity={hovered ? 6 : 3}
        width={SCREEN_W}
        height={SCREEN_H}
        position={[0, 0, 0.05]}
      />

      <Html position={[-SCREEN_W / 2 + 0.2, SCREEN_H / 2 + 0.25, 0.1]} transform distanceFactor={5}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '3px',
          color: project.color,
          opacity: 0.7,
        }}>
          0{project.index + 1} /
        </div>
      </Html>

      {hovered && (
        <Html position={[0, -SCREEN_H / 2 - 0.4, 0.1]} center transform distanceFactor={5}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '28px',
            color: '#E8ECF0',
            whiteSpace: 'nowrap',
            textShadow: `0 0 25px ${project.color}`,
            pointerEvents: 'none',
          }}>
            {project.name}
          </div>
        </Html>
      )}

      {isActive && (
        <Html position={[0, 0, 0.5]} center distanceFactor={5}>
          <div style={{
            width: '420px',
            background: 'rgba(5,8,20,0.95)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${project.color}55`,
            borderRadius: '16px',
            padding: '36px',
            pointerEvents: 'auto',
            animation: 'fadeUp 0.4s ease forwards',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: project.color,
              marginBottom: '14px',
            }}>
              {String(project.index + 1).padStart(2, '0')} / 06
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: '44px',
              lineHeight: '0.95',
              color: '#E8ECF0',
              marginBottom: '12px',
            }}>
              {project.name}
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '17px',
              color: 'rgba(232,236,240,0.6)',
              marginBottom: '18px',
              lineHeight: '1.5',
            }}>
              {project.tagline}
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              lineHeight: '1.75',
              color: 'rgba(232,236,240,0.5)',
              marginBottom: '22px',
            }}>
              {project.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
              {project.stack.map(s => (
                <span key={s} style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '100px',
                  color: 'rgba(232,236,240,0.45)',
                }}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {project.url && (
                <a href={project.url} target="_blank" rel="noreferrer" style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: project.color,
                  textDecoration: 'none',
                  padding: '10px 22px',
                  border: `1px solid ${project.color}55`,
                  borderRadius: '100px',
                }}>
                  Voir ↗
                </a>
              )}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgba(232,236,240,0.3)',
              }}>
                ↓ scroll pour continuer
              </span>
            </div>
          </div>
          <style>{`
            @keyframes fadeUp {
              from { opacity:0; transform:translateY(12px); }
              to   { opacity:1; transform:translateY(0); }
            }
          `}</style>
        </Html>
      )}
    </group>
  );
}
