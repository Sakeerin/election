'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { IOverviewSummary } from '@election/shared';
import { api } from '@/lib/api';

/**
 * Polling interval when WebSocket is NOT connected.
 * When the socket IS connected, we rely on push events instead.
 */
const POLL_INTERVAL_MS = 30_000;

export function useElectionData(initialData: IOverviewSummary) {
    const [data, setData] = useState<IOverviewSummary>(initialData);
    const [isLive, setIsLive] = useState(false);
    const socketConnectedRef = useRef(false);

    const fetchLatest = useCallback(async () => {
        // Skip polling when WebSocket is providing real-time updates
        if (socketConnectedRef.current) return;

        try {
            const fresh = await api.get<IOverviewSummary>('/summary/overview?electionId=1');
            setData(fresh);
            setIsLive(true);
        } catch {
            // Keep existing data; API might not be running yet
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchLatest, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchLatest]);

    /** Call this from useElectionSocket to suppress polling while the socket is live */
    const setSocketConnected = useCallback((connected: boolean) => {
        socketConnectedRef.current = connected;
        if (connected) setIsLive(true);
    }, []);

    return { data, setData, isLive, setSocketConnected };
}
