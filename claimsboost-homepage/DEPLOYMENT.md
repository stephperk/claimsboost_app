# ClaimsBoost Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set in your production environment:

```bash
# Required for production
PUBLIC_SUPABASE_URL=https://eaqsybrymavpwmdhmlxk.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-key>
MAXMIND_ACCOUNT_ID=<your-maxmind-account-id>
MAXMIND_LICENSE_KEY=<your-maxmind-license-key>
VITE_EMBEDDING_API_URL=https://claimsboost-embedding-api.fly.dev
```

### 2. MaxMind GeoIP2 Setup
1. Sign up for MaxMind GeoLite2 at https://www.maxmind.com/en/geolite2/signup
2. Generate a license key from your account dashboard
3. Add `MAXMIND_ACCOUNT_ID` and `MAXMIND_LICENSE_KEY` to your environment

### 3. Database Setup
✅ Already completed:
- Row Level Security (RLS) enabled on all tables
- Permissions restricted (anon users read-only)
- Functions secured with search_path
- Foreign key indexes added

### 4. Security Features
✅ Implemented:
- **Geolocation**: MaxMind GeoIP2 for real user location detection
- **Cookie Security**: HTTPS-only cookies in production (`secure: true`)
- **Rate Limiting**: API endpoints protected with sliding window algorithm
  - Geocoding: 10 req/min
  - Semantic Search: 20 req/min
  - Standard APIs: 30-60 req/min

### 5. Materialized Views Refresh
⚠️ **Action Required**: Set up a cron job or scheduled task to refresh materialized views

Option A - Using Supabase SQL Editor (recommended):
```sql
-- Run this query on a schedule (daily at 1 AM recommended)
REFRESH MATERIALIZED VIEW CONCURRENTLY law_firm_search_view;
REFRESH MATERIALIZED VIEW CONCURRENTLY settlement_search_view;
```

Option B - Using pg_cron extension:
```sql
-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily refresh at 1 AM UTC
SELECT cron.schedule(
    'refresh-law-firm-view',
    '0 1 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY law_firm_search_view'
);

SELECT cron.schedule(
    'refresh-settlement-view',
    '0 1 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY settlement_search_view'
);
```

## Deployment Steps

### 1. Build the Application
```bash
npm install
npm run build
```

### 2. Deploy to Your Platform

#### Vercel (Recommended)

**Why Vercel?**
- Official SvelteKit adapter support
- Fast edge network for global performance
- Easy environment variable management
- Free tier suitable for production
- Excellent `getClientAddress()` support for rate limiting

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```
This will open your browser to authenticate.

**Step 3: Link Project (First Time Only)**
```bash
# From your project directory
cd /path/to/claimsboost-homepage

# Link to Vercel (creates .vercel directory)
vercel link
```

You'll be prompted to:
- Select your Vercel scope (personal or team)
- Link to existing project or create new one
- Confirm project settings

**Step 4: Add Environment Variables**

Option A - Via Vercel Dashboard (Recommended):
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - `PUBLIC_SUPABASE_URL` = `https://eaqsybrymavpwmdhmlxk.supabase.co`
   - `PUBLIC_SUPABASE_ANON_KEY` = `<your-anon-key>`
   - `PUBLIC_GOOGLE_MAPS_API_KEY` = `<your-google-maps-key>`
   - `MAXMIND_ACCOUNT_ID` = `<your-maxmind-account-id>`
   - `MAXMIND_LICENSE_KEY` = `<your-maxmind-license-key>`
   - `VITE_EMBEDDING_API_URL` = `https://claimsboost-embedding-api.fly.dev`
5. Select environments: Production, Preview, Development
6. Click "Save"

Option B - Via CLI:
```bash
# Add environment variables one at a time
vercel env add PUBLIC_SUPABASE_URL production
vercel env add PUBLIC_SUPABASE_ANON_KEY production
vercel env add PUBLIC_GOOGLE_MAPS_API_KEY production
vercel env add MAXMIND_ACCOUNT_ID production
vercel env add MAXMIND_LICENSE_KEY production
vercel env add VITE_EMBEDDING_API_URL production
```

