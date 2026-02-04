# Quick Setup - Using GitHub as Database

Since you already have a GitHub account, we'll use GitHub itself to store the data! No separate database needed.

## Step 1: Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Boys Trip App"
4. Select expiration: "No expiration" (or choose a date)
5. Check the box: **`repo`** (Full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

## Step 2: Add Token to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `GITHUB_TOKEN`
   - **Value:** (paste the token you copied)
   - **Environment:** Production, Preview, Development (check all)
4. Click **Save**

## Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**

That's it! Now your app will save all changes directly to your GitHub repository. No separate database account needed!

## How It Works

- **Local development:** Uses `database.json` file (works as before)
- **Production (Vercel):** Saves changes to GitHub repository using the API
- All changes are committed to your `Boys-Trip` repo automatically
- Everyone sees the same data because it's all in one GitHub repo

## Security Note

The GitHub token only has access to your `Boys-Trip` repository, so it's safe. If you want to revoke it later, just go back to https://github.com/settings/tokens and delete it.

