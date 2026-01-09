import { NextRequest, NextResponse } from 'next/server'
import { syncDataToSheet, isClientAuthenticated } from '@/lib/google-sheets'

/**
 * POST /api/clients/[id]/google-sheets/sync
 * Syncs financial data to the client's Google Sheet
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id

    // Check if client is authenticated with Google
    const isAuthenticated = await isClientAuthenticated(clientId)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Client not authenticated with Google. Please connect first.' },
        { status: 401 }
      )
    }

    // Parse request body for optional days parameter
    const body = await request.json().catch(() => ({}))
    const days = body.days || 30

    // Sync data to sheet
    const rowsSynced = await syncDataToSheet(clientId, days)

    return NextResponse.json({
      success: true,
      rowsSynced,
      message: `Successfully synced ${rowsSynced} days of data to Google Sheet`,
    })
  } catch (error) {
    console.error('Error syncing data to Google Sheet:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to sync data to Google Sheet',
      },
      { status: 500 }
    )
  }
}
