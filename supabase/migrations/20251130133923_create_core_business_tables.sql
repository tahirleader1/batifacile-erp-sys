/*
  # Create Core Business Tables for BATIFACILE Hardware Store

  ## Overview
  This migration creates the foundational database structure for managing a hardware store business,
  including inventory, customers, sales, and payments tracking.

  ## 1. New Tables

  ### `products`
  Stores all products available in the inventory.
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `category` (text) - Product category (ciment, fer, bois, peinture)
  - `unit` (text) - Unit of measurement (sac, tonne, m3, litre, etc)
  - `retail_price` (numeric) - Price for retail customers
  - `wholesale_price` (numeric) - Price for wholesale customers
  - `stock_quantity` (numeric) - Current stock quantity
  - `reorder_level` (numeric) - Minimum stock level before reorder
  - `supplier` (text, optional) - Supplier name
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `customers`
  Stores customer information and credit tracking.
  - `id` (uuid, primary key)
  - `name` (text) - Customer full name
  - `phone` (text) - Phone number
  - `email` (text, optional) - Email address
  - `company` (text, optional) - Company name
  - `address` (text, optional) - Physical address
  - `type` (text) - Customer type: 'détail' or 'gros'
  - `allow_credit` (boolean) - Whether customer can buy on credit
  - `credit_limit` (numeric) - Maximum credit allowed
  - `balance` (numeric) - Current outstanding balance
  - `total_purchases` (numeric) - Lifetime total purchases
  - `total_paid` (numeric) - Lifetime total payments
  - `last_purchase_date` (timestamptz, optional)
  - `notes` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `sales`
  Records all sales transactions.
  - `id` (uuid, primary key)
  - `receipt_number` (text, unique) - Generated receipt number
  - `date` (timestamptz) - Sale date and time
  - `customer_id` (uuid, optional, foreign key) - Reference to customer
  - `customer_name` (text) - Customer name (for anonymous sales)
  - `customer_type` (text) - Type at time of sale
  - `payment_method` (text) - cash, mobile, bank, credit, check
  - `subtotal` (numeric) - Total before discount
  - `discount_percent` (numeric) - Discount percentage applied
  - `discount_amount` (numeric) - Calculated discount amount
  - `total` (numeric) - Final total after discount
  - `amount_paid` (numeric) - Amount paid at time of sale
  - `amount_due` (numeric) - Remaining amount owed
  - `payment_status` (text) - paid, partial, unpaid
  - `due_date` (date, optional) - Payment due date for credit
  - `notes` (text, optional) - Additional notes
  - `seller` (text) - Name of person who made the sale
  - `created_at` (timestamptz)

  ### `sale_items`
  Line items for each sale.
  - `id` (uuid, primary key)
  - `sale_id` (uuid, foreign key) - Reference to sale
  - `product_id` (uuid, foreign key) - Reference to product
  - `product_name` (text) - Product name snapshot
  - `quantity` (numeric) - Quantity sold
  - `unit_price` (numeric) - Price per unit at time of sale
  - `total` (numeric) - Line item total
  - `created_at` (timestamptz)

  ### `payments`
  Records all payment transactions.
  - `id` (uuid, primary key)
  - `payment_number` (text) - Generated payment reference
  - `date` (timestamptz) - Payment date
  - `customer_id` (uuid, foreign key) - Reference to customer
  - `sale_id` (uuid, optional, foreign key) - Related sale if applicable
  - `sale_receipt_number` (text) - Receipt number for reference
  - `amount` (numeric) - Payment amount
  - `method` (text) - cash, mobile, bank, check
  - `reference` (text, optional) - Transaction reference/check number
  - `notes` (text, optional) - Additional notes
  - `received_by` (text) - Person who received payment
  - `created_at` (timestamptz)

  ### `procurement_orders`
  Tracks inventory procurement/restocking orders.
  - `id` (uuid, primary key)
  - `order_number` (text, unique) - Generated order number
  - `supplier` (text) - Supplier name
  - `order_date` (date) - Date order was placed
  - `expected_delivery` (date, optional) - Expected delivery date
  - `status` (text) - pending, received, cancelled
  - `total_cost` (numeric) - Total order cost
  - `notes` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `procurement_items`
  Line items for procurement orders.
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key) - Reference to order
  - `product_id` (uuid, foreign key) - Reference to product
  - `product_name` (text) - Product name snapshot
  - `quantity` (numeric) - Quantity ordered
  - `unit_cost` (numeric) - Cost per unit
  - `total_cost` (numeric) - Line item total
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated users to perform CRUD operations
  - All tables locked down by default until policies are added

  ## 3. Important Notes
  - All monetary values use `numeric` type for precision
  - Timestamps use `timestamptz` for timezone awareness
  - Default values set where appropriate
  - Foreign keys use CASCADE on delete for cleanup
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL DEFAULT 'unité',
  retail_price numeric NOT NULL DEFAULT 0,
  wholesale_price numeric NOT NULL DEFAULT 0,
  stock_quantity numeric NOT NULL DEFAULT 0,
  reorder_level numeric DEFAULT 0,
  supplier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  company text,
  address text,
  type text NOT NULL DEFAULT 'détail',
  allow_credit boolean DEFAULT false,
  credit_limit numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  total_purchases numeric DEFAULT 0,
  total_paid numeric DEFAULT 0,
  last_purchase_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_type text NOT NULL,
  payment_method text NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  amount_paid numeric DEFAULT 0,
  amount_due numeric DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'unpaid',
  due_date date,
  notes text,
  seller text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,
  sale_receipt_number text NOT NULL,
  amount numeric NOT NULL,
  method text NOT NULL,
  reference text,
  notes text,
  received_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create procurement_orders table
CREATE TABLE IF NOT EXISTS procurement_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  supplier text NOT NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery date,
  status text NOT NULL DEFAULT 'pending',
  total_cost numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create procurement_items table
CREATE TABLE IF NOT EXISTS procurement_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES procurement_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity numeric NOT NULL,
  unit_cost numeric NOT NULL,
  total_cost numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipt_number ON sales(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date DESC);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Allow all operations on products for authenticated users"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for customers
CREATE POLICY "Allow all operations on customers for authenticated users"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for sales
CREATE POLICY "Allow all operations on sales for authenticated users"
  ON sales
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for sale_items
CREATE POLICY "Allow all operations on sale_items for authenticated users"
  ON sale_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for payments
CREATE POLICY "Allow all operations on payments for authenticated users"
  ON payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for procurement_orders
CREATE POLICY "Allow all operations on procurement_orders for authenticated users"
  ON procurement_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for procurement_items
CREATE POLICY "Allow all operations on procurement_items for authenticated users"
  ON procurement_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_orders_updated_at
  BEFORE UPDATE ON procurement_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();