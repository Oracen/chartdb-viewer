import { schemaNameToSchemaId } from './db-schema';

export interface DBRelationship {
    id: string;
    name: string;
    sourceSchema?: string;
    sourceTableId: string;
    targetSchema?: string;
    targetTableId: string;
    sourceFieldId: string;
    targetFieldId: string;
    sourceCardinality: Cardinality;
    targetCardinality: Cardinality;
    createdAt: number;
}

export type RelationshipType =
    | 'one_to_one'
    | 'one_to_many'
    | 'many_to_one'
    | 'many_to_many';
export type Cardinality = 'one' | 'many';

export const shouldShowRelationshipBySchemaFilter = (
    relationship: DBRelationship,
    filteredSchemas?: string[]
): boolean =>
    !filteredSchemas ||
    !relationship.sourceSchema ||
    !relationship.targetSchema ||
    (filteredSchemas.includes(
        schemaNameToSchemaId(relationship.sourceSchema)
    ) &&
        filteredSchemas.includes(
            schemaNameToSchemaId(relationship.targetSchema)
        ));

export const determineRelationshipType = ({
    sourceCardinality,
    targetCardinality,
}: {
    sourceCardinality: Cardinality;
    targetCardinality: Cardinality;
}): RelationshipType => {
    if (sourceCardinality === 'one' && targetCardinality === 'one')
        return 'one_to_one';
    if (sourceCardinality === 'one' && targetCardinality === 'many')
        return 'one_to_many';
    if (sourceCardinality === 'many' && targetCardinality === 'one')
        return 'many_to_one';
    return 'many_to_many';
};
