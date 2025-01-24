import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { Input } from '@/components/input/input';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import { useReactFlow } from '@xyflow/react';
import {
    Check,
    CircleDotDashed,
    EllipsisVertical,
    Pencil,
    Trash2,
} from 'lucide-react';
import React, { useCallback } from 'react';
import { useClickAway, useKeyPressEvent } from 'react-use';
import { ListItemHeaderButton } from '../../../../list-item-header-button/list-item-header-button';

import { useTranslation } from 'react-i18next';

export interface RelationshipListItemHeaderProps {
    relationship: DBRelationship;
    hideSidePanel: () => void;
}

export const RelationshipListItemHeader: React.FC<
    RelationshipListItemHeaderProps
> = ({ relationship, hideSidePanel }) => {
    const { fitView, deleteElements, setEdges } = useReactFlow();
    const { t } = useTranslation();
    const [editMode, setEditMode] = React.useState(false);
    const [relationshipName, setRelationshipName] = React.useState(
        relationship.name
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    const editRelationshipName = useCallback(() => {
        if (!editMode) return;
        if (relationshipName.trim() && relationshipName !== relationship.name) {
            console.error('Not implemented: updateRelationship');
        }

        setEditMode(false);
    }, [relationshipName, relationship.id, editMode, relationship.name]);

    useClickAway(inputRef, editRelationshipName);
    useKeyPressEvent('Enter', editRelationshipName);

    const enterEditMode = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.stopPropagation();
        setEditMode(true);
    };

    const focusOnRelationship = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.stopPropagation();
            setEdges((edges) =>
                edges.map((edge) =>
                    edge.id == relationship.id
                        ? {
                              ...edge,
                              selected: true,
                          }
                        : {
                              ...edge,
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
                        id: relationship.sourceTableId,
                    },
                    {
                        id: relationship.targetTableId,
                    },
                ],
            });
        },
        [
            fitView,
            relationship.sourceTableId,
            relationship.targetTableId,
            setEdges,
            relationship.id,
            hideSidePanel,
        ]
    );

    const deleteRelationshipHandler = useCallback(() => {
        console.error('Not implemented: removeRelationship');

        deleteElements({
            edges: [{ id: relationship.id }],
        });
    }, [relationship.id, deleteElements]);

    const renderDropDownMenu = useCallback(
        () => (
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <ListItemHeaderButton>
                        <EllipsisVertical />
                    </ListItemHeaderButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                    <DropdownMenuLabel>
                        {t(
                            'side_panel.relationships_section.relationship.relationship_actions.title'
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={deleteRelationshipHandler}
                            className="flex justify-between !text-red-700"
                        >
                            {t(
                                'side_panel.relationships_section.relationship.relationship_actions.delete_relationship'
                            )}
                            <Trash2 className="size-3.5 text-red-700" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [deleteRelationshipHandler, t]
    );

    return (
        <div className="group flex h-11 flex-1 items-center justify-between overflow-hidden">
            <div className="flex min-w-0 flex-1">
                {editMode ? (
                    <Input
                        ref={inputRef}
                        autoFocus
                        type="text"
                        placeholder={relationship.name}
                        value={relationshipName}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRelationshipName(e.target.value)}
                        className="h-7 w-full focus-visible:ring-0"
                    />
                ) : (
                    <div className="truncate">{relationship.name}</div>
                )}
            </div>
            <div className="flex flex-row-reverse">
                {!editMode ? (
                    <>
                        <div>{renderDropDownMenu()}</div>
                        <div className="flex flex-row-reverse md:hidden md:group-hover:flex">
                            <ListItemHeaderButton onClick={enterEditMode}>
                                <Pencil />
                            </ListItemHeaderButton>
                            <ListItemHeaderButton onClick={focusOnRelationship}>
                                <CircleDotDashed />
                            </ListItemHeaderButton>
                        </div>
                    </>
                ) : (
                    <ListItemHeaderButton onClick={editRelationshipName}>
                        <Check />
                    </ListItemHeaderButton>
                )}
            </div>
        </div>
    );
};
