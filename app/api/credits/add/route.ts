import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(request: Request) {
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
    console.error('Credit addition error:', error)
    return NextResponse.json({ message: 'An error occurred while adding credits' }, { status: 500 })
  }
}

