# Google Sheets Integration Setup Guide

This guide walks you through setting up the Google Sheets integration for Kommerce.ai.

## Prerequisites

- Google Cloud Platform account
- PostgreSQL database
- Node.js 18+

## Step 1: Google Cloud Project Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name your project (e.g., "Kommerce-AI")
4. Click "Create"

### 1.2 Enable Google Sheets API

1. In your project dashboard, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click "Enable"
4. Also enable "Google Drive API" (required for sharing sheets)

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Kommerce.ai
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
   - Scopes: Add `https://www.googleapis.com/auth/spreadsheets` and `https://www.googleapis.com/auth/drive.file`
4. Application type: Web application
5. Name: Kommerce.ai Web Client
6. Authorized redirect URIs:
   - `http://localhost:3000/api/integrations/google/callback` (for development)
   - `https://your-domain.com/api/integrations/google/callback` (for production)
7. Click "Create"
8. **Save your Client ID and Client Secret** - you'll need these for the .env file

## Step 2: Environment Configuration

Create a `.env` file in the root of your project:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kommerce"

# NextAuth
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Google Sheets API
GOOGLE_CLIENT_ID="your-client-id-from-step-1.3.8"
GOOGLE_CLIENT_SECRET="your-client-secret-from-step-1.3.8"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/integrations/google/callback"

# Cron Secret (for scheduled syncs)
CRON_SECRET="generate-another-secure-random-string"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Generating Secure Secrets

You can generate secure random strings using:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 3: Database Setup

1. Make sure PostgreSQL is running
2. Update the `DATABASE_URL` in your `.env` file
3. Push the Prisma schema to your database:

```bash
npx prisma db push
npx prisma generate
```

## Step 4: Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 5: Using Google Sheets Integration

### 5.1 Authorize Google Sheets Access

1. Create a client in Kommerce.ai
2. Navigate to the client's Daily P&L page
3. Click "Connect Google Sheets" button
4. You'll be redirected to Google to authorize access
5. Grant permissions for:
   - See, edit, create, and delete spreadsheets
   - See and download your Google Drive files
6. You'll be redirected back to Kommerce.ai

### 5.2 Create a Google Sheet

1. On the Daily P&L page, click "Create Sheet"
2. A new Google Sheet will be created with:
   - Pre-formatted headers (dark background, white text, bold)
   - Frozen header row
   - Conditional formatting (🟢 Green, 🟡 Yellow, 🔴 Red status indicators)
   - Auto-resized columns
3. The sheet will be shared with the client's email address (edit access)

### 5.3 Sync Data to Google Sheets

#### Manual Sync

1. Click "Sync Now" button on the Daily P&L page
2. The last 30 days of data will be synced
3. The Google Sheet will open in a new tab

#### Automated Sync

The system automatically syncs data daily at 8:00 AM (server time) for all clients with:
- Auto-sync enabled
- Google Sheet configured
- Valid Google credentials

To modify the sync schedule, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-google-sheets",
      "schedule": "0 8 * * *"  // Daily at 8:00 AM
    }
  ]
}
```

Schedule format: `minute hour day month day-of-week` (cron syntax)

Examples:
- `0 8 * * *` - Daily at 8:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 8 * * 1` - Every Monday at 8:00 AM

## Google Sheet Template Structure

The created Google Sheet will have the following columns:

| Column | Description | Format |
|--------|-------------|--------|
| Date | Transaction date | MM/DD/YYYY |
| Platform | SHOPIFY, META, TIKTOK_SHOP, TIKTOK_ADS | Text |
| Revenue | Total revenue | Currency ($) |
| Orders | Number of orders | Number |
| AOV | Average Order Value | Currency ($) |
| Ad Spend | Total ad spend | Currency ($) |
| ROAS | Return on Ad Spend | Number (2 decimals) |
| CPA | Cost Per Acquisition | Currency ($) |
| Margin $ | Profit per order | Currency ($) |
| Margin % | Profit margin percentage | Percentage |
| Status | Performance indicator | 🟢 🟡 🔴 |

### Conditional Formatting

- **🟢 Green**: Margin meets or exceeds target
- **🟡 Yellow**: Margin within 10% of target
- **🔴 Red**: Margin below target (action needed)

## API Endpoints

### Authorization Flow

- `GET /api/integrations/google/auth?clientId=<client-id>`
  - Initiates OAuth flow
  - Redirects to Google authorization page

- `GET /api/integrations/google/callback`
  - Handles OAuth callback
  - Stores tokens in database
  - Redirects to client settings page

### Google Sheets Operations

- `POST /api/clients/[id]/google-sheets/create`
  - Creates new Google Sheet from template
  - Returns spreadsheet ID and URL

- `POST /api/clients/[id]/google-sheets/sync`
  - Syncs last 30 days of data to existing sheet
  - Returns number of rows written

### Automated Sync (Cron)

- `GET /api/cron/sync-google-sheets`
  - Requires `Authorization: Bearer <CRON_SECRET>` header
  - Syncs all clients with auto-sync enabled
  - Returns sync results for all clients

## Troubleshooting

### "Failed to authenticate with Google"

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that redirect URI matches exactly in Google Cloud Console
- Ensure Google Sheets API and Google Drive API are enabled

### "No Google Sheet configured"

- Create a Google Sheet first using the "Create Sheet" button
- Verify the client has `googleSheetId` in the database

### "Unauthorized" error on cron endpoint

- Check that `CRON_SECRET` in `.env` matches the one used in the request
- Ensure the `Authorization` header is set correctly

### Sync not working automatically

- Verify `vercel.json` is configured correctly
- Check that Vercel cron jobs are enabled (Vercel dashboard > Project > Cron Jobs)
- Ensure `autoSyncEnabled` is `true` for the client in the database

## Security Best Practices

1. **Never commit `.env` file** - it's in `.gitignore` by default
2. **Use strong secrets** - Generate random strings for `NEXTAUTH_SECRET` and `CRON_SECRET`
3. **Rotate credentials regularly** - Especially after team member departures
4. **Limit OAuth scopes** - Only request necessary permissions
5. **Monitor API usage** - Track Google Sheets API quota in Google Cloud Console

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel project settings:
   - All variables from `.env`
   - Update `GOOGLE_REDIRECT_URI` to your production domain
   - Update `NEXTAUTH_URL` to your production domain
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
4. Update Google Cloud Console redirect URIs to include production URL
5. Deploy

### Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GOOGLE_REDIRECT_URI`
- ✅ `CRON_SECRET`
- ✅ `NEXT_PUBLIC_APP_URL`

## Support

For issues or questions:
- Check the [Kommerce.ai documentation](https://kommerce.ai/docs)
- Review [Google Sheets API documentation](https://developers.google.com/sheets/api)
- Contact support@kommerce.ai

---

**Congratulations!** Your Google Sheets integration is now set up and ready to use. 🎉
