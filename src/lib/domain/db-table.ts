import { deepCopy } from '../utils';

import { type DBField } from './db-field';
import { type DBIndex } from './db-index';
import type { DBRelationship } from './db-relationship';
import { schemaNameToSchemaId } from './db-schema';

export interface DBTable {
    id: string;
    name: string;
    schema?: string;
    x: number;
    y: number;
    fields: DBField[];
    indexes: DBIndex[];
    color: string;
    isView: boolean;
    isMaterializedView?: boolean;
    createdAt: number;
    width?: number;
    comments?: string;
    order?: number;
}

export const shouldShowTablesBySchemaFilter = (
    table: DBTable,
    filteredSchemas?: string[]
): boolean =>
    !filteredSchemas ||
    !table.schema ||
    filteredSchemas.includes(schemaNameToSchemaId(table.schema));

export const adjustTablePositions = ({
    relationships: inputRelationships,
    tables: inputTables,
    mode = 'all',
}: {
    tables: DBTable[];
    relationships: DBRelationship[];
    mode?: 'all' | 'perSchema';
}): DBTable[] => {
    const tables = deepCopy(inputTables);
    const relationships = deepCopy(inputRelationships);

    const adjustPositionsForTables = (tablesToAdjust: DBTable[]) => {
        const tableWidth = 200;
        const tableHeight = 300;
        const gapX = 100;
        const gapY = 100;
        const startX = 100;
        const startY = 100;

        // Create a map of table connections
        const tableConnections = new Map<string, Set<string>>();
        relationships.forEach((rel) => {
            if (!tableConnections.has(rel.sourceTableId)) {
                tableConnections.set(rel.sourceTableId, new Set());
            }
            if (!tableConnections.has(rel.targetTableId)) {
                tableConnections.set(rel.targetTableId, new Set());
            }
            tableConnections.get(rel.sourceTableId)!.add(rel.targetTableId);
            tableConnections.get(rel.targetTableId)!.add(rel.sourceTableId);
        });

        // Sort tables by number of connections
        const sortedTables = [...tablesToAdjust].sort(
            (a, b) =>
                (tableConnections.get(b.id)?.size || 0) -
                (tableConnections.get(a.id)?.size || 0)
        );

        const positionedTables = new Set<string>();
        const tablePositions = new Map<string, { x: number; y: number }>();

        const isOverlapping = (
            x: number,
            y: number,
            currentTableId: string
        ): boolean => {
            for (const [tableId, pos] of tablePositions) {
                if (tableId === currentTableId) continue;
                if (
                    Math.abs(x - pos.x) < tableWidth + gapX &&
                    Math.abs(y - pos.y) < tableHeight + gapY
                ) {
                    return true;
                }
            }
            return false;
        };

        const findNonOverlappingPosition = (
            baseX: number,
            baseY: number,
            tableId: string
        ): { x: number; y: number } => {
            const spiralStep = Math.max(tableWidth, tableHeight) / 2;
            let angle = 0;
            let radius = 0;
            let iterations = 0;
            const maxIterations = 1000; // Prevent infinite loop

            while (iterations < maxIterations) {
                const x = baseX + radius * Math.cos(angle);
                const y = baseY + radius * Math.sin(angle);
                if (!isOverlapping(x, y, tableId)) {
                    return { x, y };
                }
                angle += Math.PI / 4;
                if (angle >= 2 * Math.PI) {
                    angle = 0;
                    radius += spiralStep;
                }
                iterations++;
            }

            // If we can't find a non-overlapping position, return a position far from others
            return {
                x: baseX + radius * Math.cos(angle),
                y: baseY + radius * Math.sin(angle),
            };
        };

        const positionTable = (
            table: DBTable,
            baseX: number,
            baseY: number
        ) => {
            if (positionedTables.has(table.id)) return;

            const { x, y } = findNonOverlappingPosition(baseX, baseY, table.id);

            table.x = x;
            table.y = y;
            tablePositions.set(table.id, { x: table.x, y: table.y });
            positionedTables.add(table.id);

            // Position connected tables
            const connectedTables = tableConnections.get(table.id) || new Set();
            let angle = 0;
            const angleStep = (2 * Math.PI) / connectedTables.size;

            connectedTables.forEach((connectedTableId) => {
                if (!positionedTables.has(connectedTableId)) {
                    const connectedTable = tablesToAdjust.find(
                        (t) => t.id === connectedTableId
                    );
                    if (connectedTable) {
                        const newX =
                            x + Math.cos(angle) * (tableWidth + gapX * 2);
                        const newY =
                            y + Math.sin(angle) * (tableHeight + gapY * 2);
                        positionTable(connectedTable, newX, newY);
                        angle += angleStep;
                    }
                }
            });
        };

        // Position tables
        sortedTables.forEach((table, index) => {
            if (!positionedTables.has(table.id)) {
                const row = Math.floor(index / 6);
                const col = index % 6;
                const x = startX + col * (tableWidth + gapX * 2);
                const y = startY + row * (tableHeight + gapY * 2);
                positionTable(table, x, y);
            }
        });

        // Apply positions to tables
        tablesToAdjust.forEach((table) => {
            const position = tablePositions.get(table.id);
            if (position) {
                table.x = position.x;
                table.y = position.y;
            }
        });
    };

    if (mode === 'perSchema') {
        // Group tables by schema
        const tablesBySchema = tables.reduce(
            (acc, table) => {
                const schema = table.schema || 'default';
                if (!acc[schema]) {
                    acc[schema] = [];
                }
                acc[schema].push(table);
                return acc;
            },
            {} as Record<string, DBTable[]>
        );

        // Adjust positions for each schema group
        Object.values(tablesBySchema).forEach(adjustPositionsForTables);
    } else {
        // Adjust positions for all tables
        adjustPositionsForTables(tables);
    }

    return tables;
};
