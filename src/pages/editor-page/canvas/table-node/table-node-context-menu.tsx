import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '@/components/context-menu/context-menu';
import type { DBTable } from '@/lib/domain/db-table';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface TableNodeContextMenuProps {
    table: DBTable;
    readonly: boolean;
    openTableFromSidebar: (tableId: string) => void;
}

export const TableNodeContextMenu: React.FC<
    React.PropsWithChildren<TableNodeContextMenuProps>
> = ({ children, table, readonly, openTableFromSidebar }) => {
    const { t } = useTranslation();

    const duplicateTableHandler = useCallback(() => {
        console.error('Not implemented: createTable');
    }, [table]);

    const editTableHandler = useCallback(() => {
        openTableFromSidebar(table.id);
    }, [openTableFromSidebar, table.id]);

    const removeTableHandler = useCallback(() => {
        console.error('Not implemented: removeTable');
    }, [table.id]);

    if (readonly) {
        return <>{children}</>;
    }
    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    onClick={editTableHandler}
                    className="flex justify-between gap-3"
                >
                    <span>{t('table_node_context_menu.edit_table')}</span>
                    <Pencil className="size-3.5" />
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={duplicateTableHandler}
                    className="flex justify-between gap-3"
                >
                    <span>{t('table_node_context_menu.duplicate_table')}</span>
                    <Copy className="size-3.5" />
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={removeTableHandler}
                    className="flex justify-between gap-3"
                >
                    <span>{t('table_node_context_menu.delete_table')}</span>
                    <Trash2 className="size-3.5 text-red-700" />
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
