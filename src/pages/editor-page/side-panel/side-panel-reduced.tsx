import type { SelectBoxOption } from '@/components/select-box/select-box';
import { SelectBox } from '@/components/select-box/select-box';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { DBDependency } from '@/lib/domain/db-dependency';
import { DBRelationship } from '@/lib/domain/db-relationship';
import { DBSchema } from '@/lib/domain/db-schema';
import { DBTable } from '@/lib/domain/db-table';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DependenciesSection } from './dependencies-section/dependencies-section';
import { RelationshipsSection } from './relationships-section/relationships-section';
import { TablesSection } from './tables-section/tables-section';

export interface SidePanelProps {
    schemas: DBSchema[];
    initialTables: DBTable[];
    initialRelationships: DBRelationship[];
    initialDependencies: DBDependency[];
    initialFilteredSchemas: string[];
    selectedSidebarSection: SidebarSection;
    setSelectedSidebarSection: (section: SidebarSection) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
    schemas,
    initialTables,
    initialRelationships,
    initialDependencies,
    initialFilteredSchemas,
    selectedSidebarSection,
    setSelectedSidebarSection,
}) => {
    const { t } = useTranslation();

    const [isSelectSchemaOpen, setInnerIsSelectSchemaOpen] =
        React.useState(false);

    const [openTable, setOpenTable] = React.useState<string | null>(null);

    const setIsSelectSchemaOpen = useCallback(
        (open: boolean) => {
            setInnerIsSelectSchemaOpen(open);
        },
        [setInnerIsSelectSchemaOpen]
    );
    const schemasOptions: SelectBoxOption[] = [];
    const filteredSchemas = initialFilteredSchemas;

    return (
        <aside className="flex h-full flex-col overflow-hidden">
            {schemasOptions.length > 0 ? (
                <div className="flex items-center justify-center border-b pl-3 pt-0.5">
                    <div className="shrink-0 text-sm font-semibold">
                        {t('side_panel.schema')}
                    </div>
                    <div className="flex min-w-0 flex-1">
                        <SelectBox
                            oneLine
                            className="w-full rounded-none border-none"
                            selectAll
                            deselectAll
                            options={schemasOptions}
                            value={filteredSchemas ?? []}
                            onChange={() => {
                                console.error(
                                    'Not implemented: filter by schema'
                                );
                            }}
                            placeholder={t('side_panel.filter_by_schema')}
                            inputPlaceholder={t('side_panel.search_schema')}
                            emptyPlaceholder={t('side_panel.no_schemas_found')}
                            multiple
                            open={isSelectSchemaOpen}
                            onOpenChange={setIsSelectSchemaOpen}
                        />
                    </div>
                </div>
            ) : null}

            <div className="flex justify-center border-b pt-0.5">
                <Select
                    value={selectedSidebarSection}
                    onValueChange={(value) =>
                        setSelectedSidebarSection(value as SidebarSection)
                    }
                >
                    <SelectTrigger className="rounded-none border-none font-semibold shadow-none hover:bg-secondary hover:underline focus:border-transparent focus:ring-0">
                        <SelectValue />
                        <div className="flex flex-1 justify-end px-2 text-xs font-normal text-muted-foreground">
                            {t('side_panel.view_all_options')}
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="tables">
                                {t('side_panel.tables_section.tables')}
                            </SelectItem>
                            <SelectItem value="relationships">
                                {t(
                                    'side_panel.relationships_section.relationships'
                                )}
                            </SelectItem>
                            <SelectItem value="dependencies">
                                {t(
                                    'side_panel.dependencies_section.dependencies'
                                )}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            {selectedSidebarSection === 'tables' ? (
                <TablesSection
                    schemas={schemas}
                    tables={initialTables}
                    filteredSchemas={initialFilteredSchemas}
                    openedTableInSidebar={openTable}
                    hideSidePanel={() => {
                        console.error('Not implemented: hideSidePanel');
                    }}
                    openTableFromSidebar={(id) => setOpenTable(id)}
                    closeAllTablesInSidebar={() => {
                        console.error(
                            'Not implemented: closeAllTablesInSidebar'
                        );
                    }}
                />
            ) : selectedSidebarSection === 'relationships' ? (
                <RelationshipsSection
                    relationships={initialRelationships}
                    filteredSchemas={initialFilteredSchemas}
                    closeAllRelationshipsInSidebar={() => {
                        console.error(
                            'Not implemented: closeAllRelationshipsInSidebar'
                        );
                    }}
                />
            ) : (
                <DependenciesSection
                    dependencies={initialDependencies}
                    filteredSchemas={initialFilteredSchemas}
                    closeAllDependenciesInSidebar={() => {
                        console.error(
                            'Not implemented: closeAllDependenciesInSidebar'
                        );
                    }}
                />
            )}
        </aside>
    );
};
