import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { ListCollapse } from 'lucide-react';
import React, { useMemo } from 'react';
import { TableList } from './table-list/table-list';

import { EmptyState } from '@/components/empty-state/empty-state';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { DBSchema } from '@/lib/domain/db-schema';
import type { DBTable } from '@/lib/domain/db-table';
import { shouldShowTablesBySchemaFilter } from '@/lib/domain/db-table';

export interface TablesSectionProps {
    tables: DBTable[];
    schemas: DBSchema[];
    filteredSchemas: string[];
    closeAllTablesInSidebar: () => void;
    hideSidePanel: () => void;
    openTableFromSidebar: (id: string | null) => void;
    openedTableInSidebar: string | null;
}

export const TablesSection: React.FC<TablesSectionProps> = ({
    tables,
    schemas,
    filteredSchemas,
    closeAllTablesInSidebar,
    hideSidePanel,
    openTableFromSidebar,
    openedTableInSidebar,
}) => {
    const [filterText, setFilterText] = React.useState('');

    const filteredTables = useMemo(() => {
        const filterTableName: (table: DBTable) => boolean = (table) =>
            !filterText?.trim?.() ||
            table.name.toLowerCase().includes(filterText.toLowerCase());

        const filterSchema: (table: DBTable) => boolean = (table) =>
            shouldShowTablesBySchemaFilter(table, filteredSchemas);

        return tables.filter(filterSchema).filter(filterTableName);
    }, [tables, filterText, filteredSchemas]);

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden px-2"
            data-vaul-no-drag
        >
            <div className="flex items-center justify-between gap-4 py-1">
                <div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    variant="ghost"
                                    className="size-8 p-0"
                                    onClick={closeAllTablesInSidebar}
                                >
                                    <ListCollapse className="size-4" />
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>Collapse</TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder={'Filter'}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="h-full">
                    {tables.length === 0 ? (
                        <EmptyState
                            title="Title"
                            description="Description"
                            className="mt-20"
                        />
                    ) : (
                        <TableList
                            tables={filteredTables}
                            schemas={schemas}
                            hideSidePanel={hideSidePanel}
                            openTableFromSidebar={openTableFromSidebar}
                            openedTableInSidebar={openedTableInSidebar}
                        />
                    )}
                </ScrollArea>
            </div>
        </section>
    );
};
