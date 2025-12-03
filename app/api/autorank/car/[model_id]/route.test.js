import { describe, it, afterEach, expect, vi } from 'vitest';
import { GET } from './route.js';

global.fetch = vi.fn();

describe('GET /api/autorank/car/[model_id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns car details for a valid model_id', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => [
        {
          model_id: '123',
          model_make_id: 'ford',
          model_name: 'Focus',
          model_year: '2000',
        },
      ],
    });

    const response = await GET({}, { params: { model_id: '123' } });
    const data = await response.json();

    expect(data).toHaveProperty('model_id', '123');
    expect(data).toHaveProperty('model_make_id', 'ford');
    expect(data).toHaveProperty('model_name', 'Focus');
    expect(data).toHaveProperty('model_year', '2000');
  });

  it('returns 404 if car not found', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => [],
    });

    const response = await GET({}, { params: { model_id: '999' } });
    expect(response.status).toBe(404);
  });
});