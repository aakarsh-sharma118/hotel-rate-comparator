import {
  proxyActivities,
  CancellationScope,
  sleep,
  isCancellation,
  defineSignal,
  setHandler,
  workflowInfo,
  ActivityCancellationType,
} from '@temporalio/workflow';
import type * as activities from '../activities/supplierActivities';
import type { SupplierSearchParams } from '../activities/supplierActivities';
import type { HotelOffer } from '../mockSuppliers/supplierA';

export interface WorkflowOffer extends HotelOffer {
  supplier: 'Supplier A' | 'Supplier B';
}

export interface SupplierExecutionStatus {
  status: 'SUCCESS' | 'FAILED' | 'TIMED_OUT' | 'EMPTY';
  count: number;
  error?: string;
}

export interface SearchWorkflowResult {
  success: boolean;
  status: 'SUCCESS' | 'ERROR' | 'NO_HOTELS_FOUND' | 'CANCELLED';
  bestDeal: WorkflowOffer | null;
  allOffers: WorkflowOffer[];
  supplierA: SupplierExecutionStatus;
  supplierB: SupplierExecutionStatus;
  workflowId: string;
  city: string;
  checkIn: string;
  checkOut: string;
  message?: string;
  error?: string;
}

export interface ActivityOutcome<T = HotelOffer[]> {
  data?: T | null;
  error?: string | null;
  isTimeout?: boolean;
}

// Signal to support mid-way user cancellation
export const cancelSearchSignal = defineSignal('cancelSearch');

// Configure activities with 5s timeout & retry policy (up to 2 retries on transient errors)
const { fetchSupplierA, fetchSupplierB } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5s',
  retry: {
    initialInterval: '100ms',
    maximumAttempts: 3, // Initial attempt + 2 retries = 3 attempts max
    backoffCoefficient: 1.5,
    nonRetryableErrorTypes: ['CancelledError', 'NonRetryableError'],
  },
  cancellationType: ActivityCancellationType.TRY_CANCEL,
});

/**
 * Evaluates hotel rates decision.
 */
export function evaluateHotelRatesDecision(
  outcomeA: ActivityOutcome,
  outcomeB: ActivityOutcome,
  city: string,
  checkIn: string,
  checkOut: string,
  workflowId: string,
  userCancellationRequested: boolean = false
): SearchWorkflowResult {
  if (userCancellationRequested) {
    return {
      success: false,
      status: 'CANCELLED',
      bestDeal: null,
      allOffers: [],
      supplierA: { status: 'FAILED', count: 0, error: 'Cancelled by user' },
      supplierB: { status: 'FAILED', count: 0, error: 'Cancelled by user' },
      workflowId,
      city,
      checkIn,
      checkOut,
      message: 'Workflow cancelled gracefully mid-way by user',
    };
  }

  // Process Supplier A status
  let statusA: SupplierExecutionStatus;
  let offersA: WorkflowOffer[] = [];
  if (outcomeA.isTimeout) {
    statusA = { status: 'TIMED_OUT', count: 0, error: outcomeA.error || 'Timed out (>5s)' };
  } else if (outcomeA.error) {
    statusA = { status: 'FAILED', count: 0, error: outcomeA.error };
  } else if (outcomeA.data && outcomeA.data.length === 0) {
    statusA = { status: 'EMPTY', count: 0 };
  } else if (outcomeA.data && outcomeA.data.length > 0) {
    statusA = { status: 'SUCCESS', count: outcomeA.data.length };
    offersA = outcomeA.data.map((o) => ({ ...o, supplier: 'Supplier A' as const }));
  } else {
    statusA = { status: 'EMPTY', count: 0 };
  }

  // Process Supplier B status
  let statusB: SupplierExecutionStatus;
  let offersB: WorkflowOffer[] = [];
  if (outcomeB.isTimeout) {
    statusB = { status: 'TIMED_OUT', count: 0, error: outcomeB.error || 'Timed out (>5s)' };
  } else if (outcomeB.error) {
    statusB = { status: 'FAILED', count: 0, error: outcomeB.error };
  } else if (outcomeB.data && outcomeB.data.length === 0) {
    statusB = { status: 'EMPTY', count: 0 };
  } else if (outcomeB.data && outcomeB.data.length > 0) {
    statusB = { status: 'SUCCESS', count: outcomeB.data.length };
    offersB = outcomeB.data.map((o) => ({ ...o, supplier: 'Supplier B' as const }));
  } else {
    statusB = { status: 'EMPTY', count: 0 };
  }

  const hasOffersA = offersA.length > 0;
  const hasOffersB = offersB.length > 0;
  const failedA = statusA.status === 'FAILED' || statusA.status === 'TIMED_OUT';
  const failedB = statusB.status === 'FAILED' || statusB.status === 'TIMED_OUT';
  const emptyA = statusA.status === 'EMPTY';
  const emptyB = statusB.status === 'EMPTY';

  // Scenario 5: Both fail -> Return error response
  if (failedA && failedB) {
    return {
      success: false,
      status: 'ERROR',
      bestDeal: null,
      allOffers: [],
      supplierA: statusA,
      supplierB: statusB,
      workflowId,
      city,
      checkIn,
      checkOut,
      error: 'Both suppliers failed to provide hotel rates.',
    };
  }

  // Scenario 7: Both return empty -> Return "No hotels found"
  if ((emptyA && emptyB) || (!hasOffersA && !hasOffersB && !failedA && !failedB)) {
    return {
      success: false,
      status: 'NO_HOTELS_FOUND',
      bestDeal: null,
      allOffers: [],
      supplierA: statusA,
      supplierB: statusB,
      workflowId,
      city,
      checkIn,
      checkOut,
      message: 'No hotels found for the selected city and dates.',
    };
  }

  // Combine all available non-empty offers
  const allOffers: WorkflowOffer[] = [...offersA, ...offersB];

  if (allOffers.length === 0) {
    return {
      success: false,
      status: 'NO_HOTELS_FOUND',
      bestDeal: null,
      allOffers: [],
      supplierA: statusA,
      supplierB: statusB,
      workflowId,
      city,
      checkIn,
      checkOut,
      message: 'No hotels found',
    };
  }

  // Sort offers:
  // 1. Lowest price first
  // 2. Deterministic tie-breaking: Supplier A preferred when rates are identical
  allOffers.sort((x, y) => {
    if (x.price !== y.price) {
      return x.price - y.price;
    }
    // If same price, pick Supplier A deterministically
    if (x.supplier === 'Supplier A' && y.supplier !== 'Supplier A') {
      return -1;
    }
    if (y.supplier === 'Supplier A' && x.supplier !== 'Supplier A') {
      return 1;
    }
    return 0;
  });

  const bestDeal = allOffers[0];

  return {
    success: true,
    status: 'SUCCESS',
    bestDeal,
    allOffers,
    supplierA: statusA,
    supplierB: statusB,
    workflowId,
    city,
    checkIn,
    checkOut,
    message: `Best deal found: ${bestDeal.name} for $${bestDeal.price} via ${bestDeal.supplier}`,
  };
}

