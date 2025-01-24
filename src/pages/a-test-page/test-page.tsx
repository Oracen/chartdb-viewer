import React from 'react';

import { examples } from '@/lib/examples-data/examples-data';
import EditorDesktopLayoutReduced from '@/pages/editor-page/editor-desktop-layout-reduced';
import { ReactFlowProvider } from '@xyflow/react';

export function TestPageHome() {
    const diagram = examples[0].diagram;

    return (
        <div className=" w-screen h-screen">
            <h1>Test Page</h1>

            <ReactFlowProvider>
                <EditorDesktopLayoutReduced initialDiagram={diagram} />
            </ReactFlowProvider>
        </div>
    );
}
