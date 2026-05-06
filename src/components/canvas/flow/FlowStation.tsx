'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ShaderMaterial, Group } from 'three';
import { Project } from '@/data/projects';
import { useStore } from '@/store/useStore';

const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

const SHADERS: Record<string, string> = {
  waves: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    void main(){
      vec2 uv=vUv; float t=u_time*0.5;
      float w1=sin(uv.x*10.0+t)*sin(uv.y*8.0-t*0.7)*0.5+0.5;
      float w2=sin(uv.x*5.0-t*1.3+uv.y*4.0)*0.3+0.7;
      vec3 c1=vec3(0.22,0.43,0.87); vec3 c2=vec3(0.08,0.78,0.95);
      vec2 ct=uv*2.0-1.0; float vig=1.0-dot(ct*0.4,ct*0.4);
      vec3 col=mix(c1*0.3,c2*0.7,w1*w2)*vig*(0.6+u_hover*0.6);
      float b=max(max(step(0.95,uv.x),step(0.95,1.0-uv.x)),max(step(0.97,uv.y),step(0.97,1.0-uv.y)));
      col+=vec3(0.22,0.43,0.87)*b*u_hover*3.0;
      gl_FragColor=vec4(col,1.0);
    }`,
  matrix: `
    varying vec2 vUv; uniform float u_time;  uniform float u_hover;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
    void main(){
      vec2 uv=vUv; float t=u_time*0.4;
      float col=0.0;
      for(int i=0;i<30;i++){
        vec2 seed=vec2(float(i)*0.137,float(i)*0.291);
        vec2 pos=vec2(hash(seed),fract(hash(seed+0.5)+t*hash(seed+1.0)*0.3));
        float d=length(uv-pos);
        col+=0.006/(d*d+0.001);
      }
      vec3 c=vec3(0.13,0.83,0.60)*col*(0.5+u_hover*0.7);
      gl_FragColor=vec4(c,1.0);
    }`,
  wireframe: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    void main(){
      vec2 uv=vUv*2.0-1.0; float t=u_time*0.5;
      float r=length(uv);
      float circles=sin(r*18.0-t*2.5)*0.5+0.5;
      float angle=atan(uv.y,uv.x);
      float rays=abs(sin(angle*8.0+t))*0.5+0.5;
      vec3 c=vec3(0.08,0.76,0.93)*circles*rays*(0.5+u_hover*0.8);
      c+=vec3(0.05,0.4,0.6)*(1.0-r)*0.3;
      gl_FragColor=vec4(c,1.0);
    }`,
  embers: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float n(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(fract(sin(dot(i,vec2(127.1,311.7)))*43758.5),fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5),f.x),mix(fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5),fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5),f.x),f.y);}
    void main(){
      vec2 uv=vUv; float t=u_time*0.5;
      uv.y=fract(uv.y+t*0.12);
      float fire=n(uv*6.0+vec2(0,t))*n(uv*12.0-vec2(t*0.5,0));
      fire=pow(fire,2.0)*3.0;
      vec3 c=mix(vec3(0.6,0.05,0.0),vec3(1.0,0.5,0.1),fire)*(0.4+u_hover*0.7);
      gl_FragColor=vec4(mix(vec3(0),c,fire),1.0);
    }`,
  orbs: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    void main(){
      vec2 uv=vUv*2.0-1.0; float t=u_time*0.7; vec3 col=vec3(0);
      vec3 oc[3]; oc[0]=vec3(0.55,0.36,0.98); oc[1]=vec3(0.08,0.78,0.95); oc[2]=vec3(0.13,0.83,0.60);
      for(int i=0;i<3;i++){
        float a=t+float(i)*2.094;
        vec2 pos=vec2(cos(a)*0.4,sin(a)*0.4);
        float d=length(uv-pos);
        col+=oc[i]*0.04/(d*d+0.002);
      }
      float ctr=1.0-length(uv)*1.5;
      col+=vec3(1.0,0.71,0.33)*max(0.0,ctr)*0.3*(0.5+u_hover*0.5);
      gl_FragColor=vec4(col,1.0);
    }`,
  crt: `
    varying vec2 vUv; uniform float u_time; uniform float u_hover;
    float h(float n){return fract(sin(n)*43758.5);}
    void main(){
      vec2 uv=vUv; float t=u_time;
      float scan=sin(uv.y*160.0)*0.04+0.96;
      float lines=0.0;
      for(int i=0;i<10;i++){
        float y=float(i)/10.0;
        float len=h(float(i)+0.5)*0.7+0.1;
        float line=step(0.04,uv.x)*step(uv.x,len+0.04)*step(y-0.007,uv.y)*step(uv.y,y+0.007);
        float cur=step(len+0.02,uv.x)*step(uv.x,len+0.04)*step(y-0.03,uv.y)*step(uv.y,y+0.03)*(sin(t*4.0)*0.5+0.5);
        lines+=line*0.8+cur;
      }
      float glitch=step(0.97,h(floor(t*10.0)+uv.y*15.0))*0.2;
      vec3 c=vec3(0.15,0.85,0.45)*(lines+0.04)*scan*(0.4+u_hover*0.7);
      vec2 ct=uv*2.0-1.0; float vig=1.0-dot(ct*0.45,ct*0.45);
      gl_FragColor=vec4(c*vig,1.0);
    }`,
};

interface Props {
  project: Project;
  position: [number, number, number];
  rotationY: number;
  stationIndex: number;
}

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

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => setActive(isActive ? null : project.id)}
      >
        <planeGeometry args={[4.5, 2.8]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={SHADERS[project.shaderType]}
          uniforms={{ u_time: { value: 0 }, u_hover: { value: 0 } }}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[4.7, 3.0, 0.04]} />
        <meshStandardMaterial
          color={hovered ? project.color : '#111118'}
          emissive={project.color}
          emissiveIntensity={hovered ? 0.4 : 0.08}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      <pointLight
        color={project.color}
        intensity={hovered ? 3 : 0.8}
        distance={8}
        decay={2}
        position={[0, 0, 0.5]}
      />

      <Html position={[-2.1, 1.6, 0.1]} transform distanceFactor={5}>
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
        <Html position={[0, -1.75, 0.1]} center transform distanceFactor={5}>
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
            <div style={{ display: 'flex', gap: '12px' }}>
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
              <button onClick={() => setActive(null)} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(232,236,240,0.3)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                Fermer
              </button>
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
