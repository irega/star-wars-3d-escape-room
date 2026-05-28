import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HUD } from './HUD';
import '../i18n';

describe('HUD', () => {
  it('renders inventory label', () => {
    render(<HUD inventory={[]} />);
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('renders inventory items', () => {
    render(<HUD inventory={['Keycard', 'Override Code']} />);
    expect(screen.getByText('Keycard')).toBeInTheDocument();
    expect(screen.getByText('Override Code')).toBeInTheDocument();
  });

  it('renders empty inventory with no items listed', () => {
    render(<HUD inventory={[]} />);
    const list = screen.getByRole('list');
    expect(list.children).toHaveLength(0);
  });

  it('renders hint label and text when hint is provided', () => {
    render(<HUD inventory={[]} hint="Check the loose panel" />);
    expect(screen.getByText('Hint')).toBeInTheDocument();
    expect(screen.getByText('Check the loose panel')).toBeInTheDocument();
  });

  it('does not render hint section when hint is absent', () => {
    render(<HUD inventory={[]} />);
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
  });

  it('renders current room label when currentRoom is provided', () => {
    render(<HUD inventory={[]} currentRoom="control-room" />);
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Control Room')).toBeInTheDocument();
  });

  it('does not render location when currentRoom is absent', () => {
    render(<HUD inventory={[]} />);
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });

  it('renders inventory list even when empty so min-height CSS applies to match location container height', () => {
    render(<HUD inventory={[]} currentRoom="control-room" />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(0);
  });

  it('has an aria-live region for screen reader announcements', () => {
    render(<HUD inventory={[]} announcement="Keycard collected" />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveTextContent('Keycard collected');
  });
});
