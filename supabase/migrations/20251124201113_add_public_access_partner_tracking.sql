/*
  # Add Public Access for Partner Tracking (Development)

  1. Changes
    - Add policies to allow unauthenticated access to partner tracking tables
    - This is for development purposes when authentication is not yet set up
    - These should be removed/restricted when authentication is implemented

  2. Security Notes
    - These policies allow anyone to access the data
    - Remove these policies once authentication is properly configured
    - Keep the authenticated policies as they are more secure
*/

-- Add public access policies for partner_vehicles
CREATE POLICY "Allow public read access to partner_vehicles"
  ON partner_vehicles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to partner_vehicles"
  ON partner_vehicles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to partner_vehicles"
  ON partner_vehicles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to partner_vehicles"
  ON partner_vehicles FOR DELETE
  TO public
  USING (true);

-- Add public access policies for partner_expenses
CREATE POLICY "Allow public read access to partner_expenses"
  ON partner_expenses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to partner_expenses"
  ON partner_expenses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to partner_expenses"
  ON partner_expenses FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to partner_expenses"
  ON partner_expenses FOR DELETE
  TO public
  USING (true);

-- Add public access policies for partner_sales
CREATE POLICY "Allow public read access to partner_sales"
  ON partner_sales FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to partner_sales"
  ON partner_sales FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to partner_sales"
  ON partner_sales FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to partner_sales"
  ON partner_sales FOR DELETE
  TO public
  USING (true);
