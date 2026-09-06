import { create } from 'zustand';
import { HotelOffer, SearchWorkflowResult, HotelCardData } from '../api/types';
import { hotelApi } from '../api/hotelApi';
import {
  STORAGE_KEYS,
  GST_TAX_RATE,
  loadJsonFromStorage,
  saveJsonToStorage,
} from '../constants/appConsts';
import {
  generateBookingReference,
  generateBookingId,
  calculateTaxAndTotal,
} from '../utils/utilityManager';
import { PAGE_STRINGS } from '../constants/pageStrings';

export type SortOption = 'cheapest' | 'stars' | 'name' | 'favorites';
export type AppTab = 'search' | 'bookings' | 'faq';
export type SupplierFilter = 'ALL' | 'Supplier A' | 'Supplier B';
export type PolicyModalType = 'privacy' | 'terms' | null;

export interface ConfirmedBooking {
  id: string;
  referenceCode: string;
  hotelId: string;
  hotelName: string;
  location: string;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  nightlyRate: number;
  totalPrice: number;
  supplier: string;
  guestName: string;
  guestEmail: string;
  bookedAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  image?: string;
}

interface HotelStoreState {
  // Theme state
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Search form state
  city: string;
  checkIn: string;
  checkOut: string;
  guests: string;

  // Execution state
  activeWorkflowId: string | null;
  cancelStatus: string | null;
  lastSearchResult: SearchWorkflowResult | null;

  // Inventory
  backendHotels: HotelCardData[];
  isLoadingCatalog: boolean;

  // Filters and preferences
  viewMode: 'grid' | 'list';
  sortBy: SortOption;
  supplierFilter: SupplierFilter;
  amenityFilter: string | null;
  favorites: Record<string, boolean>;
  bookingHotel: HotelOffer | null;
  isBookingSuccess: boolean;
  lastConfirmedBooking: ConfirmedBooking | null;

  // Modal state
  policyModal: PolicyModalType;
  setPolicyModal: (modal: PolicyModalType) => void;

  // Bookings
  bookings: ConfirmedBooking[];

  // Actions
  setCity: (city: string) => void;
  setCheckIn: (checkIn: string) => void;
  setCheckOut: (checkOut: string) => void;
  setGuests: (guests: string) => void;
  setActiveWorkflowId: (id: string | null) => void;
  setCancelStatus: (status: string | null) => void;
  setLastSearchResult: (result: SearchWorkflowResult | null) => void;
  setBackendHotels: (hotels: HotelCardData[]) => void;
  fetchCatalogForCity: (city: string) => Promise<void>;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: SortOption) => void;
  setSupplierFilter: (filter: SupplierFilter) => void;
  setAmenityFilter: (amenity: string | null) => void;
  toggleFavorite: (hotelId: string) => void;
  openBookingModal: (hotel: HotelOffer) => void;
  closeBookingModal: () => void;
  confirmBookingWithDetails: (details: { guestName: string; guestEmail: string }) => void;
  cancelBooking: (bookingId: string) => void;
  selectDestination: (city: string) => void;
  resetForm: () => void;
}

// Hydrate stored data
const savedTheme = loadJsonFromStorage<'light' | 'dark'>(
  STORAGE_KEYS.THEME,
  'light'
);

const savedFavorites = loadJsonFromStorage<Record<string, boolean>>(
  STORAGE_KEYS.FAVORITES,
  {}
);

const savedBookings = loadJsonFromStorage<ConfirmedBooking[]>(
  STORAGE_KEYS.BOOKINGS,
  []
);

function applyThemeToDom(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
}

// Sync initial theme
applyThemeToDom(savedTheme || 'light');

