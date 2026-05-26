import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// R3F Canvas requires WebGL — mock it for unit tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
}));

describe('App', () => {
  it('renders the app container', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  it('renders the canvas', () => {
    render(<App />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });
});
