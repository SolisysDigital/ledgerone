-- Step 1: Create Junction Table for MANY-MANY Relationships
-- This script creates the entity_related_data junction table and updates the database structure

-- 1. Create the junction table for MANY-MANY relationships
CREATE TABLE IF NOT EXISTS entity_related_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  related_data_id UUID NOT NULL,
  type_of_record VARCHAR(50) NOT NULL CHECK (
    type_of_record IN (
      'contacts', 'emails', 'phones', 'bank_accounts', 
      'investment_accounts', 'crypto_accounts', 'credit_cards', 
      'websites', 'hosting_accounts'
    )
  ),
  relationship_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique relationships (one entity can only have one relationship with a specific related data record)
  UNIQUE(entity_id, related_data_id, type_of_record)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entity_related_data_entity_id ON entity_related_data(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_related_data_related_data_id ON entity_related_data(related_data_id);
CREATE INDEX IF NOT EXISTS idx_entity_related_data_type ON entity_related_data(type_of_record);
CREATE INDEX IF NOT EXISTS idx_entity_related_data_entity_type ON entity_related_data(entity_id, type_of_record);

-- 3. Add comments for documentation
COMMENT ON TABLE entity_related_data IS 'Junction table for MANY-MANY relationships between entities and related data records';
COMMENT ON COLUMN entity_related_data.entity_id IS 'Reference to the entity';
COMMENT ON COLUMN entity_related_data.related_data_id IS 'Reference to the related data record (contact, email, phone, etc.)';
COMMENT ON COLUMN entity_related_data.type_of_record IS 'Type of related data (contacts, emails, phones, etc.)';
COMMENT ON COLUMN entity_related_data.relationship_description IS 'Description of how the related data relates to the entity (e.g., "Primary Attorney", "Tax Advisor")';

-- 4. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_entity_related_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_entity_related_data_updated_at
  BEFORE UPDATE ON entity_related_data
  FOR EACH ROW
  EXECUTE FUNCTION update_entity_related_data_updated_at();

-- 6. Create a view for easier querying of relationships with entity and related data details
CREATE OR REPLACE VIEW entity_relationships_view AS
SELECT 
  erd.id as relationship_id,
  erd.entity_id,
  e.name as entity_name,
  erd.related_data_id,
  erd.type_of_record,
  erd.relationship_description,
  erd.created_at,
  erd.updated_at,
  -- Add specific fields based on type_of_record
  CASE 
    WHEN erd.type_of_record = 'contacts' THEN c.name
    WHEN erd.type_of_record = 'emails' THEN em.email
    WHEN erd.type_of_record = 'phones' THEN p.phone
    WHEN erd.type_of_record = 'bank_accounts' THEN ba.bank_name
    WHEN erd.type_of_record = 'investment_accounts' THEN ia.provider
    WHEN erd.type_of_record = 'crypto_accounts' THEN ca.platform
    WHEN erd.type_of_record = 'credit_cards' THEN cc.cardholder_name
    WHEN erd.type_of_record = 'websites' THEN w.url
    WHEN erd.type_of_record = 'hosting_accounts' THEN ha.provider
    ELSE 'Unknown'
  END as related_data_display_name
FROM entity_related_data erd
JOIN entities e ON erd.entity_id = e.id
LEFT JOIN contacts c ON erd.type_of_record = 'contacts' AND erd.related_data_id = c.id
LEFT JOIN emails em ON erd.type_of_record = 'emails' AND erd.related_data_id = em.id
LEFT JOIN phones p ON erd.type_of_record = 'phones' AND erd.related_data_id = p.id
LEFT JOIN bank_accounts ba ON erd.type_of_record = 'bank_accounts' AND erd.related_data_id = ba.id
LEFT JOIN investment_accounts ia ON erd.type_of_record = 'investment_accounts' AND erd.related_data_id = ia.id
LEFT JOIN crypto_accounts ca ON erd.type_of_record = 'crypto_accounts' AND erd.related_data_id = ca.id
LEFT JOIN credit_cards cc ON erd.type_of_record = 'credit_cards' AND erd.related_data_id = cc.id
LEFT JOIN websites w ON erd.type_of_record = 'websites' AND erd.related_data_id = w.id
LEFT JOIN hosting_accounts ha ON erd.type_of_record = 'hosting_accounts' AND erd.related_data_id = ha.id;

-- 7. Create helper functions for relationship management
CREATE OR REPLACE FUNCTION create_entity_relationship(
  p_entity_id UUID,
  p_related_data_id UUID,
  p_type_of_record VARCHAR(50),
  p_relationship_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  relationship_id UUID;
BEGIN
  INSERT INTO entity_related_data (
    entity_id,
    related_data_id,
    type_of_record,
    relationship_description
  ) VALUES (
    p_entity_id,
    p_related_data_id,
    p_type_of_record,
    p_relationship_description
  ) RETURNING id INTO relationship_id;
  
  RETURN relationship_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to get relationships for an entity
CREATE OR REPLACE FUNCTION get_entity_relationships(p_entity_id UUID)
RETURNS TABLE (
  relationship_id UUID,
  related_data_id UUID,
  type_of_record VARCHAR(50),
  relationship_description TEXT,
  related_data_display_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    erd.id,
    erd.related_data_id,
    erd.type_of_record,
    erd.relationship_description,
    CASE 
      WHEN erd.type_of_record = 'contacts' THEN c.name
      WHEN erd.type_of_record = 'emails' THEN em.email
      WHEN erd.type_of_record = 'phones' THEN p.phone
      WHEN erd.type_of_record = 'bank_accounts' THEN ba.bank_name
      WHEN erd.type_of_record = 'investment_accounts' THEN ia.provider
      WHEN erd.type_of_record = 'crypto_accounts' THEN ca.platform
      WHEN erd.type_of_record = 'credit_cards' THEN cc.cardholder_name
      WHEN erd.type_of_record = 'websites' THEN w.url
      WHEN erd.type_of_record = 'hosting_accounts' THEN ha.provider
      ELSE 'Unknown'
    END
  FROM entity_related_data erd
  LEFT JOIN contacts c ON erd.type_of_record = 'contacts' AND erd.related_data_id = c.id
  LEFT JOIN emails em ON erd.type_of_record = 'emails' AND erd.related_data_id = em.id
  LEFT JOIN phones p ON erd.type_of_record = 'phones' AND erd.related_data_id = p.id
  LEFT JOIN bank_accounts ba ON erd.type_of_record = 'bank_accounts' AND erd.related_data_id = ba.id
  LEFT JOIN investment_accounts ia ON erd.type_of_record = 'investment_accounts' AND erd.related_data_id = ia.id
  LEFT JOIN crypto_accounts ca ON erd.type_of_record = 'crypto_accounts' AND erd.related_data_id = ca.id
  LEFT JOIN credit_cards cc ON erd.type_of_record = 'credit_cards' AND erd.related_data_id = cc.id
  LEFT JOIN websites w ON erd.type_of_record = 'websites' AND erd.related_data_id = w.id
  LEFT JOIN hosting_accounts ha ON erd.type_of_record = 'hosting_accounts' AND erd.related_data_id = ha.id
  WHERE erd.entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Verify the table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'entity_related_data' 
ORDER BY ordinal_position;

-- 10. Show the created indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'entity_related_data';

-- 11. Test the helper functions (optional - can be run separately)
-- SELECT create_entity_relationship(
--   '00000000-0000-0000-0000-000000000000'::UUID, -- example entity_id
--   '00000000-0000-0000-0000-000000000000'::UUID, -- example related_data_id
--   'contacts',
--   'Primary Attorney'
-- );

-- SELECT * FROM get_entity_relationships('00000000-0000-0000-0000-000000000000'::UUID); 