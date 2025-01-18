import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { rateLimiter } from '@/lib/rateLimit'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    await rateLimiter.check(request, NextResponse)
  } catch {
    return NextResponse.json({ message: 'Too many requests, please try again later.' }, { status: 429 })
  }

  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { amount } = await request.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { credits: { increment: amount } },
    })

    return NextResponse.json({ credits: user.credits }, { status: 200 })
  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json({ message: 'An error occurred while purchasing credits' }, { status: 500 })
  }
}

