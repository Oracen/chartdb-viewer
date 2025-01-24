import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/accordion/accordion';
import { Button } from '@/components/button/button';
import { Textarea } from '@/components/textarea/textarea';
import type { DBTable } from '@/lib/domain/db-table';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileType2, MessageCircleMore, Plus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TableField } from './table-field/table-field';

type AccordionItemValue = 'fields' | 'indexes';

export interface TableListItemContentProps {
    table: DBTable;
}

export const TableListItemContent: React.FC<TableListItemContentProps> = ({
    table,
}) => {
    const { t } = useTranslation();
    const { color } = table;
    const [selectedItems, setSelectedItems] = React.useState<
        AccordionItemValue[]
    >(['fields']);
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active?.id !== over?.id && !!over && !!active) {
            console.error('Not implemented: updateTable');
        }
    };

    return (
        <div
            className="flex flex-col gap-1 rounded-b-md border-l-[6px] px-1"
            style={{
                borderColor: color,
            }}
        >
            <Accordion
                type="multiple"
                className="w-full"
                value={selectedItems}
                onValueChange={(value) =>
                    setSelectedItems(value as AccordionItemValue[])
                }
            >
                <AccordionItem value="fields" className="mb-2 border-y-0">
                    <AccordionTrigger
                        iconPosition="right"
                        className="group flex flex-1 p-0 px-2 py-1 text-xs text-subtitle hover:bg-secondary"
                        asChild
                    >
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex flex-row items-center gap-1">
                                <FileType2 className="size-4" />
                                Fields
                            </div>
                            <div className="flex flex-row-reverse">
                                <div className="hidden flex-row-reverse group-hover:flex">
                                    <Button
                                        variant="ghost"
                                        className="size-4 p-0 text-xs hover:bg-primary-foreground"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.error(
                                                'Not implemented: createField'
                                            );
                                        }}
                                    >
                                        <Plus className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col pb-0 pt-1">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={table.fields}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.fields.map((field) => (
                                    <TableField
                                        key={field.id}
                                        field={field}
                                        updateField={() =>
                                            console.error(
                                                'Not implemented: updateField'
                                            )
                                        }
                                        removeField={() =>
                                            console.error(
                                                'Not implemented: removeField'
                                            )
                                        }
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="comments" className="border-y-0">
                    <AccordionTrigger
                        iconPosition="right"
                        className="group flex flex-1 p-0 px-2 py-1 text-xs text-subtitle hover:bg-secondary"
                        asChild
                    >
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex flex-row items-center gap-1">
                                <MessageCircleMore className="size-4" />
                                {t('side_panel.tables_section.table.comments')}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-1">
                        <Textarea
                            value={table.comments}
                            onChange={() =>
                                console.error('Not implemented: updateTable')
                            }
                            placeholder={t(
                                'side_panel.tables_section.table.no_comments'
                            )}
                            className="w-full rounded-md bg-muted text-sm focus-visible:ring-0"
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
