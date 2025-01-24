import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cloneTable } from '@/lib/clone';
import { DBSchema } from '@/lib/domain/db-schema';
import type { DBTable } from '@/lib/domain/db-table';
import { ListItemHeaderButton } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';
import { useReactFlow } from '@xyflow/react';
import {
    CircleDotDashed,
    Copy,
    EllipsisVertical,
    FileKey2,
    FileType2,
    Group,
    Trash2,
} from 'lucide-react';
import React, { useCallback } from 'react';

export interface TableListItemHeaderProps {
    table: DBTable;
    schemas: DBSchema[];
    filteredSchemas: string[];
    hideSidePanel: () => void;
}

export const TableListItemHeader: React.FC<TableListItemHeaderProps> = ({
    table,
    schemas,
    filteredSchemas,
    hideSidePanel,
}) => {
    const { fitView, setNodes } = useReactFlow();

    const focusOnTable = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.stopPropagation();
            setNodes((nodes) =>
                nodes.map((node) =>
                    node.id == table.id
                        ? {
                              ...node,
                              selected: true,
                          }
                        : {
                              ...node,
                              selected: false,
                          }
                )
            );
            fitView({
                duration: 500,
                maxZoom: 1,
                minZoom: 1,
                nodes: [
                    {
                        id: table.id,
                    },
                ],
            });
        },
        [fitView, table.id, setNodes, hideSidePanel]
    );

    const deleteTableHandler = useCallback(() => {
        console.error('Not implemented: deleteTable');
    }, [table.id]);

    const duplicateTableHandler = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation();
            const clonedTable = cloneTable(table);

            clonedTable.name = `${clonedTable.name}_copy`;
            clonedTable.x += 30;
            clonedTable.y += 50;

            console.error('Not implemented: createTable');
        },
        [table]
    );

    const renderDropDownMenu = useCallback(
        () => (
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <ListItemHeaderButton>
                        <EllipsisVertical />
                    </ListItemHeaderButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit">
                    <DropdownMenuLabel>Table Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {schemas.length > 0 ? (
                        <>
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    className="flex justify-between gap-4"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.error('Not implemented');
                                    }}
                                >
                                    Change Schema
                                    <Group className="size-3.5" />
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                        </>
                    ) : null}
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className="flex justify-between gap-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.error('Not implemented: createField');
                            }}
                        >
                            Add Field
                            <FileType2 className="size-3.5" />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex justify-between gap-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.error('Not implemented: createIndex');
                            }}
                        >
                            Add Index
                            <FileKey2 className="size-3.5" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={duplicateTableHandler}
                            className="flex justify-between"
                        >
                            Duplicate Table
                            <Copy className="size-3.5" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={deleteTableHandler}
                            className="flex justify-between !text-red-700"
                        >
                            Delete Table
                            <Trash2 className="size-3.5 text-red-700" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [table.id, deleteTableHandler, duplicateTableHandler, schemas.length]
    );

    let schemaToDisplay;

    if (schemas.length > 1 && !!filteredSchemas && filteredSchemas.length > 1) {
        schemaToDisplay = table.schema;
    }

    return (
        <div className="group flex h-11 flex-1 items-center justify-between gap-1 overflow-hidden">
            <div className="flex min-w-0 flex-1 px-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="text-editable truncate px-2 py-0.5">
                            {table.name}
                            <span className="text-xs text-muted-foreground">
                                {schemaToDisplay ? ` (${schemaToDisplay})` : ''}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>Double Click to Edit</TooltipContent>
                </Tooltip>
            </div>
            <div className="flex flex-row-reverse">
                <div>{renderDropDownMenu()}</div>
                <div className="flex flex-row-reverse md:hidden md:group-hover:flex">
                    <ListItemHeaderButton onClick={focusOnTable}>
                        <CircleDotDashed />
                    </ListItemHeaderButton>
                </div>
            </div>
        </div>
    );
};
