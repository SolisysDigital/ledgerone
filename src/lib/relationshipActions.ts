"use server";

import { supabase } from "@/lib/supabase";
import { AppLogger } from "@/lib/logger";

export async function getEntityRelationships(entityId: string) {
  try {
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
      .order('type_of_record', { ascending: true });

    if (relationshipsError) {
      await AppLogger.error('relationshipActions', 'getEntityRelationships', 'Failed to fetch relationships', relationshipsError, { entityId });
      throw relationshipsError;
    }

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

          return {
            ...relationship,
            related_data_display_name: (relatedData as any)?.[displayField] || 'Unnamed Record'
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

    await AppLogger.info('relationshipActions', 'getEntityRelationships', 'Successfully fetched relationships', { entityId, count: enrichedRelationships?.length });
    return enrichedRelationships;
  } catch (error) {
    await AppLogger.error('relationshipActions', 'getEntityRelationships', 'Exception in getEntityRelationships', error, { entityId });
    throw error;
  }
}

export async function getAvailableRecords(typeOfRecord: string, entityId: string) {
  try {
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

    // First get the IDs of records that are already related to this entity
    const { data: existingRelationships, error: existingError } = await supabase
      .from('entity_related_data')
      .select('related_data_id')
      .eq('entity_id', entityId)
      .eq('type_of_record', typeOfRecord);

    if (existingError) {
      await AppLogger.error('relationshipActions', 'getAvailableRecords', 'Failed to fetch existing relationships', existingError, { typeOfRecord, entityId });
      throw existingError;
    }

    // Get the IDs of already related records
    const existingIds = (existingRelationships || []).map(r => r.related_data_id);

    // Get all records of the specified type that are not already related to this entity
    const query = supabase
      .from(typeOfRecord)
      .select('*')
      .order(displayField, { ascending: true });

    // If there are existing relationships, filter them out
    if (existingIds.length > 0) {
      // Use a simpler approach - get all records and filter in JavaScript
      const { data: allRecords, error: allRecordsError } = await query;
      
      if (allRecordsError) {
        await AppLogger.error('relationshipActions', 'getAvailableRecords', 'Failed to fetch all records', allRecordsError, { typeOfRecord, entityId });
        throw allRecordsError;
      }

      // Filter out existing records in JavaScript
      const availableRecords = (allRecords || []).filter(record => !existingIds.includes(record.id));
      
      await AppLogger.info('relationshipActions', 'getAvailableRecords', 'Successfully fetched available records', { typeOfRecord, entityId, count: availableRecords?.length });
      return availableRecords;
    }

    const { data, error } = await query;

    if (error) {
      await AppLogger.error('relationshipActions', 'getAvailableRecords', 'Failed to fetch available records', error, { typeOfRecord, entityId });
      throw error;
    }

    await AppLogger.info('relationshipActions', 'getAvailableRecords', 'Successfully fetched available records', { typeOfRecord, entityId, count: data?.length });
    return data;
  } catch (error) {
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { data, error } = await supabase
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

    if (error) {
      await AppLogger.error('relationshipActions', 'getRelationship', 'Failed to fetch relationship', error, { relationshipId });
      throw error;
    }

    await AppLogger.info('relationshipActions', 'getRelationship', 'Successfully fetched relationship', { relationshipId });
    return data;
  } catch (error) {
    await AppLogger.error('relationshipActions', 'getRelationship', 'Exception in getRelationship', error, { relationshipId });
    throw error;
  }
} 