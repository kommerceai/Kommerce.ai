import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from './prisma'
import { format, subDays } from 'date-fns'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

/**
 * Create OAuth2 client with credentials
 */
export function getOAuth2Client(): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  return oauth2Client
}

/**
 * Get authorization URL for OAuth flow
 */
export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client()
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
  return authUrl
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

/**
 * Get authenticated OAuth2 client for a specific client
 */
export async function getAuthenticatedClient(clientId: string): Promise<OAuth2Client> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client?.googleAccessToken || !client?.googleRefreshToken) {
    throw new Error('Client not authenticated with Google')
  }

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: client.googleAccessToken,
    refresh_token: client.googleRefreshToken,
    expiry_date: client.googleTokenExpiry?.getTime(),
  })

  // Auto-refresh if expired
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      })
    }
  })

  return oauth2Client
}

/**
 * Create a new Google Sheet for a client
 */
export async function createGoogleSheet(
  clientId: string,
  sheetTitle?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) {
    throw new Error('Client not found')
  }

  const auth = await getAuthenticatedClient(clientId)
  const sheets = google.sheets({ version: 'v4', auth })

  const title = sheetTitle || `${client.name} - Daily P&L`

  // Create spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title,
        locale: 'en_US',
        timeZone: 'America/New_York',
      },
      sheets: [
        {
          properties: {
            title: 'Daily P&L',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    },
  })

  const spreadsheetId = spreadsheet.data.spreadsheetId!
  const spreadsheetUrl = spreadsheet.data.spreadsheetUrl!

  // Set up headers
  await setupSheetHeaders(auth, spreadsheetId)

  // Apply formatting
  await formatSheet(auth, spreadsheetId)

  // Share with client if email is provided
  if (client.email) {
    await shareSheet(auth, spreadsheetId, client.email)
  }

  // Update client record
  await prisma.client.update({
    where: { id: clientId },
    data: {
      googleSheetId: spreadsheetId,
      googleSheetUrl: spreadsheetUrl,
    },
  })

  return { spreadsheetId, spreadsheetUrl }
}

/**
 * Set up sheet headers
 */
async function setupSheetHeaders(auth: OAuth2Client, spreadsheetId: string) {
  const sheets = google.sheets({ version: 'v4', auth })

  const headers = [
    'Date',
    'Revenue',
    'Orders',
    'AOV',
    'Ad Spend',
    'ROAS',
    'CPA',
    'COGS',
    'Shipping',
    'Fees',
    'Net Profit',
    'Margin %',
    'Status',
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Daily P&L!A1:M1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers],
    },
  })
}

/**
 * Format the Google Sheet with colors, bold headers, etc.
 */
async function formatSheet(auth: OAuth2Client, spreadsheetId: string) {
  const sheets = google.sheets({ version: 'v4', auth })

  const requests = [
    // Bold and freeze header row
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
              fontSize: 11,
              bold: true,
            },
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
      },
    },
    // Auto-resize columns
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 13,
        },
      },
    },
    // Add conditional formatting for Status column (M)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId: 0,
              startRowIndex: 1,
              startColumnIndex: 12,
              endColumnIndex: 13,
            },
          ],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'Good' }],
            },
            format: {
              backgroundColor: { red: 0.72, green: 0.88, blue: 0.8 },
              textFormat: { bold: true },
            },
          },
        },
        index: 0,
      },
    },
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId: 0,
              startRowIndex: 1,
              startColumnIndex: 12,
              endColumnIndex: 13,
            },
          ],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'Warning' }],
            },
            format: {
              backgroundColor: { red: 1, green: 0.95, blue: 0.8 },
              textFormat: { bold: true },
            },
          },
        },
        index: 1,
      },
    },
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId: 0,
              startRowIndex: 1,
              startColumnIndex: 12,
              endColumnIndex: 13,
            },
          ],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'Critical' }],
            },
            format: {
              backgroundColor: { red: 0.96, green: 0.8, blue: 0.8 },
              textFormat: { bold: true },
            },
          },
        },
        index: 2,
      },
    },
  ]

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  })
}

/**
 * Share sheet with user
 */
async function shareSheet(auth: OAuth2Client, spreadsheetId: string, email: string) {
  const drive = google.drive({ version: 'v3', auth })

  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      type: 'user',
      role: 'writer',
      emailAddress: email,
    },
    sendNotificationEmail: true,
  })
}

/**
 * Sync financial data to Google Sheet
 */
export async function syncDataToSheet(
  clientId: string,
  days: number = 30
): Promise<number> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      dailyFinancials: {
        where: {
          date: {
            gte: subDays(new Date(), days),
          },
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  })

  if (!client?.googleSheetId) {
    throw new Error('No Google Sheet associated with this client')
  }

  const auth = await getAuthenticatedClient(clientId)
  const sheets = google.sheets({ version: 'v4', auth })

  // Prepare data rows
  const rows = client.dailyFinancials.map((financial) => {
    const margin = financial.marginPercentage
    let status = 'Good'
    if (margin < 15) status = 'Critical'
    else if (margin < 25) status = 'Warning'

    return [
      format(new Date(financial.date), 'yyyy-MM-dd'),
      financial.totalRevenue,
      financial.totalOrders,
      financial.totalOrders > 0 ? financial.totalRevenue / financial.totalOrders : 0,
      financial.totalAdSpend,
      financial.totalRoas,
      financial.totalOrders > 0 ? financial.totalAdSpend / financial.totalOrders : 0,
      financial.cogsAmount,
      financial.shippingCost,
      financial.platformFees,
      financial.netProfit,
      financial.marginPercentage,
      status,
    ]
  })

  // Clear existing data (except header)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: client.googleSheetId,
    range: 'Daily P&L!A2:M',
  })

  // Write new data
  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: client.googleSheetId,
      range: 'Daily P&L!A2:M',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    })
  }

  // Update last synced timestamp
  await prisma.client.update({
    where: { id: clientId },
    data: {
      lastSyncedAt: new Date(),
    },
  })

  return rows.length
}

/**
 * Verify if client has valid Google authentication
 */
export async function isClientAuthenticated(clientId: string): Promise<boolean> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  return !!(client?.googleAccessToken && client?.googleRefreshToken)
}
