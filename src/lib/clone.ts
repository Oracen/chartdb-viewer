import type { DBField } from './domain/db-field';
import type { DBIndex } from './domain/db-index';
import type { DBTable } from './domain/db-table';
import { generateId as defaultGenerateId } from './utils';

const generateIdsMapFromTable = (
    table: DBTable,
    generateId: () => string = defaultGenerateId
): Map<string, string> => {
    const idsMap = new Map<string, string>();
    idsMap.set(table.id, generateId());

    table.fields.forEach((field) => {
        idsMap.set(field.id, generateId());
    });

    table.indexes.forEach((index) => {
        idsMap.set(index.id, generateId());
    });

    return idsMap;
};

export const cloneTable = (
    table: DBTable,
    options: {
        generateId: () => string;
        idsMap: Map<string, string>;
    } = {
        generateId: defaultGenerateId,
        idsMap: new Map<string, string>(),
    }
): DBTable => {
    const { generateId } = options;

    const idsMap = new Map([
        ...generateIdsMapFromTable(table, generateId),
        ...options.idsMap,
    ]);

    const getNewId = (id: string): string | null => {
        const newId = idsMap.get(id);
        if (!newId) {
            return null;
        }
        return newId;
    };

    const tableId = getNewId(table.id);
    if (!tableId) {
        throw new Error('Table id not found');
    }

    const newTable: DBTable = { ...table, id: tableId };
    newTable.fields = table.fields
        .map((field): DBField | null => {
            const id = getNewId(field.id);

            if (!id) {
                return null;
            }

            return {
                ...field,
                id,
            };
        })
        .filter((field): field is DBField => field !== null);
    newTable.indexes = table.indexes
        .map((index): DBIndex | null => {
            const id = getNewId(index.id);

            if (!id) {
                return null;
            }

            return {
                ...index,
                fieldIds: index.fieldIds
                    .map((id) => getNewId(id))
                    .filter((fieldId): fieldId is string => fieldId !== null),
                id,
            };
        })
        .filter((index): index is DBIndex => index !== null);

    return newTable;
};
