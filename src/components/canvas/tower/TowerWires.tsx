'use client';

import { useMemo } from 'react';
import { BufferAttribute, BufferGeometry, AdditiveBlending } from 'three';
import { TOWER_CONFIG } from '@/data/tower';

/**
 * Lines connecting consecutive tower nodes along the central axis.
 * Emissive amber → bloom-friendly.
 */
export default function TowerWires() {
  const geometry = useMemo(() => {
    const halfH = TOWER_CONFIG.totalHeight / 2;
    const segments = TOWER_CONFIG.nodeCount - 1;
    // Each segment: 2 vertices (start, end) × 3 floats
    const positions = new Float32Array(segments * 2 * 3);

    for (let i = 0; i < segments; i++) {
      const yA = i * TOWER_CONFIG.nodeSpacing - halfH;
      const yB = (i + 1) * TOWER_CONFIG.nodeSpacing - halfH;
      const o = i * 6;
      positions[o + 0] = 0; positions[o + 1] = yA; positions[o + 2] = 0;
      positions[o + 3] = 0; positions[o + 4] = yB; positions[o + 5] = 0;
    }

    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#FFB454"
        transparent
        opacity={0.55}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
