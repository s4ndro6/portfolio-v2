"use client";

import { create } from "zustand";
import type { SceneId } from "@/lib/constants";

export type GpuTier = 0 | 1 | 2 | 3;

export interface AppState {
  /** Global scroll progress 0-1, driven by Lenis. Mapped to axis t. */
  scrollProgress: number;
  setScrollProgress: (v: number) => void;

  /** Pre-zoom progress, restored when modal closes. */
  scrollProgressBeforeZoom: number | null;
  setScrollProgressBeforeZoom: (v: number | null) => void;

  /** Which scene is currently active, derived from scroll. */
  currentScene: SceneId;
  setCurrentScene: (s: SceneId) => void;

  /** Audio toggle — phase 2 wires this to actual sound; v1 is no-op. */
  audioEnabled: boolean;
  toggleAudio: () => void;

  /** Reduced motion + GPU tier — set once at boot. */
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  gpuTier: GpuTier;
  setGpuTier: (tier: GpuTier) => void;

  /** True until canvas + fonts ready. */
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  /** Currently zoomed project id, or null. */
  openProject: string | null;
  setOpenProject: (id: string | null) => void;

  /** Mouse normalized coords -1..1. */
  mouse: { x: number; y: number };
  setMouse: (x: number, y: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),

  scrollProgressBeforeZoom: null,
  setScrollProgressBeforeZoom: (v) => set({ scrollProgressBeforeZoom: v }),

  currentScene: "hub",
  setCurrentScene: (s) => set({ currentScene: s }),

  audioEnabled: false,
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

  reducedMotion: false,
  setReducedMotion: (v) => set({ reducedMotion: v }),

  gpuTier: 2,
  setGpuTier: (tier) => set({ gpuTier: tier }),

  isLoading: true,
  setIsLoading: (v) => set({ isLoading: v }),

  openProject: null,
  setOpenProject: (id) => set({ openProject: id }),

  mouse: { x: 0, y: 0 },
  setMouse: (x, y) => set({ mouse: { x, y } }),
}));
