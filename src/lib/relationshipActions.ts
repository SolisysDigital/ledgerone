"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { AppLogger } from "@/lib/logger";

interface EntityRelationship {
  id: string;
  related_data_id: string;
  type_of_record: string;
  relationship_description?: string;
}

export async function getEntityRelationships(entityId: string) {
  try {
    console.log('getEntityRelationships called with entityId:', entityId);
    
    // Use service role Supabase client to bypass RLS
    const supabase = getServiceSupabase();
    
    // First get the relationships
    const { data: relationships, error: relationshipsError } = await supabase
      .from('entity_related_data')
      .select(`
        id,
        related_data_id,
        type_of_record,
        relationship_description
      `)
      .eq('entity_id', entityId)
      .order('type_of_record', { ascending: true }) as { data: EntityRelationship[] | null; error: any };

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
      await AppLogger.error('relationshipActions', 'getEntityRelationships', 'Failed to fetch relationships', relationshipsError, { entityId });
      throw relationshipsError;
    }

    console.log('Raw relationships fetched:', relationships);

    // Get the display field mapping
    const getDisplayField = (type: string) => {
      const displayFields: Record<string, string> = {
        contacts: 'name',
        emails: 'email',
        phones: 'phone',
        bank_accounts: 'bank_name',
        investment_accounts: 'provider',
        crypto_accounts: 'platform',
        credit_cards: 'cardholder_name',
        websites: 'url',
        hosting_accounts: 'provider'
      };
      return displayFields[type] || 'name';
    };

    // For each relationship, fetch the related data to get the display name
    const enrichedRelationships = await Promise.all(
      (relationships || []).map(async (relationship) => {
        try {
          const displayField = getDisplayField(relationship.type_of_record);
          console.log(`Fetching ${relationship.type_of_record} data for ID: ${relationship.related_data_id}`);
          
          const { data: relatedData, error: relatedDataError } = await supabase
            .from(relationship.type_of_record)
            .select(displayField)
            .eq('id', relationship.related_data_id)
            .single();

          if (relatedDataError) {
            console.error(`Error fetching ${relationship.type_of_record} data:`, relatedDataError);
            return {
              ...relationship,
              related_data_display_name: 'Unknown Record'
            };
          }

          const displayName = (relatedData as any)?.[displayField] || 'Unnamed Record';
          console.log(`Display name for ${relationship.type_of_record}:`, displayName);
          
          return {
            ...relationship,
            related_data_display_name: displayName
          };
        } catch (error) {
          console.error(`Error processing relationship ${relationship.id}:`, error);
          return {
            ...relationship,
            related_data_display_name: 'Error Loading Record'
          };
        }
      })
    );

    console.log('Enriched relationships:', enrichedRelationships);
    await AppLogger.info('relationshipActions', 'getEntityRelationships', 'Successfully fetched relationships', { entityId, count: enrichedRelationships?.length });
    return enrichedRelationships;
  } catch (error) {
    console.error('Exception in getEntityRelationships:', error);
    await AppLogger.error('relationshipActions', 'getEntityRelationships', 'Exception in getEntityRelationships', error, { entityId });
    throw error;
  }
}

export async function getAvailableRecords(typeOfRecord: string, entityId: string) {
  try {
    console.log('getAvailableRecords called with:', { typeOfRecord, entityId });
    
    // Get the correct display field for ordering based on table type
    const getDisplayField = (type: string) => {
      const displayFields: Record<string, string> = {
        contacts: 'name',
        emails: 'email',
        phones: 'phone',
        bank_accounts: 'bank_name',
        investment_accounts: 'provider',
        crypto_accounts: 'platform',
        credit_cards: 'cardholder_name',
        websites: 'url',
        hosting_accounts: 'provider'
      };
      return displayFields[type] || 'name';
    };

    const displayField = getDisplayField(typeOfRecord);
    console.log('Display field for', typeOfRecord, ':', displayField);

    // First get the IDs of records that are already related to this entity
    const { data: existingRelationships, error: existingError } = await getServiceSupabase()
      .from('entity_related_data')
      .select('related_data_id')
      .eq('entity_id', entityId)
      .eq('type_of_record', typeOfRecord);

    if (existingError) {
      console.error('Error fetching existing relationships:', existingError);
      await AppLogger.error('relationshipActions', 'getAvailableRecords', 'Failed to fetch existing relationships', existingError, { typeOfRecord, entityId });
      throw existingError;
    }

    console.log('Existing relationships:', existingRelationships);

    // Get the IDs of already related records
    const existingIds = (existingRelationships || []).map((r: any) => r.related_data_id);
    console.log('Existing IDs to exclude:', existingIds);

    // Get all records of the specified type that are not already related to this entity
    const query = getServiceSupabase()
      .from(typeOfRecord)
      .select('*')
      .order(displayField, { ascending: true });

    // If there are existing relationships, filter them out
    if (existingIds.length > 0) {
      // Use a simpler approach - get all records and filter in JavaScript
      const { data: allRecords, error: allRecordsError } = await query;
      
      if (allRecordsError) {
        console.error('Error fetching all records:', allRecordsError);
        await AppLogger.error('relationshipActions', 'getAvailableRecords', 'Failed to fetch all records', allRecordsError, { typeOfRecord, entityId });
        throw allRecordsError;
      }

      console.log('All records fetched:', allRecords);

      // Filter out existing records in JavaScript
      const availableRecords = (allRecords || []).filter((record: any) => !existingIds.includes(record.id));
      
      console.log('Available records after filtering:', availableRecords);
      await AppLogger.info('relationshipActions', 'getAvailableRecords', 'Successfully fetched available records', { typeOfRecord, entityId, count: availableRecords?.length });
      return availableRecords;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching available records:', error);
      await AppLogger.error('relationshipActions', 'getAvailableRecords', 'Failed to fetch available records', error, { typeOfRecord, entityId });
      throw error;
    }

    console.log('Available records (no filtering needed):', data);
    await AppLogger.info('relationshipActions', 'getAvailableRecords', 'Successfully fetched available records', { typeOfRecord, entityId, count: data?.length });
    return data;
  } catch (error) {
    console.error('Exception in getAvailableRecords:', error);
    await AppLogger.error('relationshipActions', 'getAvailableRecords', 'Exception in getAvailableRecords', error, { typeOfRecord, entityId });
    throw error;
  }
}

