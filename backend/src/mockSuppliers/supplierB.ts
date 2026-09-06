import { Router, Request, Response } from 'express';
import { HotelOffer } from './supplierA';

// Failure counter
const failCountersB: Record<string, number> = {};

export function resetSupplierBFailCounter(key: string = 'default'): void {
  delete failCountersB[key];
}

export function clearAllSupplierBFailCounters(): void {
  for (const key in failCountersB) {
    delete failCountersB[key];
  }
}

export const supplierBRouter = Router();

import { isCityRecognized } from '../constants/appConsts';

// Default hotels
export const defaultSupplierBHotels: Record<string, HotelOffer[]> = {
  goa: [
    { hotelId: 'h-goa-101', name: 'Goa Grand Palace & Spa', price: 395, city: 'Goa' },
    { hotelId: 'h-goa-102', name: 'Goa Premier Business Suites', price: 275, city: 'Goa' },
    { hotelId: 'h-goa-103', name: 'Goa Heritage Boutique Hotel', price: 365, city: 'Goa' },
  ],
  mumbai: [
    { hotelId: 'h-mum-101', name: 'Mumbai Grand Palace & Spa', price: 365, city: 'Mumbai' },
    { hotelId: 'h-mum-102', name: 'Mumbai Marine Suites', price: 325, city: 'Mumbai' },
  ],
  delhi: [
    { hotelId: 'h-del-101', name: 'Delhi Imperial Court', price: 355, city: 'Delhi' },
    { hotelId: 'h-del-102', name: 'Delhi Heritage Haveli', price: 280, city: 'Delhi' },
  ],
  jaipur: [
    { hotelId: 'h-jai-101', name: 'Jaipur Palace & Spa', price: 310, city: 'Jaipur' },
    { hotelId: 'h-jai-102', name: 'Jaipur Royal Fort Inn', price: 285, city: 'Jaipur' },
  ],
  bengaluru: [
    { hotelId: 'h-blr-101', name: 'Bengaluru Silicon Suites', price: 305, city: 'Bengaluru' },
    { hotelId: 'h-blr-102', name: 'Bengaluru Garden Palace', price: 315, city: 'Bengaluru' },
  ],
  bangalore: [
    { hotelId: 'h-blr-101', name: 'Bengaluru Silicon Suites', price: 305, city: 'Bangalore' },
    { hotelId: 'h-blr-102', name: 'Bengaluru Garden Palace', price: 315, city: 'Bangalore' },
  ],
  paris: [
    { hotelId: 'h-101', name: 'Le Grand Plaza Paris', price: 170, city: 'Paris' },
    { hotelId: 'h-102', name: 'Seine Riverside Hotel', price: 255, city: 'Paris' },
    { hotelId: 'h-103', name: 'Montmartre Boutique Suites', price: 145, city: 'Paris' },
  ],
  newyork: [
    { hotelId: 'h-201', name: 'Manhattan Grand Central', price: 275, city: 'New York' },
    { hotelId: 'h-202', name: 'Broadway Skyline Hotel', price: 280, city: 'New York' },
  ],
  tokyo: [
    { hotelId: 'h-301', name: 'Shinjuku Imperial Tower', price: 195, city: 'Tokyo' },
    { hotelId: 'h-302', name: 'Shibuya Neon Suites', price: 185, city: 'Tokyo' },
  ],
  london: [
    { hotelId: 'h-401', name: 'The Westminster Palace Inn', price: 215, city: 'London' },
    { hotelId: 'h-402', name: 'Covent Garden Luxury Stay', price: 260, city: 'London' },
  ],
  dubai: [
    { hotelId: 'h-dxb-101', name: 'Dubai Marina Palace', price: 410, city: 'Dubai' },
    { hotelId: 'h-dxb-102', name: 'Dubai Palm Luxury Resort', price: 430, city: 'Dubai' },
  ],
};

supplierBRouter.get('/hotels', async (req: Request, res: Response): Promise<void> => {
  const {
    city = 'paris',
    delay,
    status,
    empty,
    failCount,
    failKey = 'default',
    abort,
    priceOverride,
  } = req.query;

  // Network abort
  if (abort === 'true') {
    req.socket.destroy();
    return;
  }

  // Delay simulation
  if (delay) {
    const delayMs = parseInt(delay as string, 10);
    if (!isNaN(delayMs) && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Error status simulation
  if (status) {
    const statusCode = parseInt(status as string, 10);
    if (!isNaN(statusCode) && statusCode >= 400) {
      res.status(statusCode).json({
        error: `Simulated error from Supplier B with status ${statusCode}`,
        supplier: 'Supplier B',
      });
      return;
    }
  }

  // Transient failure simulation
  if (failCount !== undefined) {
    const maxFailures = parseInt(failCount as string, 10);
    const key = (failKey as string) || 'default';
    const currentCount = failCountersB[key] || 0;

    if (currentCount < maxFailures) {
      failCountersB[key] = currentCount + 1;
      res.status(500).json({
        error: `Transient failure ${currentCount + 1}/${maxFailures} from Supplier B`,
        supplier: 'Supplier B',
        attempt: currentCount + 1,
      });
      return;
    }
    delete failCountersB[key];
  }

  // Empty response simulation
  if (empty === 'true') {
    res.status(200).json([]);
    return;
  }

  // Normal response
  const cityStr = (city as string) || 'paris';
  const cityKey = cityStr.toLowerCase().replace(/\s+/g, '');
  let hotels = defaultSupplierBHotels[cityKey];

  if (!hotels) {
    if (isCityRecognized(cityStr)) {
      hotels = [
        { hotelId: `h-${cityKey}-b1`, name: `${cityStr} Grand Palace & Spa`, price: 395, city: cityStr },
        { hotelId: `h-${cityKey}-b2`, name: `${cityStr} Premier Business Suites`, price: 275, city: cityStr },
      ];
    } else {
      hotels = [];
    }
  }

  const responseData: HotelOffer[] = hotels.map((h) => {
    if (priceOverride !== undefined) {
      return { ...h, price: Number(priceOverride) };
    }
    return { ...h };
  });

  res.status(200).json(responseData);
});
