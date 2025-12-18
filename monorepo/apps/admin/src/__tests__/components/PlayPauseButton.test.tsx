import { render, screen, fireEvent } from '@testing-library/react';
import { PlayPauseButton } from '@/components/PlayPauseButton';
import { vi } from 'vitest';

describe('PlayPauseButton', () => {
  const onToggle = vi.fn();

  beforeEach(() => {
    onToggle.mockClear();
  });

  it('should call onToggle when clicked', () => {
    render(<PlayPauseButton isPaused={false} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when isDisabled is true', () => {
    render(<PlayPauseButton isPaused={false} onToggle={onToggle} isDisabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onToggle when disabled', () => {
    render(<PlayPauseButton isPaused={false} onToggle={onToggle} isDisabled={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onToggle).not.toHaveBeenCalled();
  });
});
