"use server";

import { supabase } from "@/lib/supabase";
import { AppLogger } from "@/lib/logger";

export async function getEntityRelationships(entityId: string) {
  try {
    const { data, error } = await supabase
      .from('entity_related_data')
      .select(`
        id,
        related_data_id,
        type_of_record,
        relationship_description,
        related_data_display_name
      `)
      .eq('entity_id', entityId)
      .order('type_of_record', { ascending: true });

    if (error) {
      await AppLogger.error('relationshipActions', 'getEntityRelationships', 'Failed to fetch relationships', error, { entityId });
      throw error;
    }

    await AppLogger.info('relationshipActions', 'getEntityRelationships', 'Successfully fetched relationships', { entityId, count: data?.length });
    return data;
  } catch (error) {
    await AppLogger.error('relationshipActions', 'getEntityRelationships', 'Exception in getEntityRelationships', error, { entityId });
    throw error;
  }
}

export async function getAvailableRecords(typeOfRecord: string, entityId: string) {
  try {
    // Get all records of the specified type that are not already related to this entity
    const { data, error } = await supabase
      .from(typeOfRecord)
      .select('*')
      .not('id', 'in', `(
        SELECT related_data_id 
        FROM entity_related_data 
        WHERE entity_id = '${entityId}' 
        AND type_of_record = '${typeOfRecord}'
      )`)
      .order('name', { ascending: true });

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