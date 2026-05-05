/**
 * Architecture Liquide — shared constants.
 * Values mirror CSS custom properties in globals.css.
 */

export const COLORS = {
  void: "#040408",
  voidDeep: "#020204",
  mid: "#131b26",
  midElevated: "#1a2331",
  blueDeep: "#0a1828",
  text: "#e8ecf0",
  textDim: "#8a94a3",
  textFaint: "#4a5666",
  indigo: "#6366f1",
  teal: "#14b8a6",
  violet: "#8b5cf6",
  cyanDeep: "#0891b2",
  slate: "#64748b",
  slateDeep: "#1a2840",
  amber: "#ffb454",
  amberHot: "#ffc88a",
  trailSilver: "#a8c4e5",
} as const;

export const CLUSTER_COLORS = [
  COLORS.indigo,
  COLORS.teal,
  COLORS.violet,
  COLORS.cyanDeep,
  COLORS.slate,
] as const;

/**
 * Spinal axis path — CatmullRomCurve3 control points.
 * Forward Z motion + slight Y drift = "vertebral column" with depth travel.
 * Curve goes from (0, 0, 0) to (0, -25, -180) over 8 control points
 * with subtle X/Y wobble for organic feel.
 */
export const AXIS_PATH: [number, number, number][] = [
  [0, 0, 0],
  [0.4, -3.5, -22],
  [-0.6, -7, -45],
  [0.5, -10.5, -68],
  [-0.4, -14, -92],
  [0.6, -17.5, -118],
  [-0.5, -21, -148],
  [0, -25, -180],
];

/** Number of vertebrae segments distributed along the curve. */
export const VERTEBRAE_COUNT = 24;

/**
 * Anchor positions along the curve as t (0..1).
 * Each scene attaches its content to a specific t.
 */
export const ANCHORS = {
  hubManifesto: 0.05,
  about: 0.20,
  // Skills: 5 nerves emerging from 5 successive vertebrae
  skills: [0.32, 0.37, 0.42, 0.47, 0.52] as const,
  // Projects: 6 ribs alternating L/R
  projects: [0.58, 0.63, 0.69, 0.75, 0.81, 0.87] as const,
  contact: 0.96,
} as const;

/**
 * Camera traverses the curve via t-progress (0..1) instead of linear z.
 * Each scene owns a t-range — used by HUD and progress gauge.
 */
export const SCENES = {
  hub: { id: "hub", range: [0, 0.15] as const, label: "Hub" },
  about: { id: "about", range: [0.15, 0.3] as const, label: "À propos" },
  skills: { id: "skills", range: [0.3, 0.55] as const, label: "Compétences" },
  projects: { id: "projects", range: [0.55, 0.92] as const, label: "Projets" },
  outro: { id: "outro", range: [0.92, 1] as const, label: "Contact" },
} as const;

export type SceneId = keyof typeof SCENES;
export const SCENE_ORDER: SceneId[] = ["hub", "about", "skills", "projects", "outro"];

/**
 * Mood color stops (background fog + ambient color) interpolated by scroll progress.
 * void (#040408) → blueDeep (#0a1828) at projects → void at contact.
 */
export const MOOD_STOPS = [
  { t: 0.0, fog: COLORS.void, ambient: "#9eb1c8", intensity: 0.18 },
  { t: 0.3, fog: COLORS.void, ambient: "#9eb1c8", intensity: 0.18 },
  { t: 0.55, fog: "#070d18", ambient: "#a8b4c8", intensity: 0.22 },
  { t: 0.75, fog: COLORS.blueDeep, ambient: "#b0c0d8", intensity: 0.26 },
  { t: 0.9, fog: "#070d18", ambient: "#9eb1c8", intensity: 0.2 },
  { t: 1.0, fog: COLORS.void, ambient: "#9eb1c8", intensity: 0.16 },
] as const;

/** Total scrollable virtual length (vh multiplier). */
export const TOTAL_SCROLL_VH = 1100;

/** Performance budgets per tier. */
export const PERF = {
  desktop: {
    trails: 70,
    dust: 1200,
    motes: 300,
    postFX: true,
    dpr: [1, 2] as [number, number],
  },
  mobile: {
    trails: 0,
    dust: 200,
    motes: 60,
    postFX: false,
    dpr: [1, 1.5] as [number, number],
  },
} as const;

/** Mouse parallax dampening factor. */
export const PARALLAX_DAMP = 0.045;
