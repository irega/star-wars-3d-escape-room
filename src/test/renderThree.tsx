import type { ReactElement } from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';

/** Headless R3F render for unit tests — avoids jsdom "incorrect casing" warnings. */
export async function renderThree(element: ReactElement) {
  return ReactThreeTestRenderer.create(element, { frameloop: 'never' });
}
