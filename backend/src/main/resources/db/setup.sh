#!/bin/bash

# Food Delivery Platform - Database Setup Script
# This script creates the database and loads the schema

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
DB_NAME="fooddelivery"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
LOAD_SEED="yes"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --db-name)
            DB_NAME="$2"
            shift 2
            ;;
        --db-user)
            DB_USER="$2"
            shift 2
            ;;
        --db-host)
            DB_HOST="$2"
            shift 2
            ;;
        --db-port)
            DB_PORT="$2"
            shift 2
            ;;
        --no-seed)
            LOAD_SEED="no"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --db-name NAME      Database name (default: fooddelivery)"
            echo "  --db-user USER      Database user (default: postgres)"
            echo "  --db-host HOST      Database host (default: localhost)"
            echo "  --db-port PORT      Database port (default: 5432)"
            echo "  --no-seed           Skip loading seed data"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Food Delivery Platform - DB Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get PostgreSQL password
echo -n "Enter PostgreSQL password for user '$DB_USER': "
read -s PGPASSWORD
export PGPASSWORD
echo ""

# Step 1: Create database
echo -e "${BLUE}[1/3] Creating database '$DB_NAME'...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created/verified${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

# Step 2: Load schema
echo -e "${BLUE}[2/3] Loading schema...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/schema.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Schema loaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to load schema${NC}"
    exit 1
fi

# Step 3: Load seed data (optional)
if [ "$LOAD_SEED" = "yes" ]; then
    echo -e "${BLUE}[3/3] Loading seed data...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/seed.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Seed data loaded successfully${NC}"
    else
        echo -e "${RED}✗ Failed to load seed data${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}[3/3] Skipping seed data (--no-seed flag)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""
echo "Test credentials:"
echo "  Customer: customer@test.com / password123"
echo "  Restaurant: restaurant@test.com / password123"
echo "  Delivery: delivery@test.com / password123"
echo "  Admin: admin@test.com / password123"

# Unset password
unset PGPASSWORD



