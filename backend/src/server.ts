import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, Client, WorkflowFailedError } from '@temporalio/client';
import { supplierARouter, clearAllSupplierAFailCounters } from './mockSuppliers/supplierA';
import { supplierBRouter, clearAllSupplierBFailCounters } from './mockSuppliers/supplierB';
import {
  compareHotelRatesWorkflow,
  cancelSearchSignal,
  evaluateHotelRatesDecision,
  ActivityOutcome,
  SearchWorkflowResult,
} from './workflows/hotelSearchWorkflow';
import { fetchSupplierA, fetchSupplierB } from './activities/supplierActivities';
import { VALIDATION_MESSAGES } from './constants/validation';
import {
  SERVER_CONFIG,
  API_CATALOG_DATA,
  BACKEND_MESSAGES,
  VALIDATION_REGEX,
  getBackendHotelsForCity,
} from './constants/appConsts';
import {
  sanitizeInput,
  generateWorkflowId,
  isTemporalConnectionError,
  generateBookingId,
} from './utils/utilityManager';

import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.DEFAULT_PORT;

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173', 'ws:'],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: SERVER_CONFIG.CORS_ALLOWED_ORIGINS,
    methods: SERVER_CONFIG.CORS_ALLOWED_METHODS,
    allowedHeaders: SERVER_CONFIG.CORS_ALLOWED_HEADERS,
  })
);
app.use(express.json());

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

app.use((req: Request, res: Response, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + SERVER_CONFIG.RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + SERVER_CONFIG.RATE_LIMIT_WINDOW_MS;
  } else {
    entry.count += 1;
  }

  rateLimitMap.set(ip, entry);

  if (entry.count > SERVER_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: BACKEND_MESSAGES.rateLimitExceeded });
    return;
  }

  next();
});

// Mock supplier routes
app.use('/supplierA', supplierARouter);
app.use('/supplierB', supplierBRouter);

// Reset mock state
app.post('/api/reset-mock-state', (_req: Request, res: Response) => {
  clearAllSupplierAFailCounters();
  clearAllSupplierBFailCounters();
  res.json({ message: BACKEND_MESSAGES.mockStateResetSuccess });
});

// Temporal client
let temporalClient: Client | null = null;

async function getTemporalClient(): Promise<Client> {
  if (temporalClient) return temporalClient;

  const temporalAddress = process.env.TEMPORAL_ADDRESS || SERVER_CONFIG.DEFAULT_TEMPORAL_ADDRESS;
  const connection = await Connection.connect({
    address: temporalAddress,
    connectTimeout: SERVER_CONFIG.TEMPORAL_CONNECT_TIMEOUT,
  });
  temporalClient = new Client({ connection, namespace: 'default' });
  return temporalClient;
}

// Fallback comparison
async function runDirectFallbackComparison(params: {
  city: string;
  checkIn: string;
  checkOut: string;
  simulations?: any;
  workflowId: string;
  supplierAUrl?: string;
  supplierBUrl?: string;
}): Promise<SearchWorkflowResult> {
  const { city, checkIn, checkOut, simulations, workflowId, supplierAUrl, supplierBUrl } = params;
  const timeoutMs = SERVER_CONFIG.DEFAULT_ACTIVITY_TIMEOUT_MS;

  const runWithTimeout = async (fn: () => Promise<any[]>): Promise<ActivityOutcome> => {
    try {
      const data = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Activity timed out (>5s)')), timeoutMs)
        ),
      ]);
      return { data };
    } catch (err: any) {
      const isTimeout = err.message?.includes('timed out');
      return {
        error: err.message,
        isTimeout,
      };
    }
  };

  const [outcomeA, outcomeB] = await Promise.all([
    runWithTimeout(() => fetchSupplierA({ city, checkIn, checkOut, simulations, supplierAUrl })),
    runWithTimeout(() => fetchSupplierB({ city, checkIn, checkOut, simulations, supplierBUrl })),
  ]);

  return evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Reservations storage
