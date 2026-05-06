import { create } from 'zustand';

interface Store {
  scroll: number;
  mouseX: number;
  mouseY: number;
  activeProject: string | null;
  setScroll: (n: number) => void;
  setMouse: (x: number, y: number) => void;
  setActive: (id: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  scroll: 0,
  mouseX: 0,
  mouseY: 0,
  activeProject: null,
  setScroll: (scroll) => set({ scroll }),
  setMouse: (mouseX, mouseY) => set({ mouseX, mouseY }),
  setActive: (activeProject) => set({ activeProject }),
}));
