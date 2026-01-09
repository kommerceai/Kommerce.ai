import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/google-sheets'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/integrations/google/callback
 * Handles Google OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // clientId

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=oauth_failed', request.url)
      )
    }

    const clientId = state

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    // Store tokens in database
    await prisma.client.update({
      where: { id: clientId },
      data: {
        googleAccessToken: tokens.access_token || null,
        googleRefreshToken: tokens.refresh_token || null,
        googleTokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
    })

    // Redirect back to client page with success
    return NextResponse.redirect(
      new URL(`/dashboard/clients/${clientId}?connected=true`, request.url)
    )
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_failed', request.url)
    )
  }
}
