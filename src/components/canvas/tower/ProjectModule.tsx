'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import {
  Group,
  ShaderMaterial,
  Vector3,
  PlaneGeometry,
  EdgesGeometry,
  BufferGeometry,
  BufferAttribute,
} from 'three';
import { TOWER_CONFIG } from '@/data/tower';
import type { Project } from '@/data/projects';
import { useStore } from '@/store/useStore';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_hover;
  uniform vec3 u_color;
  void main() {
    vec2 uv = vUv;
    float t = u_time * 0.4;
    float gridX = step(0.97, fract(uv.x * 20.0));
    float gridY = step(0.97, fract(uv.y * 12.0));
    float grid = max(gridX, gridY) * 0.15;
    float scan = sin(uv.y * 80.0 + t * 2.0) * 0.04 + 0.96;
    vec2 c = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(c * 0.5, c * 0.5);
    vec3 col = u_color * (0.25 + u_hover * 0.5) * vig * scan;
    col += vec3(grid);
    float border = max(
      step(0.94, uv.x) + step(0.94, 1.0 - uv.x) +
      step(0.94, uv.y) + step(0.94, 1.0 - uv.y),
      0.0
    );
    col += u_color * border * u_hover * 2.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const PANEL_W = 5;
const PANEL_H = 3.2;
const BRANCH_LEN = 4.5;

function hexToVec3(hex: string): Vector3 {
  return new Vector3(
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  );
}

interface Props {
  project: Project;
}

export default function ProjectModule({ project }: Props) {
  const groupRef = useRef<Group>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();
  const enterProject = useStore((s) => s.enterProject);
  const setGlobalHovered = useStore((s) => s.setHovered);

  const nodeY =
    project.nodeIndex * TOWER_CONFIG.nodeSpacing - TOWER_CONFIG.totalHeight / 2;
  const branchX = Math.sin(project.angleOffset) * BRANCH_LEN;
  const branchZ = Math.cos(project.angleOffset) * BRANCH_LEN;
  const colorVec = useMemo(() => hexToVec3(project.accentColor), [project.accentColor]);

  // Connection wire geometry (module → axis)
  const wireGeo = useMemo(() => {
    const positions = new Float32Array([0, 0, 0, -branchX, 0, -branchZ]);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    return g;
  }, [branchX, branchZ]);

  // Edge frame geometry
  const edgeGeo = useMemo(() => {
    const plane = new PlaneGeometry(PANEL_W + 0.1, PANEL_H + 0.1);
    return new EdgesGeometry(plane);
  }, []);

  const _scratchVec = useMemo(() => new Vector3(), []);

  useFrame(({ clock }) => {
    if (!matRef.current || !groupRef.current) return;
    const t = clock.elapsedTime;
    matRef.current.uniforms.u_time.value = t;
    matRef.current.uniforms.u_hover.value +=
      ((hovered ? 1 : 0) - matRef.current.uniforms.u_hover.value) * 0.08;

    // Levitation
    groupRef.current.position.y = nodeY + Math.sin(t * 0.4 + project.nodeIndex) * 0.12;

    if (hovered) {
      groupRef.current.getWorldPosition(_scratchVec);
      _scratchVec.subVectors(camera.position, _scratchVec).normalize();
      const targetY = Math.atan2(_scratchVec.x, _scratchVec.z);
      groupRef.current.rotation.y +=
        (targetY - groupRef.current.rotation.y) * 0.05;
    } else {
      groupRef.current.rotation.y +=
        (project.angleOffset - groupRef.current.rotation.y) * 0.03;
    }
  });

  const handleEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    setGlobalHovered(project.id);
    document.body.style.cursor = 'none';
  };
  const handleLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    setGlobalHovered(null);
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    enterProject(project.id);
  };

  return (
    <group ref={groupRef} position={[branchX, nodeY, branchZ]}>
      {/* connection wire to axis */}
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial
          color={project.accentColor}
          transparent
          opacity={hovered ? 0.85 : 0.3}
        />
      </lineSegments>

      {/* screen */}
      <mesh
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
      >
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={{
            u_time: { value: 0 },
            u_hover: { value: 0 },
            u_color: { value: colorVec },
          }}
        />
      </mesh>

      {/* edge frame */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial
          color={project.accentColor}
          transparent
          opacity={hovered ? 0.95 : 0.25}
        />
      </lineSegments>

      {/* hover-revealed name + tagline */}
      {hovered && (
        <>
          <Text
            position={[0, -1.9, 0.05]}
            fontSize={0.32}
            color={project.accentColor}
            anchorX="center"
            fontStyle="italic"
          >
            {project.name}
          </Text>
          <Text
            position={[0, -2.32, 0.05]}
            fontSize={0.14}
            color="#A8AEB8"
            anchorX="center"
          >
            {project.tagline}
          </Text>
        </>
      )}

      {/* index marker */}
      <Text
        position={[-2.2, 1.35, 0.05]}
        fontSize={0.13}
        color="#5A5F69"
        anchorX="left"
      >
        {`0${project.nodeIndex}`}
      </Text>
    </group>
  );
}
