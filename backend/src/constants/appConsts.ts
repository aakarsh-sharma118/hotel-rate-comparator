/**
 * Backend constants and configuration.
 */

export interface HotelCatalogItem {
  hotelId: string;
  name: string;
  stars: number;
  location: string;
  rateA: number;
  rateB: number;
  cheaperSupplier: 'Supplier A' | 'Supplier B';
  price: number;
  savings: number;
  image: string;
  amenities: string[];
}

export const SERVER_CONFIG = {
  DEFAULT_PORT: 3001,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 150, // 150 requests per minute per IP
  DEFAULT_ACTIVITY_TIMEOUT_MS: 5000, // 5 second SLA limit
  TEMPORAL_CONNECT_TIMEOUT: '1500ms' as const,
  DEFAULT_TEMPORAL_ADDRESS: '127.0.0.1:7233',
  MAX_TEMPORAL_CONNECT_ATTEMPTS: 5,
  TASK_QUEUE_NAME: 'hotel-rate-comparator',
  CORS_ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aakarsh-sharma118.github.io',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : []),
  ],
  CORS_ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as string[],
  CORS_ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
};

export const API_CATALOG_DATA = {
  service: 'Hotel Rate Comparator API',
  version: 'v1',
  description: 'Enterprise hotel rate aggregation and verified reservations engine',
  endpoints: {
    catalog: 'GET /api/v1/hotels/catalog?city=...',
    searchHotelsQuery: 'GET /api/v1/hotels/search?city=...&checkIn=...&checkOut=...',
    searchHotelsBody: 'POST /api/v1/hotels/search',
    searchStatus: 'GET /api/v1/hotels/search/:workflowId',
    cancelSearch: 'POST /api/v1/hotels/search/:workflowId/cancel',
    listBookings: 'GET /api/v1/bookings',
    createBooking: 'POST /api/v1/bookings',
    cancelBooking: 'DELETE /api/v1/bookings/:bookingId',
    resetState: 'POST /api/v1/admin/reset-mock-state',
  },
};

export const BACKEND_MESSAGES = {
  rateLimitExceeded: 'Too many requests. Please try again later.',
  missingParameters:
    'Missing or invalid required parameters: valid city, checkIn, and checkOut are mandatory.',
  searchStarted: 'Hotel comparison workflow triggered successfully',
  searchCancelled: 'Search workflow was cancelled by user',
  searchFailed: 'Failed to complete hotel rate comparison workflow',
  supplierResetSuccess:
    'All supplier transient state counters and reservations reset successfully',
  mockStateResetSuccess: 'All supplier transient state counters reset successfully',
  bookingConfirmed: 'Booking confirmed successfully',
  bookingCancelled: (id: string) => `Reservation ${id} cancelled successfully`,
  bookingNotFound: (id: string) => `Reservation ${id} not found`,
};

export const VALIDATION_REGEX = {
  city: /^[a-zA-Z\s,.-]{2,80}$/,
  name: /^[a-zA-Z\u00C0-\u024F\s.'-]{2,60}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\s()-]{7,20}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
};

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
];

export const RECOGNIZED_CITIES = [
  'goa',
  'mumbai',
  'delhi',
  'bangalore',
  'bengaluru',
  'jaipur',
  'agra',
  'udaipur',
  'manali',
  'kochi',
  'kerala',
  'paris',
  'london',
  'tokyo',
  'new york',
  'newyork',
  'dubai',
];

export function isCityRecognized(city: string): boolean {
  if (!city) return false;
  const lower = city.trim().toLowerCase();
  return RECOGNIZED_CITIES.some((c) => lower === c || lower.includes(c) || c.includes(lower));
}

/**
 * Hotel catalog templates.
 */
