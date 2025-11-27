-- Add DELIVERED status to orders table constraint
-- This allows orders to have DELIVERED status

-- Step 1: Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Add new constraint with DELIVERED included
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'));

-- Verify the constraint
SELECT con.conname as constraint_name,
       pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'orders'
  AND con.conname = 'orders_status_check';
