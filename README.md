# Sandro Schillaci — Architecture Liquide

Portfolio immersif WebGL. 5 scènes traversées par caméra continue, palette froide + amber sodium, prismes verre, constellation skills, portails projets.

## Stack

Next.js 16 · React 19 · TypeScript strict · React Three Fiber 9 · drei 10 · postprocessing · GSAP · Lenis · Zustand · framer-motion · Tailwind v4

## Local

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
```

## Structure

```
src/
  app/            layout, globals, page
  components/
    canvas/       R3F (CanvasRoot, MainScene, PostFX, primitives, scenes)
    sections/     overlays HTML (Hub, About, Skills, Projects, Contact)
    hud/          HUD vertical, progress, scene indicator, audio toggle
  data/           projects, skills
  lib/            constants (palette, scenes, perf tiers)
  store/          Zustand global state
  hooks/          useViewport, useReducedMotion
```

## Scènes

| # | Scene    | z range      |
|---|----------|--------------|
| 1 | Hub      | 0 → 18       |
| 2 | About    | -22 → -38    |
| 3 | Skills   | -56 → -86    |
| 4 | Projects | -110 → -150  |
| 5 | Outro    | -170 → -190  |

## Performance

- Mobile : DPR 1.5, dust 200, no postFX, camera disabled
- Desktop : DPR 2, dust 1500, postFX (bloom + CA + vignette + noise)
- `prefers-reduced-motion` : native scroll, frameloop demand, camera locked

## Déploiement

Vercel — branche `main`.

---

© 2026 Sandro Schillaci · Lille
