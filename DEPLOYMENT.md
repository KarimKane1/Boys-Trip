# Deployment Guide - Trip HQ

This guide will help you deploy your Trip HQ app so your friends can access it and input their travel details in real-time.

## Quick Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps and it's free!

### Step 1: Prepare Your Code

1. Make sure all your changes are committed to Git:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   ```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your app:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default: `boys-trip`)
   - Directory? (Press Enter for `./`)
   - Override settings? **No**

4. Deploy to production:
   ```bash
   vercel --prod
   ```

**Option B: Using Vercel Website**

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### Step 3: Share Your Link

Once deployed, Vercel will give you a URL like:
- `https://boys-trip.vercel.app` (or your custom domain)

**Share this link with your friends!** They can:
- Click on their name in the "Your Info" tab
- Enter their travel details
- See updates from everyone in real-time (refreshes every 5 seconds)

## Important Notes

### Database Persistence

The database (`src/data/database.json`) will be stored on Vercel's serverless filesystem. This means:
- ✅ All changes are saved and shared
- ✅ Everyone sees the same data
- ⚠️ The file persists between deployments but may reset if you redeploy

**For production, consider:**
- Using a real database (MongoDB, PostgreSQL, etc.)
- Using Vercel KV (Redis) for better persistence
- Using a service like Supabase or Firebase

### Real-Time Updates

The app automatically refreshes data every 5 seconds, so when someone updates their info, others will see it within 5 seconds.

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS setup instructions

## Troubleshooting

**Database not saving?**
- Make sure the `src/data/database.json` file exists
- Check Vercel function logs in the dashboard

**Changes not showing?**
- The app auto-refreshes every 5 seconds
- Try manually refreshing the page
- Check browser console for errors

**Need to reset the database?**
- Edit `src/data/database.json` locally
- Commit and push changes
- Vercel will redeploy automatically

## Alternative: Deploy to Other Platforms

### Netlify
1. Connect your Git repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`

### Railway
1. Connect your Git repo
2. Railway auto-detects Next.js
3. Deploy!

### Self-Hosted (VPS)
1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 or similar for process management

---

**Need help?** Check the [Next.js deployment docs](https://nextjs.org/docs/deployment) or [Vercel docs](https://vercel.com/docs).

