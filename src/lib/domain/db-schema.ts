import { DatabaseType } from './database-type';

export interface DBSchema {
    id: string;
    name: string;
    tableCount: number;
}

export const schemaNameToSchemaId = (schema: string): string =>
    schema.trim().toLowerCase().split(' ').join('_');

export const databasesWithSchemas: DatabaseType[] = [
    DatabaseType.POSTGRESQL,
    DatabaseType.SQL_SERVER,
    DatabaseType.CLICKHOUSE,
    DatabaseType.COCKROACHDB,
];
