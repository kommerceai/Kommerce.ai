import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Initialize OAuth2 client
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Generate OAuth URL for Google Sheets authorization
export function generateAuthUrl(clientId: string) {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: clientId, // Pass client ID to link the authorization
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Create authenticated sheets client
export function getSheetsClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

// Create Google Drive client for sharing
export function getDriveClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Apply template formatting to a new spreadsheet
export async function applyTemplateFormatting(
  sheets: any,
  spreadsheetId: string
) {
  // Write headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Daily P&L!A1:K1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Date',
        'Platform',
        'Revenue',
        'Orders',
        'AOV',
        'Ad Spend',
        'ROAS',
        'CPA',
        'Margin $',
        'Margin %',
        'Status',
      ]],
    },
  });

  // Format headers and add conditional formatting
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Format header row (bold, dark background)
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  bold: true,
                },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },
        // Freeze header row
        {
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        // Green status conditional formatting
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: 0, startColumnIndex: 10, endColumnIndex: 11 }],
              booleanRule: {
                condition: {
                  type: 'TEXT_CONTAINS',
                  values: [{ userEnteredValue: '🟢' }],
                },
                format: {
                  backgroundColor: { red: 0.8, green: 1, blue: 0.8 },
                },
              },
            },
          },
        },
        // Yellow status conditional formatting
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: 0, startColumnIndex: 10, endColumnIndex: 11 }],
              booleanRule: {
                condition: {
                  type: 'TEXT_CONTAINS',
                  values: [{ userEnteredValue: '🟡' }],
                },
                format: {
                  backgroundColor: { red: 1, green: 1, blue: 0.8 },
                },
              },
            },
          },
        },
        // Red status conditional formatting
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: 0, startColumnIndex: 10, endColumnIndex: 11 }],
              booleanRule: {
                condition: {
                  type: 'TEXT_CONTAINS',
                  values: [{ userEnteredValue: '🔴' }],
                },
                format: {
                  backgroundColor: { red: 1, green: 0.8, blue: 0.8 },
                },
              },
            },
          },
        },
        // Auto-resize columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 11,
            },
          },
        },
      ],
    },
  });
}

// Share spreadsheet with client email
export async function shareSpreadsheet(
  drive: any,
  spreadsheetId: string,
  email: string
) {
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      type: 'user',
      role: 'writer',
      emailAddress: email,
    },
    sendNotificationEmail: true,
  });
}

// Get status emoji based on margin status
export function getStatusEmoji(status: string): string {
  switch (status) {
    case 'GREEN': return '🟢';
    case 'YELLOW': return '🟡';
    case 'RED': return '🔴';
    default: return '';
  }
}

// Format row data for Google Sheets
export function formatRowData(metric: any, financial: any): any[] {
  return [
    new Date(metric.date).toLocaleDateString('en-US'),
    metric.platform,
    parseFloat(metric.revenue.toString()),
    metric.orders,
    parseFloat(metric.aov.toString()),
    parseFloat(metric.adSpend.toString()),
    parseFloat(metric.roas.toString()),
    parseFloat(metric.cpa.toString()),
    financial ? parseFloat(financial.profitPerOrder.toString()) : 'N/A',
    financial ? parseFloat(financial.actualMarginPercentage.toString()) : 'N/A',
    financial ? getStatusEmoji(financial.status) : '',
  ];
}
