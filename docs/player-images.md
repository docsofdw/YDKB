# Player Images Integration

This document describes the integration with TheSportsDB API to fetch and display player images in the application.

## Overview

The player images feature allows the application to:

1. Fetch player images from TheSportsDB API
2. Store them in the Supabase database
3. Display them in the UI with a fallback to initials when no image is available

## Components

### 1. API Route

The API route `/api/player/[playerName]` handles:
- Fetching player data from TheSportsDB
- Storing the data in Supabase
- Returning the player data with image URL or initials

### 2. PlayerImage Component

The `PlayerImage` component (`app/components/PlayerImage.tsx`) is a React component that:
- Fetches player data from the API
- Displays the player image if available
- Falls back to displaying initials in a colored circle if no image is available
- Supports different sizes and custom styling

### 3. Database Schema

The players table has been extended with the following columns:
- `image_url`: URL to the player's image from TheSportsDB
- `image_type`: Either 'url' or 'initials' to indicate the type of image
- `initials`: Player's initials for fallback display
- `last_updated`: Timestamp of when the player data was last updated

## Usage

### Basic Usage

```tsx
import PlayerImage from '@/app/components/PlayerImage';

// In your component
<PlayerImage playerName="Tom Brady" />
```

### With Custom Size

```tsx
<PlayerImage playerName="Tom Brady" size={96} />
```

### With Custom Styling

```tsx
<PlayerImage 
  playerName="Tom Brady" 
  size={64} 
  className="border-2 border-blue-500" 
/>
```

## Demo Page

A demo page is available at `/player-image-demo` to showcase the PlayerImage component with various players and sizes.

## Implementation Details

### TheSportsDB API

The application uses the free tier of TheSportsDB API (key: 3) to fetch player data. The API endpoint used is:

```
https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p={playerName}
```

### Caching Strategy

- API responses are cached for 24 hours using Next.js's built-in caching
- Player data is stored in Supabase to reduce API calls
- The component checks the database first before making an API call

### Fallback Mechanism

When no image is available, the component:
1. Generates initials from the player's name
2. Creates a colored background based on the player's name (consistent for the same name)
3. Displays the initials in a circle with the colored background

## Running the Migration

To set up the database schema for player images, run:

```bash
./scripts/run-player-images-migration.sh
```

This script will:
1. Load environment variables from `.env.local`
2. Send a request to the admin API to run the migration
3. Set up the necessary columns in the players table

## Environment Variables

The following environment variables are used:

- `THESPORTSDB_API_KEY`: API key for TheSportsDB (defaults to '3' for free tier)
- `NEXT_PUBLIC_SUPABASE_URL`: URL for your Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous key for Supabase client
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations 