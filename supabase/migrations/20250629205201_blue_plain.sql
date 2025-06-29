/*
  # Fix deletion policies for events

  1. Changes
    - Update RLS policies to allow proper deletion
    - Add cascade deletion policies
    - Fix foreign key constraints

  2. Security
    - Ensure only event creators can delete their events
    - Allow proper cascade deletion of related data
*/

-- Update events table policies for better deletion support
DROP POLICY IF EXISTS "Users can delete own events" ON events;

CREATE POLICY "Users can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Update tickets table policies for cascade deletion
DROP POLICY IF EXISTS "Users can delete tickets" ON tickets;

CREATE POLICY "Users can delete tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = tickets.event_id 
      AND events.created_by = auth.uid()
    )
  );

-- Update purchases table policies for cascade deletion
DROP POLICY IF EXISTS "Users can delete purchases" ON purchases;

CREATE POLICY "Users can delete purchases"
  ON purchases
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets 
      JOIN events ON events.id = tickets.event_id
      WHERE tickets.id = purchases.ticket_id 
      AND events.created_by = auth.uid()
    )
  );

-- Ensure proper foreign key constraints with cascade
ALTER TABLE tickets 
DROP CONSTRAINT IF EXISTS tickets_event_id_fkey;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE purchases 
DROP CONSTRAINT IF EXISTS purchases_ticket_id_fkey;

ALTER TABLE purchases 
ADD CONSTRAINT purchases_ticket_id_fkey 
FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE;