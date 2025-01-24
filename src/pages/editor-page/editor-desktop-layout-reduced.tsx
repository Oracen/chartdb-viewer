import type { Diagram } from '@/lib/domain/diagram';

import React from 'react';

import { SidebarSection } from '@/context/layout-context/layout-context';
import { CanvasReduced } from './canvas/canvas-reduced';
import { SidePanel } from './side-panel/side-panel-reduced';

export interface EditorDesktopLayoutProps {
    initialDiagram?: Diagram;
}
export const EditorDesktopLayout: React.FC<EditorDesktopLayoutProps> = ({
    initialDiagram,
}) => {
    const initialTables = initialDiagram?.tables || [];
    const initialRelationships = initialDiagram?.relationships || [];
    const initialDependencies = initialDiagram?.dependencies || [];

    const [selectedSidebarSection, setSelectedSidebarSection] =
        React.useState<SidebarSection>('tables');

    return (
        <div className="h-full w-full">
            <CanvasReduced
                initialTables={initialTables}
                initialRelationships={initialRelationships}
                initialDependencies={initialDependencies}
                openTableFromSidebar={() =>
                    console.error('Not implemented: openTableFromSidebar')
                }
                setSelectedSection={setSelectedSidebarSection}
            />
            <SidePanel
                schemas={[]}
                initialFilteredSchemas={[]}
                initialTables={initialTables}
                initialRelationships={initialRelationships}
                initialDependencies={initialDependencies}
                setSelectedSidebarSection={setSelectedSidebarSection}
                selectedSidebarSection={selectedSidebarSection}
            />
        </div>
    );
};

export default EditorDesktopLayout;
