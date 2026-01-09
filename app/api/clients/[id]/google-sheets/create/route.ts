import { NextRequest, NextResponse } from 'next/server'
import { createGoogleSheet, isClientAuthenticated } from '@/lib/google-sheets'

/**
 * POST /api/clients/[id]/google-sheets/create
 * Creates a new Google Sheet for the client
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

    // Parse request body for optional sheet title
    const body = await request.json().catch(() => ({}))
    const sheetTitle = body.sheetTitle

    // Create Google Sheet
    const { spreadsheetId, spreadsheetUrl } = await createGoogleSheet(
      clientId,
      sheetTitle
    )

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      message: 'Google Sheet created successfully',
    })
  } catch (error) {
    console.error('Error creating Google Sheet:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create Google Sheet',
      },
      { status: 500 }
    )
  }
}
