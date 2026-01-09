import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getSheetsClient,
  getDriveClient,
  applyTemplateFormatting,
  shareSpreadsheet,
} from '@/lib/google-sheets';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;

    // Get client with Google credentials
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.googleAccessToken || !client.googleRefreshToken) {
      return NextResponse.json(
        { error: 'Google Sheets not connected. Please authorize first.' },
        { status: 400 }
      );
    }

    // Create authenticated clients
    const sheets = getSheetsClient(
      client.googleAccessToken,
      client.googleRefreshToken
    );
    const drive = getDriveClient(
      client.googleAccessToken,
      client.googleRefreshToken
    );

    // Create new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${client.name} - Kommerce Daily P&L`,
        },
        sheets: [
          {
            properties: {
              title: 'Daily P&L',
              gridProperties: {
                rowCount: 1000,
                columnCount: 15,
                frozenRowCount: 1,
              },
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId!;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl!;

    // Apply template formatting
    await applyTemplateFormatting(sheets, spreadsheetId);

    // Share with client email
    await shareSpreadsheet(drive, spreadsheetId, client.email);

    // Update client with spreadsheet info
    await prisma.client.update({
      where: { id: clientId },
      data: {
        googleSheetId: spreadsheetId,
        googleSheetUrl: spreadsheetUrl,
        autoSyncEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      message: 'Google Sheet created successfully',
    });
  } catch (error: any) {
    console.error('Error creating Google Sheet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Google Sheet' },
      { status: 500 }
    );
  }
}
