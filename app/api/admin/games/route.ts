import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const games = await prisma.game.findMany()
    return NextResponse.json(games, { status: 200 })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ message: 'An error occurred while fetching games' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { name, description, type } = await request.json()

  try {
    const game = await prisma.game.create({
      data: { name, description, type },
    })
    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ message: 'An error occurred while creating the game' }, { status: 500 })
  }
}

