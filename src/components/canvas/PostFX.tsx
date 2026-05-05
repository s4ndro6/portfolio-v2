"use client";

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

/**
 * Post-processing chain — Active Theory grade tuning.
 * Bloom intensity 0.8, luminanceThreshold 0.4 with mipmapBlur for smooth bloom.
 */
export function PostFX() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.2}
        mipmapBlur
        radius={0.85}
      />
      <ChromaticAberration
        offset={new Vector2(0.0008, 0.0008)}
        radialModulation={false}
        modulationOffset={0}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.85} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.035} />
    </EffectComposer>
  );
}
