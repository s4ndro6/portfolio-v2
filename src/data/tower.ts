export const TOWER_CONFIG = {
  nodeCount: 8,
  nodeSpacing: 3.5,    // units between nodes
  nodeRadius: 0.8,     // icosahedron radius
  axisRadius: 0.25,    // tube radius
  totalHeight: 24.5,   // nodeCount * nodeSpacing
  orbitDistance: 11,   // camera → axis
  orbitStartY: 10,     // camera Y at top of scroll
  orbitEndY: -16,      // camera Y at bottom of scroll
} as const;

// Indices of nodes that carry project modules (skip 0 and 7 for visual breathing)
export const MODULE_NODES = [1, 2, 3, 4, 5, 6] as const;
