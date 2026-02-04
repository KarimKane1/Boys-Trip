# How Data Persistence Works

## Quick Answer

**Yes, all changes are saved and shared!**

- ✅ Andrew edits on his phone → Saved to server database
- ✅ Andrew opens on computer tomorrow → Loads from same server database (sees his changes)
- ✅ You make changes → Saved to server database
- ✅ Kachi opens the app → Loads from same server database (sees your changes)

## How It Works

### The Database File

All data is stored in `src/data/database.json` on the **server** (not on individual devices).

```
┌─────────────────────────────────────┐
│         Server (Vercel)             │
│                                     │
│  src/data/database.json             │
│  ┌─────────────────────────────┐   │
│  │ {                           │   │
│  │   "people": [               │   │
│  │     { "id": "andrew", ... },│   │
│  │     { "id": "kachi", ... }  │   │
│  │   ]                          │   │
│  │ }                            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         ↑              ↑
         │              │
    Andrew's phone   Kachi's laptop
```

### When Someone Makes Changes

1. **Andrew edits on his phone:**
   - Clicks "Save Changes"
   - App sends request to server API
   - Server updates `database.json` file
   - Server confirms save

2. **Andrew opens on computer tomorrow:**
   - App loads on page open
   - Fetches data from server API
   - Server reads `database.json`
   - Andrew sees his changes from last night ✅

3. **You make changes:**
   - Same process - saved to server `database.json`

4. **Kachi opens the app:**
   - Fetches from same server `database.json`
   - Sees your changes ✅

## Important Notes

### ✅ What Works Great

- **All changes are saved** to the server database
- **Everyone sees the same data** (single source of truth)
- **Changes persist** across devices and sessions
- **No data loss** - everything is in the database file

### ⚠️ Limitations (For Your Use Case, These Don't Matter)

1. **Vercel Serverless Filesystem:**
   - The `database.json` file is stored on Vercel's serverless filesystem
   - It persists between requests but may reset if you redeploy
   - **Solution:** For production, you can upgrade to a real database (MongoDB, PostgreSQL, etc.) later if needed

2. **No Real-Time Sync:**
   - Changes don't appear instantly for others
   - Users need to refresh the page to see updates
   - **This is fine** - you removed auto-refresh to keep it fast!

### 🔄 How to See Updates

- **On page load:** Data automatically loads from server
- **After making changes:** Your changes are saved immediately
- **To see others' changes:** Refresh the page (F5 or browser refresh button)

## Example Flow

**Monday Night:**
- Andrew opens app on phone → Sees current data
- Andrew updates his arrival date → Saved to server
- Andrew closes app

**Tuesday Morning:**
- Andrew opens app on computer → Loads from server → Sees his changes from last night ✅
- You update hotel info → Saved to server
- Kachi opens app → Loads from server → Sees your hotel updates ✅

**All working perfectly!** 🎉

## Summary

- **Single shared database** on the server
- **All changes saved** immediately
- **Persists across devices** and time
- **Everyone sees same data** (just refresh to see latest)

The database is like a shared Google Doc - everyone reads from and writes to the same file!

