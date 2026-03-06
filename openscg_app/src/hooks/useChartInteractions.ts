import { useCallback } from 'react';
import uPlot from 'uplot';
import { useHeartScanLabels, LabelType } from './useHeartScanLabels';

export type InteractionLabelType = LabelType | 'none';

export function useChartInteractions(fileId: string | undefined) {
  const { labels = {}, updateLabel } = useHeartScanLabels(fileId);

  const findNearestPoint = useCallback(
    (mouseX: number, mouseY: number, u: uPlot, data: number[][]) => {
      const time = data[0];
      const signal = data[1];
      
      // Get index near mouseX
      const idx = u.posToIdx(mouseX);
      if (idx === null || idx === undefined) return null;

      // Scan local neighborhood for best match
      const radius = 20; // index radius
      const start = Math.max(0, idx - radius);
      const end = Math.min(time.length - 1, idx + radius);
      
      let bestIdx = -1;
      let minDistance = Infinity;
      const MAX_DIST_PX = 50;
      const LABEL_WEIGHT = 0.8; // 1 / 1.25

      for (let i = start; i <= end; i++) {
        const pxX = u.valToPos(time[i], 'x');
        const pxY = u.valToPos(signal[i], 'y');
        
        const dx = mouseX - pxX;
        const dy = mouseY - pxY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        // Apply weight if this point has a label
        if (labels[i]) {
          dist *= LABEL_WEIGHT;
        }

        if (dist < minDistance && dist < MAX_DIST_PX) {
          minDistance = dist;
          bestIdx = i;
        }
      }

      return bestIdx !== -1 ? bestIdx : null;
    },
    [labels]
  );

  const cycleLabel = useCallback(
    (pointIndex: number) => {
      if (!fileId) return;

      const currentLabel = labels[pointIndex];
      let nextLabel: InteractionLabelType;

      if (!currentLabel) nextLabel = 'positive';
      else if (currentLabel === 'positive') nextLabel = 'negative';
      else if (currentLabel === 'negative') nextLabel = 'skipped';
      else nextLabel = 'none';

      updateLabel(pointIndex, nextLabel === 'none' ? undefined : nextLabel);
    },
    [fileId, labels, updateLabel]
  );

  const setNegative = useCallback(
    (pointIndex: number) => {
      if (!fileId) return;
      updateLabel(pointIndex, 'negative');
    },
    [fileId, updateLabel]
  );

  const clearLabel = useCallback(
    (pointIndex: number) => {
      if (!fileId) return;
      updateLabel(pointIndex, undefined);
    },
    [fileId, updateLabel]
  );

  const frequency = 50; // Replace with actual frequency from API if available

  return {
    findNearestPoint,
    cycleLabel,
    setNegative,
    clearLabel,
    labels,
    frequency,
  };
}
