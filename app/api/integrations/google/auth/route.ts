import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-sheets'

/**
 * GET /api/integrations/google/auth
 * Initiates Google OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Get authorization URL
    const authUrl = getAuthUrl()

    // Add state parameter to track client ID through OAuth flow
    const urlWithState = `${authUrl}&state=${clientId}`

    return NextResponse.json({
      authUrl: urlWithState,
    })
  } catch (error) {
    console.error('Error initiating Google OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    )
  }
}
