#!/bin/bash

# Script to run the player images migration
# This script sends a request to the admin API to run the migration

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Check if ADMIN_API_KEY is set
if [ -z "$ADMIN_API_KEY" ]; then
  echo "Error: ADMIN_API_KEY not found in .env.local"
  exit 1
fi

# Check if NEXT_PUBLIC_SITE_URL is set
if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
  echo "Warning: NEXT_PUBLIC_SITE_URL not found in .env.local, using http://localhost:3000"
  NEXT_PUBLIC_SITE_URL="http://localhost:3000"
fi

# Run the migration
echo "Running player images migration..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -d '{"migrationName":"db-migration-player-images"}' \
  "$NEXT_PUBLIC_SITE_URL/api/admin/run-migration"

echo -e "\nMigration complete. You can now visit $NEXT_PUBLIC_SITE_URL/player-image-demo to test the player image component." 