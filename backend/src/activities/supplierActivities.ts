import { Context } from '@temporalio/activity';
import axios from 'axios';
import { HotelOffer } from '../mockSuppliers/supplierA';

export interface SimulationConfig {
  delay?: number;
  status?: number;
  empty?: boolean;
  failCount?: number;
  failKey?: string;
  abort?: boolean;
  priceOverride?: number;
  clientTimeout?: number;
}

export interface SupplierSearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  supplierAUrl?: string;
  supplierBUrl?: string;
  simulations?: {
    supplierA?: SimulationConfig;
    supplierB?: SimulationConfig;
  };
}

export async function fetchSupplierA(params: SupplierSearchParams): Promise<HotelOffer[]> {
  let signal: AbortSignal | undefined;
  try {
    signal = Context.current().cancellationSignal;
  } catch {
    // Fallback outside Temporal context
  }

  const baseUrl =
    params.supplierAUrl ||
    process.env.SUPPLIER_A_URL ||
    `http://localhost:${process.env.PORT || 3001}/supplierA/hotels`;

  const sim = params.simulations?.supplierA || {};

  try {
    const response = await axios.get<HotelOffer[]>(baseUrl, {
      params: {
        city: params.city,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        delay: sim.delay,
        status: sim.status,
        empty: sim.empty ? 'true' : undefined,
        failCount: sim.failCount,
        failKey: sim.failKey,
        abort: sim.abort ? 'true' : undefined,
        priceOverride: sim.priceOverride,
      },
      signal,
      timeout: sim.clientTimeout || 10000,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      throw new Error('Activity fetchSupplierA was cancelled');
    }
    const message = error.response?.data?.error || error.message || 'Unknown error fetching from Supplier A';
    throw new Error(`Supplier A Error: ${message}`);
  }
}

export async function fetchSupplierB(params: SupplierSearchParams): Promise<HotelOffer[]> {
  let signal: AbortSignal | undefined;
  try {
    signal = Context.current().cancellationSignal;
  } catch {
    // Fallback outside Temporal context
  }

  const baseUrl =
    params.supplierBUrl ||
    process.env.SUPPLIER_B_URL ||
    `http://localhost:${process.env.PORT || 3001}/supplierB/hotels`;

  const sim = params.simulations?.supplierB || {};

  try {
    const response = await axios.get<HotelOffer[]>(baseUrl, {
      params: {
        city: params.city,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        delay: sim.delay,
        status: sim.status,
        empty: sim.empty ? 'true' : undefined,
        failCount: sim.failCount,
        failKey: sim.failKey,
        abort: sim.abort ? 'true' : undefined,
        priceOverride: sim.priceOverride,
      },
      signal,
      timeout: sim.clientTimeout || 10000,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      throw new Error('Activity fetchSupplierB was cancelled');
    }
    const message = error.response?.data?.error || error.message || 'Unknown error fetching from Supplier B';
    throw new Error(`Supplier B Error: ${message}`);
  }
}
