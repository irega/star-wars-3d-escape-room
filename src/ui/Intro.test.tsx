import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Intro } from './Intro';
import '../i18n';

describe('Intro', () => {
  it('renders the game title', () => {
    render(<Intro onStart={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders story context paragraphs', () => {
    render(<Intro onStart={vi.fn()} />);
    expect(screen.getByText(/Rebel Alliance/i)).toBeInTheDocument();
    expect(screen.getByText(/power failure/i)).toBeInTheDocument();
    expect(screen.getByText(/4 puzzles/i)).toBeInTheDocument();
  });

  it('renders the name input field', () => {
    render(<Intro onStart={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the start button', () => {
    render(<Intro onStart={vi.fn()} />);
    expect(screen.getByRole('button', { name: /begin mission/i })).toBeInTheDocument();
  });

  it('calls onStart with default name "Rebel" when no name entered', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Rebel');
  });

  it('calls onStart with entered player name', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await userEvent.type(screen.getByRole('textbox'), 'Han Solo');
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Han Solo');
  });

  it('calls onStart with trimmed name', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await userEvent.type(screen.getByRole('textbox'), '  Luke  ');
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Luke');
  });

  it('calls onStart with "Rebel" when name is only whitespace', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await userEvent.type(screen.getByRole('textbox'), '   ');
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Rebel');
  });
});
