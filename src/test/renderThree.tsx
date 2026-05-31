import type { ReactElement } from 'react';
import ReactThreeTestRenderer, { type ReactThreeTest } from '@react-three/test-renderer';
import { useGameStore } from '../stores/useGameStore';
import { useInventoryStore } from '../stores/useInventoryStore';
import { useHintStore } from '../stores/useHintStore';
import { useControlRoomTerminalStore } from '../stores/useControlRoomTerminalStore';

type Renderer = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;
type TestInstance = ReactThreeTest.ReactThreeTestInstance;

/** Headless R3F render for unit tests — avoids jsdom "incorrect casing" warnings. */
export async function renderScene(element: ReactElement) {
  return ReactThreeTestRenderer.create(element, { frameloop: 'never' });
}

export async function fireClick(renderer: Renderer, instance: TestInstance) {
  await renderer.fireEvent(instance, 'click');
}

function findInTree(
  node: TestInstance,
  predicate: (node: TestInstance) => boolean,
): TestInstance | null {
  if (predicate(node)) return node;
  for (const child of node.allChildren) {
    const found = findInTree(child, predicate);
    if (found) return found;
  }
  return null;
}

/** Traverse the scene graph by Three.js Object3D.name (InteractiveObject testId). */
export function findByTestId(renderer: Renderer, testId: string): TestInstance {
  const found = findInTree(renderer.scene, (node) => node.instance?.name === testId);
  if (!found) {
    throw new Error(`No InteractiveObject with testId "${testId}" found in scene graph`);
  }
  return found;
}

export function resetAllStores() {
  useGameStore.getState().reset();
  useInventoryStore.getState().reset();
  useHintStore.getState().reset();
  useControlRoomTerminalStore.getState().reset();
}
