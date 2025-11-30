/*
  # Insert Sample Data for BATIFACILE Hardware Store

  ## Overview
  Populates the database with realistic sample data for immediate testing and usage.

  ## Data Included
  - Sample products across all categories (ciment, fer, bois, peinture)
  - Sample customers (retail and wholesale)
  - No sales or payments (those will be created through the app)

  ## Important Notes
  - Uses realistic prices in FCFA (West African CFA franc)
  - Products have varying stock levels
  - Customers have different credit settings
*/

-- Insert sample products

-- Ciment (Cement)
INSERT INTO products (name, category, unit, retail_price, wholesale_price, stock_quantity, reorder_level, supplier)
VALUES
  ('Ciment CIMAF 50kg', 'ciment', 'sac', 5500, 5000, 200, 50, 'CIMAF Tchad'),
  ('Ciment Dangote 50kg', 'ciment', 'sac', 5300, 4800, 150, 50, 'Dangote Cement'),
  ('Ciment Lafarge 50kg', 'ciment', 'sac', 5600, 5100, 180, 50, 'Lafarge Tchad')
ON CONFLICT DO NOTHING;

-- Fer (Iron/Rebar)
INSERT INTO products (name, category, unit, retail_price, wholesale_price, stock_quantity, reorder_level, supplier)
VALUES
  ('Fer à béton 8mm (12m)', 'fer', 'barre', 8500, 8000, 300, 100, 'Sidérurgie du Tchad'),
  ('Fer à béton 10mm (12m)', 'fer', 'barre', 12000, 11500, 250, 80, 'Sidérurgie du Tchad'),
  ('Fer à béton 12mm (12m)', 'fer', 'barre', 16500, 16000, 200, 60, 'Sidérurgie du Tchad'),
  ('Fer à béton 14mm (12m)', 'fer', 'barre', 22000, 21500, 150, 50, 'Sidérurgie du Tchad'),
  ('Fil de fer 3mm', 'fer', 'kg', 1200, 1100, 500, 100, 'Import Afrique')
ON CONFLICT DO NOTHING;

-- Bois/Plafond (Wood/Ceiling)
INSERT INTO products (name, category, unit, retail_price, wholesale_price, stock_quantity, reorder_level, supplier)
VALUES
  ('Planche sapin 4m', 'bois', 'planche', 15000, 14000, 100, 30, 'Bois du Sahel'),
  ('Chevron 5x10 (4m)', 'bois', 'pièce', 8000, 7500, 150, 40, 'Bois du Sahel'),
  ('Contreplaqué 15mm', 'bois', 'm²', 12000, 11500, 80, 20, 'Import Cameroun'),
  ('Dalle plafond 60x60', 'bois', 'dalle', 2500, 2300, 300, 100, 'Matériaux Tchad')
ON CONFLICT DO NOTHING;

-- Peinture (Paint)
INSERT INTO products (name, category, unit, retail_price, wholesale_price, stock_quantity, reorder_level, supplier)
VALUES
  ('Peinture acrylique blanche 25L', 'peinture', 'bidon', 35000, 33000, 50, 15, 'Peintures Africaines'),
  ('Peinture acrylique couleur 25L', 'peinture', 'bidon', 38000, 36000, 40, 15, 'Peintures Africaines'),
  ('Peinture glycéro blanche 5L', 'peinture', 'bidon', 12000, 11500, 60, 20, 'Peintures Africaines'),
  ('Diluant 5L', 'peinture', 'bidon', 8000, 7500, 80, 25, 'Chimie Tchad'),
  ('Vernis bois 5L', 'peinture', 'bidon', 15000, 14500, 40, 15, 'Peintures Africaines')
ON CONFLICT DO NOTHING;

-- Insert sample customers

-- Retail customers
INSERT INTO customers (name, phone, email, company, type, allow_credit, credit_limit, balance, total_purchases, total_paid)
VALUES
  ('Mahamat Saleh', '+235 66 12 34 56', 'mahamat.saleh@email.com', NULL, 'détail', true, 500000, 0, 0, 0),
  ('Fatima Hassan', '+235 63 45 67 89', NULL, NULL, 'détail', false, 0, 0, 0, 0),
  ('Ibrahim Moussa', '+235 68 90 12 34', 'ibrahim.m@email.com', NULL, 'détail', true, 300000, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Wholesale customers
INSERT INTO customers (name, phone, email, company, address, type, allow_credit, credit_limit, balance, total_purchases, total_paid)
VALUES
  ('Bechir Saleh', '+235 66 55 44 33', 'contact@batifacile.td', 'BATIFACILE SARL', 'Quartier Chagoua, NDjamena', 'gros', true, 5000000, 0, 0, 0),
  ('Entreprise BTP Tchad', '+235 62 11 22 33', 'contact@btptchad.com', 'BTP Tchad', 'Zone Industrielle, NDjamena', 'gros', true, 10000000, 0, 0, 0),
  ('Construction Moderne', '+235 68 77 88 99', 'info@constmod.td', 'Construction Moderne SARL', 'Quartier Résidentiel, NDjamena', 'gros', true, 8000000, 0, 0, 0),
  ('Ali Construction', '+235 63 22 33 44', 'ali.const@email.com', 'Ali Construction', 'Quartier Dembé, NDjamena', 'gros', true, 3000000, 0, 0, 0)
ON CONFLICT DO NOTHING;