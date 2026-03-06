import { renderHook, waitFor } from '@testing-library/react';
import { useChartDataPreparation } from './useChartDataPreparation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/hooks/useHeartScanApi';
import mockData from '../__mocks__/data/measurement_0.json';

// Mock dependencies
vi.mock('@/store/useAppStore');
vi.mock('@/hooks/useHeartScanApi');

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useChartDataPreparation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default store state
        (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            currentIndex: 0,
            filters: {},
        });
    });

    it('should return initial loading state', () => {
        (api.useFileAtIndex as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: true });
        (api.useFileData as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false });
        (api.useMLPeaks as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });

        const { result } = renderHook(() => useChartDataPreparation(), { wrapper });

        expect(result.current.isLoading).toBe(true);
    });

    it('should transform signal data correctly', () => {
        // Mock successful data fetch
        const mockMetadata = { id: 'file1', filename: 'test.json' };
        
        // Use real data structure from mock file
        // The mock file has { "data": [ { "t": ..., "x": ..., "y": ..., "z": ... } ] }
        // But our hook expects { time: number[], signalAz: number[] } from useFileData
        // We need to simulate what the API would return after parsing backend response
        
        // Simulating the backend response shape used by useFileData
        const mockSignalData = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            time: (mockData.request_body.sensor_data as any[]).map((d: any) => d.timestamp),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            signalAz: (mockData.request_body.sensor_data as any[]).map((d: any) => d.az)
        };

        (api.useFileAtIndex as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockMetadata, isLoading: false });
        (api.useFileData as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockSignalData, isLoading: false });
        (api.useMLPeaks as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });

        const { result } = renderHook(() => useChartDataPreparation(), { wrapper });

        expect(result.current.chartData).not.toBeNull();
        if (result.current.chartData) {
            expect(result.current.chartData[0]).toHaveLength(mockData.request_body.sensor_data.length); // Time
            expect(result.current.chartData[1]).toHaveLength(mockData.request_body.sensor_data.length); // Signal
            expect(result.current.chartData[1][0]).toBe(mockData.request_body.sensor_data[0].az); // Check value
        }
    });

    it('should calculate segment data correctly (split into 3 parts)', () => {
        // Create simple mock data for easy verification
        const simpleTime = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const simpleSignal = [10, 20, 30, 40, 50, 60, 70, 80, 90];
        const mockSignalData = { time: simpleTime, signalAz: simpleSignal };

        (api.useFileAtIndex as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { id: '1' }, isLoading: false });
        (api.useFileData as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockSignalData, isLoading: false });
        (api.useMLPeaks as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });

        const { result } = renderHook(() => useChartDataPreparation(), { wrapper });

        expect(result.current.segmentData).not.toBeNull();
        if (result.current.segmentData) {
            expect(result.current.segmentData).toHaveLength(3);
            // 9 items / 3 = 3 items per segment
            expect(result.current.segmentData[0][0]).toEqual([1, 2, 3]);
            expect(result.current.segmentData[1][0]).toEqual([4, 5, 6]);
            expect(result.current.segmentData[2][0]).toEqual([7, 8, 9]);
        }
    });
});
