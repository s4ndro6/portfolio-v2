'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import World from './World';

export default function CanvasRoot() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      camera={{ position: [0, 8, 12], fov: 55, near: 0.1, far: 300 }}
      shadows={false}
      style={{ touchAction: 'pan-y' }}
    >
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
        <ChromaticAberration
          offset={[0.0008, 0.0008]}
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
