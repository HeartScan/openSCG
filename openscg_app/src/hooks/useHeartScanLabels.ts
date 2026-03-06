'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAppStore, LabelType } from '@/store/useAppStore';
import { useEffect, useCallback } from 'react';

export type { LabelType };

export function useHeartScanLabels(fileId: string | undefined) {
  const queryClient = useQueryClient();
  const { 
    labels, 
    originalLabels,
    labelsFileId, 
    isLabelsDirty, 
    setLabels, 
    updateOriginalLabels,
    updateLabel
  } = useAppStore();

  const labelsQuery = useQuery({
    queryKey: ['files', fileId, 'labels'],
    queryFn: async () => {
      console.log(`[Labels] API Fetching for: ${fileId}`);
      const data = await apiFetch<Record<string, LabelType>>(`/files/${fileId}/labels`);
      return data || {};
    },
    enabled: !!fileId,
    staleTime: 1000 * 60 * 5,
  });

  // INITIALIZATION: Sync server data to Zustand ONLY if it's a new file or we're not dirty
  useEffect(() => {
    if (fileId && (fileId !== labelsFileId || !isLabelsDirty)) {
      if (labelsQuery.data) {
        console.log(`[Labels] Syncing server data to Zustand for ${fileId}`);
        setLabels(fileId, labelsQuery.data, false);
      } else if (!labelsQuery.isLoading) {
        setLabels(fileId, {}, false);
      }
    }
  }, [labelsQuery.data, labelsQuery.isLoading, fileId, labelsFileId, isLabelsDirty, setLabels]);

  const saveLabelsMutation = useMutation({
    mutationFn: async (diff: Record<string, LabelType | null>) => {
      console.log(`[Labels] GARENTEED SAVE START for ${fileId}:`, diff);
      
      const result = await apiFetch(`/files/${fileId}/labels`, {
        method: 'post',
        body: { labels: diff },
      });
      
      console.log(`[Labels] GARENTEED SAVE COMPLETE for ${fileId}`);
      return result;
    },
    onSuccess: () => {
      updateOriginalLabels();
      queryClient.invalidateQueries({ queryKey: ['files', fileId, 'labels'] });
    }
  });

  const toggleSkipMutation = useMutation({
    mutationFn: () => 
      apiFetch<{ isSkipped: boolean }>(`/files/${fileId}/skip`, {
        method: 'post',
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['files', fileId, 'skip'], data);
      queryClient.invalidateQueries({ queryKey: ['files', fileId, 'labels'] });
    },
  });

  const saveLabelsAsync = useCallback(async () => {
    if (!isLabelsDirty || labelsFileId !== fileId) return;

    const diff: Record<string, LabelType | null> = {};
    Object.entries(labels).forEach(([idx, status]) => {
      if (originalLabels[idx] !== status) diff[idx] = status;
    });
    Object.keys(originalLabels).forEach((idx) => {
      if (!labels[idx]) diff[idx] = null;
    });

    if (Object.keys(diff).length > 0) {
      await saveLabelsMutation.mutateAsync(diff);
    } else {
      updateOriginalLabels();
    }
  }, [isLabelsDirty, labelsFileId, fileId, labels, originalLabels, saveLabelsMutation, updateOriginalLabels]);

  return {
    labels,
    isSkipped: labels.skipped === 'skipped',
    saveLabels: saveLabelsAsync, // Replaced with async version
    updateLabel,
    toggleSkip: toggleSkipMutation.mutate,
    isSaving: saveLabelsMutation.isPending || toggleSkipMutation.isPending,
    isDirty: isLabelsDirty,
  };
}
