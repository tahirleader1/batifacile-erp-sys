# BATIFACILE Database Tables Reference

Complete list of all database tables used in the BATIFACILE Hardware Store application.

## Table of Contents
- [Core Business Tables](#core-business-tables)
- [Procurement Tables](#procurement-tables)
- [Shipment Tracking Tables](#shipment-tracking-tables)
- [Warehouse Management Tables](#warehouse-management-tables)
- [Partner Tracking Tables](#partner-tracking-tables)
- [System Tables](#system-tables)

---

## Core Business Tables

### 1. `products`
**Purpose:** Central inventory table storing all products across all categories

**Key Fields:**
- `id` (uuid) - Primary key
- `name` (text) - Product name
- `category` (text) - 'ciment', 'fer', 'bois', 'peinture'
- `unit` (text) - Unit of measurement
- `retail_price` (numeric) - Price for retail customers
- `wholesale_price` (numeric) - Price for wholesale customers
- `stock_quantity` (numeric) - Current inventory level
- `reorder_level` (numeric) - Minimum stock before reorder alert
- `location` (text) - 'magasin' or 'véhicule'
- `supplier` (text) - Supplier name
- `source_type` (text) - Origin of product (shipment type)
- `source_id` (text) - Reference to source shipment

**Relationships:**
- Referenced by: `sale_items`, `purchase_order_products`, `product_attributes`

**Indexes:**
- `idx_products_category` - Query by category
- `idx_products_stock` - Query by stock level
- `idx_products_source` - Query by source type and ID

---

### 2. `product_attributes`
**Purpose:** Stores category-specific attributes in flexible JSONB format

**Key Fields:**
- `id` (uuid) - Primary key
- `product_id` (uuid) - Foreign key to products
- `attributes` (jsonb) - Flexible JSON storage for:
  - Cement: brand, bagWeight, origin, arrivalDate, vehicleId
  - Iron: type, size, length, weight, brand
  - Wood: type, dimensions, qualityGrade
  - Paint: brand, type, color, volume, finish

**Relationships:**
- Belongs to: `products`

---

### 3. `customers`
**Purpose:** Customer database with credit management

**Key Fields:**
- `id` (uuid) - Primary key
- `name` (text) - Full name
- `phone` (text) - Contact number
- `email` (text) - Email address (optional)
- `company` (text) - Company name (optional)
- `address` (text) - Physical address
- `type` (text) - 'détail' or 'gros'
- `allow_credit` (boolean) - Credit enabled
- `credit_limit` (numeric) - Maximum credit allowed
- `balance` (numeric) - Outstanding balance
- `total_purchases` (numeric) - Lifetime purchases
- `total_paid` (numeric) - Lifetime payments
- `last_purchase_date` (timestamptz) - Last purchase
- `last_payment_date` (timestamptz) - Last payment

**Relationships:**
- Referenced by: `sales`, `payments`

**Indexes:**
- `idx_customers_phone` - Search by phone
- `idx_customers_type` - Filter by customer type
- `idx_customers_balance` - Find customers with outstanding balance

---

### 4. `sales`
**Purpose:** Transaction records for all sales

**Key Fields:**
- `id` (uuid) - Primary key
- `receipt_number` (text, unique) - Receipt identifier
- `date` (timestamptz) - Sale date and time
- `customer_id` (uuid) - Foreign key to customers (optional)
- `customer_name` (text) - Customer name
- `customer_type` (text) - Type at time of sale
- `payment_method` (text) - 'cash', 'mobile', 'bank', 'credit'
- `subtotal` (numeric) - Total before discount
- `discount_percent` (numeric) - Discount percentage
- `discount_amount` (numeric) - Calculated discount
- `total` (numeric) - Final amount
- `amount_paid` (numeric) - Paid at time of sale
- `amount_due` (numeric) - Remaining balance
- `payment_status` (text) - 'paid', 'partial', 'unpaid'
- `due_date` (date) - Payment due date for credit
- `seller` (text) - Salesperson name

**Relationships:**
- Belongs to: `customers`
- Has many: `sale_items`
- Referenced by: `payments`

**Indexes:**
- `idx_sales_date` - Query by date (descending)
- `idx_sales_customer_id` - Customer purchase history
- `idx_sales_receipt_number` - Lookup by receipt
- `idx_sales_payment_status` - Find unpaid/partial sales

---

### 5. `sale_items`
**Purpose:** Line items for each sale

**Key Fields:**
- `id` (uuid) - Primary key
- `sale_id` (uuid) - Foreign key to sales
- `product_id` (uuid) - Foreign key to products (optional)
- `product_name` (text) - Product name snapshot
- `quantity` (numeric) - Quantity sold
- `unit_price` (numeric) - Price per unit
- `total` (numeric) - Line total

**Relationships:**
- Belongs to: `sales`, `products`

**Indexes:**
- `idx_sale_items_sale_id` - Query items for a sale
- `idx_sale_items_product_id` - Product sales history

---

### 6. `payments`
**Purpose:** Payment transaction records

**Key Fields:**
- `id` (uuid) - Primary key
- `payment_number` (text) - Payment reference
- `date` (timestamptz) - Payment date
- `customer_id` (uuid) - Foreign key to customers
- `sale_id` (uuid) - Related sale (optional)
- `sale_receipt_number` (text) - Receipt reference
- `amount` (numeric) - Payment amount
- `method` (text) - 'cash', 'mobile', 'bank', 'check'
- `reference` (text) - Transaction reference
- `received_by` (text) - Person who received payment

**Relationships:**
- Belongs to: `customers`, `sales`

**Indexes:**
- `idx_payments_customer_id` - Customer payment history
- `idx_payments_sale_id` - Sale payment tracking
- `idx_payments_date` - Query by date

---

## Procurement Tables

### 7. `purchase_orders`
**Purpose:** General procurement/restocking orders

**Key Fields:**
- `id` (uuid) - Primary key
- `po_number` (text, unique) - Order number
- `supplier_name` (text) - Supplier
- `origin` (text) - Origin country/location
- `order_date` (date) - Order placed date
- `expected_arrival_date` (date) - Expected delivery
- `received_date` (date) - Actual receipt date
- `vehicle_id` (text) - Transport vehicle
- `base_purchase_price` (numeric) - Base cost
- `total_cost` (numeric) - Total with expenses
- `shipment_status` (text) - Order status

**Relationships:**
- Has many: `purchase_order_products`, `purchase_order_expenses`

---

### 8. `purchase_order_products`
**Purpose:** Line items for purchase orders

**Key Fields:**
- `id` (uuid) - Primary key
- `po_id` (uuid) - Foreign key to purchase_orders
- `product_name` (text) - Product name
- `category` (text) - Product category
- `quantity` (numeric) - Quantity ordered
- `unit_purchase_price` (numeric) - Unit cost
- `subtotal` (numeric) - Line total

**Relationships:**
- Belongs to: `purchase_orders`

---

### 9. `purchase_order_expenses`
**Purpose:** Expenses associated with purchase orders

**Key Fields:**
- `id` (uuid) - Primary key
- `po_id` (uuid) - Foreign key to purchase_orders
- `date` (date) - Expense date
- `type` (text) - Expense category
- `description` (text) - Expense details
- `amount` (numeric) - Expense amount
- `receipt_reference` (text) - Receipt number
- `added_by` (text) - Person who added expense

**Relationships:**
- Belongs to: `purchase_orders`

---

## Shipment Tracking Tables

### Cement Shipments

### 10. `cement_shipments`
**Purpose:** Track cement shipments from various origins (Nigeria, Cameroun, Tchad)

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_id` (text, unique) - Shipment identifier
- `origin` (text) - 'Nigeria', 'Cameroun', 'Tchad'
- `supplier` (text) - Supplier name
- `vehicle_id` (text) - Vehicle identifier
- `driver_name` (text) - Driver name
- `driver_phone` (text) - Driver contact
- `order_date` (date) - Order date
- `bank_payment_date` (date) - Payment date
- `payment_receipt_number` (text) - Payment receipt
- `amount_paid` (numeric) - Payment amount
- `departure_date` (date) - Departure date
- `expected_arrival_date` (date) - Expected arrival
- `actual_arrival_date` (date) - Actual arrival
- `status` (text) - Shipment status
- `cement_type` (text) - Type of cement
- `brand` (text) - Cement brand
- `weight_per_bag` (numeric) - Bag weight
- `total_bags` (integer) - Total bags
- `bags_sold` (integer) - Bags sold
- `price_per_bag` (numeric) - Price per bag
- `base_purchase_price` (numeric) - Base cost
- `location` (text) - 'sur véhicule' or 'en entrepôt'
- `average_selling_price` (numeric) - Average sale price
- `total_revenue` (numeric) - Total revenue

**Relationships:**
- Has many: `cement_shipment_expenses`

**Indexes:**
- `idx_cement_shipments_status` - Query by status

---

### 11. `cement_shipment_expenses`
**Purpose:** Track expenses for cement shipments by stage

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_id` (text) - Foreign key to cement_shipments
- `date` (date) - Expense date
- `stage` (text) - Shipment stage (origin-specific)
- `type` (text) - Expense type
- `description` (text) - Details
- `amount` (numeric) - Amount
- `receipt_reference` (text) - Receipt number
- `added_by` (text) - Added by

**Relationships:**
- Belongs to: `cement_shipments`

---

### Iron Commands

### 12. `iron_commands`
**Purpose:** Track iron/rebar procurement

**Key Fields:**
- `id` (uuid) - Primary key
- `command_number` (text, unique) - Command identifier
- `supplier` (text) - Supplier
- `origin_country` (text) - Origin
- `order_date` (date) - Order date
- `bank_payment_date` (date) - Payment date
- `payment_reference` (text) - Payment reference
- `amount_paid` (numeric) - Amount paid
- `status` (text) - Command status
- `total_tonnage_ordered` (numeric) - Total tonnage
- `total_tonnage_received` (numeric) - Received tonnage
- `vehicle_nigeria` (text) - Nigeria vehicle
- `vehicle_cameroun` (text) - Cameroun vehicle
- `driver_nigeria` (text) - Nigeria driver
- `driver_cameroun` (text) - Cameroun driver

**Relationships:**
- Has many: `iron_command_items`, `iron_command_expenses`, `iron_receptions`

**Indexes:**
- `idx_iron_commands_status` - Query by status

---

### 13. `iron_command_items`
**Purpose:** Line items for iron commands (by diameter)

**Key Fields:**
- `id` (uuid) - Primary key
- `command_id` (uuid) - Foreign key to iron_commands
- `diameter` (integer) - Iron diameter (6-40mm)
- `quantity_ordered` (numeric) - Ordered quantity
- `quantity_received` (numeric) - Received quantity
- `unit_price` (numeric) - Price per unit
- `subtotal` (numeric) - Line total

**Relationships:**
- Belongs to: `iron_commands`

---

### 14. `iron_command_expenses`
**Purpose:** Expenses for iron commands

**Key Fields:**
- `id` (uuid) - Primary key
- `command_id` (uuid) - Foreign key to iron_commands
- `date` (date) - Expense date
- `stage` (text) - Transit stage
- `type` (text) - Expense type
- `description` (text) - Details
- `amount` (numeric) - Amount
- `location` (text) - Location
- `customs_reference` (text) - Customs reference
- `vehicle_number` (text) - Vehicle
- `added_by` (text) - Added by

**Relationships:**
- Belongs to: `iron_commands`

---

### 15. `iron_receptions`
**Purpose:** Reception and quality control records

**Key Fields:**
- `id` (uuid) - Primary key
- `command_id` (uuid) - Foreign key to iron_commands
- `date` (date) - Reception date
- `location` (text) - Location
- `responsible_person` (text) - Responsible person
- `missing_items_compensation` (boolean) - Compensation flag
- `missing_items_notes` (text) - Notes on missing items
- `extra_items_deduction` (boolean) - Deduction flag
- `extra_items_notes` (text) - Notes on extra items
- `offloading_cost` (numeric) - Offloading cost
- `number_of_workers` (integer) - Workers count
- `offloading_date_time` (timestamptz) - Offloading time

**Relationships:**
- Belongs to: `iron_commands`
- Has many: `iron_discrepancies`

---

### 16. `iron_discrepancies`
**Purpose:** Record differences between ordered and received

**Key Fields:**
- `id` (uuid) - Primary key
- `reception_id` (uuid) - Foreign key to iron_receptions
- `diameter` (integer) - Iron diameter
- `ordered` (numeric) - Ordered quantity
- `received` (numeric) - Received quantity
- `difference` (numeric) - Difference
- `status` (text) - 'conforme', 'manquant', 'excédent'
- `notes` (text) - Additional notes

**Relationships:**
- Belongs to: `iron_receptions`

---

### Wood Shipments

### 17. `wood_shipments`
**Purpose:** Track wood/lumber shipments

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_id` (text, unique) - Shipment identifier
- `supplier` (text) - Supplier
- `origin_country` (text) - Origin
- `order_date` (date) - Order date
- `bank_payment_date` (date) - Payment date
- `payment_receipt_number` (text) - Payment receipt
- `amount_paid` (numeric) - Amount paid
- `status` (text) - Shipment status
- `wood_type` (text) - Type of wood
- `panel_thickness` (text) - Panel thickness (if applicable)
- `grade` (text) - Quality grade
- `dimensions` (text) - Dimensions
- `total_pieces` (integer) - Total pieces
- `pieces_sold` (integer) - Pieces sold
- `unit_price` (numeric) - Unit price
- `base_purchase_price` (numeric) - Base cost
- `vehicle_number` (text) - Vehicle
- `driver_name` (text) - Driver
- `driver_phone` (text) - Driver contact
- `average_selling_price` (numeric) - Average sale price
- `total_revenue` (numeric) - Total revenue

**Relationships:**
- Has many: `wood_shipment_expenses`
- Has one: `warehouse_receptions`
- Has many: `stock_movements`

**Indexes:**
- `idx_wood_shipments_status` - Query by status

---

### 18. `wood_shipment_expenses`
**Purpose:** Expenses for wood shipments

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_id` (text) - Foreign key to wood_shipments
- `date` (date) - Expense date
- `stage` (text) - Shipment stage
- `type` (text) - Expense type
- `description` (text) - Details
- `amount` (numeric) - Amount
- `reference_number` (text) - Reference
- `number_of_workers` (integer) - Workers count
- `weight` (text) - Weight
- `added_by` (text) - Added by

**Relationships:**
- Belongs to: `wood_shipments`

---

### Paint Shipments

### 19. `paint_shipments`
**Purpose:** Track paint/coating shipments

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_id` (text, unique) - Shipment identifier
- `supplier` (text) - Supplier
- `origin` (text) - 'Cameroun' or 'Tchad'
- `order_date` (date) - Order date
- `bank_payment_date` (date) - Payment date
- `payment_receipt_number` (text) - Payment receipt
- `amount_paid` (numeric) - Amount paid
- `status` (text) - Shipment status
- `brand` (text) - Paint brand
- `paint_type` (text) - Type of paint
- `color` (text) - Color
- `unit_volume` (text) - Volume per unit (e.g., '25L')
- `finish` (text) - Finish type
- `total_units` (integer) - Total units
- `units_sold` (integer) - Units sold
- `unit_price` (numeric) - Unit price
- `base_purchase_price` (numeric) - Base cost
- `vehicle_number` (text) - Vehicle
- `driver_name` (text) - Driver
- `driver_phone` (text) - Driver contact
- `average_selling_price` (numeric) - Average sale price
- `total_revenue` (numeric) - Total revenue

**Relationships:**
- Has many: `paint_shipment_expenses`
- Has one: `warehouse_receptions`
- Has many: `stock_movements`

**Indexes:**
- `idx_paint_shipments_status` - Query by status

---

### 20. `paint_shipment_expenses`
**Purpose:** Expenses for paint shipments

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_id` (text) - Foreign key to paint_shipments
- `date` (date) - Expense date
- `stage` (text) - Shipment stage
- `type` (text) - Expense type
- `description` (text) - Details
- `amount` (numeric) - Amount
- `reference_number` (text) - Reference
- `number_of_workers` (integer) - Workers count
- `weight` (text) - Weight
- `added_by` (text) - Added by

**Relationships:**
- Belongs to: `paint_shipments`

---

## Warehouse Management Tables

### 21. `warehouse_receptions`
**Purpose:** Record warehouse intake for wood and paint

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_type` (text) - 'wood' or 'paint'
- `shipment_id` (text) - Reference to shipment
- `reception_date` (date) - Reception date
- `reception_time` (time) - Reception time
- `warehouse_manager` (text) - Manager name
- `warehouse_location` (text) - Location
- `item_condition` (text) - Condition assessment
- `damaged_quantity` (integer) - Damaged items count
- `reception_notes` (text) - Notes
- `photo_url` (text) - Photo URL

**Relationships:**
- Links to: `wood_shipments`, `paint_shipments` (via shipment_id)

---

### 22. `stock_movements`
**Purpose:** Track stock in/out movements

**Key Fields:**
- `id` (uuid) - Primary key
- `shipment_type` (text) - 'wood' or 'paint'
- `shipment_id` (text) - Reference to shipment
- `date` (date) - Movement date
- `type` (text) - 'Entrée' or 'Sortie'
- `quantity` (integer) - Quantity moved
- `source_destination` (text) - Source or destination
- `responsible_person` (text) - Responsible person
- `notes` (text) - Additional notes
- `running_balance` (integer) - Stock balance after movement

**Relationships:**
- Links to: `wood_shipments`, `paint_shipments` (via shipment_id)

---

## Partner Tracking Tables

### 23. `partner_vehicles`
**Purpose:** Track partner-owned vehicles selling cement

**Key Fields:**
- `id` (text) - Primary key
- `partner_name` (text) - Partner name
- `partner_phone` (text) - Partner contact
- `partner_email` (text) - Partner email
- `vehicle_plate` (text) - Vehicle registration
- `driver_name` (text) - Driver name
- `driver_phone` (text) - Driver contact
- `total_bags` (integer) - Total cement bags
- `sold_bags` (integer) - Bags sold
- `remaining_bags` (integer) - Bags remaining
- `arrival_date` (date) - Arrival date
- `status` (text) - Vehicle status
- `access_pin` (text) - Public access PIN
- `user_id` (uuid) - Owner user ID

**Relationships:**
- Has many: `partner_sales`, `partner_expenses`

**Indexes:**
- `idx_partner_vehicles_status` - Query by status
- `idx_partner_vehicles_pin` - Lookup by PIN

**Special:** Has public read access with PIN for tracking

---

### 24. `partner_sales`
**Purpose:** Sales made by partner vehicles

**Key Fields:**
- `id` (uuid) - Primary key
- `vehicle_id` (text) - Foreign key to partner_vehicles
- `bags_sold` (integer) - Bags sold
- `price_per_bag` (numeric) - Price per bag
- `date` (timestamptz) - Sale date
- `notes` (text) - Additional notes

**Relationships:**
- Belongs to: `partner_vehicles`

---

### 25. `partner_expenses`
**Purpose:** Expenses for partner vehicles

**Key Fields:**
- `id` (uuid) - Primary key
- `vehicle_id` (text) - Foreign key to partner_vehicles
- `description` (text) - Expense description
- `amount` (numeric) - Expense amount
- `date` (timestamptz) - Expense date

**Relationships:**
- Belongs to: `partner_vehicles`

---

## System Tables

### 26. `company_info`
**Purpose:** Store company details for receipts and reports

**Key Fields:**
- `id` (uuid) - Primary key
- `name` (text) - Company name
- `address` (text) - Company address
- `phone` (text) - Company phone
- `email` (text) - Company email
- `tax_id` (text) - Tax identification
- `logo_url` (text) - Logo URL

**Default Values:**
- Single row with BATIFACILE company info

---

## Database Statistics

**Total Tables:** 26

**Table Categories:**
- Core Business: 6 tables
- Procurement: 3 tables
- Cement Shipments: 2 tables
- Iron Commands: 5 tables
- Wood Shipments: 2 tables
- Paint Shipments: 2 tables
- Warehouse: 2 tables
- Partner Tracking: 3 tables
- System: 1 table

**Total Indexes:** 18 indexes for query optimization

**Triggers:** 9 auto-update triggers for `updated_at` timestamps

**RLS Policies:** All tables protected with Row Level Security

---

## Key Relationships Summary

```
products
  ├─ product_attributes (1:many)
  └─ sale_items (1:many)

customers
  ├─ sales (1:many)
  └─ payments (1:many)

sales
  ├─ sale_items (1:many)
  └─ payments (1:many)

purchase_orders
  ├─ purchase_order_products (1:many)
  └─ purchase_order_expenses (1:many)

cement_shipments
  └─ cement_shipment_expenses (1:many)

iron_commands
  ├─ iron_command_items (1:many)
  ├─ iron_command_expenses (1:many)
  └─ iron_receptions (1:many)
      └─ iron_discrepancies (1:many)

wood_shipments
  ├─ wood_shipment_expenses (1:many)
  ├─ warehouse_receptions (1:1)
  └─ stock_movements (1:many)

paint_shipments
  ├─ paint_shipment_expenses (1:many)
  ├─ warehouse_receptions (1:1)
  └─ stock_movements (1:many)

partner_vehicles
  ├─ partner_sales (1:many)
  └─ partner_expenses (1:many)
```

---

**Generated:** 2024-11-30
**For:** BATIFACILE Hardware Store Management System
**Database:** PostgreSQL (Supabase)
