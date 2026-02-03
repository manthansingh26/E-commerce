#!/bin/bash

# AuraExpress Database Setup Script

echo "Setting up AuraExpress Authentication Database..."

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
DB_NAME=${DB_NAME:-auraexpress_auth}
DB_USER=${DB_USER:-postgres}

# Create database if it doesn't exist
echo "Creating database '$DB_NAME'..."
psql -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -U $DB_USER -c "CREATE DATABASE $DB_NAME"

# Run schema
echo "Running database schema..."
psql -U $DB_USER -d $DB_NAME -f schema.sql

echo "Database setup complete!"
