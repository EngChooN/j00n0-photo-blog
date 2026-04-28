import { create } from 'zustand';

type LightboxState = {
  isOpen: boolean;
  postIndex: number;
  photoIndex: number;
  open: (postIndex: number, photoIndex?: number) => void;
  close: () => void;
  setPostIndex: (postIndex: number) => void;
  setPhotoIndex: (photoIndex: number) => void;
};

export const useLightboxStore = create<LightboxState>((set) => ({
  isOpen: false,
  postIndex: 0,
  photoIndex: 0,
  open: (postIndex, photoIndex = 0) =>
    set({ isOpen: true, postIndex, photoIndex }),
  close: () => set({ isOpen: false }),
  setPostIndex: (postIndex) => set({ postIndex }),
  setPhotoIndex: (photoIndex) => set({ photoIndex }),
}));
