#!/bin/sh
set -e

echo "Starting Django..."

# Wait for database to be ready (important for Supabase remote database)
echo "Waiting for database..."

# Extract host from DATABASE_URL
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"
DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:]+):([0-9]+)/.*|\1|')
DB_PORT=$(echo "$DB_URL" | sed -E 's|.*@([^:]+):([0-9]+)/.*|\2|')
DB_PORT="${DB_PORT:-5432}"

MAX_RETRIES=30
RETRY_INTERVAL=3

# Try to connect to the database
retry_count=0
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U postgres > /dev/null 2>&1 || [ $retry_count -ge $MAX_RETRIES ]; do
    echo "  Database unavailable (attempt $((retry_count+1))/$MAX_RETRIES). Waiting ${RETRY_INTERVAL}s..."
    retry_count=$((retry_count+1))
    sleep $RETRY_INTERVAL
done

if [ $retry_count -ge $MAX_RETRIES ]; then
    echo "WARNING: Database not ready after ${MAX_RETRIES} attempts. Starting anyway..."
else
    echo "Database is ready!"
fi

echo "Running migrations..."
python manage.py migrate --noinput || echo "WARNING: Migration failed, continuing..."

exec "$@"