export async function createRelationship(
  entityId: string, 
  relatedDataId: string, 
  typeOfRecord: string, 
  relationshipDescription: string
) {
  try {
    const { data, error } = await getServiceSupabase()
      .from('entity_related_data')
      .insert({
        entity_id: entityId,
        related_data_id: relatedDataId,
        type_of_record: typeOfRecord,
        relationship_description: relationshipDescription
      })
      .select()
      .single();

    if (error) {
      await AppLogger.error('relationshipActions', 'createRelationship', 'Failed to create relationship', error, { 
        entityId, 
        relatedDataId, 
        typeOfRecord, 
        relationshipDescription 
      });
      throw error;
    }

    await AppLogger.info('relationshipActions', 'createRelationship', 'Successfully created relationship', { 
      entityId, 
      relatedDataId, 
      typeOfRecord, 
      relationshipDescription,
      relationshipId: data?.id 
    });
    return data;
  } catch (error) {
    await AppLogger.error('relationshipActions', 'createRelationship', 'Exception in createRelationship', error, { 
      entityId, 
      relatedDataId, 
      typeOfRecord, 
      relationshipDescription 
    });
    throw error;
  }
}

export async function updateRelationship(
  relationshipId: string, 
  relationshipDescription: string
) {
  try {
    const { data, error } = await getServiceSupabase()
      .from('entity_related_data')
      .update({ relationship_description: relationshipDescription })
      .eq('id', relationshipId)
      .select()
      .single();

    if (error) {
      await AppLogger.error('relationshipActions', 'updateRelationship', 'Failed to update relationship', error, { 
        relationshipId, 
        relationshipDescription 
      });
      throw error;
    }

    await AppLogger.info('relationshipActions', 'updateRelationship', 'Successfully updated relationship', { 
      relationshipId, 
      relationshipDescription 
    });
    return data;
  } catch (error) {
    await AppLogger.error('relationshipActions', 'updateRelationship', 'Exception in updateRelationship', error, { 
      relationshipId, 
      relationshipDescription 
    });
    throw error;
  }
}

export async function deleteRelationship(relationshipId: string) {
  try {
    const { error } = await getServiceSupabase()
      .from('entity_related_data')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      await AppLogger.error('relationshipActions', 'deleteRelationship', 'Failed to delete relationship', error, { relationshipId });
      throw error;
    }

    await AppLogger.info('relationshipActions', 'deleteRelationship', 'Successfully deleted relationship', { relationshipId });
    return { success: true };
  } catch (error) {
    await AppLogger.error('relationshipActions', 'deleteRelationship', 'Exception in deleteRelationship', error, { relationshipId });
    throw error;
  }
}

export async function getRelationship(relationshipId: string) {
  try {
    console.log('getRelationship called with relationshipId:', relationshipId);
    
    // First try to find the relationship by its ID in entity_related_data
    let { data, error } = await getServiceSupabase()
      .from('entity_related_data')
      .select(`
        id,
        entity_id,
        related_data_id,
        type_of_record,
        relationship_description
      `)
      .eq('id', relationshipId)
      .single();

    // If not found by ID, try to find by related_data_id
    if (error && error.code === 'PGRST116') {
      console.log('Relationship not found by ID, trying to find by related_data_id:', relationshipId);
      
      const { data: relationshipByRelatedId, error: relatedIdError } = await getServiceSupabase()
        .from('entity_related_data')
        .select(`
          id,
          entity_id,
          related_data_id,
          type_of_record,
          relationship_description
        `)
        .eq('related_data_id', relationshipId)
        .single();

      if (relatedIdError) {
        console.log('Relationship not found by related_data_id either:', relatedIdError);
        await AppLogger.error('relationshipActions', 'getRelationship', 'Failed to fetch relationship by ID or related_data_id', relatedIdError, { relationshipId });
        throw new Error(`Relationship not found with ID: ${relationshipId}`);
      }

      data = relationshipByRelatedId;
      error = null;
      console.log('Found relationship by related_data_id:', data);
    }

    if (error) {
      await AppLogger.error('relationshipActions', 'getRelationship', 'Failed to fetch relationship', error, { relationshipId });
      throw error;
    }

    await AppLogger.info('relationshipActions', 'getRelationship', 'Successfully fetched relationship', { relationshipId, relationshipData: data });
    return data;
  } catch (error) {
    await AppLogger.error('relationshipActions', 'getRelationship', 'Exception in getRelationship', error, { relationshipId });
    throw error;
  }
} 