import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-sheets';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This contains the client ID

  if (!code || !state) {
    return NextResponse.json(
      { error: 'Missing authorization code or state' },
      { status: 400 }
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Update client with Google tokens
    await prisma.client.update({
      where: { id: state },
      data: {
        googleAccessToken: tokens.access_token || '',
        googleRefreshToken: tokens.refresh_token || '',
      },
    });

    // Redirect back to client settings page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${state}/settings?google_connected=true`
    );
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
}
