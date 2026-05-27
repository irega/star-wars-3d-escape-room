import { describe, it, expect, beforeEach } from 'vitest';
import { useInventoryStore } from './useInventoryStore';

beforeEach(() => {
  useInventoryStore.getState().reset();
});

describe('useInventoryStore', () => {
  describe('initial state', () => {
    it('starts with no items', () => {
      expect(useInventoryStore.getState().items).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('adds an item to the inventory', () => {
      useInventoryStore.getState().addItem('keycard');
      expect(useInventoryStore.getState().items).toContain('keycard');
    });

    it('does not duplicate an item already in inventory', () => {
      useInventoryStore.getState().addItem('keycard');
      useInventoryStore.getState().addItem('keycard');
      expect(useInventoryStore.getState().items.filter((i) => i === 'keycard')).toHaveLength(1);
    });

    it('can hold multiple distinct items', () => {
      useInventoryStore.getState().addItem('keycard');
      useInventoryStore.getState().addItem('override-code');
      expect(useInventoryStore.getState().items).toContain('keycard');
      expect(useInventoryStore.getState().items).toContain('override-code');
    });
  });

  describe('hasItem', () => {
    it('returns true for a collected item', () => {
      useInventoryStore.getState().addItem('frequency');
      expect(useInventoryStore.getState().hasItem('frequency')).toBe(true);
    });

    it('returns false for an item not in inventory', () => {
      expect(useInventoryStore.getState().hasItem('keycard')).toBe(false);
    });
  });

  describe('removeItem', () => {
    it('removes an item from the inventory', () => {
      useInventoryStore.getState().addItem('override-code');
      useInventoryStore.getState().removeItem('override-code');
      expect(useInventoryStore.getState().hasItem('override-code')).toBe(false);
    });

    it('is a no-op when the item is not in inventory', () => {
      expect(() => useInventoryStore.getState().removeItem('keycard')).not.toThrow();
    });
  });

  describe('reset', () => {
    it('clears all items', () => {
      useInventoryStore.getState().addItem('keycard');
      useInventoryStore.getState().addItem('frequency');

      useInventoryStore.getState().reset();

      expect(useInventoryStore.getState().items).toEqual([]);
    });
  });
});
