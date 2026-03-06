import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { useFileCount } from '@/hooks/useHeartScanApi';
import { apiFetch } from '@/lib/api-client';
import { components } from '@/types/api';
import { useHotkeys } from 'react-hotkeys-hook';

type FileMetadata = components['schemas']['FileMetadata'];
type FileData = components['schemas']['FileData'];

interface UseFileNavigationProps {
    isDirty: boolean;
    saveLabels: () => Promise<void>;
    toggleSkip: () => void;
}

export function useFileNavigation({ isDirty, saveLabels, toggleSkip }: UseFileNavigationProps) {
    const queryClient = useQueryClient();
    const {
        currentIndex,
        totalFiles,
        setCurrentIndex,
        setTotalFiles,
        filters,
    } = useAppStore();

    const { data: countData } = useFileCount(filters);

    // Sync total files
    useEffect(() => {
        if (countData?.total !== undefined) {
            setTotalFiles(countData.total);
        }
    }, [countData?.total, setTotalFiles]);

    // PREFETCH Logic
    useEffect(() => {
        if (totalFiles === 0) return;

        const indicesToPrefetch = [
            currentIndex - 2,
            currentIndex - 1,
            currentIndex + 1,
            currentIndex + 2
        ].filter(idx => idx >= 0 && idx < totalFiles);

        indicesToPrefetch.forEach(idx => {
            queryClient.prefetchQuery({
                queryKey: ['files', 'at-index', idx, filters],
                queryFn: async () => {
                    const meta = await apiFetch<FileMetadata>('/files/at-index', {
                        method: 'post',
                        body: { index: idx, filters },
                    });
                    
                    if (meta?.id) {
                        queryClient.prefetchQuery({
                            queryKey: ['files', meta.id, 'data'],
                            queryFn: () => apiFetch<FileData>(`/files/${meta.id}/data`),
                        });
                        queryClient.prefetchQuery({
                            queryKey: ['files', meta.id, 'peaks'],
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            queryFn: () => apiFetch<any>(`/files/${meta.id}/peaks`),
                        });
                    }
                    return meta;
                }
            });
        });
    }, [currentIndex, totalFiles, filters, queryClient]);

    // Navigation Handlers
    const handlePrev = useCallback(async () => {
        if (isDirty) {
            console.log(`[Labels] Navigation: Saving changes before going PREV...`);
            await saveLabels();
        }
        setCurrentIndex(Math.max(0, currentIndex - 1));
    }, [isDirty, saveLabels, currentIndex, setCurrentIndex]);

    const handleNext = useCallback(async () => {
        if (isDirty) {
            console.log(`[Labels] Navigation: Saving changes before going NEXT...`);
            await saveLabels();
        }
        setCurrentIndex(Math.min(totalFiles - 1, currentIndex + 1));
    }, [isDirty, saveLabels, currentIndex, totalFiles, setCurrentIndex]);

    // Hotkeys
    useHotkeys('right', handleNext);
    useHotkeys('left', handlePrev);
    useHotkeys('up', () => toggleSkip());
    useHotkeys('down', () => toggleSkip());
    useHotkeys('s', () => toggleSkip());

    return {
        currentIndex,
        totalFiles,
        handlePrev,
        handleNext,
    };
}
