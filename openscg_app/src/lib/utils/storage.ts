import localforage from 'localforage';
import { MeasurementEntry } from '@/types/scg';

localforage.config({
  name: 'OpenSCG',
  storeName: 'measurements'
});

export const storage = {
  saveMeasurement: async (entry: MeasurementEntry) => {
    try {
      await localforage.setItem(entry.id, entry);
    } catch (e) {
      console.error('Failed to save measurement', e);
      throw e;
    }
  },

  getMeasurement: async (id: string): Promise<MeasurementEntry | null> => {
    try {
      return await localforage.getItem<MeasurementEntry>(id);
    } catch (e) {
      console.error('Failed to load measurement', e);
      return null;
    }
  },

  getAllMeasurements: async (): Promise<MeasurementEntry[]> => {
    const measurements: MeasurementEntry[] = [];
    try {
      await localforage.iterate((value: MeasurementEntry, key, iterationNumber) => {
        measurements.push(value);
      });
      // Sort by timestamp descending
      return measurements.sort((a, b) => b.timestamp - a.timestamp);
    } catch (e) {
      console.error('Failed to load all measurements', e);
      return [];
    }
  },

  deleteMeasurement: async (id: string) => {
    try {
      await localforage.removeItem(id);
    } catch (e) {
      console.error('Failed to delete measurement', e);
    }
  },

  clearAll: async () => {
    try {
      await localforage.clear();
    } catch (e) {
        console.error('Failed to clear storage', e);
    }
  }
};
