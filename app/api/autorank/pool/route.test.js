import { describe, it, afterEach, expect, vi } from 'vitest';
import { GET } from './route.js';

global.fetch = vi.fn();

describe('GET /api/autorank/pool', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns a pool of cars', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ Years: { min_year: '2000', max_year: '2001' } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          Trims: [
            { model_id: '1', model_make_id: 'ford', model_name: 'Focus', model_year: '2000' },
            { model_id: '2', model_make_id: 'ford', model_name: 'Fiesta', model_year: '2000' },
          ],
        }),
      });

    const req = { url: 'http://localhost/api/autorank/pool?stat=horsepower&count=2' };
    const response = await GET(req);
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(2);
    expect(data[0]).toHaveProperty('model_id');
  });
});