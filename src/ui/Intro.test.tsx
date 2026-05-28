import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Intro } from './Intro';
import '../i18n';

vi.mock('../audio/ambientMusic', () => ({
  startAmbientMusic: vi.fn(),
}));

async function skipIntroCrawl() {
  await userEvent.click(screen.getByTestId('skip-crawl'));
}

describe('Intro', () => {
  it('shows long time ago before play intro', () => {
    render(<Intro onStart={vi.fn()} />);
    expect(screen.getByText(/long time ago/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('renders the crawl title after play intro', async () => {
    render(<Intro onStart={vi.fn()} />);
    await userEvent.click(screen.getByTestId('begin-crawl'));
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.queryByText(/long time ago/i)).not.toBeInTheDocument();
  });

  it('renders story context paragraphs after play intro', async () => {
    render(<Intro onStart={vi.fn()} />);
    await userEvent.click(screen.getByTestId('begin-crawl'));
    expect(screen.getByText(/Rebel Alliance/i)).toBeInTheDocument();
    expect(screen.getByText(/power failure/i)).toBeInTheDocument();
    expect(screen.getByText(/4 puzzles/i)).toBeInTheDocument();
  });

  it('renders the name input after skipping the crawl', async () => {
    render(<Intro onStart={vi.fn()} />);
    await skipIntroCrawl();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the start button after skipping the crawl', async () => {
    render(<Intro onStart={vi.fn()} />);
    await skipIntroCrawl();
    expect(screen.getByRole('button', { name: /begin mission/i })).toBeInTheDocument();
  });

  it('calls onStart with default name "Rebel" when no name entered', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await skipIntroCrawl();
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Rebel');
  });

  it('calls onStart with entered player name', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await skipIntroCrawl();
    await userEvent.type(screen.getByRole('textbox'), 'Han Solo');
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Han Solo');
  });

  it('calls onStart with trimmed name', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await skipIntroCrawl();
    await userEvent.type(screen.getByRole('textbox'), '  Luke  ');
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Luke');
  });

  it('calls onStart with "Rebel" when name is only whitespace', async () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} />);
    await skipIntroCrawl();
    await userEvent.type(screen.getByRole('textbox'), '   ');
    await userEvent.click(screen.getByRole('button', { name: /begin mission/i }));
    expect(onStart).toHaveBeenCalledWith('Rebel');
  });
});
