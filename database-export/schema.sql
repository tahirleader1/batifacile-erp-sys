-- ============================================================================
-- BATIFACILE Hardware Store - Complete Database Schema
-- ============================================================================
-- PostgreSQL database schema for Supabase
-- Generated: 2024-11-30
--
-- This schema includes all tables for managing:
-- - Products and Inventory
-- - Customers and Credit Management
-- - Sales and Payments
-- - Procurement and Restocking
-- - Shipment Tracking (Cement, Iron, Wood, Paint)
-- - Partner Vehicle Tracking
-- - Warehouse Management
-- ============================================================================

-- ============================================================================
-- CORE BUSINESS TABLES
-- ============================================================================

-- Products Table
-- Stores all products available in inventory across all categories
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL, -- 'ciment', 'fer', 'bois', 'peinture'
    unit text NOT NULL DEFAULT 'unité',
    retail_price numeric NOT NULL DEFAULT 0,
    wholesale_price numeric NOT NULL DEFAULT 0,
    stock_quantity numeric NOT NULL DEFAULT 0,
    reorder_level numeric DEFAULT 0,
    location text DEFAULT 'magasin', -- 'magasin' or 'véhicule'
    supplier text,
    cost_per_unit numeric,
    warehouse_location text,
    source_type text, -- 'iron_command', 'wood_shipment', 'paint_shipment', 'cement_shipment', 'purchase_order'
    source_id text,
    po_id text,
    original_quantity numeric,
    added_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Product Attributes Table (JSONB for flexible attributes)
-- Stores category-specific attributes for products
CREATE TABLE IF NOT EXISTS product_attributes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attributes jsonb NOT NULL, -- Flexible JSON storage for category-specific data
    created_at timestamptz DEFAULT now()
);

-- Customers Table
-- Stores customer information and credit tracking
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    company text,
    address text,
    type text NOT NULL DEFAULT 'détail', -- 'détail' or 'gros'
    allow_credit boolean DEFAULT false,
    credit_limit numeric DEFAULT 0,
    balance numeric DEFAULT 0,
    total_purchases numeric DEFAULT 0,
    total_paid numeric DEFAULT 0,
    last_purchase_date timestamptz,
    last_payment_date timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Sales Table
-- Records all sales transactions
CREATE TABLE IF NOT EXISTS sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number text UNIQUE NOT NULL,
    date timestamptz NOT NULL DEFAULT now(),
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    customer_name text NOT NULL,
    customer_type text NOT NULL, -- 'détail' or 'gros'
    payment_method text NOT NULL, -- 'cash', 'mobile', 'bank', 'credit'
    subtotal numeric NOT NULL DEFAULT 0,
    discount_percent numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    total numeric NOT NULL DEFAULT 0,
    amount_paid numeric DEFAULT 0,
    amount_due numeric DEFAULT 0,
    payment_status text NOT NULL DEFAULT 'unpaid', -- 'paid', 'partial', 'unpaid'
    due_date date,
    notes text,
    vehicle_info text,
    seller text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Sale Items Table
-- Line items for each sale
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

