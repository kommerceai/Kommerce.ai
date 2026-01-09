# Kommerce.ai - Google Sheets Integration

E-commerce Agency Management Platform with Google Sheets integration for automated P&L reporting and client data synchronization.

## Features

- **Google Sheets Integration**: OAuth 2.0 authentication with automated sheet creation
- **Automated Data Sync**: Daily cron job to sync financial data to Google Sheets
- **Client Management**: Track multiple e-commerce clients and their metrics
- **Financial Reporting**: Daily P&L tracking with profit/loss calculations
- **Multi-Platform Support**: Ready for Shopify, Meta Ads, TikTok integration
- **Conditional Formatting**: Color-coded status indicators (Good/Warning/Critical)
- **API-First Design**: RESTful API endpoints for all operations

## Tech Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth 2.0
- **APIs**: Google Sheets API v4, Google Drive API v3
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel with Cron Jobs

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Console project with Sheets & Drive APIs enabled
- Vercel account (for deployment with cron jobs)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/kommerceai/Kommerce.ai.git
cd Kommerce.ai
npm install
```

### 2. Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/integrations/google/callback` (development)
   - `https://your-domain.vercel.app/api/integrations/google/callback` (production)
7. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/kommerce"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/integrations/google/callback"
CRON_SECRET="your-random-secret-key"
```

### 4. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with test data
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## API Endpoints

### Client Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create a new client |
| GET | `/api/clients/[id]` | Get client details |
| PUT | `/api/clients/[id]` | Update client |
| DELETE | `/api/clients/[id]` | Delete client |

### Google Sheets Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations/google/auth?clientId={id}` | Initiate OAuth flow |
| GET | `/api/integrations/google/callback` | OAuth callback handler |
| POST | `/api/clients/[id]/google-sheets/create` | Create new Google Sheet |
| POST | `/api/clients/[id]/google-sheets/sync` | Sync data to sheet |

### Cron Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cron/sync-google-sheets` | Automated daily sync |

## Usage Flow

### 1. Create a Client

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Store",
    "email": "client@acme.com",
    "defaultMarginTarget": 30.0
  }'
```

### 2. Connect Google Account

```bash
# Get OAuth URL
curl http://localhost:3000/api/integrations/google/auth?clientId=CLIENT_ID

# User completes OAuth flow in browser
# Callback automatically stores tokens
```

### 3. Create Google Sheet

```bash
curl -X POST http://localhost:3000/api/clients/CLIENT_ID/google-sheets/create \
  -H "Content-Type: application/json" \
  -d '{"sheetTitle": "Acme Store - Daily P&L"}'
```

### 4. Sync Data

```bash
curl -X POST http://localhost:3000/api/clients/CLIENT_ID/google-sheets/sync \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
```

## Database Schema

### Client Model

```prisma
model Client {
  id                  String
  name                String
  email               String?
  googleSheetId       String?
  googleSheetUrl      String?
  googleAccessToken   String?
  googleRefreshToken  String?
  lastSyncedAt        DateTime?
  // ... more fields
}
```

### DailyFinancials Model

```prisma
model DailyFinancials {
  id                  String
  clientId            String
  date                DateTime
  totalRevenue        Float
  totalAdSpend        Float
  netProfit           Float
  marginPercentage    Float
  // ... more fields
}
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Enable cron jobs (automatic with vercel.json)
```

### Configure Cron Job

The `vercel.json` file configures automated daily sync at 8 AM:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-google-sheets",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## Google Sheet Output Format

The integration creates a beautifully formatted sheet with:

| Column | Description |
|--------|-------------|
| Date | Transaction date |
| Revenue | Total revenue |
| Orders | Number of orders |
| AOV | Average order value |
| Ad Spend | Total advertising spend |
| ROAS | Return on ad spend |
| CPA | Cost per acquisition |
| COGS | Cost of goods sold |
| Shipping | Shipping costs |
| Fees | Platform fees |
| Net Profit | Final profit amount |
| Margin % | Profit margin percentage |
| Status | Color-coded status (Good/Warning/Critical) |

**Conditional Formatting:**
- 🟢 **Good**: Margin ≥ 25%
- 🟡 **Warning**: 15% ≤ Margin < 25%
- 🔴 **Critical**: Margin < 15%

## Security

- OAuth 2.0 tokens stored encrypted in database
- Automatic token refresh handling
- Cron endpoints protected with secret key
- Environment variables for sensitive data
- HTTPS required for production

## Troubleshooting

### "Client not authenticated with Google"
- Complete OAuth flow first via `/api/integrations/google/auth`

### "No Google Sheet associated with this client"
- Create sheet first via `/api/clients/[id]/google-sheets/create`

### Database connection errors
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running

### OAuth redirect mismatch
- Check `GOOGLE_REDIRECT_URI` matches Google Console settings
- Verify domain is added to authorized redirect URIs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@kommerce.ai

## Roadmap

- [ ] Shopify integration
- [ ] Meta Ads integration
- [ ] TikTok Shop integration
- [ ] Advanced analytics dashboard
- [ ] Multi-user authentication
- [ ] Email reporting
- [ ] Slack notifications
- [ ] Custom alert rules

---

Built with ❤️ by the Kommerce.ai team
