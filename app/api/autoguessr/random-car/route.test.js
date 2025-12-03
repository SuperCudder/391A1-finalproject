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
        json: async () => ({ Years: { min_year: '2000', max_year: '2001' } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ Makes: [{ make_id: 'ford' }] }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ Models: [{ model_name: 'Focus' }] }),
      })
      .mockResolvedValueOnce({
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

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('model_id', '123');
    expect(data).toHaveProperty('make', 'ford');
    expect(data).toHaveProperty('model', 'Focus');
    expect(data).toHaveProperty('year', '2000');
  });

  it('returns 404 if no makes found', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => ({ Years: { min_year: '2000', max_year: '2001' } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ Makes: [] }),
      })
      .mockResolvedValueOnce({ json: async () => ({}) })
      .mockResolvedValueOnce({ json: async () => ({}) });

    const response = await GET();
    expect(response.status).toBe(404);
  });
});