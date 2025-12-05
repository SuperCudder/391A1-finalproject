/**
 * Author: Lucas Lotze
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

vi.mock('next-auth');
vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('GET /api/stats/get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const request = new Request('http://localhost:3000/api/stats/get');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 if user is not found in database', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const request = new Request('http://localhost:3000/api/stats/get');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'User not found' });
  });

  it('returns user stats when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    } as any);

    const mockStats = {
      autoguessrCurrentStreak: 5,
      autoguessrMaxStreak: 10,
      autorankCurrentStreak: 3,
      autorankMaxStreak: 7,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockStats as any);

    const request = new Request('http://localhost:3000/api/stats/get');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockStats);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      select: {
        autoguessrCurrentStreak: true,
        autoguessrMaxStreak: true,
        autorankCurrentStreak: true,
        autorankMaxStreak: true,
      },
    });
  });
});