/**
 * Executes activity with a timeout.
 */
async function executeActivityWithTimeout<T>(
  activityFn: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<ActivityOutcome<T>> {
  const scope = new CancellationScope();
  let isTimeout = false;

  try {
    const data = await scope.run(async () => {
      const actPromise = activityFn();
      const timerPromise = sleep(timeoutMs).then(() => {
        isTimeout = true;
        scope.cancel();
        throw new Error('Activity timed out (>5 seconds)');
      });
      return await Promise.race([actPromise, timerPromise]);
    });

    return { data, error: null, isTimeout: false };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const timedOut =
      isTimeout ||
      err?.name === 'TimeoutFailure' ||
      errorMsg.includes('timed out') ||
      errorMsg.includes('Activity timed out');
    return { data: null, error: errorMsg, isTimeout: timedOut };
  }
}

/**
 * Workflow for hotel rate comparison.
 */
export async function compareHotelRatesWorkflow(
  params: SupplierSearchParams
): Promise<SearchWorkflowResult> {
  const info = workflowInfo();
  let userCancellationRequested = false;

  setHandler(cancelSearchSignal, () => {
    userCancellationRequested = true;
  });

  try {
    if (userCancellationRequested) {
      return evaluateHotelRatesDecision({}, {}, params.city, params.checkIn, params.checkOut, info.workflowId, true);
    }

    // Trigger Activity A and Activity B in parallel
    const [outcomeA, outcomeB] = await Promise.all([
      executeActivityWithTimeout(() => fetchSupplierA(params), 5000),
      executeActivityWithTimeout(() => fetchSupplierB(params), 5000),
    ]);

    return evaluateHotelRatesDecision(
      outcomeA,
      outcomeB,
      params.city,
      params.checkIn,
      params.checkOut,
      info.workflowId,
      userCancellationRequested
    );
  } catch (err: any) {
    if (isCancellation(err)) {
      return evaluateHotelRatesDecision({}, {}, params.city, params.checkIn, params.checkOut, info.workflowId, true);
    }
    throw err;
  }
}
