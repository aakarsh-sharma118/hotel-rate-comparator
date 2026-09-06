import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResultsList } from '../src/components/SearchResultsList';
import { useHotelStore } from '../src/store/useHotelStore';
import { PAGE_STRINGS, STORAGE_KEYS, loadJsonFromStorage } from '../src/constants/appConsts';

describe('SearchResultsList Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useHotelStore.setState({
      city: 'Goa',
      viewMode: 'grid',
      sortBy: 'cheapest',
      supplierFilter: 'ALL',
      amenityFilter: null,
      favorites: {},
      backendHotels: [
        {
          hotelId: 'h-1',
          name: 'The Orchid Grand Palace',
          stars: 5,
          location: 'Goa - Waterfront Promenade',
          rateA: 2499,
          rateB: 2199,
          cheaperSupplier: 'Supplier B',
          price: 2199,
          savings: 300,
          image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
          amenities: ['Free High-Speed WiFi', 'Complimentary Breakfast'],
        },
      ],
    });
  });

  it('renders loading skeletons when isLoading is true', () => {
    render(
      <SearchResultsList
        isLoading={true}
        result={null}
        error={null}
        city="Goa"
      />
    );

    const skeletonCards = document.querySelectorAll('.skeleton-card');
    expect(skeletonCards.length).toBeGreaterThanOrEqual(3);
  });

  it('renders dedicated no-results-found message when search returns NO_HOTELS_FOUND', () => {
    const emptyResult = {
      success: false,
      status: 'NO_HOTELS_FOUND' as const,
      bestDeal: null,
      allOffers: [],
      supplierA: { status: 'EMPTY' as const, count: 0 },
      supplierB: { status: 'EMPTY' as const, count: 0 },
      workflowId: 'test-wf-empty',
      city: 'UnknownCity',
      checkIn: '2026-10-01',
      checkOut: '2026-10-05',
    };

    render(
      <SearchResultsList
        isLoading={false}
        result={emptyResult}
        error={null}
        city="UnknownCity"
      />
    );

    expect(screen.getByTestId('no-results-found')).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(PAGE_STRINGS.results.emptyState.title, 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(PAGE_STRINGS.results.emptyState.description)
    ).toBeInTheDocument();
    expect(
      screen.getByText(PAGE_STRINGS.results.emptyState.resetButton)
    ).toBeInTheDocument();
  });

  it('clicking a destination pill in empty state updates destination', () => {
    const emptyResult = {
      success: false,
      status: 'NO_HOTELS_FOUND' as const,
      bestDeal: null,
      allOffers: [],
      supplierA: { status: 'EMPTY' as const, count: 0 },
      supplierB: { status: 'EMPTY' as const, count: 0 },
      workflowId: 'test-wf-empty',
      city: 'UnknownCity',
      checkIn: '2026-10-01',
      checkOut: '2026-10-05',
    };

    render(
      <SearchResultsList
        isLoading={false}
        result={emptyResult}
        error={null}
        city="UnknownCity"
      />
    );

    const goaButton = screen.getByRole('button', { name: /Goa/i });
    fireEvent.click(goaButton);
    expect(useHotelStore.getState().city).toBe('Goa');
  });

  it('renders verified hotel cards when results are available', () => {
    render(
      <SearchResultsList
        isLoading={false}
        result={null}
        error={null}
        city="Goa"
      />
    );

    expect(screen.getByTestId('search-results-list')).toBeInTheDocument();
    expect(screen.getByTestId('hotel-card-0')).toBeInTheDocument();
    expect(screen.getByText(/The Orchid Grand Palace/i)).toBeInTheDocument();
  });

  it('persists user favorites in JSON format in localStorage', () => {
    render(
      <SearchResultsList
        isLoading={false}
        result={null}
        error={null}
        city="Goa"
      />
    );

    const favButton = screen.getByRole('button', { name: /Save to favorites/i });
    fireEvent.click(favButton);

    expect(useHotelStore.getState().favorites['h-1']).toBe(true);
    const stored = loadJsonFromStorage<Record<string, boolean>>(STORAGE_KEYS.FAVORITES, {});
    expect(stored['h-1']).toBe(true);
  });
});
