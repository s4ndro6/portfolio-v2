import { CatmullRomCurve3, Vector3 } from 'three';

export const FLOW_CURVE = new CatmullRomCurve3(
  [
    new Vector3(0, 0, 0),
    new Vector3(-3, 0.5, -8),
    new Vector3(0, -0.3, -16),
    new Vector3(4, 1.0, -24),
    new Vector3(-2, 0.2, -32),
    new Vector3(1, -0.5, -40),
    new Vector3(3, 0.8, -48),
    new Vector3(-1, 0, -56),
    new Vector3(0, 0, -64),
  ],
  false,
  'catmullrom',
  0.5,
);

export const STATION_T = [0.10, 0.23, 0.38, 0.52, 0.67, 0.82];

export const STATION_OFFSET = [
  { x: 5, y: 0.5 },
  { x: -5, y: -0.3 },
  { x: 4.5, y: 1.0 },
  { x: -5.5, y: 0 },
  { x: 5, y: -0.5 },
  { x: -4.5, y: 0.8 },
];