export const HOTEL_CATALOG_TEMPLATES = [
  {
    nameSuffix: 'Grand Palace & Spa',
    stars: 5,
    locationSuffix: 'Waterfront Promenade (400m to beach)',
    baseRateA: 2499,
    baseRateB: 2199,
    cheaperSupplier: 'Supplier B' as const,
    amenities: ['Free High-Speed WiFi', 'Complimentary Breakfast', 'Free Cancellation'],
    imageIndex: 0,
  },
  {
    nameSuffix: 'Premier Business Suites',
    stars: 4,
    locationSuffix: 'City Center Business District',
    baseRateA: 1850,
    baseRateB: 1990,
    cheaperSupplier: 'Supplier A' as const,
    amenities: ['Spa & Wellness Center', 'City Skyline View', 'Airport Transfer'],
    imageIndex: 1,
  },
  {
    nameSuffix: 'Heritage Boutique Hotel',
    stars: 4,
    locationSuffix: 'Historical Old Quarter',
    baseRateA: 2350,
    baseRateB: 2150,
    cheaperSupplier: 'Supplier B' as const,
    amenities: ['Infinity Pool', '24h Room Service', 'Free Cancellation'],
    imageIndex: 2,
  },
  {
    nameSuffix: 'Royal Waterfront Haveli',
    stars: 5,
    locationSuffix: 'Lakeside Cultural Enclave',
    baseRateA: 2799,
    baseRateB: 3050,
    cheaperSupplier: 'Supplier A' as const,
    amenities: ['Ayurvedic Spa', 'Infinity Pool', 'Complimentary Breakfast'],
    imageIndex: 3,
  },
  {
    nameSuffix: 'Residency Garden Suites',
    stars: 3,
    locationSuffix: 'Green Valley Transit Corridor',
    baseRateA: 1699,
    baseRateB: 1820,
    cheaperSupplier: 'Supplier A' as const,
    amenities: ['Free High-Speed WiFi', 'Fitness Center', 'Free Cancellation'],
    imageIndex: 4,
  },
  {
    nameSuffix: 'Plaza Executive Resort',
    stars: 4,
    locationSuffix: 'Airport Expressway Hub',
    baseRateA: 2950,
    baseRateB: 2650,
    cheaperSupplier: 'Supplier B' as const,
    amenities: ['Airport Transfer', 'Executive Lounge', 'Complimentary Breakfast'],
    imageIndex: 5,
  },
  {
    nameSuffix: 'The Oberoi View Retreat',
    stars: 5,
    locationSuffix: 'Hilltop Scenic Ridge',
    baseRateA: 3450,
    baseRateB: 3180,
    cheaperSupplier: 'Supplier B' as const,
    amenities: ['Mountain View', 'Infinity Pool', 'Complimentary Breakfast'],
    imageIndex: 6,
  },
  {
    nameSuffix: 'Taj Legacy Court',
    stars: 5,
    locationSuffix: 'Royal Botanical Gardens',
    baseRateA: 3890,
    baseRateB: 4120,
    cheaperSupplier: 'Supplier A' as const,
    amenities: ['Butler Service', 'Spa & Wellness Center', 'Fine Dining'],
    imageIndex: 7,
  },
  {
    nameSuffix: 'Seaside Luxury Villas',
    stars: 5,
    locationSuffix: 'Private Golden Sands Bay',
    baseRateA: 2850,
    baseRateB: 2690,
    cheaperSupplier: 'Supplier B' as const,
    amenities: ['Private Beach Access', 'Free Cancellation', 'Ocean View'],
    imageIndex: 8,
  },
  {
    nameSuffix: 'Urban Oasis Hotel',
    stars: 4,
    locationSuffix: 'Metro Downtown Hub',
    baseRateA: 1750,
    baseRateB: 1890,
    cheaperSupplier: 'Supplier A' as const,
    amenities: ['Fitness Center', 'Free High-Speed WiFi', 'City Skyline View'],
    imageIndex: 9,
  },
  {
    nameSuffix: 'Sapphire Boutique Inn',
    stars: 3,
    locationSuffix: 'Art & Heritage Boulevard',
    baseRateA: 1420,
    baseRateB: 1540,
    cheaperSupplier: 'Supplier A' as const,
    amenities: ['Artisan Cafe', 'Free High-Speed WiFi', 'Free Cancellation'],
    imageIndex: 10,
  },
  {
    nameSuffix: 'Crown Imperial Hotel',
    stars: 4,
    locationSuffix: 'Diplomatic Enclave',
    baseRateA: 2620,
    baseRateB: 2480,
    cheaperSupplier: 'Supplier B' as const,
    amenities: ['Executive Lounge', 'Airport Transfer', 'Complimentary Breakfast'],
    imageIndex: 11,
  },
];

/**
 * Hotel catalog by destination.
 */
export function getBackendHotelsForCity(
  city: string,
  priceModifier?: { bestPrice?: number; isSupplierACheaper?: boolean; winningHotelName?: string }
): HotelCatalogItem[] {
  const normalizedCity = city.trim();
  const lowerCity = normalizedCity.toLowerCase();

  // Return empty if unknown or test empty destination
  if (
    lowerCity === 'atlantiscity' ||
    lowerCity === 'emptycity' ||
    lowerCity === 'nowhere' ||
    !isCityRecognized(normalizedCity)
  ) {
    return [];
  }

  const effectiveCity = normalizedCity || 'Goa';

  return HOTEL_CATALOG_TEMPLATES.map((tmpl, idx) => {
    let rateA = tmpl.baseRateA;
    let rateB = tmpl.baseRateB;
    let cheaperSupplier = tmpl.cheaperSupplier;

    // If search comparison result provided overrides for top winning hotel
    if (idx === 0 && priceModifier?.bestPrice) {
      const best = priceModifier.bestPrice < 500 ? Math.round(priceModifier.bestPrice * 6.5) : priceModifier.bestPrice;
      const isA = priceModifier.isSupplierACheaper ?? true;
      cheaperSupplier = isA ? 'Supplier A' : 'Supplier B';
      rateA = isA ? best : Math.round(best * 1.09);
      rateB = isA ? Math.round(best * 1.09) : best;
    }

    const price = Math.min(rateA, rateB);
    const savings = Math.abs(rateA - rateB);
    const hotelName =
      idx === 0 && priceModifier?.winningHotelName
        ? priceModifier.winningHotelName
        : `${effectiveCity} ${tmpl.nameSuffix}`;

    return {
      hotelId: `htl-${effectiveCity.toLowerCase().replace(/\s+/g, '-')}-${idx + 1}`,
      name: hotelName,
      stars: tmpl.stars,
      location: `${effectiveCity} - ${tmpl.locationSuffix}`,
      rateA,
      rateB,
      cheaperSupplier,
      price,
      savings,
      image: HOTEL_IMAGES[tmpl.imageIndex % HOTEL_IMAGES.length],
      amenities: tmpl.amenities,
    };
  });
}
