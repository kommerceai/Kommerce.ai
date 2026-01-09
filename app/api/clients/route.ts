import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all clients
export async function GET(request: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      include: {
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        financialProfile: true,
        _count: {
          select: {
            dailyMetrics: true,
            alerts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ clients });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, accountManagerId } = body;

    if (!name || !email || !accountManagerId) {
      return NextResponse.json(
        { error: 'Name, email, and account manager are required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        accountManagerId,
      },
      include: {
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create client' },
      { status: 500 }
    );
  }
}
