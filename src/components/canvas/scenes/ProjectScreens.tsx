"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import {
  Vector3,
  PlaneGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  Group,
  type Mesh,
  type ShaderMaterial,
} from "three";
import { AXIS_CURVE } from "@/lib/curve";
import { ANCHORS, COLORS } from "@/lib/constants";
import { FONT } from "@/lib/fonts";
import { PROJECTS, type Project } from "@/data/projects";
import { useAppStore } from "@/store/useAppStore";
import { makeProjectMaterial, type ProjectShaderId } from "./projectShaders";

const PANEL_GEO = new PlaneGeometry(4, 2.5, 1, 1);
const RIB_GEO = new BoxGeometry(3.5, 0.04, 0.04);
const RIB_MAT_BASE = new MeshBasicMaterial({
  color: COLORS.amber,
  toneMapped: false,
  transparent: true,
  opacity: 0.6,
});

interface ScreenProps {
  project: Project;
  index: number;
}

function ProjectScreen({ project, index }: ScreenProps) {
  const groupRef = useRef<Group>(null);
  const panelRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const anchorT = ANCHORS.projects[index];
  const side = index % 2 === 0 ? -1 : 1; // 0,2,4 left | 1,3,5 right

  const material = useMemo(
    () => makeProjectMaterial(project.id as ProjectShaderId),
    [project.id],
  );

  const { axisPoint, panelCenter, ribAngle, panelRotY } = useMemo(() => {
    const axisPoint = new Vector3();
    AXIS_CURVE.getPointAt(anchorT, axisPoint);
    const tan = new Vector3();
    AXIS_CURVE.getTangentAt(anchorT, tan).normalize();
    const right = new Vector3(-tan.z, 0, tan.x).normalize();
    const ribAngle = Math.atan2(right.z, right.x);
    const panelCenter = axisPoint.clone().addScaledVector(right, side * 3.5);
    // Panel rotates to face the axis (camera) with slight tilt
    const panelRotY =
      Math.atan2(axisPoint.x - panelCenter.x, axisPoint.z - panelCenter.z) +
      side * 0.25;
    return { axisPoint, panelCenter, ribAngle, panelRotY };
  }, [anchorT, side]);

  // Time + scroll-driven reveal
  useFrame((state) => {
    if (!groupRef.current) return;
    const sp = useAppStore.getState().scrollProgress;
    const dist = Math.abs(sp - anchorT);
    const reveal = Math.max(0, Math.min(1, 1 - dist / 0.06));
    groupRef.current.scale.setScalar(0.4 + reveal * 0.6);
    groupRef.current.visible = reveal > 0.02;

    // Update shader time
    const mat = material as ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Hover lift
    if (panelRef.current) {
      const target = hovered ? 1.06 : 1;
      panelRef.current.scale.x += (target - panelRef.current.scale.x) * 0.18;
      panelRef.current.scale.y += (target - panelRef.current.scale.y) * 0.18;
    }
  });

  const ribMid = useMemo(
    () => axisPoint.clone().lerp(panelCenter, 0.5),
    [axisPoint, panelCenter],
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const sp = useAppStore.getState().scrollProgress;
    useAppStore.getState().setScrollProgressBeforeZoom(sp);
    useAppStore.getState().setOpenProject(project.id);
  };

  return (
    <group ref={groupRef}>
      {/* Rib */}
      <mesh
        position={[ribMid.x, ribMid.y, ribMid.z]}
        rotation={[0, -ribAngle - (side > 0 ? Math.PI : 0), 0]}
        geometry={RIB_GEO}
        material={RIB_MAT_BASE}
      />

      <group position={[panelCenter.x, panelCenter.y, panelCenter.z]}>
        <group rotation={[-0.08, panelRotY, 0]}>
          {/* Shader panel */}
          <mesh
            ref={panelRef}
            geometry={PANEL_GEO}
            material={material}
            onClick={handleClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = "";
            }}
          />

          {/* Title overlay (drei Text on top of shader) */}
          <Text
            font={FONT.display}
            fontSize={0.42}
            color={COLORS.text}
            anchorX="left"
            anchorY="bottom"
            position={[-1.85, -1.1, 0.02]}
            letterSpacing={-0.03}
            material-toneMapped={false}
          >
            {project.name}
          </Text>
          <Text
            font={FONT.mono}
            fontSize={0.085}
            color={COLORS.textDim}
            anchorX="left"
            anchorY="bottom"
            position={[-1.85, -0.95, 0.02]}
            letterSpacing={0.2}
            material-toneMapped={false}
          >
            {`${project.index} · ${project.tagline.toUpperCase()}`}
          </Text>
          <Text
            font={FONT.mono}
            fontSize={0.075}
            color={COLORS.amber}
            anchorX="right"
            anchorY="top"
            position={[1.85, 1.1, 0.02]}
            letterSpacing={0.25}
            material-toneMapped={false}
          >
            {project.year}
          </Text>
        </group>
      </group>
    </group>
  );
}

