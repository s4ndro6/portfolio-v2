/**
 * Architecture Liquide — shared constants.
 * Values mirror CSS custom properties in globals.css.
 */

export const COLORS = {
  void: "#050810",
  mid: "#131b26",
  midElevated: "#1a2331",
  text: "#e8ecf0",
  textDim: "#8a94a3",
  textFaint: "#4a5666",
  indigo: "#6366f1",
  teal: "#14b8a6",
  violet: "#8b5cf6",
  cyanDeep: "#0891b2",
  slate: "#64748b",
  amber: "#ffb454",
} as const;

export const CLUSTER_COLORS = [
  COLORS.indigo,
  COLORS.teal,
  COLORS.violet,
  COLORS.cyanDeep,
  COLORS.slate,
] as const;

/**
 * Camera traverses z=18 → z=-180 across 5 scenes.
 * Each scene owns a scroll progress range (0 → 1).
 */
export const SCENES = {
  hub: { id: "hub", range: [0, 0.15] as const, z: [18, 8] as const, label: "Hub" },
  about: { id: "about", range: [0.15, 0.35] as const, z: [8, -25] as const, label: "À propos" },
  skills: { id: "skills", range: [0.35, 0.55] as const, z: [-25, -55] as const, label: "Compétences" },
  projects: { id: "projects", range: [0.55, 0.85] as const, z: [-55, -125] as const, label: "Projets" },
  outro: { id: "outro", range: [0.85, 1] as const, z: [-125, -180] as const, label: "Contact" },
} as const;

export type SceneId = keyof typeof SCENES;
export const SCENE_ORDER: SceneId[] = ["hub", "about", "skills", "projects", "outro"];

/** Total scrollable virtual length (vh multiplier). 5 scenes × 200vh ≈ 10× viewport. */
export const TOTAL_SCROLL_VH = 1000;

/** Performance budgets per tier. */
export const PERF = {
  desktop: { dust: 1500, postFX: true, dpr: [1, 2] as [number, number] },
  mobile: { dust: 200, postFX: false, dpr: [1, 1.5] as [number, number] },
} as const;

/** Mouse parallax dampening factor. */
export const PARALLAX_DAMP = 0.045;
