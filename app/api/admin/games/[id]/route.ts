import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    await prisma.game.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Game deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ message: 'An error occurred while deleting the game' }, { status: 500 })
  }
}

