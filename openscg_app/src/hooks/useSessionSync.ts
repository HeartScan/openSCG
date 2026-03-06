import { useState, useCallback } from 'react';
import { storage } from '@/lib/utils/storage';
import { MeasurementEntry } from '@/types/scg';

export const useSessionSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkServerStatus = async (sessionId: string): Promise<boolean> => {
        try {
            console.log(`[useSessionSync] Checking server status for ${sessionId}`);
            // Use HEAD to avoid large payload and potential caching issues with GET
            const response = await fetch(`/api/sessions/${sessionId}/data`, { method: 'HEAD' });
            console.log(`[useSessionSync] Server response for ${sessionId}: ${response.status}`);
            return response.ok;
        } catch (e) {
            console.error(`[useSessionSync] Status check failed for ${sessionId}`, e);
            return false;
        }
    };

    const uploadData = async (measurement: MeasurementEntry): Promise<boolean> => {
        try {
            console.log(`[useSessionSync] Uploading data for ${measurement.id} (${measurement.data.length} samples)`);
            // Re-map ScgTuple back to API format if necessary
            // The API /docs/openscg-format.md says samples: [{t, ax, ay, az}]
            // Our V2 format is [t, ax, ay, az]
            const formattedSamples = measurement.data.map(d => ({
                t: d[0],
                ax: d[1],
                ay: d[2],
                az: d[3]
            }));

            const payload = {
                version: "0.1",
                sessionId: measurement.id,
                startedAt: new Date(measurement.timestamp).toISOString(),
                samples: formattedSamples,
                samplingRateHz: 100 // Default or from metadata
            };

            const response = await fetch(`/api/sessions/${measurement.id}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            return response.ok;
        } catch (e) {
            console.error("Upload failed", e);
            return false;
        }
    };

    const ensureSynced = useCallback(async (measurement: MeasurementEntry): Promise<string | null> => {
        setIsSyncing(true);
        setError(null);
        const url = `${window.location.origin}/view/${measurement.id}`;

        try {
            console.log(`[useSessionSync] ensureSynced started for ${measurement.id}`);
            // 1. Check if already on server
            const exists = await checkServerStatus(measurement.id);
            if (exists) {
                console.log(`[useSessionSync] Session ${measurement.id} already exists on server.`);
                setIsSyncing(false);
                return url;
            }

            // 2. If not, upload
            console.log(`[useSessionSync] Session ${measurement.id} not on server. Initiating upload...`);
            const success = await uploadData(measurement);
            if (success) {
                console.log(`[useSessionSync] Upload successful for ${measurement.id}. Updating local storage.`);
                // Update local status
                await storage.saveMeasurement({ ...measurement, synced: true });
                setIsSyncing(false);
                return url;
            } else {
                throw new Error("Failed to sync with server");
            }
        } catch (e: unknown) {
            console.error(`[useSessionSync] ensureSynced failed for ${measurement.id}:`, e);
            setError(e instanceof Error ? e.message : "An unknown error occurred");
            setIsSyncing(false);
            return null;
        }
    }, []);

    return { ensureSynced, isSyncing, error };
};
