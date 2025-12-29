#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until node -e "
const { Client } = require('pg');
const c = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
c.connect().then(() => process.exit(0)).catch(() => process.exit(1));
"; do
  sleep 2
done

echo "🌱 Running database seed..."
npm run seed || echo "⚠️ Seed failed, continuing..."

echo "🚀 Starting server..."
exec npm start