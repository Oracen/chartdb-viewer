import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { SidebarSection } from '@/context/layout-context/layout-context';
import { DBDependency } from '@/lib/domain/db-dependency';
import { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import {
    adjustTablePositions,
    shouldShowTablesBySchemaFilter,
} from '@/lib/domain/db-table';
import type { Graph } from '@/lib/graph';
import { createGraph } from '@/lib/graph';
import { cn, debounce, getOperatingSystem } from '@/lib/utils';
import type {
    NodeDimensionChange,
    NodePositionChange,
    OnEdgesChange,
    OnNodesChange,
} from '@xyflow/react';
import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
    useEdgesState,
    useKeyPress,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import equal from 'fast-deep-equal';
import { AlertTriangle, LayoutGrid, Magnet } from 'lucide-react';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { findOverlappingTables, findTableOverlapping } from './canvas-utils';
import type { DependencyEdgeType } from './dependency-edge';
import { DependencyEdge } from './dependency-edge';
import { MarkerDefinitions } from './marker-definitions';
import type { RelationshipEdgeType } from './relationship-edge';
import { RelationshipEdge } from './relationship-edge';
import type { TableNodeType } from './table-node/table-node';
import { MIN_TABLE_SIZE, TableNode } from './table-node/table-node';
import {
    TARGET_DEP_PREFIX,
    TOP_SOURCE_HANDLE_ID_PREFIX,
} from './table-node/table-node-dependency-indicator';
import {
    LEFT_HANDLE_ID_PREFIX,
    TARGET_ID_PREFIX,
} from './table-node/table-node-field';
import { Toolbar } from './toolbar/toolbar';

export type EdgeType = RelationshipEdgeType | DependencyEdgeType;

const edgeTypes = {
    'relationship-edge': RelationshipEdge,
    'dependency-edge': DependencyEdge,
};

const initialEdges: EdgeType[] = [];

const effectiveTheme = 'light';

const tableToTableNode = (
    table: DBTable,
    relationships: DBRelationship[],
    dependencies: DBDependency[],
    readonly: boolean,

    openTableFromSidebar: (tableId: string) => void,
    selectSidebarSection: (
        section: 'tables' | 'relationships' | 'dependencies'
    ) => void,
    filteredSchemas?: string[]
): TableNodeType => ({
    id: table.id,
    type: 'table',
    position: { x: table.x, y: table.y },
    data: {
        table,
        isOverlapping: false,
        relationships,
        dependencies,
        readonly,
        openTableFromSidebar,
        selectSidebarSection,
    },
    width: table.width ?? MIN_TABLE_SIZE,
    hidden: !shouldShowTablesBySchemaFilter(table, filteredSchemas),
});

export interface CanvasProps {
    initialTables: DBTable[];
    initialRelationships: DBRelationship[];
    initialDependencies: DBDependency[];
    openTableFromSidebar: (tableId: string) => void;
    setSelectedSection: (section: SidebarSection) => void;
    readonly?: boolean;
}

export const CanvasReduced: React.FC<CanvasProps> = ({
    initialTables,
    initialRelationships,
    initialDependencies,
    readonly,
    openTableFromSidebar,
    setSelectedSection,
}) => {
    const showDependenciesOnCanvas = true;
    const showMiniMapOnCanvas = true;

    const { getEdge, getInternalNode, fitView, getEdges, getNode } =
        useReactFlow();
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
    const [selectedRelationshipIds, setSelectedRelationshipIds] = useState<
        string[]
    >([]);

    const { t } = useTranslation();

    const filteredSchemas: string[] = [];
    const relationships: DBRelationship[] = initialRelationships;
    const dependencies: DBDependency[] = initialDependencies;
    const tables: DBTable[] = initialTables;

    const nodeTypes = useMemo(() => ({ table: TableNode }), []);
    const [highlightOverlappingTables, setHighlightOverlappingTables] =
        useState(false);

    const [isInitialLoadingNodes, setIsInitialLoadingNodes] = useState(true);
    const [overlapGraph, setOverlapGraph] =
        useState<Graph<string>>(createGraph());

    const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeType>(
        initialTables.map((table) =>
            tableToTableNode(
                table,
                relationships,
                dependencies,
                readonly || true,
                openTableFromSidebar,
                setSelectedSection,
                filteredSchemas
            )
        )
    );
    const [edges, setEdges, onEdgesChange] =
        useEdgesState<EdgeType>(initialEdges);

    const [snapToGridEnabled, setSnapToGridEnabled] = useState(false);

    useEffect(() => {
        setIsInitialLoadingNodes(true);
    }, [initialTables]);

    useEffect(() => {
        const initialNodes = initialTables.map((table) =>
            tableToTableNode(
                table,
                relationships,
                dependencies,
                readonly || true,
                openTableFromSidebar,
                setSelectedSection,
                filteredSchemas
            )
        );
        if (equal(initialNodes, nodes)) {
            setIsInitialLoadingNodes(false);
        }
    }, [initialTables, nodes, filteredSchemas]);

    useEffect(() => {
        if (!isInitialLoadingNodes) {
            debounce(() => {
                fitView({
                    duration: 200,
                    padding: 0.1,
                    maxZoom: 0.8,
                });
            }, 500)();
        }
    }, [isInitialLoadingNodes, fitView]);

    useEffect(() => {
        const targetIndexes: Record<string, number> = relationships.reduce(
            (acc, relationship) => {
                acc[
                    `${relationship.targetTableId}${relationship.targetFieldId}`
                ] = 0;
                return acc;
            },
            {} as Record<string, number>
        );

        const targetDepIndexes: Record<string, number> = dependencies.reduce(
            (acc, dep) => {
                acc[dep.tableId] = 0;
                return acc;
            },
            {} as Record<string, number>
        );

        setEdges([
            ...relationships.map(
                (relationship): RelationshipEdgeType => ({
                    id: relationship.id,
                    source: relationship.sourceTableId,
                    target: relationship.targetTableId,
                    sourceHandle: `${LEFT_HANDLE_ID_PREFIX}${relationship.sourceFieldId}`,
                    targetHandle: `${TARGET_ID_PREFIX}${targetIndexes[`${relationship.targetTableId}${relationship.targetFieldId}`]++}_${relationship.targetFieldId}`,
                    type: 'relationship-edge',
                    data: {
                        relationship,
                        relationships,
                        openRelationshipFromSidebar: () => {},
                        selectSidebarSection: setSelectedSection,
                    },
                })
            ),
            ...dependencies.map(
                (dep): DependencyEdgeType => ({
                    id: dep.id,
                    source: dep.dependentTableId,
                    target: dep.tableId,
                    sourceHandle: `${TOP_SOURCE_HANDLE_ID_PREFIX}${dep.dependentTableId}`,
                    targetHandle: `${TARGET_DEP_PREFIX}${targetDepIndexes[dep.tableId]++}_${dep.tableId}`,
                    type: 'dependency-edge',
                    data: {
                        dependency: dep,
                        dependencies,
                        openDependencyFromSidebar: () => {},
                        selectSidebarSection: setSelectedSection,
                    },
                    hidden: false,
                })
            ),
        ]);
    }, [relationships, dependencies, setEdges, showDependenciesOnCanvas]);

    useEffect(() => {
        const selectedNodesIds = nodes
            .filter((node) => node.selected)
            .map((node) => node.id);

        if (equal(selectedNodesIds, selectedTableIds)) {
            return;
        }

        setSelectedTableIds(selectedNodesIds);
    }, [nodes, setSelectedTableIds, selectedTableIds]);

    useEffect(() => {
        const selectedEdgesIds = edges
            .filter((edge) => edge.selected)
            .map((edge) => edge.id);

        if (equal(selectedEdgesIds, selectedRelationshipIds)) {
            return;
        }

        setSelectedRelationshipIds(selectedEdgesIds);
    }, [edges, setSelectedRelationshipIds, selectedRelationshipIds]);

    useEffect(() => {
        const tablesSelectedEdges = getEdges()
            .filter(
                (edge) =>
                    selectedTableIds.includes(edge.source) ||
                    selectedTableIds.includes(edge.target)
            )
            .map((edge) => edge.id);

        const allSelectedEdges = [
            ...tablesSelectedEdges,
            ...selectedRelationshipIds,
        ];

        setEdges((edges) =>
            edges.map((edge): EdgeType => {
                const selected = allSelectedEdges.includes(edge.id);

                if (edge.type === 'dependency-edge') {
                    const dependencyEdge = edge as DependencyEdgeType;
                    return {
                        ...dependencyEdge,
                        data: {
                            ...dependencyEdge.data!,
                            highlighted: selected,
                        },
                        animated: selected,
                        zIndex: selected ? 1 : 0,
                    };
                } else {
                    const relationshipEdge = edge as RelationshipEdgeType;
                    return {
                        ...relationshipEdge,
                        data: {
                            ...relationshipEdge.data!,
                            highlighted: selected,
                        },
                        animated: selected,
                        zIndex: selected ? 1 : 0,
                    };
                }
            })
        );
    }, [selectedRelationshipIds, selectedTableIds, setEdges, getEdges]);

    useEffect(() => {
        setNodes(
            tables.map((table) => {
                const isOverlapping =
                    (overlapGraph.graph.get(table.id) ?? []).length > 0;
                const node = tableToTableNode(
                    table,
                    relationships,
                    dependencies,
                    readonly || true,
                    openTableFromSidebar,
                    setSelectedSection,
                    filteredSchemas
                );
                return {
                    ...node,
                    data: {
                        ...node.data,
                        isOverlapping,
                        highlightOverlappingTables,
                    },
                };
            })
        );
    }, [
        tables,
        setNodes,
        filteredSchemas,
        overlapGraph.lastUpdated,
        overlapGraph.graph,
        highlightOverlappingTables,
    ]);

    const prevFilteredSchemas = useRef<string[] | undefined>(undefined);
    useEffect(() => {
        if (!equal(filteredSchemas, prevFilteredSchemas.current)) {
            debounce(() => {
                const overlappingTablesInDiagram = findOverlappingTables({
                    tables: tables.filter((table) =>
                        shouldShowTablesBySchemaFilter(table, filteredSchemas)
                    ),
                });
                setOverlapGraph(overlappingTablesInDiagram);
                fitView({
                    duration: 500,
                    padding: 0.1,
                    maxZoom: 0.8,
                });
            }, 500)();
            prevFilteredSchemas.current = filteredSchemas;
        }
    }, [filteredSchemas, fitView, tables]);

    const onEdgesChangeHandler: OnEdgesChange<EdgeType> = useCallback(
        (changes) => {
            let changesToApply = changes;

            if (readonly) {
                changesToApply = changesToApply.filter(
                    (change) => change.type !== 'remove'
                );
            }

            return onEdgesChange(changesToApply);
        },
        [getEdge, onEdgesChange, readonly]
    );

    const updateOverlappingGraphOnChanges = useCallback(
        ({
            positionChanges,
            sizeChanges,
        }: {
            positionChanges: NodePositionChange[];
            sizeChanges: NodeDimensionChange[];
        }) => {
            if (positionChanges.length > 0 || sizeChanges.length > 0) {
                let newOverlappingGraph: Graph<string> = overlapGraph;

                for (const change of positionChanges) {
                    newOverlappingGraph = findTableOverlapping(
                        { node: getNode(change.id) as TableNodeType },
                        { nodes: nodes.filter((node) => !node.hidden) },
                        newOverlappingGraph
                    );
                }

                for (const change of sizeChanges) {
                    newOverlappingGraph = findTableOverlapping(
                        { node: getNode(change.id) as TableNodeType },
                        { nodes: nodes.filter((node) => !node.hidden) },
                        newOverlappingGraph
                    );
                }

                setOverlapGraph(newOverlappingGraph);
            }
        },
        [nodes, overlapGraph, setOverlapGraph, getNode]
    );

    const updateOverlappingGraphOnChangesDebounced = debounce(
        updateOverlappingGraphOnChanges,
        200
    );

    const onNodesChangeHandler: OnNodesChange<TableNodeType> = useCallback(
        (changes) => {
            let changesToApply = changes;

            if (readonly) {
                changesToApply = changesToApply.filter(
                    (change) => change.type !== 'remove'
                );
            }

            const positionChanges: NodePositionChange[] = changesToApply.filter(
                (change) => change.type === 'position' && !change.dragging
            ) as NodePositionChange[];

            const sizeChanges: NodeDimensionChange[] = changesToApply.filter(
                (change) => change.type === 'dimensions' && change.resizing
            ) as NodeDimensionChange[];

            updateOverlappingGraphOnChangesDebounced({
                positionChanges,
                sizeChanges,
            });

            return onNodesChange(changesToApply);
            //
        },
        [onNodesChange, updateOverlappingGraphOnChangesDebounced, readonly]
    );

    const isLoadingDOM =
        tables.length > 0 ? !getInternalNode(tables[0].id) : false;

    const reorderTables = useCallback(() => {
        const newTables = adjustTablePositions({
            relationships,
            tables: tables.filter((table) =>
                shouldShowTablesBySchemaFilter(table, filteredSchemas)
            ),
            mode: 'all', // Use 'all' mode for manual reordering
        });

        const updatedOverlapGraph = findOverlappingTables({
            tables: newTables,
        });

        setOverlapGraph(updatedOverlapGraph);
    }, [filteredSchemas, relationships, tables]);

    const hasOverlappingTables = useMemo(() => {
        return Array.from(overlapGraph.graph).some(
            ([, value]) => value.length > 0
        );
    }, [overlapGraph]);

    const pulseOverlappingTables = useCallback(() => {
        setHighlightOverlappingTables(true);
        setTimeout(() => setHighlightOverlappingTables(false), 600);
    }, []);

    const shiftPressed = useKeyPress('Shift');
    const operatingSystem = getOperatingSystem();

    return (
        <div className="relative flex h-full w-full">
            <ReactFlow
                colorMode={effectiveTheme}
                className="canvas-cursor-default nodes-animated"
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChangeHandler}
                onEdgesChange={onEdgesChangeHandler}
                maxZoom={5}
                minZoom={0.1}
                onConnect={() => {}}
                proOptions={{
                    hideAttribution: true,
                }}
                fitView={false}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{
                    animated: false,
                    type: 'relationship-edge',
                }}
                panOnScroll={true}
                snapToGrid={shiftPressed || snapToGridEnabled}
                snapGrid={[20, 20]}
            >
                <Controls
                    position="top-left"
                    showZoom={false}
                    showFitView={false}
                    showInteractive={false}
                    className="!shadow-none"
                >
                    <div className="flex flex-col items-center gap-2 md:flex-row">
                        {!readonly ? (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button
                                                variant="secondary"
                                                className="size-8 p-1 shadow-none"
                                                onClick={reorderTables}
                                            >
                                                <LayoutGrid className="size-4" />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {t('toolbar.reorder_diagram')}
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button
                                                variant="secondary"
                                                className={cn(
                                                    'size-8 p-1 shadow-none',
                                                    snapToGridEnabled ||
                                                        shiftPressed
                                                        ? 'bg-pink-600 text-white hover:bg-pink-500 dark:hover:bg-pink-700 hover:text-white'
                                                        : ''
                                                )}
                                                onClick={() =>
                                                    setSnapToGridEnabled(
                                                        (prev) => !prev
                                                    )
                                                }
                                            >
                                                <Magnet className="size-4" />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {t('snap_to_grid_tooltip', {
                                            key:
                                                operatingSystem === 'mac'
                                                    ? '⇧'
                                                    : 'Shift',
                                        })}
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        ) : null}

                        <div
                            className={`transition-opacity duration-300 ease-in-out ${
                                hasOverlappingTables
                                    ? 'opacity-100'
                                    : 'opacity-0'
                            }`}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button
                                            variant="default"
                                            className="size-8 p-1 shadow-none"
                                            onClick={pulseOverlappingTables}
                                        >
                                            <AlertTriangle className="size-4 text-white" />
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t('toolbar.highlight_overlapping_tables')}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </Controls>
                {isLoadingDOM ? (
                    <Controls
                        position="top-center"
                        orientation="horizontal"
                        showZoom={false}
                        showFitView={false}
                        showInteractive={false}
                        className="!shadow-none"
                    >
                        <Badge
                            variant="default"
                            className="bg-pink-600 text-white"
                        >
                            {t('loading_diagram')}
                        </Badge>
                    </Controls>
                ) : null}

                <Controls
                    position={'bottom-center'}
                    orientation="horizontal"
                    showZoom={false}
                    showFitView={false}
                    showInteractive={false}
                    className="!shadow-none"
                >
                    <Toolbar readonly={readonly} />
                </Controls>
                {showMiniMapOnCanvas && (
                    <MiniMap
                        style={{
                            width: 100,
                            height: 100,
                        }}
                    />
                )}
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                />
            </ReactFlow>
            <MarkerDefinitions />
        </div>
    );
};
