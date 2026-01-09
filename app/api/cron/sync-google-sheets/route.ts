import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncDataToSheet, isClientAuthenticated } from '@/lib/google-sheets'

/**
 * GET /api/cron/sync-google-sheets
 * Automated cron job to sync all clients' data to their Google Sheets
 * This should be called by Vercel Cron or similar scheduling service
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all active clients with Google Sheets configured
    const clients = await prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        googleSheetId: { not: null },
      },
    })

    const results = {
      total: clients.length,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Sync each client
    for (const client of clients) {
      try {
        const isAuthenticated = await isClientAuthenticated(client.id)
        if (!isAuthenticated) {
          results.failed++
          results.errors.push(`Client ${client.name}: Not authenticated`)
          continue
        }

        await syncDataToSheet(client.id, 30)
        results.successful++
      } catch (error) {
        results.failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Client ${client.name}: ${errorMessage}`)
        console.error(`Error syncing client ${client.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      results,
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