export interface BookingRecord {
  id: string;
  hotelId: string;
  hotelName: string;
  city: string;
  supplier: 'SupplierA' | 'SupplierB';
  price: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

const confirmedBookings: BookingRecord[] = [];

// Search handler
async function handleHotelSearch(
  params: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    simulations?: any;
    waitForResult?: boolean | string;
    workflowId?: string;
  },
  res: Response
): Promise<void> {
  const { city, checkIn, checkOut, simulations } = params;
  const waitForResult = params.waitForResult === 'false' || params.waitForResult === false ? false : true;

  const rawCity = sanitizeInput(String(city || ''));
  const sanitizedCity = rawCity.substring(0, 80);
  const sanitizedCheckIn = sanitizeInput(String(checkIn || ''));
  const sanitizedCheckOut = sanitizeInput(String(checkOut || ''));

  if (
    !sanitizedCity ||
    !sanitizedCheckIn ||
    !sanitizedCheckOut ||
    !VALIDATION_REGEX.city.test(sanitizedCity)
  ) {
    res.status(400).json({
      error: BACKEND_MESSAGES.missingParameters,
    });
    return;
  }

  const workflowId = params.workflowId || generateWorkflowId(sanitizedCity);

  try {
    const client = await getTemporalClient();

    const handle = await client.workflow.start(compareHotelRatesWorkflow, {
      taskQueue: SERVER_CONFIG.TASK_QUEUE_NAME,
      workflowId,
      args: [
        {
          city: sanitizedCity,
          checkIn: sanitizedCheckIn,
          checkOut: sanitizedCheckOut,
          simulations,
        },
      ],
    });

    console.log(`[Server] Started Temporal workflow: ${workflowId}`);

    // If client requested async start, return workflowId immediately
    if (waitForResult === false) {
      res.status(202).json({
        workflowId,
        message: BACKEND_MESSAGES.searchStarted,
      });
      return;
    }

    // Wait for the workflow result (with 2.5s worker timeout fallback if no worker is running)
    const result = await Promise.race([
      handle.result(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Temporal worker queue wait timeout')), 2500)
      ),
    ]);

    if (result.status === 'ERROR') {
      res.status(500).json(result);
      return;
    }

    const hotels =
      result.status === 'SUCCESS' && result.bestDeal
        ? getBackendHotelsForCity(sanitizedCity, {
            bestPrice: result.bestDeal.price,
            isSupplierACheaper: result.bestDeal.supplier === 'Supplier A',
            winningHotelName: result.bestDeal.name,
          })
        : [];

    res.status(200).json({ ...result, hotels });
  } catch (error: any) {
    // If workflow was cancelled
    if (error.name === 'WorkflowFailedError' && error.cause?.name === 'CancelledError') {
      res.status(499).json({
        status: 'CANCELLED',
        workflowId,
        message: BACKEND_MESSAGES.searchCancelled,
      });
      return;
    }

    // Temporal offline fallback
    if (isTemporalConnectionError(error)) {
      console.warn(
        `[Server] Temporal server offline (${error.message}). Executing direct rate comparison fallback for ${workflowId}...`
      );
      try {
        const localPort = (res.req?.socket as any)?.localPort || PORT;
        const fallbackResult = await runDirectFallbackComparison({
          city: sanitizedCity,
          checkIn: sanitizedCheckIn,
          checkOut: sanitizedCheckOut,
          simulations,
          workflowId,
          supplierAUrl: process.env.SUPPLIER_A_URL || `http://localhost:${localPort}/supplierA/hotels`,
          supplierBUrl: process.env.SUPPLIER_B_URL || `http://localhost:${localPort}/supplierB/hotels`,
        });

        const fallbackHotels =
          fallbackResult.status === 'SUCCESS' && fallbackResult.bestDeal
            ? getBackendHotelsForCity(sanitizedCity, {
                bestPrice: fallbackResult.bestDeal.price,
                isSupplierACheaper: fallbackResult.bestDeal.supplier === 'Supplier A',
                winningHotelName: fallbackResult.bestDeal.name,
              })
            : [];

        res.status(200).json({ ...fallbackResult, hotels: fallbackHotels });
        return;
      } catch (fallbackError: any) {
        console.error(`[Server] Fallback comparison error:`, fallbackError);
      }
    }

    console.error(`[Server] Error executing workflow ${workflowId}:`, error);
    res.status(500).json({
      error: error?.message || BACKEND_MESSAGES.searchFailed,
      workflowId,
    });
  }
}

// Hotel catalog endpoint
app.get('/api/v1/hotels/catalog', (req: Request, res: Response): void => {
  const rawCity = sanitizeInput(String(req.query.city || 'Goa'));
  const sanitizedCity = rawCity.substring(0, 80) || 'Goa';
  const hotels = getBackendHotelsForCity(sanitizedCity);
  res.status(200).json({
    city: sanitizedCity,
    count: hotels.length,
    hotels,
  });
});

// Search hotels endpoints
app.get('/api/v1/hotels/search', async (req: Request, res: Response): Promise<void> => {
  await handleHotelSearch(req.query as any, res);
});

app.post('/api/v1/hotels/search', async (req: Request, res: Response): Promise<void> => {
  await handleHotelSearch(req.body, res);
});

app.post('/api/search-hotels', async (req: Request, res: Response): Promise<void> => {
  await handleHotelSearch(req.body, res);
});

