export interface IndexInfo {
    schema: string;
    table: string;
    name: string;
    column: string;
    index_type: string;
    cardinality: number;
    size: number;
    unique: boolean;
    is_partial_index: boolean;
    direction: string;
    column_position: number;
}

export type AggregatedIndexInfo = Omit<IndexInfo, 'column'> & {
    columns: { name: string; position: number }[];
};
