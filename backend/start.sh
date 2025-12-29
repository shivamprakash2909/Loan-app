#!/bin/sh
set -e

echo "🌱 Running database seed..."
if node seeds/seed.js; then
  echo "✅ Seed process completed"
else
  echo "⚠️ Seed process encountered an error, but continuing..."
fi

echo "🚀 Starting server..."
exec npm start