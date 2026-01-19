import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSheetsClient, formatRowData } from '@/lib/google-sheets';
import { subDays } from 'date-fns';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    // Get client with Google credentials
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { financialProfile: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.googleSheetId) {
      return NextResponse.json(
        { error: 'No Google Sheet configured. Please create one first.' },
        { status: 400 }
      );
    }

    if (!client.googleAccessToken || !client.googleRefreshToken) {
      return NextResponse.json(
        { error: 'Google Sheets not connected. Please authorize first.' },
        { status: 400 }
      );
    }

    // Fetch last 30 days of data
    const startDate = subDays(new Date(), 30);
    const metrics = await prisma.dailyMetrics.findMany({
      where: {
        clientId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const financials = await prisma.dailyFinancials.findMany({
      where: {
        clientId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Create a map of financials by date for quick lookup
    const financialsMap = new Map(
      financials.map((f) => [f.date.toISOString().split('T')[0], f])
    );

    // Format data for Google Sheets
    const rows = metrics.map((metric) => {
      const dateKey = new Date(metric.date).toISOString().split('T')[0];
      const financial = financialsMap.get(dateKey);
      return formatRowData(metric, financial);
    });

    // Get authenticated sheets client
    const sheets = getSheetsClient(
      client.googleAccessToken,
      client.googleRefreshToken
    );

    // Clear existing data (keep headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: client.googleSheetId,
      range: 'Daily P&L!A2:K',
    });

    // Write new data
    if (rows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: client.googleSheetId,
        range: 'Daily P&L!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rows,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rowsWritten: rows.length,
      spreadsheetUrl: client.googleSheetUrl,
      message: `Successfully synced ${rows.length} rows to Google Sheets`,
    });
  } catch (error: any) {
    console.error('Error syncing to Google Sheets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync to Google Sheets' },
      { status: 500 }
    );
  }
}
