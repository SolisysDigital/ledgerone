"use client";

import { getEntityRelationships, getAvailableRecords, createRelationship, deleteRelationship, updateRelationship, getRelationship } from "./relationshipActions";

export const clientGetEntityRelationships = async (entityId: string) => {
  return getEntityRelationships(entityId);
};

export const clientGetAvailableRecords = async (typeOfRecord: string, entityId: string) => {
  return getAvailableRecords(typeOfRecord, entityId);
};

export const clientCreateRelationship = async (
  entityId: string, 
  relatedDataId: string, 
  typeOfRecord: string, 
  relationshipDescription: string
) => {
  return createRelationship(entityId, relatedDataId, typeOfRecord, relationshipDescription);
};

export const clientDeleteRelationship = async (relationshipId: string) => {
  return deleteRelationship(relationshipId);
};

export const clientUpdateRelationship = async (
  relationshipId: string, 
  relationshipDescription: string
) => {
  return updateRelationship(relationshipId, relationshipDescription);
};

export const clientGetRelationship = async (relationshipId: string) => {
  return getRelationship(relationshipId);
}; 