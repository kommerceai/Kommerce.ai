# 🚀 Deploy Kommerce.ai Now

All credentials are configured! Follow these steps to go live:

## ✅ What's Already Done

- ✅ Google Cloud credentials configured
- ✅ Supabase database ready
- ✅ Secrets generated
- ✅ `.env` file created
- ✅ Code committed to Git

## 🎯 Next: Deploy to Vercel (10 minutes)

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" > "Project"
   - Select `kommerceai/Kommerce.ai` repository
   - Select branch: `claude/google-sheets-integration-gcBZz`

3. **Add Environment Variables**

Click "Environment Variables" and paste these (already configured for you):

```env
DATABASE_URL=[your-supabase-database-url-from-local-.env]

NEXTAUTH_SECRET=[from-local-.env]

NEXTAUTH_URL=https://your-app.vercel.app

GOOGLE_CLIENT_ID=[from-local-.env]

GOOGLE_CLIENT_SECRET=[from-local-.env]

GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/integrations/google/callback

CRON_SECRET=[from-local-.env]

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note:** All credentials are already saved in your local `.env` file. Copy them from there!

**Important:** Replace `https://your-app.vercel.app` with your actual Vercel URL after deployment (Step 5 below).

Select: ✅ Production, ✅ Preview, ✅ Development for each variable.

4. **Click "Deploy"**

Wait 2-3 minutes for build to complete.

5. **Copy Your Vercel URL**

After deployment, you'll get a URL like:
```
https://kommerce-ai-xyz123.vercel.app
```

6. **Update Environment Variables with Real URL**

   a. Go to Vercel Dashboard > Your Project > Settings > Environment Variables

   b. Edit these 3 variables and replace `your-app.vercel.app` with your real URL:
      - `NEXTAUTH_URL`
      - `GOOGLE_REDIRECT_URI`
      - `NEXT_PUBLIC_APP_URL`

   c. Click "Save"

   d. Go to Deployments > Click "..." > "Redeploy"

### Option B: Deploy via CLI (Faster)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to project
vercel link

# Add environment variables (you'll be prompted for each)
# Copy values from your local .env file

vercel env add DATABASE_URL
# Paste your Supabase DATABASE_URL from .env

vercel env add NEXTAUTH_SECRET
# Paste NEXTAUTH_SECRET from .env

vercel env add GOOGLE_CLIENT_ID
# Paste GOOGLE_CLIENT_ID from .env

vercel env add GOOGLE_CLIENT_SECRET
# Paste GOOGLE_CLIENT_SECRET from .env

vercel env add CRON_SECRET
# Paste CRON_SECRET from .env

# Deploy to production
vercel --prod
```

After deployment, update these 3 env vars with your real URL:
```bash
vercel env add NEXTAUTH_URL
# Paste: https://your-actual-vercel-url.vercel.app

vercel env add GOOGLE_REDIRECT_URI
# Paste: https://your-actual-vercel-url.vercel.app/api/integrations/google/callback

vercel env add NEXT_PUBLIC_APP_URL
# Paste: https://your-actual-vercel-url.vercel.app
```

---

## 📝 Update Google Cloud Console

After deployment (takes 5 minutes):

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", click "ADD URI"
4. Add: `https://your-actual-vercel-url.vercel.app/api/integrations/google/callback`
5. Click "Save"

---

## 🗄️ Initialize Database

After deployment, run this ONCE from your local machine:

```bash
# Pull production environment variables
npx vercel env pull .env.production

# Create database tables
npx prisma db push

# You should see: "Your database is now in sync with your schema."
```

---

## ✅ Test Your Deployment

1. Visit: `https://your-vercel-url.vercel.app`
2. You should see the Kommerce.ai homepage
3. Go to `/dashboard`
4. Navigate to any client's P&L page
5. Click "Connect Google Sheets" - should redirect to Google OAuth
6. Authorize and you're done!

---

## 🎉 You're Live!

Your Google Sheets integration is now live in production!

**Quick Links:**
- Dashboard: `https://your-url.vercel.app/dashboard`
- Vercel Dashboard: https://vercel.com/dashboard
- Database: https://supabase.com/dashboard
- Google Cloud: https://console.cloud.google.com

---

## 🔍 Verify Everything Works

- [ ] Homepage loads
- [ ] Dashboard accessible at `/dashboard`
- [ ] Google OAuth flow works
- [ ] "Create Sheet" creates a formatted Google Sheet
- [ ] "Sync Now" writes data to sheet
- [ ] Cron job visible in Vercel Dashboard > Cron Jobs

---

## 🆘 Quick Troubleshooting

**Build fails with Prisma error:**
- The database tables will be created automatically on first deployment
- If issues persist, run `npx prisma db push` locally after pulling env vars

**OAuth error "redirect_uri_mismatch":**
- Make sure you added the EXACT Vercel URL to Google Cloud Console
- Include the full path: `/api/integrations/google/callback`
- No trailing slash

**Database connection error:**
- Verify DATABASE_URL is correct in Vercel env vars
- Check Supabase project is active
- Use the connection pooling URL (port 5432)

---

## 📊 Your Credentials

All credentials are securely stored in your local `.env` file. You can view them anytime by running:

```bash
cat .env
```

---

**Ready to deploy? Start with Option A (Vercel Dashboard) - it's the easiest!**

All your credentials are in the `.env` file - just copy/paste them when adding environment variables to Vercel.
