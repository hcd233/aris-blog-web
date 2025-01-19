import { create } from 'zustand'

type PopoverType = 'login' | 'theme'

interface PopoverStore {
  open: PopoverType | null
  openPopover: (type: PopoverType) => void
  closePopover: () => void
}

export const usePopover = create<PopoverStore>((set) => ({
  open: null,
  openPopover: (type) => set({ open: type }),
  closePopover: () => set({ open: null }),
})) 