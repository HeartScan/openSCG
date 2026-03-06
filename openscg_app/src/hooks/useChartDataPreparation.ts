import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFileAtIndex, useFileData, useMLPeaks } from '@/hooks/useHeartScanApi';
import { useAppStore } from '@/store/useAppStore';
import { components } from '@/types/api';
import { ChartData, PeakData } from '@/types/scg';

type FileMetadata = components['schemas']['FileMetadata'];

export function useChartDataPreparation() {
    const { currentIndex, filters } = useAppStore();
    
    // Fetch Data
    const { data: metadata, isLoading: metaLoading, error: metaError } = useFileAtIndex(currentIndex, filters);
    const { data: signalData, isLoading: signalLoading, error: signalError } = useFileData(metadata?.id);
    const { data: peakDataRaw } = useMLPeaks(metadata?.id);

    // Transform Chart Data
    const chartData = useMemo((): ChartData | null => {
        if (!signalData?.time || !signalData?.signalAz) return null;
        return [signalData.time, signalData.signalAz];
    }, [signalData]);

    // Transform Segment Data (for HIGH mode)
    const segmentData = useMemo((): ChartData[] | null => {
        if (!chartData) return null;
        const [time, signal] = chartData;
        const len = time.length;
        const third = Math.floor(len / 3);
        return [
            [time.slice(0, third), signal.slice(0, third)],
            [time.slice(third, 2 * third), signal.slice(third, 2 * third)],
            [time.slice(2 * third), signal.slice(2 * third)],
        ];
    }, [chartData]);

    // Transform Peak Data
    const peakData = useMemo((): PeakData | undefined => {
        if (!peakDataRaw) return undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('peaks' in peakDataRaw && 'valleys' in peakDataRaw) return peakDataRaw as any;
        return undefined;
    }, [peakDataRaw]);

    return {
        metadata,
        chartData,
        segmentData,
        peakData,
        isLoading: metaLoading || signalLoading,
        error: metaError || signalError,
    };
}
