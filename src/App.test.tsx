import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { useGameStore } from './stores/useGameStore';
import './i18n';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
  useFrame: () => {},
}));

vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  ContactShadows: () => null,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('App', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('renders the app container', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  it('does not render the canvas during intro', () => {
    render(<App />);
    expect(screen.queryByTestId('canvas-mock')).not.toBeInTheDocument();
  });

  it('renders the canvas when phase is playing', () => {
    useGameStore.setState({ phase: 'playing', playerName: 'Test' });
    render(<App />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('does not render the canvas on victory', () => {
    useGameStore.setState({ phase: 'won', playerName: 'Test' });
    render(<App />);
    expect(screen.queryByTestId('canvas-mock')).not.toBeInTheDocument();
  });

  it('renders the inventory HUD', () => {
    render(<App />);
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });
});
