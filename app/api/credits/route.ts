import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { getFromKV, setInKV } from '@/lib/kv'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cacheKey = `user_credits:${session.user.email}`
    let credits = await getFromKV(cacheKey)

    if (credits === null) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { credits: true },
      })
      credits = user?.credits || 0
      await setInKV(cacheKey, credits)
    }

    return NextResponse.json({ credits }, { status: 200 })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json({ message: 'An error occurred while fetching credits' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { amount } = await request.json()

  if (!amount || isNaN(amount)) {
    return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
  }

  try {
    const cacheKey = `user_credits:${session.user.email}`
    const currentCredits = await getFromKV(cacheKey) || 0
    const newCredits = currentCredits + amount

    await setInKV(cacheKey, newCredits)

    // Update the database asynchronously
    prisma.user.update({
      where: { email: session.user.email },
      data: { credits: newCredits },
    }).catch(console.error)

    return NextResponse.json({ credits: newCredits }, { status: 200 })
  } catch (error) {
    console.error('Error updating credits:', error)
    return NextResponse.json({ message: 'An error occurred while updating credits' }, { status: 500 })
  }
}