// Cancel search endpoints
const cancelSearchHandler = async (req: Request, res: Response): Promise<void> => {
  const workflowId = req.params.workflowId as string;

  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);

    // Send the cancellation signal and request cancellation
    await Promise.allSettled([
      handle.signal(cancelSearchSignal),
      handle.cancel(),
    ]);

    console.log(`[Server] Cancel signal sent to workflow: ${workflowId}`);
    res.status(200).json({
      workflowId,
      status: 'CANCEL_REQUESTED',
      message: `Workflow ${workflowId} cancellation triggered successfully`,
    });
  } catch (error: any) {
    console.error(`[Server] Failed to cancel workflow ${workflowId}:`, error);
    res.status(500).json({
      error: `Failed to cancel workflow ${workflowId}: ${error?.message || error}`,
    });
  }
};
app.post('/api/v1/hotels/search/:workflowId/cancel', cancelSearchHandler);
app.post('/api/cancel-search/:workflowId', cancelSearchHandler);

// Search status endpoints
const searchStatusHandler = async (req: Request, res: Response): Promise<void> => {
  const workflowId = req.params.workflowId as string;

  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    const description = await handle.describe();

    let result = null;
    if (description.status.name === 'COMPLETED') {
      result = await handle.result();
    }

    res.status(200).json({
      workflowId,
      status: description.status.name,
      result,
    });
  } catch (error: any) {
    res.status(404).json({
      error: `Workflow ${workflowId} not found or query failed: ${error?.message || error}`,
    });
  }
};
app.get('/api/v1/hotels/search/:workflowId', searchStatusHandler);
app.get('/api/search-status/:workflowId', searchStatusHandler);

// Reservations endpoints
app.get('/api/v1/bookings', (_req: Request, res: Response): void => {
  res.status(200).json({
    bookings: confirmedBookings,
    count: confirmedBookings.length,
  });
});

app.post('/api/v1/bookings', (req: Request, res: Response): void => {
  const { hotelId, hotelName, city, supplier, price, guestName, guestEmail, guestPhone, checkIn, checkOut, guests } = req.body;

  const cleanName = sanitizeInput(String(guestName || ''));
  const cleanEmail = sanitizeInput(String(guestEmail || ''));
  const cleanPhone = sanitizeInput(String(guestPhone || ''));
  const cleanCity = sanitizeInput(String(city || ''));

  if (!cleanName || !VALIDATION_REGEX.name.test(cleanName)) {
    res.status(400).json({ error: VALIDATION_MESSAGES.nameInvalid });
    return;
  }
  if (!cleanEmail || !VALIDATION_REGEX.email.test(cleanEmail)) {
    res.status(400).json({ error: VALIDATION_MESSAGES.emailInvalid });
    return;
  }
  if (!cleanPhone || !VALIDATION_REGEX.phone.test(cleanPhone)) {
    res.status(400).json({ error: VALIDATION_MESSAGES.phoneInvalid });
    return;
  }

  const newBooking: BookingRecord = {
    id: generateBookingId(),
    hotelId: sanitizeInput(String(hotelId || 'HTL-GEN')),
    hotelName: sanitizeInput(String(hotelName || 'Verified Hotel')),
    city: cleanCity,
    supplier: supplier === 'SupplierB' ? 'SupplierB' : 'SupplierA',
    price: Number(price) || 2500,
    guestName: cleanName,
    guestEmail: cleanEmail,
    guestPhone: cleanPhone,
    checkIn: sanitizeInput(String(checkIn || '')),
    checkOut: sanitizeInput(String(checkOut || '')),
    guests: sanitizeInput(String(guests || '2 Adults')),
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  confirmedBookings.unshift(newBooking);
  res.status(201).json({
    message: BACKEND_MESSAGES.bookingConfirmed,
    booking: newBooking,
  });
});

app.delete('/api/v1/bookings/:bookingId', (req: Request, res: Response): void => {
  const bookingId = String(req.params.bookingId);
  const booking = confirmedBookings.find((b) => b.id === bookingId);
  if (!booking) {
    res.status(404).json({ error: BACKEND_MESSAGES.bookingNotFound(bookingId) });
    return;
  }
  booking.status = 'CANCELLED';
  res.status(200).json({ message: BACKEND_MESSAGES.bookingCancelled(bookingId), booking });
});

// Admin reset endpoint
app.post('/api/v1/admin/reset-mock-state', (_req: Request, res: Response): void => {
  clearAllSupplierAFailCounters();
  clearAllSupplierBFailCounters();
  confirmedBookings.length = 0;
  res.json({ message: BACKEND_MESSAGES.supplierResetSuccess });
});

// API catalog
app.get('/api/v1', (_req: Request, res: Response): void => {
  res.json(API_CATALOG_DATA);
});

if (require.main === module || process.argv[1]?.includes('server.ts')) {
  app.listen(PORT, () => {
    console.log(`[Server] Hotel Rate Comparator API listening on http://localhost:${PORT}`);
    console.log(`[Server] Mock Supplier A available at http://localhost:${PORT}/supplierA/hotels`);
    console.log(`[Server] Mock Supplier B available at http://localhost:${PORT}/supplierB/hotels`);
  });
}

export default app;
