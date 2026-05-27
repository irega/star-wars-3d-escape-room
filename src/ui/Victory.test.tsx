import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Victory } from './Victory';
import '../i18n';

describe('Victory', () => {
  it('renders victory message with player name', () => {
    render(<Victory playerName="Han" />);
    expect(screen.getByText('Han escaped Detention Block AA-23')).toBeInTheDocument();
  });

  it('renders default player name "Rebel" when playerName is not provided', () => {
    render(<Victory />);
    expect(screen.getByText('Rebel escaped Detention Block AA-23')).toBeInTheDocument();
  });

  it('renders elapsed time when provided', () => {
    render(<Victory time="02:30" />);
    expect(screen.getByText('Time: 02:30')).toBeInTheDocument();
  });

  it('does not render time section when time is not provided', () => {
    render(<Victory />);
    expect(screen.queryByText(/Time:/)).not.toBeInTheDocument();
  });

  it('renders replay button', () => {
    render(<Victory />);
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
  });

  it('calls onReplay when replay button is clicked', async () => {
    const onReplay = vi.fn();
    render(<Victory onReplay={onReplay} />);
    await userEvent.click(screen.getByRole('button', { name: /play again/i }));
    expect(onReplay).toHaveBeenCalledOnce();
  });
});
