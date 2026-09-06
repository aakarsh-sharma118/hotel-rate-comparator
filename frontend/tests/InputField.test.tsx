import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InputField } from '../src/components/common/InputField';

describe('InputField Component', () => {
  it('renders with label and associates with input via id', () => {
    render(<InputField id="city-field" label="Destination City" value="Tokyo" onChange={vi.fn()} />);

    const input = screen.getByLabelText(/destination city/i);
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('Tokyo');
  });

  it('triggers onChange callback when user types', () => {
    const handleChange = vi.fn();
    render(<InputField id="city-field" label="Destination City" value="" onChange={handleChange} />);

    const input = screen.getByLabelText(/destination city/i);
    fireEvent.change(input, { target: { value: 'Paris' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state properly', () => {
    render(<InputField id="city-field" label="Destination City" value="" onChange={vi.fn()} disabled />);

    const input = screen.getByLabelText(/destination city/i);
    expect(input).toBeDisabled();
  });

  it('triggers showPicker and onClick when date input is clicked', () => {
    const handleClick = vi.fn();
    const showPickerMock = vi.fn();
    render(
      <InputField
        id="checkin-field"
        label="Check-in Date"
        type="date"
        value="2026-10-12"
        onChange={vi.fn()}
        onClick={handleClick}
      />
    );

    const input = screen.getByLabelText(/check-in date/i);
    // Attach mock showPicker
    (input as any).showPicker = showPickerMock;

    fireEvent.click(input);
    expect(showPickerMock).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
