# Trip HQ

A collaborative trip planning app built with Next.js 14, TypeScript, and Tailwind CSS. Share a link with your friends so everyone can input their travel details and see updates in real-time!

## Features

- **Your Info Tab**: Each person can click on their name card to enter:
  - Arrival/departure dates and cities
  - Exact date ranges for each city (London, Paris, Amsterdam)
  - Status (Coming, Tentative, Not Coming)
- **Calendar Tab**: Visual calendar showing who will be where and when
- **Hotels Tab**: 
  - London: Fixed display of The Drey hotel with room types and pricing
  - Paris & Amsterdam: Add and manage hotel options
- **Shared Database**: All changes are saved to a shared database and visible to everyone (refresh to see updates)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment & Sharing

**Want to share this with your friends?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions to deploy to Vercel (free and easy!).

Once deployed, you'll get a shareable link like `https://your-app.vercel.app` that your friends can use to:
- Input their travel details
- See everyone's information
- View the calendar and hotels

All changes are saved to the database and visible to everyone in real-time!

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes for database operations
│   ├── page.tsx           # Main home page with tabs
│   └── layout.tsx         # Root layout
├── components/
│   ├── PeopleTab.tsx      # Your Info tab
│   ├── CalendarTab.tsx    # Calendar view
│   └── HotelsTab.tsx      # Hotels management
├── data/
│   ├── tripData.ts        # TypeScript interfaces
│   └── database.json      # Persistent database (JSON file)
└── lib/
    ├── api.ts             # Client-side API utilities
    └── database.ts        # Server-side database functions
```

## Data Management

All data is stored in `/src/data/database.json`:
- **People**: Travel details, dates, city ranges
- **Hotels**: Hotel information for each city
- **London Hotel**: The Drey hotel details (fixed)

The database is shared across all users, so when someone updates their info, it's saved and visible to everyone.

## Real-Time Updates

The app automatically refreshes data every 5 seconds. You'll see a "Live updates" indicator in the top right showing when data was last refreshed.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **JSON Database** (file-based, can be upgraded to a real database)

## Notes

- Currently uses a JSON file as the database (works great for small groups!)
- For production with many users, consider upgrading to a real database (MongoDB, PostgreSQL, etc.)
- All API routes are serverless and handle database reads/writes
- No authentication required (everyone can edit - perfect for trusted groups!)

---

**Ready to deploy?** Check out [DEPLOYMENT.md](./DEPLOYMENT.md)!
