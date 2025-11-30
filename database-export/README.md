# BATIFACILE Database Export

Complete database schema export for the BATIFACILE Hardware Store Management System.

## 📁 Files in This Directory

### 1. `schema.sql` (30 KB)
**Complete PostgreSQL database schema**

Contains the full SQL code to create all 26 tables, indexes, triggers, and Row Level Security policies. This is the main file you'll use to set up your Supabase database.

**What's included:**
- All table CREATE statements
- All foreign key relationships
- All indexes for performance
- All triggers for auto-updating timestamps
- Row Level Security (RLS) setup
- RLS policies for all tables
- Initial company info data

**How to use:**
1. Open Supabase SQL Editor
2. Copy entire file contents
3. Paste and run
4. Verify tables created

### 2. `tables-list.md` (20 KB)
**Complete reference documentation**

Detailed documentation of all 26 database tables with descriptions, key fields, relationships, and indexes.

**Sections:**
- Core Business Tables (6 tables)
- Procurement Tables (3 tables)
- Shipment Tracking Tables (11 tables)
- Warehouse Management Tables (2 tables)
- Partner Tracking Tables (3 tables)
- System Tables (1 table)

**Use this for:**
- Understanding table structure
- Finding table relationships
- Reference during development
- Onboarding new team members

### 3. `migration-guide.md` (13 KB)
**Step-by-step migration instructions**

Complete guide for importing the schema into Supabase, including troubleshooting, verification steps, and next steps.

**Covers:**
- Prerequisites and setup
- Step-by-step migration process
- Verification queries
- Troubleshooting common issues
- Post-migration configuration
- Production considerations

**Follow this to:**
- Set up database from scratch
- Verify migration success
- Configure your application
- Prepare for production

## 🚀 Quick Start

**5-Minute Setup:**

1. **Open** `migration-guide.md` and follow the Quick Start section
2. **Copy** contents of `schema.sql`
3. **Paste** into Supabase SQL Editor
4. **Run** the migration
5. **Verify** using the verification queries in the guide

That's it! Your database is ready to use.

## 📊 Database Overview

**26 Tables Total:**

| Category | Tables | Purpose |
|----------|--------|---------|
| Core Business | 6 | Products, customers, sales, payments |
| Procurement | 3 | Purchase orders and expenses |
| Cement Shipments | 2 | Cement tracking from 3 origins |
| Iron Commands | 5 | Iron/rebar procurement & QC |
| Wood Shipments | 2 | Wood/lumber tracking |
| Paint Shipments | 2 | Paint/coating tracking |
| Warehouse | 2 | Reception and stock movements |
| Partner Tracking | 3 | Partner vehicle cement sales |
| System | 1 | Company information |

**Key Features:**
- ✅ Row Level Security on all tables
- ✅ 18+ indexes for performance
- ✅ 9 auto-update triggers
- ✅ Complete foreign key relationships
- ✅ Flexible JSONB for product attributes
- ✅ Comprehensive expense tracking
- ✅ Multi-origin shipment support

## 🗃️ Database Structure

```
┌─────────────────────────────────────────┐
│          CORE BUSINESS LAYER            │
├─────────────────────────────────────────┤
│  products → sale_items ← sales          │
│              ↓             ↓             │
│          customers ← payments            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         PROCUREMENT LAYER               │
├─────────────────────────────────────────┤
│  purchase_orders                         │
│    ├─ po_products                        │
│    └─ po_expenses                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      SHIPMENT TRACKING LAYER            │
├─────────────────────────────────────────┤
│  cement_shipments → expenses             │
│  iron_commands → items/expenses/QC       │
│  wood_shipments → expenses/warehouse     │
│  paint_shipments → expenses/warehouse    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         WAREHOUSE LAYER                 │
├─────────────────────────────────────────┤
│  warehouse_receptions                    │
│  stock_movements                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        PARTNER TRACKING LAYER           │
├─────────────────────────────────────────┤
│  partner_vehicles                        │
│    ├─ partner_sales                      │
│    └─ partner_expenses                   │
└─────────────────────────────────────────┘
```

