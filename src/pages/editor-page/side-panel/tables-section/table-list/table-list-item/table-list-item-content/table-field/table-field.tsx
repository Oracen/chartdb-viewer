import { Button } from '@/components/button/button';
import { Separator } from '@/components/separator/separator';
import { Ellipsis, KeyRound } from 'lucide-react';
import React from 'react';

import { Checkbox } from '@/components/checkbox/checkbox';
import { Label } from '@/components/label/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { Textarea } from '@/components/textarea/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import type { DBField } from '@/lib/domain/db-field';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableFieldToggle } from './table-field-toggle';

export interface TableFieldProps {
    field: DBField;
    updateField: (attrs: Partial<DBField>) => void;
    removeField: () => void;
}

export const TableField: React.FC<TableFieldProps> = ({
    field,
    updateField,
}) => {
    const { attributes, setNodeRef, transform, transition } = useSortable({
        id: field.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div
            className="flex flex-1 touch-none flex-row justify-between p-1"
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div className="flex w-8/12 items-center justify-start gap-1 overflow-hidden">
                <span>
                    {field.name} ({field.type.id})
                </span>
            </div>
            <div className="flex w-4/12 justify-end gap-1 overflow-hidden">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <TableFieldToggle
                                pressed={field.nullable}
                                onPressedChange={(value) =>
                                    updateField({
                                        nullable: value,
                                    })
                                }
                            >
                                N
                            </TableFieldToggle>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>Nullable</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <TableFieldToggle
                                pressed={field.primaryKey}
                                onPressedChange={(value) =>
                                    updateField({
                                        unique: value,
                                        primaryKey: value,
                                    })
                                }
                            >
                                <KeyRound className="h-3.5" />
                            </TableFieldToggle>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>Primary Key</TooltipContent>
                </Tooltip>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 w-[32px] p-2 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <Ellipsis className="size-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="width"
                                        className="text-subtitle"
                                    >
                                        Unique
                                    </Label>
                                    <Checkbox
                                        checked={field.unique}
                                        disabled={field.primaryKey}
                                        onCheckedChange={(value) =>
                                            updateField({
                                                unique: !!value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="width"
                                        className="text-subtitle"
                                    >
                                        Comments
                                    </Label>
                                    <Textarea
                                        value={field.comments}
                                        onChange={(e) =>
                                            updateField({
                                                comments: e.target.value,
                                            })
                                        }
                                        placeholder="No comments"
                                        className="w-full rounded-md bg-muted text-sm"
                                    />
                                </div>
                            </div>
                            <Separator orientation="horizontal" />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};
