'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Experience from './Experience';

export default function CanvasRoot() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      shadows
      camera={{ position: [0, 1.6, 6], fov: 60, near: 0.01, far: 300 }}
    >
      <Suspense fallback={null}>
        <Environment preset="night" />
        <Experience />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <ChromaticAberration
          offset={[0.0006, 0.0006]}
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