**Step 5: Deploy to Production**
```bash
# Deploy to production
vercel --prod
```

This will:
1. Build your SvelteKit application
2. Upload to Vercel edge network
3. Return your production URL (e.g., `https://claimsboost.vercel.app`)

**Step 6: Configure Custom Domain (Optional)**
```bash
# Add your custom domain
vercel domains add claimsboost.com

# Follow DNS instructions provided
```

Or via dashboard:
1. Go to Project Settings → Domains
2. Add `claimsboost.com`
3. Update your DNS with provided records

**Preview Deployments**

Every git push to a branch creates a preview deployment:
```bash
# Deploy to preview (non-production)
vercel

# This gives you a unique URL like:
# https://claimsboost-git-feature-branch.vercel.app
```

**Automatic Deployments via Git**

Connect your GitHub repository for automatic deployments:
1. Go to Project Settings → Git
2. Connect GitHub repository
3. Select repository and branch
4. Vercel will automatically deploy on every push to main

**Vercel Build Configuration**

Your `svelte.config.js` should use the Vercel adapter:
```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x', // or 'edge' for edge runtime
      regions: ['iad1'] // Optional: specify regions
    })
  }
};
```

**Monitoring Your Deployment**

After deployment, check:
- Build logs: `vercel logs <deployment-url>`
- Runtime logs: Available in Vercel dashboard
- Analytics: Vercel dashboard → Analytics tab

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Cloudflare Pages
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variables in dashboard

### 3. Post-Deployment Verification

✅ Check these endpoints:
- [ ] `/api/geolocation` - Should return your real location (not Orlando)
- [ ] `/api/law-firms/nearby` - Should work without errors
- [ ] `/api/geocode` - Should rate limit after 10 requests/min
- [ ] Cookies should have `Secure` flag set (check DevTools)

✅ Check rate limiting headers:
```bash
curl -I https://your-domain.com/api/law-firms/nearby
# Should see:
# X-RateLimit-Limit: 30
# X-RateLimit-Remaining: 29
# X-RateLimit-Reset: <unix-timestamp>
```

## Monitoring

### Rate Limit Logs
Watch for rate limit violations in logs:
```
[Rate Limit] Blocked request from <ip> to <endpoint>
```

### Geolocation Logs
Verify geolocation is working:
```
[Geolocation] Detected location: <city>, <state> for IP <ip>
```

### Database Performance
Monitor Supabase dashboard for:
- Query response times
- RLS policy performance
- Materialized view freshness

## Troubleshooting

### Issue: Geolocation returns "New York" for everyone
**Cause**: MaxMind credentials not set or invalid
**Fix**: Verify `MAXMIND_ACCOUNT_ID` and `MAXMIND_LICENSE_KEY` in environment

### Issue: "Rate limit exceeded" too quickly
**Cause**: Multiple users behind same IP (corporate network, VPN)
**Fix**: Adjust rate limits in `/src/lib/server/rateLimit.js`

### Issue: Cookies not setting
**Cause**: Not using HTTPS in production
**Fix**: Ensure deployment platform serves over HTTPS

### Issue: Materialized views showing stale data
**Cause**: Views not being refreshed
**Fix**: Set up automated refresh schedule (see step 5 above)

## Security Notes

- ✅ RLS protects all sensitive tables
- ✅ API keys are in environment variables (never in code)
- ✅ Rate limiting prevents abuse
- ✅ HTTPS-only cookies in production
- ✅ No SQL injection vulnerabilities (using Supabase client)

## Performance Expectations

- **Law Firm Search**: 60-150ms (with PostGIS indexing)
- **Geolocation**: ~100ms (MaxMind API call, then cached)
- **Settlements**: Instant (materialized view)
- **Rate Limit Overhead**: < 1ms per request

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Check Supabase dashboard for database errors
4. Review rate limit configuration in `rateLimit.js`
