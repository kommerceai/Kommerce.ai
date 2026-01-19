# Kommerce.ai Deployment Checklist

## Pre-Deployment Setup

### 1. Google Cloud Configuration

- [ ] Create Google Cloud Project
- [ ] Enable Google Sheets API
- [ ] Enable Google Drive API
- [ ] Create OAuth 2.0 credentials
- [ ] Configure OAuth consent screen
- [ ] Add authorized redirect URIs (dev + prod)
- [ ] Save Client ID and Client Secret

### 2. Database Setup

- [ ] Provision PostgreSQL database (Supabase/Railway/etc.)
- [ ] Note down database connection string
- [ ] Test database connectivity

### 3. Environment Variables

Create these environment variables in your deployment platform:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="[generate-secure-random-string]"
NEXTAUTH_URL="https://your-domain.com"

# Google Sheets
GOOGLE_CLIENT_ID="[from-google-cloud]"
GOOGLE_CLIENT_SECRET="[from-google-cloud]"
GOOGLE_REDIRECT_URI="https://your-domain.com/api/integrations/google/callback"

# Cron
CRON_SECRET="[generate-secure-random-string]"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 4. Generate Secrets

Generate secure random strings for secrets:

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET
openssl rand -base64 32
```

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select framework preset: **Next.js**

### Step 2: Configure Project

1. **Build Settings:**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Root Directory:** Leave as `/`

### Step 3: Add Environment Variables

Add all environment variables from `.env.example`:

1. Go to Project Settings > Environment Variables
2. Add each variable (Production, Preview, Development)
3. **Important:** Update URLs to production domain

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL (e.g., `kommerce-ai.vercel.app`)

### Step 5: Update Google Cloud Console

1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 client
3. Add authorized redirect URI: `https://your-vercel-domain.com/api/integrations/google/callback`
4. Save

### Step 6: Database Migration

Run Prisma migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma db push
```

### Step 7: Enable Cron Jobs

1. Go to Vercel Dashboard > Your Project > Cron Jobs
2. Verify the cron job is listed: `/api/cron/sync-google-sheets`
3. Schedule should show: `0 8 * * *` (daily at 8 AM)

### Step 8: Test the Deployment

- [ ] Visit your production URL
- [ ] Create a test client
- [ ] Authorize Google Sheets access
- [ ] Create a Google Sheet
- [ ] Sync data manually
- [ ] Verify cron job runs (check Vercel logs)

## Alternative Deployment (Railway/Render/etc.)

### Railway

1. Create new project on Railway
2. Connect GitHub repository
3. Add PostgreSQL database service
4. Configure environment variables
5. Deploy

**Note:** Railway doesn't support Vercel cron syntax. You'll need to use a different approach for scheduled tasks (e.g., GitHub Actions, external cron service).

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Add PostgreSQL database
4. Configure environment variables
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Deploy

**Note:** Render doesn't support Vercel cron syntax. Use Render Cron Jobs feature or external service.

## Post-Deployment

### 1. Verify Functionality

- [ ] Dashboard loads correctly
- [ ] Client creation works
- [ ] Google Sheets OAuth flow works
- [ ] Sheet creation successful
- [ ] Data sync working
- [ ] Cron jobs executing (check logs after 24 hours)

### 2. Monitor Performance

- [ ] Check Vercel Analytics
- [ ] Monitor database connections
- [ ] Review error logs
- [ ] Check API response times

### 3. Security

- [ ] Verify all secrets are set
- [ ] Confirm database access is restricted
- [ ] Check CORS settings if applicable
- [ ] Enable HTTPS (should be automatic on Vercel)

### 4. Documentation

- [ ] Update README with production URL
- [ ] Document any custom configurations
- [ ] Share access credentials with team (use 1Password/similar)

## Troubleshooting

### Build Fails

**Issue:** TypeScript errors during build

**Solution:**
```bash
# Run locally to identify issues
npm run build

# Fix TypeScript errors
# Ensure all dependencies are in package.json
```

### Database Connection Issues

**Issue:** `Can't reach database server`

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database is publicly accessible
- Ensure IP whitelist includes Vercel IPs (if applicable)

### Google OAuth Not Working

**Issue:** Redirect URI mismatch

**Solution:**
- Ensure `GOOGLE_REDIRECT_URI` matches exactly in Google Cloud Console
- Include both `http://localhost:3000` (dev) and production URL
- Check for trailing slashes

### Cron Jobs Not Running

**Issue:** Automated sync not working

**Solution:**
- Verify `vercel.json` is in root directory
- Check Vercel Dashboard > Cron Jobs shows the job
- Ensure `CRON_SECRET` is set correctly
- Review cron execution logs in Vercel

## Maintenance

### Weekly

- [ ] Review error logs
- [ ] Check database performance
- [ ] Monitor API usage (Google Sheets quota)

### Monthly

- [ ] Review and update dependencies
- [ ] Check for security updates
- [ ] Analyze usage patterns
- [ ] Optimize slow queries

### Quarterly

- [ ] Rotate secrets (`NEXTAUTH_SECRET`, `CRON_SECRET`)
- [ ] Review Google Cloud permissions
- [ ] Database cleanup (old data)
- [ ] Performance audit

## Scaling Considerations

### Database

- Monitor connection pool size
- Add read replicas if needed
- Consider database indexing for large datasets

### API Rate Limits

**Google Sheets API:**
- Quota: 500 requests per 100 seconds per project
- 60 requests per minute per user

**Solutions:**
- Implement request batching
- Add Redis caching for frequently accessed data
- Spread sync jobs across multiple hours

### Background Jobs

If cron jobs become too heavy:
- Consider using a dedicated job queue (Bull, BullMQ)
- Move to serverless functions with longer timeout
- Batch process clients in smaller groups

## Backup Strategy

### Database Backups

- Enable automated backups on your database provider
- Test restore process quarterly
- Keep at least 30 days of backups

### Code Backups

- Use Git for version control
- Tag releases: `git tag v1.0.0`
- Keep main branch protected

## Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Google Cloud Support:** https://cloud.google.com/support
- **Database Provider:** [Your provider's support]

---

**Ready to deploy!** 🚀

Follow this checklist step-by-step to ensure a smooth deployment.
