import { Accordion } from '@/components/accordion/accordion';
import type { DBTable } from '@/lib/domain/db-table';

import { DBSchema } from '@/lib/domain/db-schema';
import React, { useCallback, useMemo } from 'react';
import { TableListItem } from './table-list-item/table-list-item';

export interface TableListProps {
    tables: DBTable[];
    schemas: DBSchema[];
    hideSidePanel: () => void;
    openTableFromSidebar: (id: string | null) => void;
    openedTableInSidebar: string | null;
}

export const TableList: React.FC<TableListProps> = ({
    tables,
    schemas,
    hideSidePanel,
    openTableFromSidebar,
    openedTableInSidebar,
}) => {
    const lastOpenedTable = React.useRef<string | null>(null);
    const refs = useMemo(
        () =>
            tables.reduce(
                (acc, table) => {
                    acc[table.id] = React.createRef();
                    return acc;
                },
                {} as Record<string, React.RefObject<HTMLDivElement>>
            ),
        [tables]
    );

    const scrollToTable = useCallback(
        (id: string) =>
            refs[id]?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            }),
        [refs]
    );

    const handleScrollToTable = useCallback(() => {
        if (
            openedTableInSidebar &&
            lastOpenedTable.current !== openedTableInSidebar
        ) {
            lastOpenedTable.current = openedTableInSidebar;
            scrollToTable(openedTableInSidebar);
        }
    }, [scrollToTable, openedTableInSidebar]);

    return (
        <Accordion
            type="single"
            collapsible
            className="flex w-full flex-col gap-1"
            value={openedTableInSidebar || ''}
            onValueChange={openTableFromSidebar}
            onAnimationEnd={handleScrollToTable}
        >
            {tables
                .sort((table1: DBTable, table2: DBTable) => {
                    // if one table has order and the other doesn't, the one with order should come first
                    if (table1.order && table2.order === undefined) {
                        return -1;
                    }

                    if (table1.order === undefined && table2.order) {
                        return 1;
                    }

                    // if both tables have order, sort by order
                    if (
                        table1.order !== undefined &&
                        table2.order !== undefined
                    ) {
                        return table1.order - table2.order;
                    }

                    // if both tables don't have order, sort by name
                    if (table1.isView === table2.isView) {
                        // Both are either tables or views, so sort alphabetically by name
                        return table1.name.localeCompare(table2.name);
                    }
                    // If one is a view and the other is not, put tables first
                    return table1.isView ? 1 : -1;
                })
                .map((table) => (
                    <TableListItem
                        key={table.id}
                        table={table}
                        ref={refs[table.id]}
                        schemas={schemas}
                        hideSidePanel={hideSidePanel}
                    />
                ))}
        </Accordion>
    );
};