## 🔐 Security Features

**Row Level Security (RLS):**
- All tables have RLS enabled by default
- Authenticated users get full CRUD access
- Partner vehicles have public read access with PIN
- Tables are locked down until policies are added

**Best Practices Implemented:**
- UUID primary keys (not sequential integers)
- Foreign keys with CASCADE/SET NULL
- Indexed columns for performance
- Timestamp tracking on all records
- Separate expense tracking tables

## 📱 Application Integration

**Environment Variables Needed:**
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Sample Query (TypeScript):**
```typescript
import { supabase } from './lib/supabase'

// Fetch products
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'ciment')
  .order('name')

// Create sale
const { data: sale } = await supabase
  .from('sales')
  .insert({
    receipt_number: 'REC-001',
    customer_name: 'John Doe',
    customer_type: 'détail',
    payment_method: 'cash',
    total: 50000,
    amount_paid: 50000,
    payment_status: 'paid',
    seller: 'Admin'
  })
  .select()
  .single()
```

## 🎯 Use Cases

This database schema supports:

✅ **Retail & Wholesale Operations**
- Product inventory management
- Customer tracking with credit limits
- Point of sale transactions
- Payment tracking and reconciliation

✅ **Procurement & Supply Chain**
- Purchase order management
- Multi-origin shipment tracking (Nigeria, Cameroun, Tchad)
- Expense tracking by stage
- Quality control and discrepancy recording

✅ **Warehouse Management**
- Stock reception and condition assessment
- Movement tracking (in/out)
- Running balance maintenance
- Damaged goods recording

✅ **Partner Management**
- Vehicle-based cement sales
- Partner sales tracking
- Expense tracking
- Public access with PIN

✅ **Financial Tracking**
- Customer credit management
- Payment history
- Revenue tracking by shipment
- Comprehensive expense tracking

## 📚 Related Files

**Application Code:**
- `/src/types/index.ts` - TypeScript type definitions
- `/src/lib/supabase.ts` - Supabase client setup
- `/src/context/AppContext.tsx` - Application state management

**Database Migrations:**
- `/supabase/migrations/` - Existing migrations
- Already includes partner tracking tables

## ⚠️ Important Notes

1. **Data Safety:** Schema creates empty tables. No sample data is included by default.

2. **RLS Impact:** With RLS enabled, queries will return 0 rows until you authenticate or adjust policies.

3. **Authentication Required:** Set up Supabase Auth for production use.

4. **Backup First:** If migrating existing data, back up first!

5. **Test Environment:** Test in a development project before production deployment.

## 🛠️ Maintenance

**Regular Tasks:**
- Run ANALYZE after bulk data imports
- Monitor query performance
- Review and optimize RLS policies
- Check storage usage
- Back up regularly

**Schema Changes:**
- Document all changes
- Create new migration files
- Test in development first
- Use transactions for safety

## 📞 Support

**Supabase Resources:**
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

**Need Help?**
1. Check `migration-guide.md` troubleshooting section
2. Review `tables-list.md` for table details
3. Consult Supabase documentation
4. Ask in Supabase Discord community

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Schema migrated successfully
- [ ] All 26 tables verified
- [ ] RLS policies reviewed
- [ ] Sample queries tested
- [ ] Authentication configured
- [ ] Environment variables set
- [ ] Backup strategy in place
- [ ] Team access granted
- [ ] Documentation reviewed
- [ ] Performance tested

## 🎉 You're Ready!

With these files, you have everything needed to:
- Set up a complete database
- Understand the structure
- Integrate with your application
- Deploy to production

Start with `migration-guide.md` for step-by-step instructions!

---

**Generated:** 2024-11-30
**Version:** 1.0
**For:** BATIFACILE Hardware Store Management System
**Database:** PostgreSQL (Supabase)
**Tables:** 26
**Total Size:** ~63 KB documentation
