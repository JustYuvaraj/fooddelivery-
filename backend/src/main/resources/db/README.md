# Database Setup Guide

This directory contains the database schema and seed data for the Food Delivery Platform.

## Files

- `schema.sql` - Complete database schema with all tables, indexes, triggers, and functions
- `seed.sql` - Sample data for testing and development
- `README.md` - This file

## Setup Instructions

### Prerequisites

- PostgreSQL 15 or higher installed and running
- Database user with CREATE DATABASE privileges

### Step 1: Create Database

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE fooddelivery;

-- Connect to the new database
\c fooddelivery
```

### Step 2: Run Schema

```bash
# From the backend directory
psql -U postgres -d fooddelivery -f src/main/resources/db/schema.sql
```

Or from within psql:

```sql
\i src/main/resources/db/schema.sql
```

### Step 3: Load Seed Data (Optional)

```bash
# From the backend directory
psql -U postgres -d fooddelivery -f src/main/resources/db/seed.sql
```

Or from within psql:

```sql
\i src/main/resources/db/seed.sql
```

### Step 4: Verify Setup

```sql
-- Check tables
\dt

-- Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM restaurants;
SELECT COUNT(*) FROM products;

-- View sample data
SELECT * FROM users;
SELECT * FROM restaurants;
```

## Test Credentials

After loading seed data, you can use these credentials to test:

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | password123 |
| Restaurant Owner | restaurant@test.com | password123 |
| Delivery Agent | delivery@test.com | password123 |
| Admin | admin@test.com | password123 |

## Database Structure

### Tables Created

1. **users** - User accounts (customers, restaurant owners, delivery agents, admins)
2. **user_addresses** - Customer delivery addresses
3. **restaurants** - Restaurant profiles
4. **products** - Menu items
5. **orders** - Customer orders
6. **order_items** - Order line items
7. **delivery_assignments** - Delivery agent assignments
8. **order_status_history** - Order status audit trail
9. **agent_locations** - Real-time location tracking
10. **notifications** - User notifications
11. **reviews** - Customer reviews and ratings

### Key Features

- ✅ All foreign key constraints
- ✅ Comprehensive indexes for performance
- ✅ Automatic timestamp updates via triggers
- ✅ Order status history tracking
- ✅ JSONB support for flexible data (notifications)
- ✅ Check constraints for data validation

## Advanced Setup (Optional)

### Enable PostGIS for Geo-Spatial Queries

If you want to use PostGIS for more efficient geo-spatial queries:

```sql
-- Install PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Then recreate geo indexes (already in schema.sql, just uncomment the GIST indexes)
```

### Production Considerations

1. **Backups**: Set up regular database backups
2. **Connection Pooling**: Configure appropriate connection pool size
3. **Indexes**: Monitor and add indexes based on query patterns
4. **Partitioning**: Consider partitioning large tables (orders, notifications)
5. **Archiving**: Archive old orders and notifications

## Troubleshooting

### Common Issues

**Error: "relation already exists"**
- Drop the database and recreate, or drop individual tables

**Error: "type already exists"**
- Drop types first: `DROP TYPE IF EXISTS user_role CASCADE;`

**Error: "permission denied"**
- Ensure your database user has CREATE privileges

### Reset Database

To completely reset the database:

```sql
-- Drop all objects
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run schema.sql again
```

## Notes

- All timestamps are stored in UTC
- Passwords are BCrypt hashed
- Geo coordinates use DECIMAL(10, 8) for latitude and DECIMAL(11, 8) for longitude
- The schema includes views for common queries (active_orders_summary, delivery_agent_performance)



