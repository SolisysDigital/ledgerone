-- Add short_description field to entities table
-- This field will store a short description with maximum 50 characters

ALTER TABLE entities 
ADD COLUMN short_description VARCHAR(50);

-- Add a comment to document the field
COMMENT ON COLUMN entities.short_description IS 'Short description field with maximum 50 characters for entity summaries';

-- Optional: Add a check constraint to ensure the field doesn't exceed 50 characters
-- (This is redundant with VARCHAR(50) but provides extra validation)
ALTER TABLE entities 
ADD CONSTRAINT entities_short_description_length_check 
CHECK (LENGTH(short_description) <= 50);

-- Optional: Create an index for better query performance if you plan to search by short_description
-- CREATE INDEX idx_entities_short_description ON entities(short_description);

-- Verify the column was added successfully
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'entities' AND column_name = 'short_description'; 