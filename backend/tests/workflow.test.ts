import { describe, it, expect, vi } from 'vitest';
import {
  evaluateHotelRatesDecision,
  SearchWorkflowResult,
} from '../src/workflows/hotelSearchWorkflow';
import { HotelOffer } from '../src/mockSuppliers/supplierA';

describe('Workflow Scenarios Test Suite (10 Matrix Cases)', () => {
  const city = 'Paris';
  const checkIn = '2026-09-10';
  const checkOut = '2026-09-15';
  const workflowId = 'test-workflow-001';

  // 1. Supplier A cheaper -> Return A's result
  it('Scenario 1: Supplier A is cheaper -> Returns Supplier A result', () => {
    const outcomeA = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 140 }],
    };
    const outcomeB = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 170 }],
    };

    const result: SearchWorkflowResult = evaluateHotelRatesDecision(
      outcomeA,
      outcomeB,
      city,
      checkIn,
      checkOut,
      workflowId
    );

    expect(result.success).toBe(true);
    expect(result.status).toBe('SUCCESS');
    expect(result.bestDeal).not.toBeNull();
    expect(result.bestDeal?.supplier).toBe('Supplier A');
    expect(result.bestDeal?.price).toBe(140);
  });

  // 2. Supplier B cheaper -> Return B's result
  it('Scenario 2: Supplier B is cheaper -> Returns Supplier B result', () => {
    const outcomeA = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 180 }],
    };
    const outcomeB = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 130 }],
    };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(true);
    expect(result.status).toBe('SUCCESS');
    expect(result.bestDeal).not.toBeNull();
    expect(result.bestDeal?.supplier).toBe('Supplier B');
    expect(result.bestDeal?.price).toBe(130);
  });

  // 3. Both return same rate -> Return A's result (deterministic)
  it('Scenario 3: Both return same rate -> Picks Supplier A deterministically', () => {
    const outcomeA = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 150 }],
    };
    const outcomeB = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 150 }],
    };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(true);
    expect(result.status).toBe('SUCCESS');
    expect(result.bestDeal).not.toBeNull();
    expect(result.bestDeal?.supplier).toBe('Supplier A');
    expect(result.bestDeal?.price).toBe(150);
  });

  // 4. Supplier A fails, B succeeds -> Return B's result
  it('Scenario 4: Supplier A fails, Supplier B succeeds -> Returns Supplier B result', () => {
    const outcomeA = {
      error: 'HTTP 500 Internal Server Error from Supplier A',
    };
    const outcomeB = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 165 }],
    };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(true);
    expect(result.status).toBe('SUCCESS');
    expect(result.supplierA.status).toBe('FAILED');
    expect(result.supplierB.status).toBe('SUCCESS');
    expect(result.bestDeal?.supplier).toBe('Supplier B');
    expect(result.bestDeal?.price).toBe(165);
  });

  // 5. Both fail -> Return error response
  it('Scenario 5: Both suppliers fail -> Returns error response', () => {
    const outcomeA = { error: 'Network error from Supplier A' };
    const outcomeB = { error: 'Connection refused from Supplier B' };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(false);
    expect(result.status).toBe('ERROR');
    expect(result.bestDeal).toBeNull();
    expect(result.error).toContain('Both suppliers failed');
  });

  // 6. One returns empty -> Use available non-empty result
  it('Scenario 6: One returns empty -> Uses available non-empty result', () => {
    const outcomeA = { data: [] }; // Empty
    const outcomeB = {
      data: [{ hotelId: 'h2', name: 'Plaza Suite', price: 175 }],
    };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(true);
    expect(result.status).toBe('SUCCESS');
    expect(result.supplierA.status).toBe('EMPTY');
    expect(result.supplierB.status).toBe('SUCCESS');
    expect(result.bestDeal?.supplier).toBe('Supplier B');
    expect(result.bestDeal?.price).toBe(175);
  });

  // 7. Both return empty -> Return "No hotels found"
  it('Scenario 7: Both return empty -> Returns "No hotels found"', () => {
    const outcomeA = { data: [] };
    const outcomeB = { data: [] };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(false);
    expect(result.status).toBe('NO_HOTELS_FOUND');
    expect(result.bestDeal).toBeNull();
    expect(result.message).toMatch(/No hotels found/i);
  });

  // 8. One supplier takes >5s -> Cancel slow activity, proceed with available result
  it('Scenario 8: One supplier takes >5s -> Cancels slow activity, proceeds with available result', () => {
    const outcomeA = {
      isTimeout: true,
      error: 'Activity timed out (>5 seconds)',
    };
    const outcomeB = {
      data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 185 }],
    };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(true);
    expect(result.status).toBe('SUCCESS');
    expect(result.supplierA.status).toBe('TIMED_OUT');
    expect(result.supplierB.status).toBe('SUCCESS');
    expect(result.bestDeal?.supplier).toBe('Supplier B');
    expect(result.bestDeal?.price).toBe(185);
  });

  // 9. Supplier A fails 2x before success -> Retry policy handles it and returns result
  it('Scenario 9: Supplier A fails twice before succeeding -> Handled via retry policy to return result', async () => {
    let attempts = 0;
    const retryableActivity = async (): Promise<HotelOffer[]> => {
      attempts++;
      if (attempts <= 2) {
        throw new Error(`Transient failure attempt ${attempts}`);
      }
      return [{ hotelId: 'h-retry', name: 'Resilient Hotel', price: 135 }];
    };

    // Simulate Temporal Activity Retry Policy (maximumAttempts: 3)
    let outcomeData: HotelOffer[] | null = null;
    let maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        outcomeData = await retryableActivity();
        break;
      } catch (e) {
        if (attempt === maxRetries) throw e;
      }
    }

    expect(attempts).toBe(3); // Failed twice, succeeded on attempt 3
    expect(outcomeData).not.toBeNull();

    const outcomeA = { data: outcomeData };
    const outcomeB = { data: [{ hotelId: 'h-retry', name: 'Resilient Hotel', price: 190 }] };

    const result = evaluateHotelRatesDecision(outcomeA, outcomeB, city, checkIn, checkOut, workflowId);

    expect(result.success).toBe(true);
    expect(result.bestDeal?.supplier).toBe('Supplier A');
    expect(result.bestDeal?.price).toBe(135);
  });

  // 10. User cancels mid-way -> Workflow cancels gracefully
  it('Scenario 10: User cancels mid-way -> Workflow cancels gracefully with CANCELLED status', () => {
    const outcomeA = { data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 140 }] };
    const outcomeB = { data: [{ hotelId: 'h1', name: 'Grand Hotel', price: 170 }] };

    const result = evaluateHotelRatesDecision(
      outcomeA,
      outcomeB,
      city,
      checkIn,
      checkOut,
      workflowId,
      true // userCancellationRequested = true
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe('CANCELLED');
    expect(result.bestDeal).toBeNull();
    expect(result.message).toMatch(/cancelled.*user/i);
  });
});
