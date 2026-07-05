import { create } from "zustand";

interface UIState {
  unreadCount: number;
  showMobileNav: boolean;
  setUnreadCount: (count: number) => void;
  setShowMobileNav: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  unreadCount: 0,
  showMobileNav: false,
  setUnreadCount: (count) => set({ unreadCount: count }),
  setShowMobileNav: (show) => set({ showMobileNav: show }),
}));
