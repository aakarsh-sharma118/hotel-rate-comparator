export interface HotelOffer {
  hotelId: string;
  name: string;
  price: number;
  city?: string;
  supplier?: 'Supplier A' | 'Supplier B';
  stars?: number;
  location?: string;
  image?: string;
}

export interface SupplierExecutionStatus {
  status: 'SUCCESS' | 'FAILED' | 'TIMED_OUT' | 'EMPTY';
  count: number;
  error?: string;
}

export interface HotelCardData {
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

export interface SearchWorkflowResult {
  success: boolean;
  status: 'SUCCESS' | 'ERROR' | 'NO_HOTELS_FOUND' | 'CANCELLED';
  bestDeal: HotelOffer | null;
  allOffers: HotelOffer[];
  supplierA: SupplierExecutionStatus;
  supplierB: SupplierExecutionStatus;
  workflowId: string;
  city: string;
  checkIn: string;
  checkOut: string;
  message?: string;
  error?: string;
  hotels?: HotelCardData[];
}

export interface SupplierSimulation {
  delay?: number;
  status?: number;
  empty?: boolean;
  failCount?: number;
  failKey?: string;
  abort?: boolean;
  priceOverride?: number;
}

export interface SimulationOptions {
  supplierA?: SupplierSimulation;
  supplierB?: SupplierSimulation;
}

export interface SearchHotelsParams {
  city: string;
  checkIn: string;
  checkOut: string;
  guests?: string;
  workflowId?: string;
  simulations?: SimulationOptions;
}

export interface CancelResponse {
  workflowId: string;
  status: string;
  message: string;
}
