-- Option 3: Create a flexible constraint that accepts both cases
-- This will allow 'person', 'Person', 'business', 'Business'

-- First, drop the existing constraint
ALTER TABLE entities 
DROP CONSTRAINT IF EXISTS entities_type_check;

-- Then create a new constraint that accepts both cases
ALTER TABLE entities 
ADD CONSTRAINT entities_type_check 
CHECK (LOWER(type) IN ('person', 'business'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'entities'::regclass AND conname = 'entities_type_check'; 