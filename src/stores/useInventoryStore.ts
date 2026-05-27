import { create } from 'zustand';

export type InventoryItem = 'keycard' | 'override-code' | 'frequency';

interface InventoryState {
  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  removeItem: (item: InventoryItem) => void;
  hasItem: (item: InventoryItem) => boolean;
  reset: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: state.items.includes(item) ? state.items : [...state.items, item],
    })),
  removeItem: (item) =>
    set((state) => ({
      items: state.items.filter((i) => i !== item),
    })),
  hasItem: (item) => get().items.includes(item),
  reset: () => set({ items: [] }),
}));