-- Payments Table
-- Records all payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number text NOT NULL,
    date timestamptz NOT NULL DEFAULT now(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,
    sale_receipt_number text NOT NULL,
    amount numeric NOT NULL,
    method text NOT NULL, -- 'cash', 'mobile', 'bank', 'check'
    reference text,
    notes text,
    received_by text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PROCUREMENT & RESTOCKING TABLES
-- ============================================================================

-- Purchase Orders Table
-- Tracks general procurement orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number text UNIQUE NOT NULL,
    supplier_name text NOT NULL,
    origin text,
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    expected_arrival_date date,
    received_date date,
    vehicle_id text,
    base_purchase_price numeric DEFAULT 0,
    total_cost numeric DEFAULT 0,
    shipment_status text NOT NULL DEFAULT 'commandé', -- 'commandé', 'en transit', 'à la frontière', 'dédouanement', 'arrivé', 'en stock'
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Purchase Order Products Table
-- Line items for purchase orders
CREATE TABLE IF NOT EXISTS purchase_order_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_name text NOT NULL,
    category text NOT NULL,
    quantity numeric NOT NULL,
    unit_purchase_price numeric NOT NULL,
    subtotal numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Purchase Order Expenses Table
-- Tracks expenses associated with purchase orders
CREATE TABLE IF NOT EXISTS purchase_order_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    date date NOT NULL,
    type text NOT NULL, -- 'Transport', 'Douane/Taxes', etc.
    description text NOT NULL,
    amount numeric NOT NULL,
    receipt_reference text,
    added_by text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CEMENT SHIPMENT TRACKING TABLES
-- ============================================================================

-- Cement Shipments Table
-- Tracks cement shipments from various origins
CREATE TABLE IF NOT EXISTS cement_shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id text UNIQUE NOT NULL,
    origin text NOT NULL, -- 'Nigeria', 'Cameroun', 'Tchad'
    supplier text NOT NULL,
    vehicle_id text,
    driver_name text,
    driver_phone text,
    order_date date NOT NULL,
    bank_payment_date date NOT NULL,
    payment_receipt_number text NOT NULL,
    amount_paid numeric NOT NULL,
    departure_date date NOT NULL,
    expected_arrival_date date,
    actual_arrival_date date,
    status text NOT NULL DEFAULT 'commandé', -- 'commandé', 'payé', 'en route', 'arrivé', 'disponible à la vente', 'en vente', 'vendu', 'clôturé'
    cement_type text NOT NULL,
    brand text NOT NULL,
    weight_per_bag numeric NOT NULL,
    total_bags integer NOT NULL,
    bags_sold integer DEFAULT 0,
    price_per_bag numeric NOT NULL,
    base_purchase_price numeric NOT NULL,
    location text DEFAULT 'sur véhicule', -- 'sur véhicule', 'en entrepôt'
    storage_reason text, -- 'saison des pluies', 'surplus', 'autre'
    average_selling_price numeric DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    collection_location text,
    distance text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Cement Shipment Expenses Table
-- Tracks expenses for cement shipments by stage
CREATE TABLE IF NOT EXISTS cement_shipment_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id text NOT NULL REFERENCES cement_shipments(shipment_id) ON DELETE CASCADE,
    date date NOT NULL,
    stage text NOT NULL, -- Origin-specific stages
    type text NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    receipt_reference text,
    added_by text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- IRON COMMAND TRACKING TABLES
-- ============================================================================

-- Iron Commands Table
-- Tracks iron/rebar procurement from suppliers
CREATE TABLE IF NOT EXISTS iron_commands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    command_number text UNIQUE NOT NULL,
    supplier text NOT NULL,
    origin_country text NOT NULL,
    order_date date NOT NULL,
    bank_payment_date date NOT NULL,
    payment_reference text NOT NULL,
    amount_paid numeric NOT NULL,
    status text NOT NULL DEFAULT 'commandé', -- 'commandé', 'payé', 'en transit nigeria', 'en transit cameroun', 'en transit tchad', 'arrivé', 'en déchargement', 'vérifié', 'clôturé'
    total_tonnage_ordered numeric NOT NULL,
    total_tonnage_received numeric DEFAULT 0,
    departure_nigeria_date date,
    expected_arrival_tchad date,
    vehicle_nigeria text,
    vehicle_cameroun text,
    driver_nigeria text,
    driver_cameroun text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Iron Command Items Table
-- Line items for iron commands (by diameter)
CREATE TABLE IF NOT EXISTS iron_command_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    command_id uuid NOT NULL REFERENCES iron_commands(id) ON DELETE CASCADE,
    diameter integer NOT NULL, -- 6, 8, 10, 12, 14, 16, 20, 25, 32, 40 (mm)
    quantity_ordered numeric NOT NULL,
    quantity_received numeric DEFAULT 0,
    unit_price numeric NOT NULL,
    subtotal numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Iron Command Expenses Table
-- Tracks expenses for iron commands
CREATE TABLE IF NOT EXISTS iron_command_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    command_id uuid NOT NULL REFERENCES iron_commands(id) ON DELETE CASCADE,
    date date NOT NULL,
    stage text NOT NULL, -- 'arrivée cameroun - transbordement', etc.
    type text NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    location text,
    customs_reference text,
    vehicle_number text,
    added_by text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Iron Reception Table
-- Records reception and quality control of iron shipments
CREATE TABLE IF NOT EXISTS iron_receptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    command_id uuid NOT NULL REFERENCES iron_commands(id) ON DELETE CASCADE,
    date date NOT NULL,
    location text NOT NULL,
    responsible_person text NOT NULL,
    missing_items_compensation boolean DEFAULT false,
    missing_items_notes text,
    extra_items_deduction boolean DEFAULT false,
    extra_items_notes text,
    offloading_cost numeric DEFAULT 0,
    number_of_workers integer,
    offloading_date_time timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Iron Discrepancies Table
-- Records differences between ordered and received quantities
CREATE TABLE IF NOT EXISTS iron_discrepancies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reception_id uuid NOT NULL REFERENCES iron_receptions(id) ON DELETE CASCADE,
    diameter integer NOT NULL,
    ordered numeric NOT NULL,
    received numeric NOT NULL,
    difference numeric NOT NULL,
    status text NOT NULL, -- 'conforme', 'manquant', 'excédent'
    notes text,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- WOOD SHIPMENT TRACKING TABLES
-- ============================================================================

-- Wood Shipments Table
-- Tracks wood/lumber shipments
CREATE TABLE IF NOT EXISTS wood_shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id text UNIQUE NOT NULL,
    supplier text NOT NULL,
    origin_country text NOT NULL,
    order_date date NOT NULL,
    bank_payment_date date NOT NULL,
    payment_receipt_number text NOT NULL,
    amount_paid numeric NOT NULL,
    status text NOT NULL DEFAULT 'commandé', -- 'commandé', 'payé', 'en transit', 'arrivé', 'en stock', 'vendu', 'clôturé'
    wood_type text NOT NULL, -- 'Planche', 'Chevron', 'Lambourde', 'Plafond', 'Panneau'
    panel_thickness text, -- '8mm', '10mm', '15mm' (for panels)
    grade text NOT NULL, -- 'Grade A', 'Grade B', 'Grade C', 'Standard', 'Premium'
    dimensions text NOT NULL,
    total_pieces integer NOT NULL,
    pieces_sold integer DEFAULT 0,
    unit_price numeric NOT NULL,
    base_purchase_price numeric NOT NULL,
    departure_cameroun_date date,
    expected_arrival_tchad date,
    vehicle_number text,
    driver_name text,
    driver_phone text,
    average_selling_price numeric DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Wood Shipment Expenses Table
-- Tracks expenses for wood shipments
CREATE TABLE IF NOT EXISTS wood_shipment_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id text NOT NULL REFERENCES wood_shipments(shipment_id) ON DELETE CASCADE,
    date date NOT NULL,
    stage text NOT NULL, -- 'Chargement (Cameroun)', etc.
    type text NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    reference_number text,
    number_of_workers integer,
    weight text,
    added_by text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PAINT SHIPMENT TRACKING TABLES
-- ============================================================================

-- Paint Shipments Table
-- Tracks paint/coating shipments
CREATE TABLE IF NOT EXISTS paint_shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id text UNIQUE NOT NULL,
    supplier text NOT NULL,
    origin text NOT NULL, -- 'Cameroun', 'Tchad'
    order_date date NOT NULL,
    bank_payment_date date NOT NULL,
    payment_receipt_number text NOT NULL,
    amount_paid numeric NOT NULL,
    status text NOT NULL DEFAULT 'commandé', -- 'commandé', 'payé', 'en transit', 'arrivé', 'en stock', 'vendu', 'clôturé'
    brand text NOT NULL,
    paint_type text NOT NULL, -- 'Faume Universel', 'Faume National', 'Plastique', 'Peinture à l\'Huile'
    color text NOT NULL,
    unit_volume text NOT NULL, -- e.g., '25L', '5L'
    finish text NOT NULL, -- 'Mate', 'Brillante', 'Satinée'
    total_units integer NOT NULL,
    units_sold integer DEFAULT 0,
    unit_price numeric NOT NULL,
    base_purchase_price numeric NOT NULL,
    departure_cameroun_date date,
    expected_arrival_tchad date,
    vehicle_number text,
    driver_name text,
    driver_phone text,
    average_selling_price numeric DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Paint Shipment Expenses Table
-- Tracks expenses for paint shipments
CREATE TABLE IF NOT EXISTS paint_shipment_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id text NOT NULL REFERENCES paint_shipments(shipment_id) ON DELETE CASCADE,
    date date NOT NULL,
    stage text NOT NULL, -- Origin-specific stages
    type text NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    reference_number text,
    number_of_workers integer,
    weight text,
    added_by text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- WAREHOUSE MANAGEMENT TABLES
-- ============================================================================

-- Warehouse Receptions Table
-- Records warehouse intake for wood and paint shipments
CREATE TABLE IF NOT EXISTS warehouse_receptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_type text NOT NULL, -- 'wood', 'paint'
    shipment_id text NOT NULL,
    reception_date date NOT NULL,
    reception_time time NOT NULL,
    warehouse_manager text NOT NULL,
    warehouse_location text NOT NULL,
    item_condition text NOT NULL, -- 'Excellent', 'Bon', 'Endommagé'
    damaged_quantity integer DEFAULT 0,
    reception_notes text,
    photo_url text,
    created_at timestamptz DEFAULT now()
);

