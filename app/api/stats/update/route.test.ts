/**
 * Author: Lucas Lotze
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

vi.mock('next-auth');
vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('POST /api/stats/update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const request = new Request('http://localhost:3000/api/stats/update', {
      method: 'POST',
      body: JSON.stringify({ game: 'autoguessr', won: true }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 if user is not found in database', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const request = new Request('http://localhost:3000/api/stats/update', {
      method: 'POST',
      body: JSON.stringify({ game: 'autoguessr', won: true }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'User not found' });
  });

  it('increments autoguessr streak when user wins', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    } as any);

    const mockUser = {
      email: 'test@example.com',
      autoguessrCurrentStreak: 2,
      autoguessrMaxStreak: 5,
      autorankCurrentStreak: 0,
      autorankMaxStreak: 0,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    const request = new Request('http://localhost:3000/api/stats/update', {
      method: 'POST',
      body: JSON.stringify({ game: 'autoguessr', won: true }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: {
        autoguessrCurrentStreak: 3,
        autoguessrMaxStreak: 5,
      },
    });
  });

  it('resets autoguessr streak when user loses', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    } as any);

    const mockUser = {
      email: 'test@example.com',
      autoguessrCurrentStreak: 5,
      autoguessrMaxStreak: 10,
      autorankCurrentStreak: 0,
      autorankMaxStreak: 0,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    const request = new Request('http://localhost:3000/api/stats/update', {
      method: 'POST',
      body: JSON.stringify({ game: 'autoguessr', won: false }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: {
        autoguessrCurrentStreak: 0,
      },
    });
  });

  it('updates max streak when current streak exceeds it', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    } as any);

    const mockUser = {
      email: 'test@example.com',
      autoguessrCurrentStreak: 9,
      autoguessrMaxStreak: 9,
      autorankCurrentStreak: 0,
      autorankMaxStreak: 0,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    const request = new Request('http://localhost:3000/api/stats/update', {
      method: 'POST',
      body: JSON.stringify({ game: 'autoguessr', won: true }),
    });

    const response = await POST(request as any);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: {
        autoguessrCurrentStreak: 10,
        autoguessrMaxStreak: 10,
      },
    });
  });

  it('handles autorank game correctly', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    } as any);

    const mockUser = {
      email: 'test@example.com',
      autoguessrCurrentStreak: 0,
      autoguessrMaxStreak: 0,
      autorankCurrentStreak: 3,
      autorankMaxStreak: 5,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    const request = new Request('http://localhost:3000/api/stats/update', {
      method: 'POST',
      body: JSON.stringify({ game: 'autorank', won: true }),
    });

    const response = await POST(request as any);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: {
        autorankCurrentStreak: 4,
        autorankMaxStreak: 5,
      },
    });
  });
});