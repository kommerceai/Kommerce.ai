import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/clients
 * List all clients
 */
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        googleSheetId: true,
        googleSheetUrl: true,
        lastSyncedAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, defaultMarginTarget, currency } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        defaultMarginTarget,
        currency: currency || 'USD',
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
