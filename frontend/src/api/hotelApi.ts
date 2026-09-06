import axios from 'axios';
import { SearchHotelsParams, SearchWorkflowResult, CancelResponse, HotelCardData } from './types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export const hotelApiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const hotelApi = {
  /**
   * Fetch hotel catalog for a destination.
   */
  getHotelCatalog: async (city: string = 'Goa'): Promise<HotelCardData[]> => {
    const response = await hotelApiClient.get<{ city: string; count: number; hotels: HotelCardData[] }>(
      '/api/v1/hotels/catalog',
      { params: { city } }
    );
    return response.data.hotels || [];
  },
  /**
   * Search hotels.
   */
  searchHotels: async (params: SearchHotelsParams): Promise<SearchWorkflowResult> => {
    // Post if simulations requested
    if (params.simulations) {
      const response = await hotelApiClient.post<SearchWorkflowResult>('/api/v1/hotels/search', params);
      return response.data;
    }

    const response = await hotelApiClient.get<SearchWorkflowResult>('/api/v1/hotels/search', {
      params: {
        city: params.city,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests,
      },
    });
    return response.data;
  },

  cancelSearch: async (workflowId: string): Promise<CancelResponse> => {
    const response = await hotelApiClient.post<CancelResponse>(`/api/v1/hotels/search/${workflowId}/cancel`);
    return response.data;
  },

  getSearchStatus: async (workflowId: string) => {
    const response = await hotelApiClient.get(`/api/v1/hotels/search/${workflowId}`);
    return response.data;
  },

  getBookings: async () => {
    const response = await hotelApiClient.get('/api/v1/bookings');
    return response.data;
  },

  createBooking: async (bookingData: Record<string, any>) => {
    const response = await hotelApiClient.post('/api/v1/bookings', bookingData);
    return response.data;
  },

  cancelBooking: async (bookingId: string) => {
    const response = await hotelApiClient.delete(`/api/v1/bookings/${bookingId}`);
    return response.data;
  },

  resetMockState: async (): Promise<{ message: string }> => {
    const response = await hotelApiClient.post('/api/v1/admin/reset-mock-state');
    return response.data;
  },
};
