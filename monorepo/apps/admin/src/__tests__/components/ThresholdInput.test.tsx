import { render, screen, fireEvent } from '@testing-library/react';
import { ThresholdInput } from '@/components/ThresholdInput';
import { vi } from 'vitest';

describe('ThresholdInput', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('should call onChange with valid number input', () => {
    render(<ThresholdInput value={50} onChange={onChange} />);

    // Use placeholder or display value to find input in new design
    // The new design has a label "Alert Threshold"
    const input = screen.getByLabelText(/Alert Threshold/i);
    
    fireEvent.change(input, { target: { value: '75' } });

    expect(onChange).toHaveBeenCalledWith(75);
  });

  it('should not call onChange with invalid number outside range', () => {
    render(<ThresholdInput value={50} onChange={onChange} min={20} max={90} />);

    const input = screen.getByLabelText(/Alert Threshold/i);

    fireEvent.change(input, { target: { value: '100' } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '10' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not call onChange with non-numeric input', () => {
    render(<ThresholdInput value={50} onChange={onChange} />);

    const input = screen.getByLabelText(/Alert Threshold/i);
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should clamp value to min on blur when below range', () => {
    render(<ThresholdInput value={50} onChange={onChange} min={20} max={90} />);

    const input = screen.getByLabelText(/Alert Threshold/i);
    fireEvent.change(input, { target: { value: '10' } });

    // Check that onChange was not called during change (value is invalid)
    expect(onChange).not.toHaveBeenCalled();

    // Fire blur event - this should trigger clamping
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('should clamp value to max on blur when above range', () => {
    render(<ThresholdInput value={50} onChange={onChange} min={20} max={90} />);

    const input = screen.getByLabelText(/Alert Threshold/i);
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(90);
  });
  
  it('should handle decimal values', () => {
    render(<ThresholdInput value={50} onChange={onChange} />);

    const input = screen.getByLabelText(/Alert Threshold/i);
    fireEvent.change(input, { target: { value: '75.5' } });

    expect(onChange).toHaveBeenCalledWith(75.5);
  });
});
