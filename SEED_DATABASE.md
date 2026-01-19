# 🌱 Seed Database with Demo Data

Your database seed script is ready! It will create:

- **3 Demo Clients**: Luxe Fashion Co., TechGadgets Pro, Wellness Essentials
- **30 Days of Metrics**: For each client across all platforms (Shopify, Meta, TikTok Shop, TikTok Ads)
- **Financial Profiles**: COGS, margins, targets for each client
- **Alert Rules**: ROAS drop, margin alerts, CPA spikes
- **1 Demo User**: Account manager login

---

## 🚀 Run the Seed Script

### From Your Local Machine:

```bash
# 1. Install dependencies (if not already)
npm install

# 2. Make sure database is accessible
# Your DATABASE_URL is already in .env

# 3. Run the seed script
npm run db:seed
```

### Expected Output:

```
🌱 Starting database seed...
✅ Created demo user: demo@kommerce.ai
✅ Created client: Luxe Fashion Co.
  ✅ Created financial profile for Luxe Fashion Co.
  ✅ Generated 30 days of metrics for Luxe Fashion Co.
  ✅ Created alert rules for Luxe Fashion Co.
✅ Created client: TechGadgets Pro
  ✅ Created financial profile for TechGadgets Pro
  ✅ Generated 30 days of metrics for TechGadgets Pro
  ✅ Created alert rules for TechGadgets Pro
✅ Created client: Wellness Essentials
  ✅ Created financial profile for Wellness Essentials
  ✅ Generated 30 days of metrics for Wellness Essentials
  ✅ Created alert rules for Wellness Essentials

🎉 Database seeded successfully!

📊 Demo Data Summary:
   - Users: 4
   - Clients: 3
   - Daily Metrics: 360 records
   - Daily Financials: 90 records
   - Alert Rules: 9 rules

🔐 Login Credentials:
   Email: demo@kommerce.ai
   Password: demo123
```

---

## 📊 What Gets Created:

### Client 1: Luxe Fashion Co.
- **Industry**: Fashion & Apparel
- **Avg Daily Revenue**: $50,000
- **Avg Daily Orders**: 500
- **Avg Daily Ad Spend**: $10,000
- **COGS**: 35%
- **Target Margin**: 25%

### Client 2: TechGadgets Pro
- **Industry**: Electronics
- **Avg Daily Revenue**: $75,000
- **Avg Daily Orders**: 300
- **Avg Daily Ad Spend**: $15,000
- **COGS**: 45%
- **Target Margin**: 20%

### Client 3: Wellness Essentials
- **Industry**: Health & Wellness
- **Avg Daily Revenue**: $35,000
- **Avg Daily Orders**: 400
- **Avg Daily Ad Spend**: $7,000
- **COGS**: 30%
- **Target Margin**: 30%

---

## 🎨 Dashboard Will Show:

After seeding, your dashboard will display:

✅ **Total Revenue**: ~$4.8M (across 30 days, all clients)
✅ **Total Ad Spend**: ~$960K
✅ **Blended ROAS**: ~5.0x
✅ **Active Clients**: 3
✅ **360 Daily Metrics** across 4 platforms
✅ **Color-coded performance** (🟢 🟡 🔴)

---

## 🔄 Re-run Anytime:

The seed script uses `upsert`, so you can run it multiple times safely. It will:
- Update existing records (if found)
- Create new records (if not found)
- Never duplicate data

---

## 🎯 Next Steps After Seeding:

1. **Visit your dashboard**: See populated metrics and clients
2. **Test Google Sheets sync**: Click "Sync Now" on any client's P&L page
3. **View the data**: All 30 days will export to Google Sheets with formatting

---

**Ready to populate your database? Run `npm run db:seed` now!** 🚀