/**
 * Case study modal — drei Html portal that appears when openProject matches.
 * Anchored at the panel center, faces the camera once it has zoomed in.
 */
function CaseStudy() {
  const openProject = useAppStore((s) => s.openProject);
  const project = openProject ? PROJECTS.find((p) => p.id === openProject) : null;
  if (!project) return null;
  const idx = PROJECTS.findIndex((p) => p.id === openProject);
  if (idx < 0) return null;

  const anchorT = ANCHORS.projects[idx];
  const side = idx % 2 === 0 ? -1 : 1;
  const axisPoint = new Vector3();
  AXIS_CURVE.getPointAt(anchorT, axisPoint);
  const tan = new Vector3();
  AXIS_CURVE.getTangentAt(anchorT, tan).normalize();
  const right = new Vector3(-tan.z, 0, tan.x).normalize();
  const panelCenter = axisPoint.clone().addScaledVector(right, side * 3.5);

  const close = () => {
    useAppStore.getState().setOpenProject(null);
  };

  return (
    <Html
      transform
      occlude={false}
      distanceFactor={4}
      position={[panelCenter.x, panelCenter.y - 0.4, panelCenter.z + 0.05]}
      rotation={[
        -0.08,
        Math.atan2(axisPoint.x - panelCenter.x, axisPoint.z - panelCenter.z) +
          side * 0.25,
        0,
      ]}
    >
      <article className="case-study" data-accent={project.id}>
        <header className="case-head">
          <span className="case-index">
            {project.index} / {String(PROJECTS.length).padStart(2, "0")}
          </span>
          <span className="case-status" data-status={project.status}>
            {STATUS[project.status]}
          </span>
        </header>
        <h3 className="case-title">{project.name}</h3>
        <p className="case-tagline">
          {project.tagline} · {project.year}
        </p>
        <div className="case-blocks">
          <div>
            <span className="case-label">Le problème</span>
            <p>{project.problem}</p>
          </div>
          <div>
            <span className="case-label">La solution</span>
            <p>{project.solution}</p>
          </div>
        </div>
        <div className="case-metrics">
          {project.metrics.map((m) => (
            <div key={m.label}>
              <span className="case-metric-value">{m.value}</span>
              <span className="case-metric-label">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="case-stack">
          {project.stack.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <footer className="case-foot">
          {project.cta ? (
            <a
              href={project.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="case-cta"
            >
              {project.cta.label} →
            </a>
          ) : (
            <span className="case-private">Privé · démo sur demande</span>
          )}
          <button type="button" onClick={close} className="case-close">
            Fermer · ESC
          </button>
        </footer>
      </article>
    </Html>
  );
}

const STATUS: Record<string, string> = {
  live: "● Live",
  production: "● En production",
  ongoing: "○ Construction active",
  paused: "◌ En pause",
};

export function ProjectScreens() {
  // ESC to close
  useFrame(() => {
    /* noop — ESC handled in HUD */
  });

  return (
    <group>
      {PROJECTS.map((p, i) => (
        <ProjectScreen key={p.id} project={p} index={i} />
      ))}
      <CaseStudy />
    </group>
  );
}
