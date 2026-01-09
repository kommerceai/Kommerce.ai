import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all clients with auto-sync enabled
    const clients = await prisma.client.findMany({
      where: {
        autoSyncEnabled: true,
        googleSheetId: { not: null },
        googleAccessToken: { not: null },
        googleRefreshToken: { not: null },
      },
    });

    console.log(`Starting automated sync for ${clients.length} clients`);

    const results = [];

    for (const client of clients) {
      try {
        // Trigger sync for each client
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/clients/${client.id}/google-sheets/sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();
        results.push({
          clientId: client.id,
          clientName: client.name,
          success: result.success,
          rowsWritten: result.rowsWritten,
          error: result.error,
        });

        console.log(
          `Synced client ${client.name}: ${result.success ? `${result.rowsWritten} rows` : result.error}`
        );
      } catch (error: any) {
        console.error(`Error syncing client ${client.name}:`, error);
        results.push({
          clientId: client.id,
          clientName: client.name,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      totalClients: clients.length,
      successCount,
      failureCount,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in automated Google Sheets sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to run automated sync',
      },
      { status: 500 }
    );
  }
}
