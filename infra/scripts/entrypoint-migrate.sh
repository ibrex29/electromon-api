#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "==> Waiting for database..."
attempt=0
until nc -z postgres 5432 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "ERROR: Database not reachable after 60s"
    exit 1
  fi
  sleep 2
done

echo "==> Running database migrations..."
cd /app
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "==> Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "==> Migrations complete."
