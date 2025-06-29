/*
  # Create purchases table for ticket purchases

  1. New Tables
    - `purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional - for registered users)
      - `ticket_id` (uuid, references tickets)
      - `quantity` (integer)
      - `total_price` (decimal)
      - `customer_name` (text)
      - `customer_email` (text)
      - `qr_code` (text - base64 encoded QR code)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `purchases` table
    - Add policies for reading and creating purchases
*/

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  qr_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow public to create purchases (for guest purchases)
CREATE POLICY "Anyone can create purchases"
  ON purchases
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read purchases (needed for QR validation)
CREATE POLICY "Anyone can read purchases"
  ON purchases
  FOR SELECT
  TO public
  USING (true);

-- Allow users to read their own purchases
CREATE POLICY "Users can read own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_ticket_id ON purchases(ticket_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);