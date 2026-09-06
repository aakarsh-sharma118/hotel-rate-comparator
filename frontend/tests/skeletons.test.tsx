import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HotelCardSkeleton } from '../src/components/skeletons/HotelCardSkeleton';
import { HotelListSkeleton } from '../src/components/skeletons/HotelListSkeleton';

describe('Skeletons Component Suite', () => {
  it('renders HotelCardSkeleton in default grid view', () => {
    render(<HotelCardSkeleton viewMode="grid" />);
    expect(screen.getByTestId('hotel-card-skeleton-grid')).toBeInTheDocument();
  });

  it('renders HotelCardSkeleton in horizontal list view', () => {
    render(<HotelCardSkeleton viewMode="list" />);
    expect(screen.getByTestId('hotel-card-skeleton-list')).toBeInTheDocument();
  });

  it('renders HotelListSkeleton with correct count of items in grid view', () => {
    render(<HotelListSkeleton count={3} viewMode="grid" isDark={false} />);
    const listWrapper = screen.getByTestId('hotel-list-skeleton');
    expect(listWrapper).toHaveClass('hotel-cards-grid');
    const items = screen.getAllByTestId('hotel-card-skeleton-grid');
    expect(items).toHaveLength(3);
  });

  it('renders HotelListSkeleton in list view with dark theme', () => {
    render(<HotelListSkeleton count={4} viewMode="list" isDark={true} />);
    const listWrapper = screen.getByTestId('hotel-list-skeleton');
    expect(listWrapper).toHaveClass('hotel-cards-list-view');
    const items = screen.getAllByTestId('hotel-card-skeleton-list');
    expect(items).toHaveLength(4);
  });
});
