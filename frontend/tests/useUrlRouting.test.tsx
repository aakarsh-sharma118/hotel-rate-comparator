import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlRouting } from '../src/hooks/useUrlRouting';
import { useHotelStore } from '../src/store/useHotelStore';

describe('useUrlRouting Hook', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    useHotelStore.setState({
      activeTab: 'search',
      city: '',
      checkIn: '',
      checkOut: '',
      guests: '2 Adults',
    });
  });

  it('initializes tab to search when path is root /', () => {
    window.history.pushState({}, '', '/');
    const { result } = renderHook(() => useUrlRouting());
    expect(useHotelStore.getState().activeTab).toBe('search');
    expect(result.current.navigateToTab).toBeDefined();
  });

  it('initializes tab to bookings when path is /bookings', () => {
    window.history.pushState({}, '', '/bookings');
    renderHook(() => useUrlRouting());
    expect(useHotelStore.getState().activeTab).toBe('bookings');
  });

  it('initializes tab to faq when path is /faq', () => {
    window.history.pushState({}, '', '/faq');
    renderHook(() => useUrlRouting());
    expect(useHotelStore.getState().activeTab).toBe('faq');
  });

  it('updates path and history on navigateToTab', () => {
    const { result } = renderHook(() => useUrlRouting());

    act(() => {
      result.current.navigateToTab('bookings');
    });

    expect(window.location.pathname).toBe('/bookings');
    expect(useHotelStore.getState().activeTab).toBe('bookings');

    act(() => {
      result.current.navigateToTab('faq');
    });

    expect(window.location.pathname).toBe('/faq');
    expect(useHotelStore.getState().activeTab).toBe('faq');
  });

  it('syncs search parameters into URL query string', () => {
    const { result } = renderHook(() => useUrlRouting());

    act(() => {
      result.current.syncSearchToUrl({
        city: 'Jaipur',
        checkIn: '2026-09-10',
        checkOut: '2026-09-12',
        guests: 2,
      });
    });

    expect(window.location.search).toContain('city=Jaipur');
    expect(window.location.search).toContain('checkIn=2026-09-10');
    expect(window.location.search).toContain('checkOut=2026-09-12');
  });

  it('auto-triggers search if valid query parameters exist on mount', () => {
    window.history.pushState({}, '', '/?city=Goa&checkIn=2026-09-10&checkOut=2026-09-12&guests=2');
    const onAutoSearch = vi.fn();

    renderHook(() => useUrlRouting({ onAutoSearch }));

    expect(useHotelStore.getState().city).toBe('Goa');
    expect(onAutoSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Goa',
        checkIn: '2026-09-10',
        checkOut: '2026-09-12',
      })
    );
  });
});
