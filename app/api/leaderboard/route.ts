import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getFromKV, setInKV } from '@/lib/kv';
import { rateLimiter } from '@/lib/rateLimit';

const LEADERBOARD_CACHE_KEY = 'leaderboard';
const CACHE_TTL = 60 * 5; // 5 minutes

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    await rateLimiter.check(request, NextResponse);
  } catch {
    return NextResponse.json({ message: 'Too many requests, please try again later.' }, { status: 429 });
  }

  try {
    // Try to get the leaderboard from KV cache
    let leaderboard = await getFromKV(LEADERBOARD_CACHE_KEY);

    if (!leaderboard) {
      // If not in cache, fetch from database
      leaderboard = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          credits: true,
        },
        orderBy: {
          credits: 'desc',
        },
        take: 10,
      });

      // Store in KV cache
      await setInKV(LEADERBOARD_CACHE_KEY, JSON.stringify(leaderboard), { ex: CACHE_TTL });
    } else {
      // If it was in cache, parse the JSON string
      leaderboard = JSON.parse(leaderboard);
    }

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ message: 'An error occurred while fetching the leaderboard' }, { status: 500 });
  }
}

