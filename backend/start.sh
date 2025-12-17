#!/bin/sh
set -e

echo "🌱 Running database seed..."
npm run seed || echo "⚠️  Seed script failed or database not ready, continuing..."

echo "🚀 Starting server..."
exec npm start

