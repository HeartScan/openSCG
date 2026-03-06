import { create } from 'zustand';
import { components } from '@/types/api';

type FileFilter = components['schemas']['FileFilter'];
export type LabelType = 'positive' | 'negative' | 'skipped';

interface AppState {
  // Navigation
  currentIndex: number;
  totalFiles: number;
  setCurrentIndex: (index: number) => void;
  setTotalFiles: (total: number) => void;
  
  // Display Mode
  displayMode: 'high' | 'low';
  setDisplayMode: (mode: 'high' | 'low') => void;
  
  // Filtering
  filters: FileFilter;
  setFilters: (filters: FileFilter) => void;
  
  // UI State
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  setIsFilterPanelOpen: (isOpen: boolean) => void;
  
  // Interaction
  interactionMode: 'standard' | 'rapid-negative';
  setInteractionMode: (mode: 'standard' | 'rapid-negative') => void;

  // LABELS STATE
  labels: Record<string, LabelType>;
  originalLabels: Record<string, LabelType>; // State from server for diffing
  labelsFileId: string | undefined;
  isLabelsDirty: boolean;
  setLabels: (fileId: string | undefined, labels: Record<string, LabelType>, isDirty?: boolean) => void;
  updateLabel: (pointIndex: number, type: LabelType | undefined) => void;
  clearLabelsDirty: () => void;
  updateOriginalLabels: () => void; // Sync original with current after save
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentIndex: 0,
  totalFiles: 0,
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setTotalFiles: (total) => set({ totalFiles: total }),
  
  // Display Mode
  displayMode: 'high',
  setDisplayMode: (mode) => set({ displayMode: mode }),
  
  // Filtering
  filters: { labelStatus: 'all' },
  setFilters: (filters) => set({ filters, currentIndex: 0 }), // Reset index when filters change
  
  // UI State
  isFilterPanelOpen: false,
  toggleFilterPanel: () => set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
  setIsFilterPanelOpen: (isOpen) => set({ isFilterPanelOpen: isOpen }),
  
  // Interaction
  interactionMode: 'standard',
  setInteractionMode: (mode) => set({ interactionMode: mode }),

  // LABELS
  labels: {},
  originalLabels: {},
  labelsFileId: undefined,
  isLabelsDirty: false,

  setLabels: (fileId, labels, isDirty = false) => set({ 
    labelsFileId: fileId, 
    labels: labels, 
    originalLabels: { ...labels }, // CLONE!
    isLabelsDirty: isDirty 
  }),

  updateLabel: (pointIndex, type) => set((state) => {
    const newLabels = { ...state.labels };
    if (!type) {
      delete newLabels[pointIndex];
    } else {
      newLabels[pointIndex] = type;
    }
    return { 
      labels: newLabels, 
      isLabelsDirty: true 
    };
  }),

  clearLabelsDirty: () => set({ isLabelsDirty: false }),

  updateOriginalLabels: () => set((state) => ({
    originalLabels: { ...state.labels },
    isLabelsDirty: false
  })),
}));
