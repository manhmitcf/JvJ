#!/bin/sh
set -e

echo "Đang kết nối Supabase database..."
echo "Đang chạy migrations..."
python manage.py migrate --no-input

echo "Django ready!"
exec "$@"
