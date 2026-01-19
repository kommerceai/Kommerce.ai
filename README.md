# Kommerce.ai

E-commerce Agency Management Platform with Google Sheets Integration

## Features

- 🔄 Multi-platform data integration (Shopify, Meta Ads, TikTok)
- 📊 Real-time P&L tracking and financial modeling
- 📈 Automated Google Sheets sync
- 🔔 Performance alerts and notifications
- 📄 Automated client reporting

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Integrations**: Google Sheets API, Shopify API, Meta Marketing API, TikTok Business API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud Project with Sheets API enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kommerceai/Kommerce.ai.git
cd Kommerce.ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google Sheets Integration

The platform includes powerful Google Sheets integration for collaborative data analysis:

- **One-click sync**: Export daily P&L data to Google Sheets
- **Auto-formatting**: Pre-formatted templates with conditional formatting
- **Scheduled sync**: Automated daily updates
- **Bi-directional**: Changes in sheets can sync back to platform

## Project Structure

```
kommerce-ai/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
├── prisma/               # Database schema
└── types/                # TypeScript types
```

## License

MIT
