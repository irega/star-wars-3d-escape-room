import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';
import '../i18n';

describe('Loading', () => {
  it('renders loading message by default', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders loading message when isVisible is true', () => {
    render(<Loading isVisible={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    render(<Loading isVisible={false} />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('has an accessible role for the loading indicator', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
