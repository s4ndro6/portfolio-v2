import { create } from 'zustand';

export type Chapter = 'intro' | 'tower' | 'project' | 'contact';

interface Store {
  // Scroll
  scrollProgress: number;
  chapter: Chapter;

  // Mouse (-1 to 1, normalized)
  mouseX: number;
  mouseY: number;

  // Active project
  activeProject: string | null;
  isEnteringProject: boolean;
  isInsideProject: boolean;

  // Hover
  hoveredModule: string | null;

  // Actions
  setScroll: (p: number) => void;
  setChapter: (c: Chapter) => void;
  setMouse: (x: number, y: number) => void;
  enterProject: (id: string) => void;
  exitProject: () => void;
  setHovered: (id: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  scrollProgress: 0,
  chapter: 'intro',
  mouseX: 0,
  mouseY: 0,
  activeProject: null,
  isEnteringProject: false,
  isInsideProject: false,
  hoveredModule: null,

  setScroll: (scrollProgress) => {
    let chapter: Chapter = 'intro';
    if (scrollProgress > 0.08 && scrollProgress < 0.75) chapter = 'tower';
    else if (scrollProgress >= 0.75) chapter = 'contact';
    set({ scrollProgress, chapter });
  },
  setChapter: (chapter) => set({ chapter }),
  setMouse: (mouseX, mouseY) => set({ mouseX, mouseY }),

  enterProject: (id) => {
    set({ activeProject: id, isEnteringProject: true });
    if (typeof window !== 'undefined') {
      window.setTimeout(
        () => set({ isEnteringProject: false, isInsideProject: true }),
        1500,
      );
    }
  },
  exitProject: () => {
    set({ isInsideProject: false, isEnteringProject: true });
    if (typeof window !== 'undefined') {
      window.setTimeout(
        () => set({ isEnteringProject: false, activeProject: null }),
        1000,
      );
    }
  },
  setHovered: (hoveredModule) => set({ hoveredModule }),
}));
