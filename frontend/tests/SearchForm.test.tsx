import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchForm } from '../src/components/SearchForm';

describe('SearchForm Component', () => {
  it('renders all essential input fields and the submit button', () => {
    const handleSearch = vi.fn();
    render(<SearchForm onSearch={handleSearch} isLoading={false} />);

    expect(screen.getByLabelText(/where are you going/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/check-in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/check-out/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guests/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-search-btn')).toBeInTheDocument();
  });

  it('allows user to change the city and submits with updated values', () => {
    const handleSearch = vi.fn();
    render(<SearchForm onSearch={handleSearch} isLoading={false} />);

    const cityInput = screen.getByLabelText(/where are you going/i);
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    expect((cityInput as HTMLInputElement).value).toBe('Paris');

    const submitBtn = screen.getByTestId('submit-search-btn');
    fireEvent.click(submitBtn);

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Paris',
      })
    );
  });

  it('shows inline error message when destination city is empty and does not call onSearch', () => {
    const handleSearch = vi.fn();
    render(<SearchForm onSearch={handleSearch} isLoading={false} />);

    const cityInput = screen.getByLabelText(/where are you going/i);
    fireEvent.change(cityInput, { target: { value: '   ' } });

    const submitBtn = screen.getByTestId('submit-search-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a destination city before searching/i);
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('shows error bubble when destination city is unrecognized and does not call onSearch', () => {
    const handleSearch = vi.fn();
    render(<SearchForm onSearch={handleSearch} isLoading={false} />);

    const cityInput = screen.getByLabelText(/where are you going/i);
    fireEvent.change(cityInput, { target: { value: 'NonExistingCityXYZ' } });

    const submitBtn = screen.getByTestId('submit-search-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/destination city not recognized/i);
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('resets inputs, clears errors, and resets store when reset button is clicked', () => {
    const handleSearch = vi.fn();
    render(<SearchForm onSearch={handleSearch} isLoading={false} />);

    const cityInput = screen.getByLabelText(/where are you going/i);
    fireEvent.change(cityInput, { target: { value: '   ' } });

    const submitBtn = screen.getByTestId('submit-search-btn');
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const resetBtn = screen.getByTitle(/reset form/i);
    fireEvent.click(resetBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables input fields and submit button while loading', () => {
    const handleSearch = vi.fn();
    render(<SearchForm onSearch={handleSearch} isLoading={true} />);

    expect(screen.getByLabelText(/where are you going/i)).toBeDisabled();
    expect(screen.getByLabelText(/check-in/i)).toBeDisabled();
    expect(screen.getByLabelText(/check-out/i)).toBeDisabled();
    expect(screen.getByTestId('submit-search-btn')).toBeDisabled();
    expect(screen.getByText(/comparing\.\.\./i)).toBeInTheDocument();
  });
});
