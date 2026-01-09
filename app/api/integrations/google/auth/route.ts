import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID is required' },
      { status: 400 }
    );
  }

  // Generate OAuth URL with client ID in state
  const authUrl = generateAuthUrl(clientId);

  return NextResponse.redirect(authUrl);
}
