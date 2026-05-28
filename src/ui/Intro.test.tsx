import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Intro } from './Intro';
import '../i18n';

vi.mock('../audio/ambientMusic', () => ({
  startAmbientMusic: vi.fn(),
}));

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

  it('keeps start disabled until a name is entered', async () => {
    render(<Intro onStart={vi.fn()} />);
    const start = screen.getByRole('button', { name: /begin mission/i });
    expect(start).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox'), 'Leia');
    expect(start).toBeEnabled();
  });

  it('does not call onStart when name is empty', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    const start = screen.getByRole('button', { name: /begin mission/i });
    await userEvent.click(start);
    expect(onStart).not.toHaveBeenCalled();
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

  it('keeps start disabled when name is only whitespace', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await userEvent.type(screen.getByRole('textbox'), '   ');
    const start = screen.getByRole('button', { name: /begin mission/i });
    expect(start).toBeDisabled();
    await userEvent.click(start);
    expect(onStart).not.toHaveBeenCalled();
  });
});
