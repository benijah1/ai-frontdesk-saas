import { create } from 'zustand';

interface DemoModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useDemoModal = create<DemoModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