-- Stock Movements Table
-- Tracks stock movements in/out of warehouse
CREATE TABLE IF NOT EXISTS stock_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_type text NOT NULL, -- 'wood', 'paint'
    shipment_id text NOT NULL,
    date date NOT NULL,
    type text NOT NULL, -- 'Entrée', 'Sortie'
    quantity integer NOT NULL,
    source_destination text NOT NULL,
    responsible_person text NOT NULL,
    notes text,
    running_balance integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PARTNER VEHICLE TRACKING TABLES
-- ============================================================================

-- Partner Vehicles Table
-- Tracks partner-owned vehicles selling cement
CREATE TABLE IF NOT EXISTS partner_vehicles (
    id text PRIMARY KEY,
    partner_name text NOT NULL,
    partner_phone text NOT NULL,
    partner_email text,
    vehicle_plate text NOT NULL,
    driver_name text NOT NULL,
    driver_phone text NOT NULL,
    total_bags integer DEFAULT 0,
    sold_bags integer DEFAULT 0,
    remaining_bags integer DEFAULT 0,
    arrival_date date NOT NULL,
    status text DEFAULT 'En Route', -- 'En Route', 'Arrivé', 'En Vente', 'Terminé'
    access_pin text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Partner Sales Table
-- Records sales made by partner vehicles
CREATE TABLE IF NOT EXISTS partner_sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id text NOT NULL REFERENCES partner_vehicles(id) ON DELETE CASCADE,
    bags_sold integer NOT NULL DEFAULT 0,
    price_per_bag numeric DEFAULT 5000,
    date timestamptz DEFAULT now(),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Partner Expenses Table
-- Tracks expenses for partner vehicles
CREATE TABLE IF NOT EXISTS partner_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id text NOT NULL REFERENCES partner_vehicles(id) ON DELETE CASCADE,
    description text NOT NULL,
    amount numeric DEFAULT 0,
    date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- COMPANY INFORMATION TABLE
-- ============================================================================

-- Company Info Table
-- Stores company details for receipts and reports
CREATE TABLE IF NOT EXISTS company_info (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL DEFAULT 'BATIFACILE',
    address text NOT NULL DEFAULT 'NDjamena, Tchad',
    phone text NOT NULL DEFAULT '+235 XX XX XX XX',
    email text NOT NULL DEFAULT 'contact@batifacile.td',
    tax_id text,
    logo_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source_type, source_id);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(balance);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipt_number ON sales(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);

-- Sale items indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date DESC);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_cement_shipments_status ON cement_shipments(status);
CREATE INDEX IF NOT EXISTS idx_iron_commands_status ON iron_commands(status);
CREATE INDEX IF NOT EXISTS idx_wood_shipments_status ON wood_shipments(status);
CREATE INDEX IF NOT EXISTS idx_paint_shipments_status ON paint_shipments(status);

