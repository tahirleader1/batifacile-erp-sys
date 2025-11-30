# BATIFACILE Database Migration Guide

Complete guide for importing and setting up the database schema in Supabase.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Next Steps](#next-steps)

---

## Prerequisites

Before starting the migration, ensure you have:

✅ **Supabase Account**
- Active Supabase project
- Project URL and API keys

✅ **Database Access**
- Access to Supabase SQL Editor
- Project connection string (optional for CLI)

✅ **Files Ready**
- `schema.sql` - Complete database schema
- `tables-list.md` - Reference documentation

---

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended)

**This is the easiest method for most users.**

1. Log into your Supabase project at https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. Wait for execution to complete (should take 10-30 seconds)
8. Verify tables were created (see [Verification](#verification) section)

### Option 2: Using Supabase CLI

**For users comfortable with command line tools.**

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db reset
# Then manually run schema.sql through the dashboard
```

---

## Step-by-Step Migration

### Step 1: Prepare Your Supabase Project

1. **Create a New Supabase Project** (if you don't have one)
   - Go to https://app.supabase.com
   - Click "New Project"
   - Choose organization, name, database password, region
   - Wait for project to be provisioned (2-3 minutes)

2. **Note Your Credentials**
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public key: `eyJhbGc...` (for frontend)
   - Service role key: `eyJhbGc...` (for backend, keep secret!)

### Step 2: Access SQL Editor

1. In your Supabase dashboard, click **SQL Editor** in left sidebar
2. You'll see the SQL query interface

### Step 3: Run the Schema Migration

1. **Open schema.sql** in a text editor
2. **Copy the entire file contents** (Ctrl+A, Ctrl+C)
3. **Paste into Supabase SQL Editor**
4. **Review** the SQL (optional but recommended)
5. Click **RUN** button or press Ctrl+Enter

**Expected Result:**
- Success message: "Success. No rows returned"
- Execution time: ~10-30 seconds
- No errors

### Step 4: Verify Table Creation

After running the migration, verify tables were created:

**Option A: Using Table Editor**
1. Click **Table Editor** in left sidebar
2. You should see all 26 tables listed
3. Click on any table to view its structure

**Option B: Using SQL Query**
```sql
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

This should return 26 rows (one for each table).

### Step 5: Verify Row Level Security (RLS)

Check that RLS is enabled on all tables:

```sql
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
```

This should return **0 rows** (all tables have RLS enabled).

### Step 6: Verify Indexes

Check that indexes were created:

```sql
SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should return at least 18 indexes.

### Step 7: Verify Triggers

Check that triggers were created:

```sql
SELECT
    trigger_name,
    event_object_table AS table_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

Should return 9 triggers for `updated_at` columns.

---

## Verification

### Complete Verification Checklist

Run these queries to ensure everything is set up correctly:

#### 1. Count Tables
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
```
**Expected:** `26`

#### 2. Check Core Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'products',
    'customers',
    'sales',
    'sale_items',
    'payments',
    'cement_shipments',
    'iron_commands',
    'wood_shipments',
    'paint_shipments',
    'partner_vehicles'
)
ORDER BY table_name;
```
**Expected:** All 10 table names returned

#### 3. Check RLS Policies
```sql
SELECT
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
**Expected:** At least 26 policies (one per table)

#### 4. Test Sample Query
```sql
-- This should work without errors (even if empty)
SELECT * FROM products LIMIT 1;
SELECT * FROM customers LIMIT 1;
SELECT * FROM sales LIMIT 1;
```

#### 5. Check Company Info
```sql
SELECT * FROM company_info;
```
**Expected:** 1 row with BATIFACILE default data

---

## Troubleshooting

### Error: "relation already exists"

**Problem:** Tables already exist in your database.

**Solution:**
```sql
-- Drop all tables (WARNING: This deletes all data!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run schema.sql again
```

### Error: "permission denied"

**Problem:** Insufficient permissions.

**Solution:**
- Ensure you're using the project owner account
- Check that you're connected to the correct project
- Try refreshing your browser session

### Error: "syntax error at or near"

**Problem:** SQL syntax issue or incomplete paste.

**Solution:**
- Ensure you copied the ENTIRE schema.sql file
- Check that no characters were corrupted during copy/paste
- Try pasting in smaller sections to isolate the error

### Tables Created But No Data

**Problem:** This is expected! The schema creates empty tables.

**Solution:**
- The schema only creates structure, not sample data
- Sample data is inserted via the application or separate migration
- You can manually insert test data if needed

### RLS Blocking Queries

**Problem:** Queries return 0 rows or "permission denied" errors.

**Solution:**
- RLS is enabled by default for security
- For testing, you can temporarily disable RLS:
```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- (repeat for tables you want to test)
```
- For production, set up proper authentication with Supabase Auth

### Slow Query Performance

**Problem:** Queries are slow after migration.

**Solution:**
```sql
-- Analyze tables to update statistics
ANALYZE products;
ANALYZE customers;
ANALYZE sales;
-- (repeat for other tables)

-- Or analyze all tables at once:
ANALYZE;
```

---

## Next Steps

### 1. Configure Environment Variables

Update your `.env` file with Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Set Up Authentication

If you haven't already, configure Supabase Auth:

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Configure email provider or other auth methods
3. Set up email templates
4. Configure redirect URLs

### 3. Insert Sample Data

You can insert sample data for testing:

```sql
-- Insert sample products
INSERT INTO products (name, category, unit, retail_price, wholesale_price, stock_quantity)
VALUES
    ('Ciment CIMAF 50kg', 'ciment', 'sac', 5500, 5000, 200),
    ('Fer à béton 8mm', 'fer', 'barre', 8500, 8000, 300),
    ('Planche sapin 4m', 'bois', 'planche', 15000, 14000, 100),
    ('Peinture acrylique 25L', 'peinture', 'bidon', 35000, 33000, 50);

-- Insert sample customers
INSERT INTO customers (name, phone, type, allow_credit, credit_limit)
VALUES
    ('Jean Dupont', '+235 66 12 34 56', 'détail', true, 500000),
    ('BTP Tchad', '+235 62 11 22 33', 'gros', true, 10000000);
```

### 4. Update Application Code

Update your React application to use Supabase:

**src/lib/supabase.ts** (already exists)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Example: Fetch products**
```typescript
import { supabase } from './lib/supabase'

// Fetch all products
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .order('name')

if (error) {
  console.error('Error fetching products:', error)
} else {
  console.log('Products:', products)
}
```

### 5. Set Up Real-time Subscriptions (Optional)

Enable real-time updates for tables:

1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable replication for tables you want to subscribe to
3. In your code:

```typescript
// Subscribe to product changes
const subscription = supabase
  .channel('products-channel')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'products' },
    (payload) => {
      console.log('Product changed:', payload)
    }
  )
  .subscribe()

// Cleanup when done
subscription.unsubscribe()
```

### 6. Configure Storage (For Photos)

If you need to store photos (receipts, warehouse photos, etc.):

1. Go to **Storage** in Supabase dashboard
2. Create a bucket (e.g., "receipts", "warehouse-photos")
3. Set up storage policies for access control

### 7. Set Up Database Backups

1. Go to **Database** → **Backups** in Supabase dashboard
2. Configure automatic daily backups (included in paid plans)
3. Test restore process

### 8. Monitor Database Performance

1. Go to **Database** → **Roles** for connection info
2. Use **Database** → **Extensions** to add useful extensions:
   - `pg_stat_statements` - Query performance
   - `pg_trgm` - Better text search
3. Monitor query performance in **Logs** section

---

## Production Considerations

### Security Checklist

- [ ] Enable RLS on all tables
- [ ] Review and tighten RLS policies based on your requirements
- [ ] Never expose service role key in frontend code
- [ ] Use anon key for frontend, service key only for backend
- [ ] Set up proper authentication before going live
- [ ] Review and limit database role permissions
- [ ] Enable MFA for Supabase account

### Performance Checklist

- [ ] Run ANALYZE on all tables after initial data load
- [ ] Add additional indexes for your specific query patterns
- [ ] Set up connection pooling if needed
- [ ] Monitor slow queries and optimize
- [ ] Consider partitioning large tables (sales, payments) by date

### Maintenance Checklist

- [ ] Set up automated backups
- [ ] Document any schema changes
- [ ] Create migration files for future changes
- [ ] Monitor database size and storage usage
- [ ] Set up alerts for errors and performance issues

---

## Support Resources

### Supabase Documentation
- **Main Docs:** https://supabase.com/docs
- **Database Guide:** https://supabase.com/docs/guides/database
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **SQL Editor:** https://supabase.com/docs/guides/database/sql-editor

### Community Support
- **Discord:** https://discord.supabase.com
- **GitHub Discussions:** https://github.com/supabase/supabase/discussions
- **Twitter:** @supabase

### BATIFACILE Specific
- Review `tables-list.md` for complete table reference
- Check `schema.sql` for table structures and relationships
- Refer to TypeScript types in `src/types/index.ts`

---

## Migration Checklist

Use this checklist to track your migration progress:

**Pre-Migration:**
- [ ] Supabase project created
- [ ] Project credentials noted
- [ ] schema.sql file reviewed
- [ ] Backup of existing data (if migrating)

**Migration:**
- [ ] SQL Editor accessed
- [ ] schema.sql executed successfully
- [ ] No errors in execution

**Verification:**
- [ ] 26 tables created
- [ ] RLS enabled on all tables
- [ ] 18+ indexes created
- [ ] 9 triggers created
- [ ] 26+ policies created
- [ ] Sample queries work

**Post-Migration:**
- [ ] Environment variables updated
- [ ] Sample data inserted (optional)
- [ ] Application code updated
- [ ] Authentication configured
- [ ] Storage configured (if needed)
- [ ] Backups enabled
- [ ] Team access granted

**Production Readiness:**
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained

---

## Conclusion

After completing this migration, you should have:

✅ Complete database schema deployed to Supabase
✅ All 26 tables with proper structure
✅ Row Level Security enabled
✅ Indexes for performance
✅ Triggers for automatic updates
✅ Ready to connect from your application

If you encounter any issues not covered in this guide, refer to the Supabase documentation or reach out to their support community.

**Happy building! 🚀**

---

**Document Version:** 1.0
**Last Updated:** 2024-11-30
**For:** BATIFACILE Hardware Store Management System
