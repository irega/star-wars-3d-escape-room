import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlRoomTerminal } from './ControlRoomTerminal';
import '../i18n';

describe('ControlRoomTerminal', () => {
  it('renders input line and closes on button click', async () => {
    const onClose = vi.fn();
    render(<ControlRoomTerminal inputBuffer={['A', 'U']} inputFeedback="none" onClose={onClose} />);

    const panel = screen.getByTestId('control-room-terminal');
    expect(panel).toHaveTextContent('IMPERIAL OVERRIDE SYSTEM');
    expect(panel).toHaveTextContent('> AU_');

    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
