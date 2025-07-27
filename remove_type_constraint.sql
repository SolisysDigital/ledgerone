-- Option 2: Remove the constraint entirely
-- This will allow any value in the type field

-- Drop the existing constraint
ALTER TABLE entities 
DROP CONSTRAINT IF EXISTS entities_type_check;

-- Verify the constraint was removed
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'entities'::regclass AND conname = 'entities_type_check'; 