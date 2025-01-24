import { Button } from '@/components/button/button';
import { EmptyState } from '@/components/empty-state/empty-state';
import { Input } from '@/components/input/input';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

import type { DBRelationship } from '@/lib/domain/db-relationship';
import { shouldShowRelationshipBySchemaFilter } from '@/lib/domain/db-relationship';
import { ListCollapse, Workflow } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RelationshipList } from './relationship-list/relationship-list';

export interface RelationshipsSectionProps {
    relationships: DBRelationship[];
    filteredSchemas: string[];
    closeAllRelationshipsInSidebar: () => void;
}

export const RelationshipsSection: React.FC<RelationshipsSectionProps> = ({
    relationships,
    filteredSchemas,
    closeAllRelationshipsInSidebar,
}) => {
    const [filterText, setFilterText] = React.useState('');
    const { t } = useTranslation();

    const [openRelationship, setOpenRelationship] = React.useState<
        string | null
    >(null);

    const filteredRelationships = useMemo(() => {
        const filterName: (relationship: DBRelationship) => boolean = (
            relationship
        ) =>
            !filterText?.trim?.() ||
            relationship.name.toLowerCase().includes(filterText.toLowerCase());

        const filterSchema: (relationship: DBRelationship) => boolean = (
            relationship
        ) =>
            shouldShowRelationshipBySchemaFilter(relationship, filteredSchemas);

        return relationships.filter(filterSchema).filter(filterName);
    }, [relationships, filterText, filteredSchemas]);

    return (
        <section className="flex flex-1 flex-col overflow-hidden px-2">
            <div className="flex items-center justify-between gap-4 py-1">
                <div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    variant="ghost"
                                    className="size-8 p-0"
                                    onClick={closeAllRelationshipsInSidebar}
                                >
                                    <ListCollapse className="size-4" />
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t('side_panel.relationships_section.collapse')}
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder={t(
                            'side_panel.relationships_section.filter'
                        )}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <Button
                    variant="secondary"
                    className="h-8 p-2 text-xs"
                    onClick={() => {
                        console.error('Not implemented');
                    }}
                >
                    <Workflow className="h-4" />
                    {t('side_panel.relationships_section.add_relationship')}
                </Button>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="h-full">
                    {relationships.length === 0 ? (
                        <EmptyState
                            title={t(
                                'side_panel.relationships_section.empty_state.title'
                            )}
                            description={t(
                                'side_panel.relationships_section.empty_state.description'
                            )}
                            className="mt-20"
                        />
                    ) : (
                        <RelationshipList
                            relationships={filteredRelationships}
                            openRelationshipFromSidebar={setOpenRelationship}
                            openedRelationshipInSidebar={openRelationship}
                        />
                    )}
                </ScrollArea>
            </div>
        </section>
    );
};
