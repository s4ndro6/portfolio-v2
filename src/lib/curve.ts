/**
 * Spinal axis curve — singleton CatmullRomCurve3 used everywhere.
 * Anchors all 3D content (camera, vertebrae, ribs, nerves) to a single
 * deterministic path through the world.
 */

import { CatmullRomCurve3, Vector3 } from "three";
import { AXIS_PATH } from "@/lib/constants";

const points = AXIS_PATH.map(([x, y, z]) => new Vector3(x, y, z));

/** The one true axis. Centripetal Catmull-Rom for smooth curvature. */
export const AXIS_CURVE = new CatmullRomCurve3(points, false, "centripetal", 0.5);

/** Cached curve length — used to convert linear scroll progress to arc-length t. */
export const AXIS_LENGTH = AXIS_CURVE.getLength();

/** Get a point on the axis by normalized progress (0..1). */
export function axisPointAt(t: number, target?: Vector3): Vector3 {
  const out = target ?? new Vector3();
  return AXIS_CURVE.getPointAt(Math.min(1, Math.max(0, t)), out);
}

/** Tangent (forward direction) at t. */
export function axisTangentAt(t: number, target?: Vector3): Vector3 {
  const out = target ?? new Vector3();
  return AXIS_CURVE.getTangentAt(Math.min(1, Math.max(0, t)), out).normalize();
}

/** Right vector at t (perpendicular to tangent, in world XZ plane). */
export function axisRightAt(t: number, target?: Vector3): Vector3 {
  const out = target ?? new Vector3();
  const tan = axisTangentAt(t, out);
  // Cross with world up to get right; reuse `out`.
  out.set(-tan.z, 0, tan.x).normalize();
  return out;
}
