export interface AccelerometerDataPoint {
    timestamp: number;
    ax: number;
    ay: number;
    az: number;
}

/**
 * V2 Optimized Tuple Format: [timestamp, ax, ay, az]
 */
export type ScgTuple = [number, number, number, number];

export interface Session {
    sessionId: string;
    createdAt: string;
    status: 'created' | 'active' | 'ended';
    viewerUrl: string;
    websocketUrl: string;
}

export interface Sample {
    t: number;
    ax: number;
    ay: number;
    az: number;
}

export interface ScgDataPayload {
    sessionId: string;
    data: ScgTuple[];
}

export interface MeasurementEntry {
    id: string;
    timestamp: number;
    duration: number;
    data: ScgTuple[];
    source?: string;
    synced?: boolean;
}

export interface PeakData {
    peaks: number[];   // Array of indices or timestamps where peaks occur
    valleys: number[]; // Array of indices or timestamps where valleys occur
}

// uPlot expects data as an array of arrays: [ [x1, x2, ...], [y1, y2, ...], ... ]
export type ChartData = number[][];

export interface ChartWorkspaceProps {
    displayMode: 'high' | 'low';
    chartData: ChartData | null;
    segmentData?: ChartData[] | null;
    labels?: Record<string, unknown>; // Should be refined if label structure is known
    peaks?: PeakData | null;
    onPointClick?: (pointIndex: number) => void;
    onPointRightClick?: (pointIndex: number) => void;
    onPointDoubleClick?: (pointIndex: number) => void;
    // findNearestPoint signature aligned with uPlot usage if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findNearestPoint?: (mouseX: number, mouseY: number, u: any, data: ChartData) => number | null;
}
