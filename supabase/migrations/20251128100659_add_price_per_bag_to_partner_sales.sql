/*
  # Add price_per_bag column to partner_sales

  1. Changes
    - Add price_per_bag column to partner_sales table
    - This allows tracking the price per bag for each sale
    - Default value is 5000 FCFA for existing records

  2. Notes
    - The column is nullable to support backward compatibility
    - New sales should always include this field
*/

-- Add price_per_bag column to partner_sales
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_sales' AND column_name = 'price_per_bag'
  ) THEN
    ALTER TABLE partner_sales ADD COLUMN price_per_bag NUMERIC DEFAULT 5000;
  END IF;
END $$;
