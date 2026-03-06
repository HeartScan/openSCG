'use client';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { components } from '@/types/api';

type FileMetadata = components['schemas']['FileMetadata'];
type FileFilter = components['schemas']['FileFilter'];

export function useFileCount(filters: FileFilter) {
  return useQuery({
    queryKey: ['files', 'count', filters],
    queryFn: () => apiFetch<{ total: number }>('/files/count', {
      method: 'post',
      body: filters,
    }),
  });
}

export function useFileAtIndex(index: number, filters: FileFilter) {
  return useQuery({
    queryKey: ['files', 'at-index', index, filters],
    queryFn: () => apiFetch<FileMetadata>('/files/at-index', {
      method: 'post',
      body: { index, filters },
    }),
  });
}

export function useFileData(fileId: string | undefined) {
  return useQuery({
    queryKey: ['files', fileId, 'data'],
    queryFn: () => apiFetch<components['schemas']['FileData']>(`/files/${fileId}/data`),
    enabled: !!fileId,
  });
}

export function useMLPeaks(fileId: string | undefined) {
  return useQuery({
    queryKey: ['files', fileId, 'peaks'],
    queryFn: () => apiFetch<components['schemas']['PeakData']>(`/files/${fileId}/peaks`),
    enabled: !!fileId,
  });
}

export function useFileLabels(fileId: string | undefined) {
  return useQuery({
    queryKey: ['files', fileId, 'labels'],
    queryFn: async () => {
      console.log(`[Labels] Fetching for file: ${fileId}`);
      const data = await apiFetch<Record<string, "positive" | "negative" | "skipped">>(`/files/${fileId}/labels`);
      console.log(`[Labels] Received:`, data);
      return data;
    },
    enabled: !!fileId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateLabels(fileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (labels: Record<string, "positive" | "negative" | "skipped">) => {
      console.log(`[Labels] Saving for file: ${fileId}`, labels);
      const formattedLabels: Record<string, string> = {};
      Object.entries(labels).forEach(([key, value]) => {
        formattedLabels[String(key)] = value;
      });
      
      const result = await apiFetch<{ status: string }>(`/files/${fileId}/labels`, {
        method: 'post',
        body: { labels: formattedLabels },
      });
      console.log(`[Labels] Save result:`, result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', fileId, 'labels'] });
    },
  });
}

export function useFileSkipStatus(fileId: string | undefined) {
  return useQuery({
    queryKey: ['files', fileId, 'skip'],
    queryFn: () => apiFetch<{ isSkipped: boolean }>(`/files/${fileId}/skip`),
    enabled: !!fileId,
  });
}

export function useSkipFile(fileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ isSkipped: boolean }>(`/files/${fileId}/skip`, {
        method: 'post',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', fileId, 'labels'] });
    },
  });
}
