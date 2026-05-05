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
 * Post-processing chain for desktop.
 * Subtle bloom + chromatic aberration + vignette + noise overlay.
 */
export function PostFX() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.42}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.18}
        mipmapBlur
        radius={0.7}
      />
      <ChromaticAberration
        offset={new Vector2(0.0006, 0.0009)}
        radialModulation={false}
        modulationOffset={0}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette eskil={false} offset={0.18} darkness={0.78} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.04} />
    </EffectComposer>
  );
}
