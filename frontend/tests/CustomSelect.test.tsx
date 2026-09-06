import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomSelect } from '../src/components/common/CustomSelect';

const OPTIONS = [
  { value: '1 Adult', label: '1 Adult' },
  { value: '2 Adults', label: '2 Adults' },
  { value: '3 Adults', label: '3 Adults' },
];

describe('CustomSelect Component', () => {
  it('renders trigger with current selected label', () => {
    render(
      <CustomSelect
        id="guests-field"
        label="Guests Selection"
        options={OPTIONS}
        value="2 Adults"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('2 Adults')).toBeInTheDocument();
  });

  it('opens dropdown menu on click and invokes onChange when an option is clicked', () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        id="guests-field"
        label="Guests Selection"
        options={OPTIONS}
        value="2 Adults"
        onChange={handleChange}
      />
    );

    // Click trigger
    const trigger = screen.getByRole('button', { name: /guests selection/i });
    fireEvent.click(trigger);

    // Dropdown list should show all options
    const option3 = screen.getByText('3 Adults');
    expect(option3).toBeInTheDocument();

    // Select 3 Adults
    fireEvent.click(option3);
    expect(handleChange).toHaveBeenCalledWith('3 Adults');
  });

  it('supports disabled state', () => {
    render(
      <CustomSelect
        id="guests-field"
        label="Guests Selection"
        options={OPTIONS}
        value="2 Adults"
        onChange={vi.fn()}
        disabled
      />
    );

    const trigger = screen.getByRole('button', { name: /guests selection/i });
    expect(trigger).toBeDisabled();
  });
});
