#!/bin/sh
set -e

echo "🌱 Running database seed..."
node seeds/seed.js || echo "⚠️ Seed already applied, continuing..."

echo "🚀 Starting server..."
exec npm start