-- Partner vehicles indexes
CREATE INDEX IF NOT EXISTS idx_partner_vehicles_status ON partner_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_partner_vehicles_pin ON partner_vehicles(access_pin);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cement_shipments_updated_at
    BEFORE UPDATE ON cement_shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iron_commands_updated_at
    BEFORE UPDATE ON iron_commands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wood_shipments_updated_at
    BEFORE UPDATE ON wood_shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paint_shipments_updated_at
    BEFORE UPDATE ON paint_shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_vehicles_updated_at
    BEFORE UPDATE ON partner_vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_info_updated_at
    BEFORE UPDATE ON company_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cement_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cement_shipment_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE iron_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE iron_command_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE iron_command_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE iron_receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE iron_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wood_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wood_shipment_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE paint_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paint_shipment_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (full access)
-- Note: These policies allow full CRUD for authenticated users
-- Adjust based on your specific access control requirements

-- Products policies
CREATE POLICY "Allow all for authenticated users" ON products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON product_attributes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customers policies
CREATE POLICY "Allow all for authenticated users" ON customers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sales policies
CREATE POLICY "Allow all for authenticated users" ON sales
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON sale_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Payments policies
CREATE POLICY "Allow all for authenticated users" ON payments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Procurement policies
CREATE POLICY "Allow all for authenticated users" ON purchase_orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON purchase_order_products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON purchase_order_expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Cement shipment policies
CREATE POLICY "Allow all for authenticated users" ON cement_shipments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON cement_shipment_expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Iron command policies
CREATE POLICY "Allow all for authenticated users" ON iron_commands
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON iron_command_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON iron_command_expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON iron_receptions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON iron_discrepancies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Wood shipment policies
CREATE POLICY "Allow all for authenticated users" ON wood_shipments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON wood_shipment_expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Paint shipment policies
CREATE POLICY "Allow all for authenticated users" ON paint_shipments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON paint_shipment_expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Warehouse policies
CREATE POLICY "Allow all for authenticated users" ON warehouse_receptions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON stock_movements
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Partner vehicle policies
CREATE POLICY "Allow all for authenticated users" ON partner_vehicles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON partner_sales
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON partner_expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Company info policies
CREATE POLICY "Allow all for authenticated users" ON company_info
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public access policy for partner tracking (read-only with PIN)
CREATE POLICY "Public read with PIN" ON partner_vehicles
    FOR SELECT TO anon
    USING (access_pin IS NOT NULL);

CREATE POLICY "Public read partner sales" ON partner_sales
    FOR SELECT TO anon
    USING (true);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default company info
INSERT INTO company_info (name, address, phone, email)
VALUES ('BATIFACILE', 'NDjamena, Tchad', '+235 XX XX XX XX', 'contact@batifacile.td')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
