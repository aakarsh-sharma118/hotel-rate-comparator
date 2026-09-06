import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import axios from 'axios';
import { Server } from 'http';
import { supplierARouter, clearAllSupplierAFailCounters } from '../src/mockSuppliers/supplierA';
import { supplierBRouter, clearAllSupplierBFailCounters } from '../src/mockSuppliers/supplierB';

describe('Mock Suppliers API Tests', () => {
  let app: express.Express;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    clearAllSupplierAFailCounters();
    clearAllSupplierBFailCounters();

    app = express();
    app.use('/supplierA', supplierARouter);
    app.use('/supplierB', supplierBRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });

    return () => {
      server.close();
    };
  });

  describe('Supplier A', () => {
    it('returns default hotels for a valid city', async () => {
      const res = await axios.get(`${baseUrl}/supplierA/hotels?city=Paris`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]).toHaveProperty('hotelId');
      expect(res.data[0]).toHaveProperty('name');
      expect(res.data[0]).toHaveProperty('price');
    });

    it('returns empty array when empty=true', async () => {
      const res = await axios.get(`${baseUrl}/supplierA/hotels?city=Paris&empty=true`);
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('returns 500 when status=500 is requested', async () => {
      await expect(axios.get(`${baseUrl}/supplierA/hotels?city=Paris&status=500`)).rejects.toThrow(
        /500/
      );
    });

    it('simulates transient failure: fails twice before succeeding on 3rd attempt', async () => {
      const failKey = `test-${Date.now()}`;
      const url = `${baseUrl}/supplierA/hotels?city=Paris&failCount=2&failKey=${failKey}`;

      // 1st request -> Fails (500)
      await expect(axios.get(url)).rejects.toThrow(/500/);

      // 2nd request -> Fails (500)
      await expect(axios.get(url)).rejects.toThrow(/500/);

      // 3rd request -> Succeeds (200)
      const res = await axios.get(url);
      expect(res.status).toBe(200);
      expect(res.data.length).toBeGreaterThan(0);
    });

    it('supports controllable latency/delay', async () => {
      const start = Date.now();
      const res = await axios.get(`${baseUrl}/supplierA/hotels?city=Paris&delay=200`);
      const duration = Date.now() - start;
      expect(res.status).toBe(200);
      expect(duration).toBeGreaterThanOrEqual(180);
    });

    it('supports priceOverride parameter', async () => {
      const res = await axios.get(`${baseUrl}/supplierA/hotels?city=Paris&priceOverride=99`);
      expect(res.status).toBe(200);
      expect(res.data[0].price).toBe(99);
    });
    it('returns empty array [] for unknown or unrecognized destination city', async () => {
      const res = await axios.get(`${baseUrl}/supplierA/hotels?city=UnknownCityXYZ123`);
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('returns hotels for Indian destinations such as Goa and Mumbai', async () => {
      const resGoa = await axios.get(`${baseUrl}/supplierA/hotels?city=Goa`);
      expect(resGoa.status).toBe(200);
      expect(resGoa.data.length).toBeGreaterThan(0);
      expect(resGoa.data[0].city).toBe('Goa');
    });
  });

  describe('Supplier B', () => {
    it('returns default hotels for a valid city', async () => {
      const res = await axios.get(`${baseUrl}/supplierB/hotels?city=Paris`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
    });

    it('returns empty array [] for unknown or unrecognized destination city', async () => {
      const res = await axios.get(`${baseUrl}/supplierB/hotels?city=UnknownCityXYZ123`);
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('returns empty array when empty=true', async () => {
      const res = await axios.get(`${baseUrl}/supplierB/hotels?city=Paris&empty=true`);
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('returns 500 when status=500 is requested', async () => {
      await expect(axios.get(`${baseUrl}/supplierB/hotels?city=Paris&status=500`)).rejects.toThrow(
        /500/
      );
    });

    it('simulates transient failure: fails twice before succeeding on 3rd attempt', async () => {
      const failKey = `test-b-${Date.now()}`;
      const url = `${baseUrl}/supplierB/hotels?city=Paris&failCount=2&failKey=${failKey}`;

      await expect(axios.get(url)).rejects.toThrow(/500/);
      await expect(axios.get(url)).rejects.toThrow(/500/);

      const res = await axios.get(url);
      expect(res.status).toBe(200);
      expect(res.data.length).toBeGreaterThan(0);
    });
  });
});