export const useHotelStore = create<HotelStoreState>((set, get) => ({
  theme: savedTheme || 'light',
  setTheme: (theme) => {
    applyThemeToDom(theme);
    set({ theme });
    saveJsonToStorage(STORAGE_KEYS.THEME, theme);
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },

  activeTab: 'search',
  setActiveTab: (activeTab) => set({ activeTab }),

  city: '',
  checkIn: '',
  checkOut: '',
  guests: '',

  activeWorkflowId: null,
  cancelStatus: null,
  lastSearchResult: null,

  backendHotels: [],
  isLoadingCatalog: false,

  viewMode: 'grid',
  sortBy: 'cheapest',
  supplierFilter: 'ALL',
  amenityFilter: null,
  favorites: savedFavorites,
  bookingHotel: null,
  isBookingSuccess: false,
  lastConfirmedBooking: null,

  policyModal: null,
  setPolicyModal: (policyModal) => set({ policyModal }),

  bookings: savedBookings,

  setCity: (city) => set({ city }),
  setCheckIn: (checkIn) => set({ checkIn }),
  setCheckOut: (checkOut) => set({ checkOut }),
  setGuests: (guests) => set({ guests }),
  setActiveWorkflowId: (activeWorkflowId) => set({ activeWorkflowId }),
  setCancelStatus: (cancelStatus) => set({ cancelStatus }),
  setLastSearchResult: (lastSearchResult) => {
    set({ lastSearchResult });
    if (lastSearchResult?.hotels && lastSearchResult.hotels.length > 0) {
      set({ backendHotels: lastSearchResult.hotels });
    }
  },
  setBackendHotels: (backendHotels) => set({ backendHotels }),

  fetchCatalogForCity: async (city) => {
    const targetCity = city.trim() || 'Goa';
    set({ isLoadingCatalog: true });
    try {
      const hotels = await hotelApi.getHotelCatalog(targetCity);
      set({ backendHotels: hotels, isLoadingCatalog: false });
    } catch (err) {
      console.warn('[Store] Could not load hotel catalog from backend:', err);
      set({ isLoadingCatalog: false });
    }
  },

  setViewMode: (viewMode) => set({ viewMode }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSupplierFilter: (supplierFilter) => set({ supplierFilter }),
  setAmenityFilter: (amenityFilter) => set({ amenityFilter }),

  toggleFavorite: (hotelId) => {
    const updatedFavorites = {
      ...get().favorites,
      [hotelId]: !get().favorites[hotelId],
    };
    set({ favorites: updatedFavorites });
    saveJsonToStorage(STORAGE_KEYS.FAVORITES, updatedFavorites);
  },

  openBookingModal: (hotel) =>
    set({ bookingHotel: hotel, isBookingSuccess: false, lastConfirmedBooking: null }),
  closeBookingModal: () =>
    set({ bookingHotel: null, isBookingSuccess: false, lastConfirmedBooking: null }),

  confirmBookingWithDetails: ({ guestName, guestEmail }) => {
    const state = get();
    if (!state.bookingHotel) return;

    const { total: totalPrice } = calculateTaxAndTotal(state.bookingHotel.price, GST_TAX_RATE);
    const refCode = generateBookingReference();

    const newBooking: ConfirmedBooking = {
      id: generateBookingId(),
      referenceCode: refCode,
      hotelId: state.bookingHotel.hotelId,
      hotelName: state.bookingHotel.name,
      location: state.bookingHotel.location || `${state.city || 'Goa'} - ${PAGE_STRINGS.common.defaultLocationSuffix}`,
      city: state.city || 'Goa',
      checkIn: state.checkIn || '2026-10-12',
      checkOut: state.checkOut || '2026-10-15',
      guests: state.guests || '2 Adults',
      nightlyRate: state.bookingHotel.price,
      totalPrice,
      supplier: state.bookingHotel.supplier || 'Supplier B',
      guestName,
      guestEmail,
      bookedAt: new Date().toISOString(),
      status: 'CONFIRMED',
      image: state.bookingHotel.image,
    };

    const updatedBookings = [newBooking, ...state.bookings];
    set({
      isBookingSuccess: true,
      lastConfirmedBooking: newBooking,
      bookings: updatedBookings,
    });
    saveJsonToStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);
  },

  cancelBooking: (bookingId) => {
    const updatedBookings = get().bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
    );
    set({ bookings: updatedBookings });
    saveJsonToStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);
  },

  selectDestination: (city) => {
    const targetCity = city.trim();
    set({
      city: targetCity,
      activeTab: 'search',
      lastSearchResult: null,
    });
    get().fetchCatalogForCity(targetCity);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  resetForm: () => {
    set({
      city: '',
      checkIn: '',
      checkOut: '',
      guests: '',
      supplierFilter: 'ALL',
      amenityFilter: null,
      cancelStatus: null,
      lastSearchResult: null,
    });
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
    get().fetchCatalogForCity('Goa');
  },
}));
