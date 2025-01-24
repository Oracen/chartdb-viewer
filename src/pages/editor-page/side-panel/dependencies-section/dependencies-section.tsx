import { Button } from '@/components/button/button';
import { EmptyState } from '@/components/empty-state/empty-state';
import { Input } from '@/components/input/input';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import type { DBDependency } from '@/lib/domain/db-dependency';
import { ListCollapse } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DependencyList } from './dependency-list/dependency-list';

export interface DependenciesSectionProps {
    dependencies: DBDependency[];
    filteredSchemas: string[];
    closeAllDependenciesInSidebar: () => void;
}

export const DependenciesSection: React.FC<DependenciesSectionProps> = ({
    dependencies,
    filteredSchemas,
    closeAllDependenciesInSidebar,
}) => {
    const [filterText, setFilterText] = React.useState('');
    const { t } = useTranslation();

    const filteredDependencies = useMemo(() => {
        console.error('Not implemented: filteredDependencies');
        return dependencies;
    }, [dependencies, filterText, filteredSchemas]);

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
                                    onClick={closeAllDependenciesInSidebar}
                                >
                                    <ListCollapse className="size-4" />
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t('side_panel.dependencies_section.collapse')}
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder={t(
                            'side_panel.dependencies_section.filter'
                        )}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="h-full">
                    {dependencies.length === 0 ? (
                        <EmptyState
                            title={t(
                                'side_panel.dependencies_section.empty_state.title'
                            )}
                            description={t(
                                'side_panel.dependencies_section.empty_state.description'
                            )}
                            className="mt-20"
                        />
                    ) : (
                        <DependencyList dependencies={filteredDependencies} />
                    )}
                </ScrollArea>
            </div>
        </section>
    );
};
