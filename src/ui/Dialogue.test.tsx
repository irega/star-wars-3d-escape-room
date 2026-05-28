import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialogue } from './Dialogue';
import '../i18n';

describe('Dialogue', () => {
  it('renders text when open', () => {
    render(<Dialogue text="Use the Force, Luke." isOpen={true} />);
    expect(screen.getByText('Use the Force, Luke.')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<Dialogue text="Use the Force, Luke." isOpen={false} />);
    expect(screen.queryByText('Use the Force, Luke.')).not.toBeInTheDocument();
  });

  it('renders a close button when open', () => {
    render(<Dialogue text="Use the Force, Luke." isOpen={true} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Dialogue text="Use the Force, Luke." isOpen={true} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(<Dialogue text="Use the Force, Luke." isOpen={true} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when clicking the overlay outside the box', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Dialogue text="Use the Force, Luke." isOpen={true} onClose={onClose} />,
    );
    const overlay = container.firstChild as HTMLElement;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when clicking inside the box', async () => {
    const onClose = vi.fn();
    render(<Dialogue text="Use the Force, Luke." isOpen={true} onClose={onClose} />);
    await userEvent.click(screen.getByText('Use the Force, Luke.'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose on Escape when dialogue is closed', async () => {
    const onClose = vi.fn();
    render(<Dialogue text="Use the Force, Luke." isOpen={false} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });
});
