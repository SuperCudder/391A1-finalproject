/**
 * Author: Lucas Lotze
 */

import { describe, it, afterEach, expect, vi } from 'vitest';
import { GET } from './route.js';

global.fetch = vi.fn();

describe('GET /api/autoguessr/random-car', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns a random car with model_id, make, model, year', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Years: { min_year: '2000', max_year: '2001' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Makes: [{ make_id: 'ford' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Models: [{ model_name: 'Focus' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Trims: [
            {
              model_id: '123',
              model_make_id: 'ford',
              model_name: 'Focus',
              model_year: '2000',
            },
          ],
        }),
      });

    const request = { url: 'http://localhost:3000/api/autoguessr/random-car?seed=12345' };
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('model_id', '123');
    expect(data).toHaveProperty('make', 'ford');
    expect(data).toHaveProperty('model', 'Focus');
    expect(data).toHaveProperty('year', '2000');
    expect(data).toHaveProperty('seed', 12345);
  });

  it('returns 404 if no makes found', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Years: { min_year: '2000', max_year: '2001' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Makes: [] }),
      });

    const request = { url: 'http://localhost:3000/api/autoguessr/random-car?seed=12345' };
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error', 'No makes found for selected year');
  });
});