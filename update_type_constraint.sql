-- Option 1: Update the existing constraint to accept capitalized values
-- This will allow 'Person' and 'Business' instead of 'person' and 'business'

-- First, drop the existing constraint
ALTER TABLE entities 
DROP CONSTRAINT IF EXISTS entities_type_check;

-- Then create a new constraint that accepts capitalized values
ALTER TABLE entities 
ADD CONSTRAINT entities_type_check 
CHECK (type IN ('Person', 'Business'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'entities'::regclass AND conname = 'entities_type_check'; 