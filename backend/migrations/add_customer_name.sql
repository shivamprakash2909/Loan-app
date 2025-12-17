-- Migration: Add customer_name column to customers table
-- Run this SQL script in your PostgreSQL database

-- Add customer_name column (nullable first for existing records)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- Set default value for existing records
UPDATE customers SET customer_name = 'N/A' WHERE customer_name IS NULL;

-- Make it NOT NULL after setting defaults (optional, uncomment if you want to enforce it)
-- ALTER TABLE customers ALTER COLUMN customer_name SET NOT NULL;

